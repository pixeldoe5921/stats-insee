# 🚀 Guide de Déploiement Vercel

## ✅ Prérequis de Déploiement

### 1. Configuration Supabase
```bash
# Créer un projet Supabase : https://supabase.com/dashboard
# Noter : Project URL + anon key + service_role key
```

### 2. Variables d'Environnement Vercel
```bash
# Obligatoires
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (optionnel pour chat)
OPENAI_API_KEY=sk-...

# Cron Security
CRON_SECRET=your-random-secret

# Monitoring (optionnel)
SENTRY_DSN=https://...
```

### 3. Base de Données (SQL à exécuter)
```sql
-- Table données économiques
CREATE TABLE economic_data (
  id VARCHAR PRIMARY KEY,
  indicator VARCHAR NOT NULL,
  value DECIMAL NOT NULL,
  date DATE NOT NULL,
  source VARCHAR NOT NULL,
  unit VARCHAR NOT NULL,
  frequency VARCHAR NOT NULL,
  geography VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table sources
CREATE TABLE data_sources (
  name VARCHAR PRIMARY KEY,
  url VARCHAR NOT NULL,
  last_sync TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Index pour performance
CREATE INDEX idx_economic_data_indicator ON economic_data(indicator);
CREATE INDEX idx_economic_data_date ON economic_data(date);
CREATE INDEX idx_economic_data_source ON economic_data(source);
```

### 4. Données de Démonstration
```sql
-- Insérer quelques données de test
INSERT INTO economic_data VALUES
('gdp-fr-2024-q1', 'PIB France', 2850.5, '2024-03-31', 'INSEE', 'Milliards €', 'QUARTERLY', 'France', 'GDP', '{}'),
('unemployment-fr-2024-05', 'Taux de chômage', 7.2, '2024-05-31', 'INSEE', '%', 'MONTHLY', 'France', 'UNEMPLOYMENT', '{}'),
('inflation-fr-2024-05', 'Inflation', 2.1, '2024-05-31', 'INSEE', '%', 'MONTHLY', 'France', 'INFLATION', '{}');
```

## 🚀 Commandes de Déploiement

### Méthode 1: CLI Vercel
```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
cd stats-insee
vercel

# Configuration automatique:
# - Link to existing project? No
# - Project name: stats-insee-dashboard  
# - Directory: ./
# - Build settings: default (Next.js)
```

### Méthode 2: Git Integration
```bash
# Push vers GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# Puis connecter dans Vercel Dashboard:
# 1. Import Project from GitHub
# 2. Configure Environment Variables
# 3. Deploy
```

## 🔍 Tests Post-Déploiement

### Endpoints à Tester
```bash
# Santé de l'application
GET https://your-app.vercel.app/api/health

# Données économiques
GET https://your-app.vercel.app/api/economic-data

# Chat IA (si OpenAI configuré)
POST https://your-app.vercel.app/api/ai-chat
```

### Fonctionnalités à Vérifier
- ✅ Dashboard principal charge
- ✅ Graphiques s'affichent
- ✅ Export PDF/CSV fonctionne
- ✅ Dark mode toggle
- ✅ Responsive design
- ✅ Chat IA (si configuré)

## 📊 Informations Disponibles

### Données Économiques
- **PIB France** : Évolution trimestrielle
- **Taux de chômage** : Données mensuelles
- **Inflation** : Évolution des prix
- **Données EU** : Comparaisons européennes

### Sources Intégrées
- **INSEE** : Données officielles France
- **Eurostat** : Statistiques européennes  
- **OECD** : Données internationales
- **Banque de France** : Indicateurs monétaires

### Visualisations
- **Graphiques linéaires** : Évolution temporelle
- **Barres comparatives** : Comparaisons géographiques
- **Cartes de chaleur** : Corrélations
- **Tableaux** : Données détaillées

## 🎯 URLs Important Post-Déploiement

```bash
# Dashboard principal
https://your-app.vercel.app/

# API santé
https://your-app.vercel.app/api/health

# Données économiques
https://your-app.vercel.app/api/economic-data

# Export données
https://your-app.vercel.app/api/export

# Cron de refresh (automatique)
https://your-app.vercel.app/api/cron/refresh-data
```

## 🔧 Dépannage

### Erreurs Communes
```bash
# Build error - ESLint
# Solution: Voir eslintrc.js pour ignorer warnings

# Supabase connection error  
# Solution: Vérifier variables d'environnement

# Cron job not working
# Solution: Vérifier CRON_SECRET défini
```

### Logs Vercel
```bash
# CLI
vercel logs

# Ou dans dashboard Vercel > Functions tab
```

---

**✅ Le projet est maintenant prêt pour un déploiement Vercel professionnel !**