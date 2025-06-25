-- 🗄️ Rollback Initial Schema Migration
-- Safely removes all tables and functions created in 001_initial_schema.sql

-- Drop triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_economic_data_updated_at ON economic_data;
DROP TRIGGER IF EXISTS update_dashboard_configs_updated_at ON dashboard_configs;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_table_info();

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS api_usage;
DROP TABLE IF EXISTS dashboard_configs;
DROP TABLE IF EXISTS data_exports;
DROP TABLE IF EXISTS economic_data;
DROP TABLE IF EXISTS profiles;

-- Drop custom types
DROP TYPE IF EXISTS indicator_category;
DROP TYPE IF EXISTS data_source;
DROP TYPE IF EXISTS frequency_type;

-- Note: Extensions are not dropped as they might be used by other schemas