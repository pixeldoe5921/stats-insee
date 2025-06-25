#!/usr/bin/env python3
"""
🐍 DATA ENGINEER - Script Scraping INSEE
Récupération automatisée des données économiques françaises
"""

import os
import sys
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import requests
from dataclasses import dataclass
import pandas as pd
from supabase import create_client
import schedule
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('insee_scraper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class EconomicIndicator:
    """Modèle de données pour un indicateur économique"""
    id: str
    name: str
    series_id: str
    category: str
    unit: str
    frequency: str
    geography: str = "France"

class INSEEScraper:
    """Scraper principal pour les données INSEE"""
    
    def __init__(self):
        self.base_url = "https://api.insee.fr/series/BDM/V1"
        self.api_key = os.getenv('INSEE_API_KEY')
        self.client_id = os.getenv('INSEE_CLIENT_ID')
        self.client_secret = os.getenv('INSEE_CLIENT_SECRET')
        
        # Configuration Supabase
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not all([supabase_url, supabase_key]):
            logger.error("Configuration Supabase manquante")
            sys.exit(1)
            
        self.supabase = create_client(supabase_url, supabase_key)
        self.access_token = None
        self.token_expires_at = None
        
        # Configuration des sessions HTTP avec retry
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "OPTIONS"],
            backoff_factor=1
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Indicateurs à récupérer
        self.indicators = [
            EconomicIndicator(
                id="gdp_quarterly",
                name="PIB trimestriel en volume",
                series_id="001656344",
                category="GDP",
                unit="Milliards €",
                frequency="QUARTERLY"
            ),
            EconomicIndicator(
                id="unemployment_rate",
                name="Taux de chômage au sens du BIT",
                series_id="001688527",
                category="UNEMPLOYMENT",
                unit="%",
                frequency="QUARTERLY"
            ),
            EconomicIndicator(
                id="inflation_ipc",
                name="Indice des prix à la consommation",
                series_id="001759972",
                category="INFLATION",
                unit="Indice",
                frequency="MONTHLY"
            ),
            EconomicIndicator(
                id="industrial_production",
                name="Production industrielle",
                series_id="010537510",
                category="INDUSTRIAL_PRODUCTION",
                unit="Indice",
                frequency="MONTHLY"
            ),
            EconomicIndicator(
                id="government_debt",
                name="Dette publique",
                series_id="001656434",
                category="GOVERNMENT_DEBT",
                unit="Milliards €",
                frequency="QUARTERLY"
            ),
            EconomicIndicator(
                id="consumer_confidence",
                name="Indicateur de confiance des ménages",
                series_id="010565692",
                category="CONSUMER_CONFIDENCE",
                unit="Solde d'opinion",
                frequency="MONTHLY"
            )
        ]

    def authenticate(self) -> bool:
        """Authentification OAuth2 avec l'API INSEE"""
        if self.access_token and self.token_expires_at:
            if datetime.now() < self.token_expires_at:
                return True

        if not all([self.client_id, self.client_secret]):
            logger.error("Identifiants INSEE manquants")
            return False

        auth_url = "https://api.insee.fr/token"
        auth_data = {
            'grant_type': 'client_credentials'
        }
        
        try:
            response = self.session.post(
                auth_url,
                data=auth_data,
                auth=(self.client_id, self.client_secret),
                timeout=30
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 3600)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
            
            logger.info("Authentification INSEE réussie")
            return True
            
        except Exception as e:
            logger.error(f"Erreur authentification INSEE: {e}")
            return False

    def get_headers(self) -> Dict[str, str]:
        """Headers pour les requêtes API"""
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'Dashboard-INSEE-Scraper/1.0'
        }
        
        if self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'
        elif self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
            
        return headers

    def fetch_series_data(self, indicator: EconomicIndicator, start_date: str = None) -> List[Dict]:
        """Récupération des données d'une série"""
        if not self.authenticate():
            logger.error(f"Impossible de récupérer {indicator.name}")
            return []

        # Construire l'URL avec filtres
        url = f"{self.base_url}/data/{indicator.series_id}"
        params = {}
        
        if start_date:
            params['startPeriod'] = start_date
            
        try:
            response = self.session.get(
                url,
                headers=self.get_headers(),
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            observations = data.get('observations', [])
            
            if not observations:
                logger.warning(f"Aucune donnée pour {indicator.name}")
                return []

            # Transformation des données
            processed_data = []
            for obs in observations:
                processed_data.append({
                    'id': f"insee_{indicator.id}_{obs['period']}",
                    'indicator': indicator.name,
                    'value': float(obs['value']) if obs['value'] else None,
                    'date': obs['period'],
                    'source': 'INSEE',
                    'unit': indicator.unit,
                    'frequency': indicator.frequency,
                    'geography': indicator.geography,
                    'category': indicator.category,
                    'sub_category': indicator.id,
                    'quality_flag': obs.get('status', 'NORMAL'),
                    'metadata': {
                        'series_id': indicator.series_id,
                        'revision_date': obs.get('last_update'),
                        'method': 'API'
                    }
                })
                
            logger.info(f"✅ {len(processed_data)} observations récupérées pour {indicator.name}")
            return processed_data

        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur HTTP pour {indicator.name}: {e}")
            return []
        except Exception as e:
            logger.error(f"Erreur traitement {indicator.name}: {e}")
            return []

    def save_to_supabase(self, data: List[Dict]) -> bool:
        """Sauvegarde des données dans Supabase"""
        if not data:
            return True

        try:
            # Filtrer les valeurs nulles
            clean_data = [item for item in data if item['value'] is not None]
            
            if not clean_data:
                logger.warning("Aucune donnée valide à sauvegarder")
                return True

            # Insertion/mise à jour en batch
            result = self.supabase.table('economic_data').upsert(
                clean_data,
                on_conflict='id',
                ignore_duplicates=False
            ).execute()
            
            if result.data:
                logger.info(f"✅ {len(clean_data)} enregistrements sauvegardés")
                return True
            else:
                logger.error("Erreur lors de la sauvegarde")
                return False

        except Exception as e:
            logger.error(f"Erreur Supabase: {e}")
            return False

    def update_data_source_status(self, source_name: str, success: bool, error_msg: str = None):
        """Met à jour le statut de la source de données"""
        try:
            update_data = {
                'last_sync': datetime.now().isoformat(),
                'next_sync': (datetime.now() + timedelta(hours=1)).isoformat()
            }
            
            if success:
                update_data['error_count'] = 0
                update_data['last_error'] = None
            else:
                update_data['last_error'] = error_msg
                
            self.supabase.table('data_sources').update(update_data).eq('name', source_name).execute()
            
        except Exception as e:
            logger.error(f"Erreur mise à jour source: {e}")

    def run_full_scraping(self, days_back: int = 30) -> Dict[str, int]:
        """Exécution complète du scraping"""
        logger.info("🚀 Début du scraping INSEE")
        
        start_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m')
        total_saved = 0
        errors = 0
        
        for indicator in self.indicators:
            try:
                logger.info(f"📊 Traitement: {indicator.name}")
                
                data = self.fetch_series_data(indicator, start_date)
                
                if data:
                    success = self.save_to_supabase(data)
                    if success:
                        total_saved += len(data)
                    else:
                        errors += 1
                        
                # Pause entre les requêtes
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Erreur indicateur {indicator.name}: {e}")
                errors += 1

        # Mise à jour du statut
        self.update_data_source_status('INSEE', errors == 0, f"{errors} erreurs" if errors > 0 else None)
        
        logger.info(f"✅ Scraping terminé: {total_saved} données sauvegardées, {errors} erreurs")
        
        return {
            'total_saved': total_saved,
            'errors': errors,
            'indicators_processed': len(self.indicators)
        }

    def run_incremental_scraping(self) -> Dict[str, int]:
        """Scraping incrémental (dernières données uniquement)"""
        return self.run_full_scraping(days_back=7)

def setup_scheduler():
    """Configuration du scheduler pour l'exécution automatique"""
    scraper = INSEEScraper()
    
    # Scraping complet une fois par jour à 6h
    schedule.every().day.at("06:00").do(scraper.run_full_scraping)
    
    # Scraping incrémental toutes les 4 heures
    schedule.every(4).hours.do(scraper.run_incremental_scraping)
    
    logger.info("📅 Scheduler configuré")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

def main():
    """Point d'entrée principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scraper INSEE')
    parser.add_argument('--mode', choices=['full', 'incremental', 'scheduler'], 
                       default='full', help='Mode d\'exécution')
    parser.add_argument('--days', type=int, default=30, 
                       help='Nombre de jours à récupérer (mode full)')
    
    args = parser.parse_args()
    
    scraper = INSEEScraper()
    
    if args.mode == 'full':
        result = scraper.run_full_scraping(args.days)
        print(f"Résultat: {result}")
        
    elif args.mode == 'incremental':
        result = scraper.run_incremental_scraping()
        print(f"Résultat: {result}")
        
    elif args.mode == 'scheduler':
        setup_scheduler()

if __name__ == "__main__":
    main()