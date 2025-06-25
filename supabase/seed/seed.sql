-- 🌱 Seed Data for INSEE Dashboard
-- Inserts sample data for development and testing

-- Insert sample economic data
INSERT INTO economic_data (indicator, value, date, source, unit, frequency, geography, category) VALUES
-- GDP Data
('PIB France', 2765.3, '2024-09-30', 'INSEE', 'Milliards €', 'QUARTERLY', 'France', 'GDP'),
('PIB France', 2752.1, '2024-06-30', 'INSEE', 'Milliards €', 'QUARTERLY', 'France', 'GDP'),
('PIB France', 2748.8, '2024-03-31', 'INSEE', 'Milliards €', 'QUARTERLY', 'France', 'GDP'),
('PIB Zone Euro', 12234.5, '2024-09-30', 'EUROSTAT', 'Milliards €', 'QUARTERLY', 'Zone Euro', 'GDP'),
('PIB Zone Euro', 12198.2, '2024-06-30', 'EUROSTAT', 'Milliards €', 'QUARTERLY', 'Zone Euro', 'GDP'),

-- Unemployment Data
('Taux de chômage', 7.2, '2024-12-01', 'INSEE', '%', 'MONTHLY', 'France', 'UNEMPLOYMENT'),
('Taux de chômage', 7.3, '2024-11-01', 'INSEE', '%', 'MONTHLY', 'France', 'UNEMPLOYMENT'),
('Taux de chômage', 7.4, '2024-10-01', 'INSEE', '%', 'MONTHLY', 'France', 'UNEMPLOYMENT'),
('Taux de chômage', 7.5, '2024-09-01', 'INSEE', '%', 'MONTHLY', 'France', 'UNEMPLOYMENT'),
('Taux de chômage Zone Euro', 6.3, '2024-12-01', 'EUROSTAT', '%', 'MONTHLY', 'Zone Euro', 'UNEMPLOYMENT'),
('Taux de chômage Zone Euro', 6.4, '2024-11-01', 'EUROSTAT', '%', 'MONTHLY', 'Zone Euro', 'UNEMPLOYMENT'),

-- Inflation Data
('Inflation (IPC)', 1.8, '2024-12-01', 'INSEE', '%', 'MONTHLY', 'France', 'INFLATION'),
('Inflation (IPC)', 1.9, '2024-11-01', 'INSEE', '%', 'MONTHLY', 'France', 'INFLATION'),
('Inflation (IPC)', 2.1, '2024-10-01', 'INSEE', '%', 'MONTHLY', 'France', 'INFLATION'),
('Inflation (IPC)', 2.3, '2024-09-01', 'INSEE', '%', 'MONTHLY', 'France', 'INFLATION'),
('Inflation Zone Euro', 2.0, '2024-12-01', 'EUROSTAT', '%', 'MONTHLY', 'Zone Euro', 'INFLATION'),
('Inflation Zone Euro', 2.1, '2024-11-01', 'EUROSTAT', '%', 'MONTHLY', 'Zone Euro', 'INFLATION'),

