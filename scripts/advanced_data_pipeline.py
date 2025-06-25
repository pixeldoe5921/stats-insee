#!/usr/bin/env python3
"""
📊 DATA ENGINEER AVANCÉ - Pipeline de données multi-sources
Intégration INSEE, Eurostat, OECD, Banque de France
"""

import asyncio
import aiohttp
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
import logging
from dataclasses import dataclass, asdict
import json
import xml.etree.ElementTree as ET
from sqlalchemy import create_engine, text
import redis
from supabase import create_client
import schedule
import time

# Configuration du logging avancé
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
    handlers=[
        logging.FileHandler('data_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class DataQualityMetrics:
    """Métriques de qualité des données"""
    completeness: float  # % de données non nulles
    accuracy: float      # % de données dans les ranges attendus
    consistency: float   # % de cohérence temporelle
    timeliness: float    # Fraîcheur des données (en jours)
    anomalies: List[str] # Liste des anomalies détectées

@dataclass
class DataSourceConfig:
    """Configuration d'une source de données"""
    name: str
    base_url: str
    api_key: Optional[str]
    rate_limit: int  # requêtes par minute
    retry_count: int
    timeout: int
    cache_ttl: int  # durée de cache en secondes

class AdvancedDataPipeline:
    """Pipeline de données avancé multi-sources"""
    
    def __init__(self):
        # Configuration des sources
        self.sources = {
            'INSEE': DataSourceConfig(
                name='INSEE',
                base_url='https://api.insee.fr/series/BDM/V1',
                api_key=os.getenv('INSEE_API_KEY'),
                rate_limit=100,
                retry_count=3,
                timeout=30,
                cache_ttl=3600
            ),
            'EUROSTAT': DataSourceConfig(
                name='EUROSTAT',
                base_url='https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data',
                api_key=None,
                rate_limit=60,
                retry_count=2,
                timeout=45,
                cache_ttl=7200
            ),
            'OECD': DataSourceConfig(
                name='OECD',
                base_url='https://stats.oecd.org/restsdmx/sdmx.ashx/GetData',
                api_key=os.getenv('OECD_API_KEY'),
                rate_limit=120,
                retry_count=3,
                timeout=30,
                cache_ttl=3600
            ),
            'BANQUE_FRANCE': DataSourceConfig(
                name='BANQUE_FRANCE',
                base_url='https://api.banque-france.fr/series/observations',
                api_key=os.getenv('BANQUE_FRANCE_API_KEY'),
                rate_limit=200,
                retry_count=3,
                timeout=20,
                cache_ttl=1800
            )
        }
        
        # Connexions
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        # Cache Redis
        try:
            self.redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                decode_responses=True
            )
            self.redis_client.ping()
            logger.info("✅ Connexion Redis établie")
        except Exception as e:
            logger.warning(f"⚠️ Redis non disponible: {e}")
            self.redis_client = None

        # Semaphores pour rate limiting
        self.rate_limiters = {
            source: asyncio.Semaphore(config.rate_limit)
            for source, config in self.sources.items()
        }

    async def fetch_with_retry(
        self, 
        session: aiohttp.ClientSession, 
        url: str, 
        source: str,
        **kwargs
    ) -> Optional[Dict]:
        """Récupération avec retry et rate limiting"""
        
        config = self.sources[source]
        
        async with self.rate_limiters[source]:
            for attempt in range(config.retry_count):
                try:
                    async with session.get(
                        url, 
                        timeout=aiohttp.ClientTimeout(total=config.timeout),
                        **kwargs
                    ) as response:
                        
                        if response.status == 200:
                            content_type = response.headers.get('content-type', '')
                            
                            if 'json' in content_type:
                                return await response.json()
                            elif 'xml' in content_type:
                                text = await response.text()
                                return self.parse_xml_to_dict(text)
                            else:
                                return await response.text()
                                
                        elif response.status == 429:  # Rate limit
                            wait_time = 2 ** attempt
                            logger.warning(f"Rate limit {source}, attente {wait_time}s")
                            await asyncio.sleep(wait_time)
                            continue
                            
                        else:
                            logger.error(f"Erreur HTTP {response.status} pour {source}")
                            
                except asyncio.TimeoutError:
                    logger.warning(f"Timeout {source} (tentative {attempt + 1})")
                except Exception as e:
                    logger.error(f"Erreur {source}: {e}")
                
                if attempt < config.retry_count - 1:
                    await asyncio.sleep(1)
        
        return None

    async def fetch_eurostat_data(self, dataset_code: str) -> List[Dict]:
        """Récupération données Eurostat"""
        
        cache_key = f"eurostat:{dataset_code}"
        
        # Vérifier le cache
        if self.redis_client:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"📦 Cache hit pour Eurostat {dataset_code}")
                return json.loads(cached_data)

        url = f"{self.sources['EUROSTAT'].base_url}/{dataset_code}?format=JSON"
        
        async with aiohttp.ClientSession() as session:
            data = await self.fetch_with_retry(session, url, 'EUROSTAT')
            
            if not data:
                return []

        # Parser les données Eurostat
        processed_data = []
        
        try:
            if 'dimension' in data and 'value' in data:
                time_dimension = data['dimension']['time']['category']['index']
                geo_dimension = data['dimension'].get('geo', {}).get('category', {}).get('index', {})
                values = data['value']
                
                for time_key, time_index in time_dimension.items():
                    for geo_key, geo_index in geo_dimension.items():
                        # Calculer l'index dans le tableau de valeurs
                        value_index = time_index * len(geo_dimension) + geo_index
                        
                        if value_index < len(values) and values[value_index] is not None:
                            processed_data.append({
                                'id': f"eurostat_{dataset_code}_{geo_key}_{time_key}",
                                'indicator': dataset_code,
                                'value': float(values[value_index]),
                                'date': time_key,
                                'source': 'EUROSTAT',
                                'unit': data.get('unit', 'Unknown'),
                                'frequency': self.detect_frequency(time_key),
                                'geography': geo_key,
                                'category': self.categorize_indicator(dataset_code),
                                'metadata': {
                                    'dataset_code': dataset_code,
                                    'last_update': data.get('updated'),
                                    'quality_score': self.calculate_quality_score(values[value_index])
                                }
                            })
                            
        except Exception as e:
            logger.error(f"Erreur parsing Eurostat {dataset_code}: {e}")

        # Mettre en cache
        if self.redis_client and processed_data:
            self.redis_client.setex(
                cache_key,
                self.sources['EUROSTAT'].cache_ttl,
                json.dumps(processed_data)
            )

        logger.info(f"✅ Eurostat {dataset_code}: {len(processed_data)} observations")
        return processed_data

    async def fetch_oecd_data(self, dataset: str, frequency: str = 'Q') -> List[Dict]:
        """Récupération données OECD"""
        
        cache_key = f"oecd:{dataset}:{frequency}"
        
        if self.redis_client:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"📦 Cache hit pour OECD {dataset}")
                return json.loads(cached_data)

        # URL SDMX pour OECD
        url = f"{self.sources['OECD'].base_url}/{dataset}/all/all/{frequency}"
        
        headers = {}
        if self.sources['OECD'].api_key:
            headers['Authorization'] = f'Bearer {self.sources["OECD"].api_key}'

        async with aiohttp.ClientSession() as session:
            data = await self.fetch_with_retry(session, url, 'OECD', headers=headers)
            
            if not data:
                return []

        # Parser XML SDMX
        processed_data = []
        
        try:
            if isinstance(data, str):  # XML response
                root = ET.fromstring(data)
                
                # Namespace SDMX
                ns = {'generic': 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic'}
                
                for obs in root.findall('.//generic:Obs', ns):
                    time_elem = obs.find('.//generic:ObsTime', ns)
                    value_elem = obs.find('.//generic:ObsValue', ns)
                    
                    if time_elem is not None and value_elem is not None:
                        try:
                            processed_data.append({
                                'id': f"oecd_{dataset}_{time_elem.text}",
                                'indicator': dataset,
                                'value': float(value_elem.get('value')),
                                'date': time_elem.text,
                                'source': 'OECD',
                                'unit': 'Index',  # À améliorer selon le dataset
                                'frequency': frequency,
                                'geography': 'OECD',
                                'category': self.categorize_indicator(dataset),
                                'metadata': {
                                    'dataset': dataset,
                                    'method': 'SDMX'
                                }
                            })
                        except ValueError:
                            continue
                            
        except Exception as e:
            logger.error(f"Erreur parsing OECD {dataset}: {e}")

        if self.redis_client and processed_data:
            self.redis_client.setex(
                cache_key,
                self.sources['OECD'].cache_ttl,
                json.dumps(processed_data)
            )

        logger.info(f"✅ OECD {dataset}: {len(processed_data)} observations")
        return processed_data

    async def fetch_banque_france_data(self, series_id: str) -> List[Dict]:
        """Récupération données Banque de France"""
        
        cache_key = f"bdf:{series_id}"
        
        if self.redis_client:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"📦 Cache hit pour BdF {series_id}")
                return json.loads(cached_data)

        url = f"{self.sources['BANQUE_FRANCE'].base_url}/{series_id}"
        
        headers = {}
        if self.sources['BANQUE_FRANCE'].api_key:
            headers['Authorization'] = f'Bearer {self.sources["BANQUE_FRANCE"].api_key}'

        async with aiohttp.ClientSession() as session:
            data = await self.fetch_with_retry(session, url, 'BANQUE_FRANCE', headers=headers)
            
            if not data:
                return []

        processed_data = []
        
        try:
            # Structure API Banque de France
            if 'observations' in data:
                for obs in data['observations']:
                    processed_data.append({
                        'id': f"bdf_{series_id}_{obs['period']}",
                        'indicator': data.get('title', series_id),
                        'value': float(obs['value']),
                        'date': obs['period'],
                        'source': 'BANQUE_FRANCE',
                        'unit': data.get('unit', '%'),
                        'frequency': data.get('frequency', 'MONTHLY'),
                        'geography': 'France',
                        'category': self.categorize_indicator(series_id),
                        'metadata': {
                            'series_id': series_id,
                            'last_update': data.get('last_update')
                        }
                    })
                    
        except Exception as e:
            logger.error(f"Erreur parsing BdF {series_id}: {e}")

        if self.redis_client and processed_data:
            self.redis_client.setex(
                cache_key,
                self.sources['BANQUE_FRANCE'].cache_ttl,
                json.dumps(processed_data)
            )

        logger.info(f"✅ Banque de France {series_id}: {len(processed_data)} observations")
        return processed_data

    def validate_and_clean_data(self, data: List[Dict]) -> Tuple[List[Dict], DataQualityMetrics]:
        """Validation et nettoyage des données"""
        
        if not data:
            return [], DataQualityMetrics(0, 0, 0, 0, ["No data"])

        df = pd.DataFrame(data)
        original_count = len(df)
        anomalies = []

        # 1. Supprimer les valeurs aberrantes
        numeric_cols = ['value']
        for col in numeric_cols:
            if col in df.columns:
                q1 = df[col].quantile(0.01)
                q99 = df[col].quantile(0.99)
                
                outliers = df[(df[col] < q1) | (df[col] > q99)]
                if len(outliers) > 0:
                    anomalies.append(f"{len(outliers)} outliers in {col}")
                    df = df[(df[col] >= q1) & (df[col] <= q99)]

        # 2. Vérifier la cohérence temporelle
        df['date_parsed'] = pd.to_datetime(df['date'], errors='coerce')
        invalid_dates = df['date_parsed'].isna().sum()
        if invalid_dates > 0:
            anomalies.append(f"{invalid_dates} invalid dates")
            df = df[df['date_parsed'].notna()]

        # 3. Détecter les doublons
        duplicates = df.duplicated(subset=['id']).sum()
        if duplicates > 0:
            anomalies.append(f"{duplicates} duplicates")
            df = df.drop_duplicates(subset=['id'])

        # 4. Calculer les métriques de qualité
        completeness = (df['value'].notna().sum() / len(df)) * 100 if len(df) > 0 else 0
        
        # Accuracy: % de valeurs dans des ranges "raisonnables"
        accuracy = 100  # Simplifié pour l'exemple
        
        # Consistency: % de données sans gaps temporels importants
        consistency = 95  # Simplifié pour l'exemple
        
        # Timeliness: fraîcheur des données
        if len(df) > 0:
            latest_date = df['date_parsed'].max()
            days_old = (datetime.now() - latest_date).days
            timeliness = max(0, 100 - days_old)
        else:
            timeliness = 0

        metrics = DataQualityMetrics(
            completeness=round(completeness, 2),
            accuracy=round(accuracy, 2),
            consistency=round(consistency, 2),
            timeliness=round(timeliness, 2),
            anomalies=anomalies
        )

        clean_data = df.drop('date_parsed', axis=1).to_dict('records')
        
        logger.info(f"🧹 Nettoyage: {original_count} → {len(clean_data)} observations")
        logger.info(f"📊 Qualité: {metrics}")
        
        return clean_data, metrics

    async def run_full_pipeline(self) -> Dict[str, any]:
        """Exécution complète du pipeline"""
        
        logger.info("🚀 Démarrage pipeline complet multi-sources")
        start_time = datetime.now()
        
        results = {
            'sources_processed': 0,
            'total_records': 0,
            'quality_metrics': {},
            'errors': [],
            'execution_time': 0
        }

        # Définir les datasets à récupérer
        datasets = {
            'EUROSTAT': [
                'nama_10_gdp',      # PIB
                'une_rt_m',         # Chômage
                'prc_hicp_manr',    # Inflation
            ],
            'OECD': [
                'QNA',              # Comptes nationaux trimestriels
                'MEI',              # Indicateurs économiques principaux
            ],
            'BANQUE_FRANCE': [
                'BSI_M_FR_4F_N_A_A24_Z01_E',  # Taux directeur
                'ICP_M_FR_000000_4_ANR',      # Inflation
            ]
        }

        # Traitement parallèle par source
        tasks = []
        
        # Eurostat
        for dataset in datasets['EUROSTAT']:
            tasks.append(self.fetch_eurostat_data(dataset))
            
        # OECD
        for dataset in datasets['OECD']:
            tasks.append(self.fetch_oecd_data(dataset))
            
        # Banque de France
        for series in datasets['BANQUE_FRANCE']:
            tasks.append(self.fetch_banque_france_data(series))

        # Exécution parallèle
        all_data = []
        completed_tasks = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(completed_tasks):
            if isinstance(result, Exception):
                results['errors'].append(str(result))
                logger.error(f"Erreur tâche {i}: {result}")
            else:
                all_data.extend(result)
                results['sources_processed'] += 1

        # Validation et nettoyage
        clean_data, quality_metrics = self.validate_and_clean_data(all_data)
        results['total_records'] = len(clean_data)
        results['quality_metrics'] = asdict(quality_metrics)

        # Sauvegarde en base
        if clean_data:
            try:
                # Batch insert optimisé
                batch_size = 100
                saved_count = 0
                
                for i in range(0, len(clean_data), batch_size):
                    batch = clean_data[i:i + batch_size]
                    
                    response = self.supabase.table('economic_data').upsert(
                        batch,
                        on_conflict='id'
                    ).execute()
                    
                    if response.data:
                        saved_count += len(batch)
                        
                logger.info(f"💾 Sauvegardé: {saved_count} enregistrements")
                
                # Mettre à jour les métriques de qualité
                self.save_quality_metrics(quality_metrics)
                
            except Exception as e:
                logger.error(f"Erreur sauvegarde: {e}")
                results['errors'].append(f"Sauvegarde: {str(e)}")

        # Finaliser
        execution_time = (datetime.now() - start_time).total_seconds()
        results['execution_time'] = round(execution_time, 2)
        
        logger.info(f"✅ Pipeline terminé en {execution_time:.2f}s")
        logger.info(f"📊 Résultats: {results}")
        
        return results

    def save_quality_metrics(self, metrics: DataQualityMetrics):
        """Sauvegarder les métriques de qualité"""
        try:
            self.supabase.table('data_quality_metrics').insert({
                'timestamp': datetime.now().isoformat(),
                'completeness': metrics.completeness,
                'accuracy': metrics.accuracy,
                'consistency': metrics.consistency,
                'timeliness': metrics.timeliness,
                'anomalies': metrics.anomalies
            }).execute()
        except Exception as e:
            logger.error(f"Erreur sauvegarde métriques: {e}")

    def categorize_indicator(self, indicator: str) -> str:
        """Catégoriser un indicateur"""
        indicator_lower = indicator.lower()
        
        if any(term in indicator_lower for term in ['gdp', 'pib', 'nama']):
            return 'GDP'
        elif any(term in indicator_lower for term in ['unemployment', 'chomage', 'une_rt']):
            return 'UNEMPLOYMENT'
        elif any(term in indicator_lower for term in ['inflation', 'price', 'prix', 'hicp', 'icp']):
            return 'INFLATION'
        elif any(term in indicator_lower for term in ['rate', 'taux', 'interest']):
            return 'INTEREST_RATES'
        else:
            return 'OTHER'

    def detect_frequency(self, date_str: str) -> str:
        """Détecter la fréquence des données"""
        if 'Q' in date_str or '-' in date_str and len(date_str.split('-')[-1]) <= 2:
            return 'QUARTERLY'
        elif len(date_str) == 4:
            return 'YEARLY'
        else:
            return 'MONTHLY'

    def calculate_quality_score(self, value: float) -> float:
        """Calculer un score de qualité pour une valeur"""
        # Simplifié pour l'exemple
        return 1.0 if value is not None and not np.isnan(value) else 0.0

    def parse_xml_to_dict(self, xml_string: str) -> Dict:
        """Parser XML vers dictionnaire"""
        try:
            root = ET.fromstring(xml_string)
            return self._element_to_dict(root)
        except Exception as e:
            logger.error(f"Erreur parsing XML: {e}")
            return {}

    def _element_to_dict(self, element) -> Dict:
        """Convertir élément XML en dictionnaire"""
        result = {}
        
        # Attributs
        if element.attrib:
            result.update(element.attrib)
            
        # Texte
        if element.text and element.text.strip():
            if len(element) == 0:
                return element.text.strip()
            result['text'] = element.text.strip()
            
        # Enfants
        for child in element:
            child_data = self._element_to_dict(child)
            if child.tag in result:
                if not isinstance(result[child.tag], list):
                    result[child.tag] = [result[child.tag]]
                result[child.tag].append(child_data)
            else:
                result[child.tag] = child_data
                
        return result

def setup_advanced_scheduler():
    """Configuration du scheduler avancé"""
    pipeline = AdvancedDataPipeline()
    
    # Pipeline complet 2x par jour
    schedule.every().day.at("06:00").do(
        lambda: asyncio.run(pipeline.run_full_pipeline())
    )
    schedule.every().day.at("18:00").do(
        lambda: asyncio.run(pipeline.run_full_pipeline())
    )
    
    # Monitoring qualité toutes les heures
    schedule.every().hour.do(
        lambda: asyncio.run(pipeline.check_data_quality())
    )
    
    logger.info("📅 Scheduler avancé configuré")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    import argparse
    import os
    
    parser = argparse.ArgumentParser(description='Pipeline de données avancé')
    parser.add_argument('--mode', choices=['full', 'scheduler'], 
                       default='full', help='Mode d\'exécution')
    
    args = parser.parse_args()
    
    if args.mode == 'full':
        pipeline = AdvancedDataPipeline()
        result = asyncio.run(pipeline.run_full_pipeline())
        print(f"Résultat: {json.dumps(result, indent=2)}")
        
    elif args.mode == 'scheduler':
        setup_advanced_scheduler()