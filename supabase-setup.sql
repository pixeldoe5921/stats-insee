-- ============================================
-- 🗄️ CONFIGURATION SUPABASE - Dashboard INSEE
-- ============================================
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- ================================
-- 📊 TABLE PRINCIPALE : economic_data
-- ================================
CREATE TABLE IF NOT EXISTS economic_data (
  id TEXT PRIMARY KEY,
  indicator TEXT NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  date TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('INSEE', 'EUROSTAT', 'OECD', 'BANQUE_FRANCE')),
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
  geography TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GDP', 'UNEMPLOYMENT', 'INFLATION', 'TRADE', 'INDUSTRIAL_PRODUCTION', 'CONSUMER_CONFIDENCE', 'GOVERNMENT_DEBT', 'INTEREST_RATES', 'POPULATION', 'HOUSING')),
  sub_category TEXT,
  revision_date TEXT,
  quality_flag TEXT DEFAULT 'NORMAL',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 🔗 TABLE : data_sources
-- ================================
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  api_key TEXT,
  api_version TEXT DEFAULT 'v1',
  last_sync TIMESTAMP WITH TIME ZONE,
  next_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency INTEGER DEFAULT 3600, -- en secondes
  is_active BOOLEAN DEFAULT true,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 📈 TABLE : data_exports
-- ================================
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session TEXT,
  export_type TEXT NOT NULL CHECK (export_type IN ('PDF', 'CSV', 'EXCEL', 'JSON')),
  filters JSONB,
  row_count INTEGER,
  file_size BIGINT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 🤖 TABLE : ai_conversations
-- ================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  data_queries JSONB, -- requêtes SQL générées
  charts_generated JSONB, -- graphiques créés
  response_time INTEGER, -- en millisecondes
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ⚡ INDEX POUR PERFORMANCES
-- ================================

-- Index principaux pour economic_data
CREATE INDEX IF NOT EXISTS idx_economic_data_date ON economic_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_economic_data_category ON economic_data(category);
CREATE INDEX IF NOT EXISTS idx_economic_data_source ON economic_data(source);
CREATE INDEX IF NOT EXISTS idx_economic_data_geography ON economic_data(geography);
CREATE INDEX IF NOT EXISTS idx_economic_data_frequency ON economic_data(frequency);
CREATE INDEX IF NOT EXISTS idx_economic_data_updated ON economic_data(updated_at DESC);

-- Index composites pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_economic_data_cat_geo ON economic_data(category, geography);
CREATE INDEX IF NOT EXISTS idx_economic_data_source_date ON economic_data(source, date DESC);
CREATE INDEX IF NOT EXISTS idx_economic_data_cat_freq ON economic_data(category, frequency);

-- Index pour recherche textuelle
CREATE INDEX IF NOT EXISTS idx_economic_data_indicator_gin ON economic_data USING gin(to_tsvector('french', indicator));

-- Index pour les autres tables
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON data_sources(is_active, next_sync);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id, created_at);

-- ================================
-- 🔄 TRIGGERS POUR MISE À JOUR AUTO
-- ================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur economic_data
DROP TRIGGER IF EXISTS trigger_update_economic_data_updated_at ON economic_data;
CREATE TRIGGER trigger_update_economic_data_updated_at
    BEFORE UPDATE ON economic_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 📊 VUES UTILES
-- ================================

-- Vue pour les dernières données par indicateur
CREATE OR REPLACE VIEW latest_economic_data AS
SELECT DISTINCT ON (category, geography, source) 
    id, indicator, value, date, source, unit, frequency, geography, category, updated_at
FROM economic_data
ORDER BY category, geography, source, date DESC, updated_at DESC;

-- Vue pour statistiques par source
CREATE OR REPLACE VIEW data_source_stats AS
SELECT 
    source,
    COUNT(*) as total_records,
    COUNT(DISTINCT category) as categories_count,
    MIN(date) as earliest_date,
    MAX(date) as latest_date,
    MAX(updated_at) as last_update
FROM economic_data
GROUP BY source;

-- Vue pour dashboard - résumé mensuel
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
    DATE_TRUNC('month', date::date) as month,
    category,
    geography,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    COUNT(*) as data_points
FROM economic_data
WHERE frequency IN ('MONTHLY', 'QUARTERLY')
GROUP BY DATE_TRUNC('month', date::date), category, geography
ORDER BY month DESC;

-- ================================
-- 🛡️ SÉCURITÉ - Row Level Security
-- ================================

-- Activer RLS (si besoin d'authentification)
-- ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique des données économiques
-- CREATE POLICY "Public read access for economic data" ON economic_data
--   FOR SELECT USING (true);

-- ================================
-- 📝 DONNÉES INITIALES
-- ================================

-- Insérer les sources de données par défaut
INSERT INTO data_sources (name, url, api_version, sync_frequency, config) VALUES
('INSEE', 'https://api.insee.fr/series/BDM/V1', 'V1', 3600, '{"timeout": 30, "retry_count": 3}'),
('EUROSTAT', 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data', '1.0', 7200, '{"timeout": 45, "retry_count": 2}'),
('BANQUE_FRANCE', 'https://api.banque-france.fr/series/observations', 'v1', 1800, '{"timeout": 30, "retry_count": 3}')
ON CONFLICT (name) DO NOTHING;

-- ================================
-- 🔧 FONCTIONS UTILITAIRES
-- ================================

-- Fonction pour nettoyer les anciennes données d'export
CREATE OR REPLACE FUNCTION cleanup_old_exports()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM data_exports 
    WHERE created_at < NOW() - INTERVAL '7 days' 
    AND status IN ('COMPLETED', 'FAILED');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour statistiques rapides
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_records', (SELECT COUNT(*) FROM economic_data),
        'sources_count', (SELECT COUNT(*) FROM data_sources WHERE is_active = true),
        'latest_update', (SELECT MAX(updated_at) FROM economic_data),
        'categories', (SELECT COUNT(DISTINCT category) FROM economic_data),
        'countries', (SELECT COUNT(DISTINCT geography) FROM economic_data)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- ✅ VÉRIFICATION FINALE
-- ================================

-- Vérifier que tout est bien créé
SELECT 
    'Tables' as type, 
    COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('economic_data', 'data_sources', 'data_exports', 'ai_conversations')
UNION ALL
SELECT 
    'Indexes' as type,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('economic_data', 'data_sources', 'data_exports', 'ai_conversations')
UNION ALL
SELECT 
    'Views' as type,
    COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('latest_economic_data', 'data_source_stats', 'monthly_summary');

-- Afficher un résumé
SELECT get_dashboard_stats() as configuration_summary;