-- Trade Data
('Balance commerciale', -8.2, '2024-11-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),
('Balance commerciale', -7.8, '2024-10-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),
('Balance commerciale', -8.5, '2024-09-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),
('Exportations', 52.3, '2024-11-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),
('Exportations', 51.8, '2024-10-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),
('Importations', 60.5, '2024-11-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),
('Importations', 59.6, '2024-10-01', 'INSEE', 'Milliards €', 'MONTHLY', 'France', 'TRADE'),

-- Demographics Data
('Population France', 68.2, '2024-01-01', 'INSEE', 'Millions', 'YEARLY', 'France', 'DEMOGRAPHICS'),
('Population Zone Euro', 347.8, '2024-01-01', 'EUROSTAT', 'Millions', 'YEARLY', 'Zone Euro', 'DEMOGRAPHICS'),
('Taux de natalité', 10.8, '2024-01-01', 'INSEE', '‰', 'YEARLY', 'France', 'DEMOGRAPHICS'),
('Espérance de vie', 82.7, '2024-01-01', 'INSEE', 'Années', 'YEARLY', 'France', 'DEMOGRAPHICS'),

-- Industrial Production
('Production industrielle', 98.5, '2024-11-01', 'INSEE', 'Indice base 100', 'MONTHLY', 'France', 'OTHER'),
('Production industrielle', 97.8, '2024-10-01', 'INSEE', 'Indice base 100', 'MONTHLY', 'France', 'OTHER'),
('Production industrielle', 98.2, '2024-09-01', 'INSEE', 'Indice base 100', 'MONTHLY', 'France', 'OTHER'),

-- Energy Data
('Consommation électricité', 468.2, '2024-11-01', 'INSEE', 'TWh', 'MONTHLY', 'France', 'OTHER'),
('Consommation électricité', 445.7, '2024-10-01', 'INSEE', 'TWh', 'MONTHLY', 'France', 'OTHER'),
('Prix pétrole Brent', 72.5, '2024-12-15', 'OECD', '$/baril', 'DAILY', 'International', 'OTHER'),
('Prix pétrole Brent', 71.8, '2024-12-14', 'OECD', '$/baril', 'DAILY', 'International', 'OTHER'),

-- Regional Data
('PIB Île-de-France', 765.2, '2024-01-01', 'INSEE', 'Milliards €', 'YEARLY', 'Île-de-France', 'GDP'),
('PIB Auvergne-Rhône-Alpes', 298.5, '2024-01-01', 'INSEE', 'Milliards €', 'YEARLY', 'Auvergne-Rhône-Alpes', 'GDP'),
('PIB Nouvelle-Aquitaine', 185.3, '2024-01-01', 'INSEE', 'Milliards €', 'YEARLY', 'Nouvelle-Aquitaine', 'GDP'),
('Taux chômage Île-de-France', 6.8, '2024-12-01', 'INSEE', '%', 'MONTHLY', 'Île-de-France', 'UNEMPLOYMENT'),
('Taux chômage PACA', 8.9, '2024-12-01', 'INSEE', '%', 'MONTHLY', 'PACA', 'UNEMPLOYMENT');

-- Insert sample dashboard configuration
INSERT INTO dashboard_configs (user_id, name, config, is_default) VALUES
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID in production
    'Dashboard par défaut',
    '{
        "layout": [
            {"i": "gdp-chart", "x": 0, "y": 0, "w": 6, "h": 3},
            {"i": "unemployment-chart", "x": 6, "y": 0, "w": 6, "h": 3},
            {"i": "inflation-chart", "x": 0, "y": 3, "w": 6, "h": 3},
            {"i": "trade-chart", "x": 6, "y": 3, "w": 6, "h": 3}
        ],
        "widgets": [
            {
                "id": "gdp-chart",
                "type": "line-chart",
                "title": "PIB France",
                "indicator": "PIB France",
                "period": "12m"
            },
            {
                "id": "unemployment-chart",
                "type": "area-chart",
                "title": "Taux de chômage",
                "indicator": "Taux de chômage",
                "period": "24m"
            },
            {
                "id": "inflation-chart",
                "type": "bar-chart",
                "title": "Inflation (IPC)",
                "indicator": "Inflation (IPC)",
                "period": "12m"
            },
            {
                "id": "trade-chart",
                "type": "line-chart",
                "title": "Balance commerciale",
                "indicator": "Balance commerciale",
                "period": "12m"
            }
        ]
    }',
    true
);

-- Add some metadata to economic_data
UPDATE economic_data SET metadata = jsonb_build_object(
    'seasonal_adjustment', 'CVS-CJO',
    'methodology', 'Base 2014',
    'last_revision', '2024-12-15',
    'quality_score', 'A'
) WHERE source = 'INSEE';

UPDATE economic_data SET metadata = jsonb_build_object(
    'seasonal_adjustment', 'SA',
    'methodology', 'ESA 2010',
    'last_revision', '2024-12-10',
    'quality_score', 'A'
) WHERE source = 'EUROSTAT';