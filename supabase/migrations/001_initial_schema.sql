-- 🗄️ Initial Schema Migration
-- Creates tables for INSEE economic data dashboard

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE frequency_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE data_source AS ENUM ('INSEE', 'EUROSTAT', 'OECD', 'ECB');
CREATE TYPE indicator_category AS ENUM ('GDP', 'UNEMPLOYMENT', 'INFLATION', 'TRADE', 'DEMOGRAPHICS', 'OTHER');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'analyst', 'user')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Economic data table
CREATE TABLE economic_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    indicator TEXT NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    date DATE NOT NULL,
    source data_source NOT NULL,
    unit TEXT,
    frequency frequency_type NOT NULL,
    geography TEXT DEFAULT 'France',
    category indicator_category DEFAULT 'OTHER',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_value CHECK (value >= 0),
    CONSTRAINT valid_date CHECK (date <= CURRENT_DATE)
);

-- Data exports table
CREATE TABLE data_exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL CHECK (export_type IN ('PDF', 'CSV', 'EXCEL')),
    filters JSONB DEFAULT '{}',
    file_path TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Dashboard configurations
CREATE TABLE dashboard_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_economic_data_date ON economic_data(date DESC);
CREATE INDEX idx_economic_data_source ON economic_data(source);
CREATE INDEX idx_economic_data_category ON economic_data(category);
CREATE INDEX idx_economic_data_geography ON economic_data(geography);
CREATE INDEX idx_economic_data_indicator ON economic_data(indicator);
CREATE INDEX idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX idx_dashboard_configs_user_id ON dashboard_configs(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_economic_data_updated_at BEFORE UPDATE ON economic_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_configs_updated_at BEFORE UPDATE ON dashboard_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for economic_data (public read, admin write)
CREATE POLICY "Anyone can view economic data" ON economic_data
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert economic data" ON economic_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update economic data" ON economic_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for data_exports
CREATE POLICY "Users can view own exports" ON data_exports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports" ON data_exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for dashboard_configs
CREATE POLICY "Users can view own dashboard configs" ON dashboard_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboard configs" ON dashboard_configs
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for api_usage (admin only)
CREATE POLICY "Admins can view api usage" ON api_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to get table info (for validation)
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE (
    table_name TEXT,
    has_rls BOOLEAN,
    policy_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        t.row_security::BOOLEAN,
        COUNT(p.policyname)::BIGINT
    FROM information_schema.tables t
    LEFT JOIN pg_policies p ON p.tablename = t.table_name
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name, t.row_security
    ORDER BY t.table_name;
END;
$$;