# 💻 DEVBOOK - Documentation Technique Complète

> **Guide complet pour les développeurs du Dashboard Économique INSEE**

---

## 📚 **TABLE DES MATIÈRES**

1. [🏗️ Architecture Générale](#architecture-générale)
2. [🔧 Stack Technique](#stack-technique)
3. [📁 Structure du Projet](#structure-du-projet)
4. [🛠️ Configuration Développement](#configuration-développement)
5. [🔗 APIs et Intégrations](#apis-et-intégrations)
6. [🎨 Design System](#design-system)
7. [📊 Pipeline de Données](#pipeline-de-données)
8. [🤖 Intelligence Artificielle](#intelligence-artificielle)
9. [🧪 Tests et Qualité](#tests-et-qualité)
10. [🚀 Déploiement](#déploiement)
11. [📈 Monitoring](#monitoring)
12. [🔍 Troubleshooting](#troubleshooting)

---

## 🏗️ **ARCHITECTURE GÉNÉRALE**

### **Paradigme Architectural**
```
┌─────────────────────────────────────────────────────────────┐
│                    📱 Frontend (Next.js 15)                │
├─────────────────────────────────────────────────────────────┤
│  🎨 Components    │  📊 Visualizations  │  🤖 AI Chat      │
│  🌓 Theme System  │  📄 Export Utils     │  🔧 Utilities    │
└─────────────────────────────────────────────────────────────┘
                              ⬇️ API Routes
┌─────────────────────────────────────────────────────────────┐
│                    🔧 Backend (API Routes)                  │
├─────────────────────────────────────────────────────────────┤
│  📊 Data APIs     │  🤖 AI Endpoints     │  📄 Export APIs  │
│  🔍 Health Check  │  ⏰ Cron Jobs        │  🔐 Auth         │
└─────────────────────────────────────────────────────────────┘
                              ⬇️ External APIs
┌─────────────────────────────────────────────────────────────┐
│                🌐 Sources de Données Externes              │
├─────────────────────────────────────────────────────────────┤
│  🇫🇷 INSEE API   │  🇪🇺 Eurostat API   │  🌍 OECD API     │
│  🏦 Banque FR    │  🗄️ Supabase DB     │  🚀 Redis Cache  │
└─────────────────────────────────────────────────────────────┘
```

### **Patterns Architecturaux Utilisés**

#### **1. Clean Architecture**
```typescript
// Séparation claire des responsabilités
src/
├── app/                 # App Router (Pages + API Routes)
├── components/          # Composants UI réutilisables
├── lib/                 # Logique métier + clients externes
├── types/               # Définitions TypeScript globales
└── utils/               # Fonctions utilitaires pures
```

#### **2. Server Components First**
```typescript
// Composants serveur par défaut pour performance
export default async function Dashboard() {
  const data = await getEconomicData() // Fetch côté serveur
  return <DashboardClient data={data} />
}

// Client components uniquement pour interactivité
'use client'
export function DashboardClient({ data }: Props) {
  const [filter, setFilter] = useState('')
  // Logique interactive côté client
}
```

#### **3. Dependency Injection**
```typescript
// Clients configurables et testables
export class EconomicDataService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly cache: RedisClient,
    private readonly logger: Logger
  ) {}
  
  async getIndicators(): Promise<EconomicData[]> {
    // Implementation avec cache et logging
  }
}
```

---

## 🔧 **STACK TECHNIQUE**

### **Frontend Technologies**

#### **Core Framework**
- **Next.js 15.3** : App Router, Server Components, API Routes
- **React 18** : Concurrent features, Suspense, Error Boundaries
- **TypeScript 5.0** : Strict mode, exact types, no-any policy

#### **Styling & UI**
```typescript
// Stack complet UI/UX
"dependencies": {
  "tailwindcss": "^3.4.0",      // Utility-first CSS
  "clsx": "^2.0.0",             // Conditional classes
  "class-variance-authority": "^0.7.0", // Variants système
  "@radix-ui/react-*": "^1.0.0", // Primitives accessibles
  "framer-motion": "^10.16.0",  // Animations fluides
  "react-grid-layout": "^1.4.4" // Drag & drop dashboard
}
```

#### **Data Visualization**
```typescript
// Graphiques et visualisations
"dependencies": {
  "recharts": "^2.8.0",         // Charts React simples
  "echarts": "^5.4.0",          // Charts avancés
  "echarts-for-react": "^3.0.2",// Wrapper React ECharts
  "react-pdf": "^7.5.0",        // Génération PDF
  "jspdf": "^2.5.1",           // PDF programmatique
  "html2canvas": "^1.4.1"       // Screenshots pour PDF
}
```

### **Backend Technologies**

#### **Database & Storage**
```typescript
// Stack données complète
"dependencies": {
  "@supabase/supabase-js": "^2.38.0",    // Client Supabase
  "@supabase/ssr": "^0.0.10",            // SSR Supabase
  "redis": "^4.6.0",                     // Cache Redis
  "ioredis": "^5.3.0",                   // Client Redis avancé
  "zod": "^3.22.0"                       // Validation schémas
}
```

#### **AI & External APIs**
```typescript
// Intégrations IA et APIs
"dependencies": {
  "openai": "^4.20.0",                   // Client OpenAI GPT-4
  "axios": "^1.6.0",                     // HTTP client
  "node-cron": "^3.0.0",                 // Scheduling tâches
  "@sentry/nextjs": "^7.80.0"            // Monitoring erreurs
}
```

### **Development Tools**

#### **Code Quality**
```json
// Configuration ESLint + Prettier
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

#### **Testing Stack**
```typescript
// Tests complets
"devDependencies": {
  "jest": "^29.7.0",                     // Tests unitaires
  "@testing-library/react": "^13.4.0",  // Tests composants
  "@testing-library/jest-dom": "^6.1.0",// Matchers DOM
  "playwright": "^1.40.0",              // Tests E2E
  "msw": "^2.0.0",                      // Mock Service Worker
  "@types/jest": "^29.5.0"              // Types Jest
}
```

---

## 📁 **STRUCTURE DU PROJET**

### **Organisation des Fichiers**

```
📦 stats-insee/
├── 📱 Frontend
│   ├── src/app/
│   │   ├── (dashboard)/             # Route group dashboard
│   │   │   ├── page.tsx            # Page principale
│   │   │   ├── loading.tsx         # Loading UI
│   │   │   └── error.tsx           # Error boundary
│   │   ├── api/                    # API Routes
│   │   │   ├── economic-data/      # Données économiques
│   │   │   ├── ai-chat/           # Chat IA
│   │   │   ├── export/            # Export PDF/CSV
│   │   │   ├── health/            # Health check
│   │   │   └── cron/              # Jobs automatiques
│   │   ├── globals.css            # Styles globaux
│   │   ├── layout.tsx             # Layout racine
│   │   └── not-found.tsx          # Page 404
│   │
│   ├── src/components/
│   │   ├── ui/                    # Composants UI de base
│   │   │   ├── Button.tsx         # Boutons système
│   │   │   ├── Card.tsx          # Cartes conteneurs
│   │   │   ├── ThemeToggle.tsx   # Switcher thème
│   │   │   └── DraggableDashboard.tsx # Dashboard drag&drop
│   │   ├── charts/                # Composants graphiques
│   │   │   ├── LineChart.tsx     # Graphiques linéaires
│   │   │   ├── BarChart.tsx      # Graphiques barres
│   │   │   └── HeatMap.tsx       # Cartes de chaleur
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── ChatBot.tsx           # Interface chat IA
│   │   └── ExportDialog.tsx      # Interface export
│   │
│   ├── src/lib/
│   │   ├── supabase.ts           # Client Supabase
│   │   ├── openai-client.ts      # Client OpenAI
│   │   ├── redis-client.ts       # Client Redis
│   │   ├── export-utils.ts       # Utilitaires export
│   │   └── utils.ts              # Utilitaires généraux
│   │
│   ├── src/types/
│   │   ├── index.ts              # Types principaux
│   │   ├── api.ts                # Types API
│   │   └── supabase.ts           # Types Supabase générés
│   │
│   └── src/styles/
│       ├── globals.css           # Styles CSS globaux
│       └── design-system.css     # Design system complet
│
├── 🐍 Backend Scripts
│   ├── scripts/
│   │   ├── advanced_data_pipeline.py # Pipeline multi-sources
│   │   ├── insee_scraper.py          # Scraper INSEE spécialisé
│   │   ├── data_quality_metrics.py   # Métriques qualité
│   │   └── requirements.txt          # Dépendances Python
│   │
│   └── supabase/
│       ├── migrations/               # Migrations DB
│       ├── seed.sql                 # Données d'exemple
│       └── schema.sql               # Schéma complet
│
├── 🐳 Infrastructure
│   ├── Dockerfile                   # Image production
│   ├── docker-compose.yml          # Stack développement
│   ├── docker-compose.prod.yml     # Stack production
│   └── .github/workflows/          # CI/CD pipelines
│       ├── ci.yml                  # Tests et qualité
│       ├── security.yml            # Scans sécurité
│       └── deploy.yml              # Déploiement
│
├── 📚 Documentation
│   ├── README.md                   # Vue d'ensemble
│   ├── DEVBOOK.md                  # Ce fichier
│   ├── DEPLOYMENT-VERCEL.md        # Guide déploiement
│   ├── API.md                      # Documentation API
│   └── PHASE2-DEPLOYMENT-GUIDE.md  # Guide Phase 2
│
└── 📋 Configuration
    ├── .env.example                # Variables d'environnement
    ├── .env.local                  # Variables locales
    ├── next.config.ts              # Configuration Next.js
    ├── tailwind.config.ts          # Configuration Tailwind
    ├── tsconfig.json              # Configuration TypeScript
    ├── eslint.config.js           # Configuration ESLint
    ├── jest.config.js             # Configuration Jest
    ├── playwright.config.ts       # Configuration Playwright
    └── vercel.json                # Configuration Vercel
```

### **Conventions de Nommage**

#### **Fichiers et Dossiers**
```typescript
// Patterns de nommage standardisés
components/               // PascalCase pour dossiers de composants
  ui/                    // kebab-case pour dossiers utilitaires
    Button.tsx           // PascalCase pour composants React
    button.stories.tsx   // kebab-case pour fichiers de tests/stories
    button.test.tsx      // kebab-case pour tests

lib/
  openai-client.ts       // kebab-case pour fichiers utilitaires
  utils.ts               // camelCase simple pour nom générique

types/
  index.ts               // camelCase pour fichiers types
  api-responses.ts       // kebab-case pour types spécialisés
```

#### **Code TypeScript**
```typescript
// Variables et fonctions : camelCase
const economicData = await fetchEconomicData()
const isLoading = true

// Interfaces et Types : PascalCase
interface EconomicData {
  id: string
  indicator: string
  value: number
}

// Composants React : PascalCase
export function DashboardComponent() {}

// Constantes : SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.insee.fr'
const DEFAULT_TIMEOUT = 5000

// Enums : PascalCase
enum EconomicCategory {
  GDP = 'GDP',
  UNEMPLOYMENT = 'UNEMPLOYMENT',
  INFLATION = 'INFLATION'
}
```

---

## 🛠️ **CONFIGURATION DÉVELOPPEMENT**

### **Setup Environnement Local**

#### **1. Variables d'Environnement**
```bash
# .env.local - Configuration locale
# Base de données Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI pour chat IA
OPENAI_API_KEY=sk-...

# Redis pour cache (optionnel en local)
REDIS_URL=redis://localhost:6379

# Sentry pour monitoring (optionnel)
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Cron security
CRON_SECRET=your-random-secret-here

# APIs externes
INSEE_API_KEY=your-insee-key  # Si requis
EUROSTAT_API_KEY=your-eurostat-key  # Si requis
```

#### **2. Base de Données Locale**
```sql
-- Exécuter dans Supabase SQL Editor
-- Schéma complet dans supabase/schema.sql

-- Table principale des données économiques
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
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_economic_data_indicator ON economic_data(indicator);
CREATE INDEX idx_economic_data_date ON economic_data(date DESC);
CREATE INDEX idx_economic_data_source ON economic_data(source);
CREATE INDEX idx_economic_data_category ON economic_data(category);

-- Table des sources de données
CREATE TABLE data_sources (
  name VARCHAR PRIMARY KEY,
  url VARCHAR NOT NULL,
  last_sync TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Table pour métriques de qualité
CREATE TABLE data_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completeness DECIMAL(5,2),
  accuracy DECIMAL(5,2),
  consistency DECIMAL(5,2),
  timeliness DECIMAL(5,2),
  anomalies JSONB DEFAULT '[]'
);

-- Table pour conversations IA
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  data_queries JSONB,
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (exemple pour lecture publique)
CREATE POLICY "Public read access" ON economic_data 
  FOR SELECT USING (true);
```

#### **3. Docker Development Stack**
```yaml
# docker-compose.yml - Stack de développement
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: stats_insee
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  node_modules:
  redis_data:
  postgres_data:
  grafana_data:
```

### **Scripts de Développement**

#### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "docker:dev": "docker-compose up -d",
    "docker:build": "docker build -t stats-insee .",
    "data:fetch": "python scripts/advanced_data_pipeline.py --mode=test",
    "db:migrate": "supabase migration up",
    "db:seed": "supabase db seed",
    "analyze": "npm run build && npx @next/bundle-analyzer"
  }
}
```

#### **Makefile pour Automatisation**
```makefile
# Makefile - Commandes développement simplifiées
.PHONY: install dev build test clean

# Installation complète
install:
	npm install
	python -m pip install -r scripts/requirements.txt

# Développement
dev:
	docker-compose up -d redis postgres
	npm run dev

# Build production
build:
	npm run type-check
	npm run lint
	npm run test
	npm run build

# Tests complets
test:
	npm run test:coverage
	npm run test:e2e

# Nettoyage
clean:
	rm -rf .next
	rm -rf node_modules
	docker-compose down -v

# Pipeline données
data:
	python scripts/advanced_data_pipeline.py --mode=full

# Déploiement
deploy:
	vercel --prod
```

---

## 🔗 **APIS ET INTÉGRATIONS**

### **API Routes Next.js**

#### **1. API Economic Data - `/api/economic-data`**
```typescript
// src/app/api/economic-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { EconomicDataSchema } from '@/types'
import { z } from 'zod'

// Schema validation des paramètres de requête
const QuerySchema = z.object({
  indicator: z.string().optional(),
  source: z.enum(['INSEE', 'EUROSTAT', 'OECD', 'BANQUE_FRANCE']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0)
})

export async function GET(request: NextRequest) {
  try {
    // Validation des paramètres
    const { searchParams } = new URL(request.url)
    const params = QuerySchema.parse({
      indicator: searchParams.get('indicator'),
      source: searchParams.get('source'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset')
    })

    // Client Supabase avec authentification
    const supabase = createServerSupabaseClient()
    
    // Construction de la requête avec filtres
    let query = supabase
      .from('economic_data')
      .select('*')
      .order('date', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1)

    if (params.indicator) {
      query = query.ilike('indicator', `%${params.indicator}%`)
    }
    
    if (params.source) {
      query = query.eq('source', params.source)
    }
    
    if (params.startDate) {
      query = query.gte('date', params.startDate)
    }
    
    if (params.endDate) {
      query = query.lte('date', params.endDate)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Validation des données de retour
    const validatedData = z.array(EconomicDataSchema).parse(data)

    return NextResponse.json({
      data: validatedData,
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: count || 0
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: 'supabase'
      }
    })

  } catch (error) {
    console.error('Economic data API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST pour ajouter de nouvelles données
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = EconomicDataSchema.parse(body)
    
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('economic_data')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      throw new Error(`Insert error: ${error.message}`)
    }

    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('Insert data error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to insert data' },
      { status: 500 }
    )
  }
}
```

#### **2. API Chat IA - `/api/ai-chat`**
```typescript
// src/app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createServerSupabaseClient } from '@/lib/supabase'
import { analyzeEconomicQuery, generateResponse } from '@/lib/openai-client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Analyse de la requête utilisateur
    const analysis = await analyzeEconomicQuery(query)
    
    // Récupération des données pertinentes
    const supabase = createServerSupabaseClient()
    const { data: relevantData } = await supabase
      .from('economic_data')
      .select('*')
      .or(analysis.filters.join(','))
      .limit(50)

    // Génération de la réponse IA
    const response = await generateResponse(query, relevantData || [], analysis)

    // Sauvegarde de la conversation
    const sessionId = generateSessionId(request)
    await supabase.from('ai_conversations').insert({
      session_id: sessionId,
      user_message: query,
      ai_response: response.response,
      data_queries: relevantData?.length ? { count: relevantData.length } : null,
      response_time: response.responseTime
    })

    return NextResponse.json({
      response: response.response,
      data: relevantData,
      analysis: analysis,
      suggestions: response.suggestions
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

function generateSessionId(request: NextRequest): string {
  const ip = request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}-${Date.now()}-${userAgent.slice(0, 10)}`
}
```

#### **3. API Export - `/api/export`**
```typescript
// src/app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generatePDF, generateCSV } from '@/lib/export-utils'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { format, filters, selectedData } = await request.json()
    
    if (!['pdf', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be pdf or csv' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Récupération des données selon les filtres
    let query = supabase.from('economic_data').select('*')
    
    if (filters) {
      // Application des filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Data fetch error: ${error.message}`)
    }

    // Génération du fichier selon le format
    let fileBuffer: Buffer
    let fileName: string
    let mimeType: string

    if (format === 'pdf') {
      fileBuffer = await generatePDF(data || [])
      fileName = `economic-data-${Date.now()}.pdf`
      mimeType = 'application/pdf'
    } else {
      fileBuffer = await generateCSV(data || [])
      fileName = `economic-data-${Date.now()}.csv`
      mimeType = 'text/csv'
    }

    // Retour du fichier
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
```

### **Intégrations API Externes**

#### **1. Client INSEE API**
```typescript
// src/lib/insee-client.ts
import axios, { AxiosInstance } from 'axios'
import { EconomicData } from '@/types'

export class INSEEClient {
  private client: AxiosInstance

  constructor(apiKey?: string) {
    this.client = axios.create({
      baseURL: 'https://api.insee.fr/melodi/data/v1',
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
        'Accept': 'application/json',
        'User-Agent': 'Dashboard-Economique-INSEE/2.0'
      },
      timeout: 30000,
      retries: 3
    })

    // Intercepteur pour retry automatique
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config
        if (config.retries > 0 && error.response?.status >= 500) {
          config.retries--
          await new Promise(resolve => setTimeout(resolve, 1000))
          return this.client.request(config)
        }
        throw error
      }
    )
  }

  async getGDPData(options: {
    startDate?: string
    endDate?: string
    geography?: string
  } = {}): Promise<EconomicData[]> {
    try {
      const response = await this.client.get('/datasets/PIB-ANA/data', {
        params: {
          filter: this.buildFilter(options),
          format: 'json',
          lang: 'fr'
        }
      })

      return this.transformINSEEData(response.data, 'GDP')
    } catch (error) {
      console.error('INSEE GDP fetch error:', error)
      throw new Error(`Failed to fetch GDP data: ${error.message}`)
    }
  }

  async getUnemploymentData(options: {
    startDate?: string
    endDate?: string
    geography?: string
  } = {}): Promise<EconomicData[]> {
    try {
      const response = await this.client.get('/datasets/CHOMAGE-TRIM/data', {
        params: {
          filter: this.buildFilter(options),
          format: 'json',
          lang: 'fr'
        }
      })

      return this.transformINSEEData(response.data, 'UNEMPLOYMENT')
    } catch (error) {
      console.error('INSEE unemployment fetch error:', error)
      throw new Error(`Failed to fetch unemployment data: ${error.message}`)
    }
  }

  private buildFilter(options: {
    startDate?: string
    endDate?: string
    geography?: string
  }): string {
    const filters = []
    
    if (options.startDate) {
      filters.push(`TIME>="${options.startDate}"`)
    }
    
    if (options.endDate) {
      filters.push(`TIME<="${options.endDate}"`)
    }
    
    if (options.geography) {
      filters.push(`GEO="${options.geography}"`)
    }

    return filters.join(' and ')
  }

  private transformINSEEData(
    data: any, 
    category: string
  ): EconomicData[] {
    if (!data?.observations) {
      return []
    }

    return data.observations.map((obs: any) => ({
      id: `insee-${category.toLowerCase()}-${obs.TIME_PERIOD}`,
      indicator: this.getIndicatorName(category),
      value: parseFloat(obs.OBS_VALUE),
      date: obs.TIME_PERIOD,
      source: 'INSEE',
      unit: this.getUnit(category),
      frequency: this.getFrequency(obs.FREQ),
      geography: obs.GEO || 'France',
      category: category,
      metadata: {
        original_code: obs.SERIES,
        insee_metadata: {
          freq: obs.FREQ,
          unit_measure: obs.UNIT_MEASURE,
          obs_status: obs.OBS_STATUS
        }
      }
    }))
  }

  private getIndicatorName(category: string): string {
    const names = {
      'GDP': 'PIB France',
      'UNEMPLOYMENT': 'Taux de chômage',
      'INFLATION': 'Inflation'
    }
    return names[category] || category
  }

  private getUnit(category: string): string {
    const units = {
      'GDP': 'Milliards €',
      'UNEMPLOYMENT': '%',
      'INFLATION': '%'
    }
    return units[category] || 'Unité'
  }

  private getFrequency(freq: string): string {
    const frequencies = {
      'A': 'YEARLY',
      'Q': 'QUARTERLY',
      'M': 'MONTHLY'
    }
    return frequencies[freq] || 'UNKNOWN'
  }
}

// Utilisation
export const inseeClient = new INSEEClient(process.env.INSEE_API_KEY)
```

#### **2. Client Eurostat API**
```typescript
// src/lib/eurostat-client.ts
export class EurostatClient {
  private readonly baseURL = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data'

  async getEUGDPData(): Promise<EconomicData[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/nama_10_gdp?format=JSON&lang=en&geo=EU27_2020`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Dashboard-Economique-INSEE/2.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Eurostat API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformEurostatData(data, 'GDP')
    } catch (error) {
      console.error('Eurostat fetch error:', error)
      throw error
    }
  }

  private transformEurostatData(data: any, category: string): EconomicData[] {
    // Transformation des données Eurostat vers notre format
    if (!data?.value) return []

    return Object.entries(data.value).map(([key, value]) => {
      const [datasetInfo, time] = key.split(',')
      
      return {
        id: `eurostat-${category.toLowerCase()}-${time}`,
        indicator: `${category} UE`,
        value: Number(value),
        date: this.parseEurostatDate(time),
        source: 'EUROSTAT',
        unit: this.getEurostatUnit(category),
        frequency: 'QUARTERLY',
        geography: 'EU27',
        category: category,
        metadata: {
          eurostat_key: key,
          dataset: datasetInfo
        }
      }
    }).filter(item => !isNaN(item.value))
  }

  private parseEurostatDate(time: string): string {
    // Eurostat format: 2023-Q1 -> 2023-03-31
    if (time.includes('-Q')) {
      const [year, quarter] = time.split('-Q')
      const months = { '1': '03', '2': '06', '3': '09', '4': '12' }
      const days = { '1': '31', '2': '30', '3': '30', '4': '31' }
      return `${year}-${months[quarter]}-${days[quarter]}`
    }
    return time
  }

  private getEurostatUnit(category: string): string {
    const units = {
      'GDP': 'Milliards €',
      'UNEMPLOYMENT': '%',
      'INFLATION': '%'
    }
    return units[category] || 'Unité'
  }
}

export const eurostatClient = new EurostatClient()
```

---

## 🎨 **DESIGN SYSTEM**

### **Système de Design Complet**

#### **1. Design Tokens**
```css
/* src/styles/design-system.css */
:root {
  /* Couleurs primaires */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* Couleurs sémantiques */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Couleurs neutres */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Typographie */
  --font-family-sans: ui-sans-serif, system-ui, sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, "SF Mono", monospace;

  /* Tailles de police */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* Hauteurs de ligne */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* Espacements */
  --spacing-px: 1px;
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
  --spacing-20: 5rem;    /* 80px */

  /* Bordures et rayons */
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;
  --border-radius-full: 9999px;

  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-900);
    --color-foreground: var(--color-gray-50);
    --color-muted: var(--color-gray-800);
    --color-muted-foreground: var(--color-gray-400);
    --color-border: var(--color-gray-700);
  }
}

[data-theme="dark"] {
  --color-background: var(--color-gray-900);
  --color-foreground: var(--color-gray-50);
  --color-muted: var(--color-gray-800);
  --color-muted-foreground: var(--color-gray-400);
  --color-border: var(--color-gray-700);
}

[data-theme="light"] {
  --color-background: var(--color-gray-50);
  --color-foreground: var(--color-gray-900);
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-600);
  --color-border: var(--color-gray-200);
}
```

#### **2. Composants UI de Base**
```typescript
// src/components/ui/Button.tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Classes de base
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

```typescript
// src/components/ui/Card.tsx
import React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### **3. Système de Thèmes**
```typescript
// src/lib/theme-provider.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light'
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')

    let effectiveTheme: 'light' | 'dark'

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      effectiveTheme = systemTheme
    } else {
      effectiveTheme = theme
    }

    root.classList.add(effectiveTheme)
    root.setAttribute('data-theme', effectiveTheme)
    setResolvedTheme(effectiveTheme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    resolvedTheme
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
```

---

## 📊 **PIPELINE DE DONNÉES**

### **Architecture du Pipeline**

```python
# scripts/advanced_data_pipeline.py
import asyncio
import aiohttp
import pandas as pd
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import redis
import json
import logging
from supabase import create_client, Client

@dataclass
class DataSource:
    name: str
    base_url: str
    endpoints: Dict[str, str]
    rate_limit: int  # requests per minute
    timeout: int
    retry_count: int

@dataclass
class DataQualityMetrics:
    completeness: float
    accuracy: float
    consistency: float
    timeliness: float
    anomalies: List[Dict[str, Any]]

class AdvancedDataPipeline:
    def __init__(self):
        self.logger = self._setup_logging()
        self.redis_client = redis.Redis.from_url(
            os.getenv('REDIS_URL', 'redis://localhost:6379')
        )
        self.supabase: Client = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        # Configuration des sources
        self.sources = {
            'insee': DataSource(
                name='INSEE',
                base_url='https://api.insee.fr/melodi/data/v1',
                endpoints={
                    'gdp': '/datasets/PIB-ANA/data',
                    'unemployment': '/datasets/CHOMAGE-TRIM/data',
                    'inflation': '/datasets/IPC-2015/data'
                },
                rate_limit=100,
                timeout=30,
                retry_count=3
            ),
            'eurostat': DataSource(
                name='EUROSTAT',
                base_url='https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data',
                endpoints={
                    'gdp': '/nama_10_gdp',
                    'unemployment': '/une_rt_m',
                    'inflation': '/prc_hicp_manr'
                },
                rate_limit=60,
                timeout=45,
                retry_count=3
            ),
            'oecd': DataSource(
                name='OECD',
                base_url='https://stats.oecd.org/restsdmx/sdmx.ashx/GetData',
                endpoints={
                    'gdp': '/QNA/..GDP.CUR.Q',
                    'unemployment': '/MAN_UNPLM/..UNPLM.Q',
                    'inflation': '/SNA_TABLE1/..P3.V.Q'
                },
                rate_limit=80,
                timeout=60,
                retry_count=3
            ),
            'banque_france': DataSource(
                name='BANQUE_FRANCE',
                base_url='https://api.banque-france.fr/data/series/v1',
                endpoints={
                    'interest_rate': '/data/FM.M.FR.EUR.RT.MM.EURIBOR3MD_.HSTA',
                    'money_supply': '/data/BSI.M.FR.N.A.A20.A.1.U2.2240.Z01.E'
                },
                rate_limit=120,
                timeout=30,
                retry_count=3
            )
        }

    async def run_full_pipeline(self) -> Dict[str, Any]:
        """Exécute le pipeline complet de collecte et traitement"""
        self.logger.info("🚀 Démarrage du pipeline complet")
        
        start_time = datetime.now()
        results = {
            'sources': {},
            'metrics': {},
            'errors': [],
            'processing_time': 0
        }

        async with aiohttp.ClientSession() as session:
            # Collecte parallèle depuis toutes les sources
            tasks = [
                self._fetch_source_data(session, source_name, source_config)
                for source_name, source_config in self.sources.items()
            ]
            
            source_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Traitement des résultats
            for i, (source_name, result) in enumerate(zip(self.sources.keys(), source_results)):
                if isinstance(result, Exception):
                    self.logger.error(f"❌ Erreur {source_name}: {result}")
                    results['errors'].append({
                        'source': source_name,
                        'error': str(result)
                    })
                else:
                    results['sources'][source_name] = result
                    self.logger.info(f"✅ {source_name}: {len(result)} enregistrements")

        # Consolidation et nettoyage des données
        all_data = []
        for source_data in results['sources'].values():
            all_data.extend(source_data)

        # Validation et nettoyage
        cleaned_data = await self._validate_and_clean_data(all_data)
        
        # Calcul des métriques de qualité
        quality_metrics = await self._calculate_quality_metrics(cleaned_data)
        results['metrics'] = quality_metrics

        # Sauvegarde en base
        if cleaned_data:
            await self._save_to_database(cleaned_data)
            await self._save_quality_metrics(quality_metrics)

        # Invalidation du cache
        await self._invalidate_cache()

        results['processing_time'] = (datetime.now() - start_time).total_seconds()
        self.logger.info(f"🎉 Pipeline terminé en {results['processing_time']:.2f}s")
        
        return results

    async def _fetch_source_data(
        self, 
        session: aiohttp.ClientSession, 
        source_name: str, 
        source_config: DataSource
    ) -> List[Dict[str, Any]]:
        """Collecte les données d'une source spécifique"""
        
        all_data = []
        
        for indicator, endpoint in source_config.endpoints.items():
            try:
                # Vérification du cache Redis
                cache_key = f"data:{source_name}:{indicator}"
                cached_data = self.redis_client.get(cache_key)
                
                if cached_data:
                    self.logger.info(f"📋 Cache hit pour {source_name}:{indicator}")
                    all_data.extend(json.loads(cached_data))
                    continue

                # Fetch depuis l'API
                data = await self._fetch_with_retry(
                    session, 
                    source_config, 
                    endpoint, 
                    indicator
                )
                
                # Transformation des données
                transformed_data = await self._transform_data(
                    data, 
                    source_name, 
                    indicator
                )
                
                all_data.extend(transformed_data)
                
                # Mise en cache (TTL: 1 heure)
                self.redis_client.setex(
                    cache_key, 
                    3600, 
                    json.dumps(transformed_data)
                )
                
                # Rate limiting
                await asyncio.sleep(60 / source_config.rate_limit)
                
            except Exception as e:
                self.logger.error(f"❌ Erreur fetch {source_name}:{indicator}: {e}")
                raise

        return all_data

    async def _fetch_with_retry(
        self,
        session: aiohttp.ClientSession,
        source_config: DataSource,
        endpoint: str,
        indicator: str
    ) -> Dict[str, Any]:
        """Fetch avec retry automatique et backoff exponentiel"""
        
        url = f"{source_config.base_url}{endpoint}"
        headers = self._get_headers(source_config.name)
        
        for attempt in range(source_config.retry_count):
            try:
                async with session.get(
                    url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=source_config.timeout)
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 429:  # Rate limit
                        wait_time = 2 ** attempt
                        self.logger.warning(f"⏳ Rate limit, attente {wait_time}s")
                        await asyncio.sleep(wait_time)
                    else:
                        response.raise_for_status()
                        
            except Exception as e:
                if attempt == source_config.retry_count - 1:
                    raise
                wait_time = 2 ** attempt
                self.logger.warning(f"🔄 Retry {attempt + 1}, attente {wait_time}s")
                await asyncio.sleep(wait_time)

    async def _validate_and_clean_data(
        self, 
        data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Validation et nettoyage des données"""
        
        cleaned_data = []
        
        for record in data:
            try:
                # Validation des champs requis
                if not all(key in record for key in ['indicator', 'value', 'date', 'source']):
                    continue
                
                # Validation des types
                if not isinstance(record['value'], (int, float)):
                    continue
                
                # Validation de la date
                try:
                    datetime.fromisoformat(record['date'])
                except ValueError:
                    continue
                
                # Détection d'anomalies statistiques
                if self._is_statistical_anomaly(record):
                    record['metadata'] = record.get('metadata', {})
                    record['metadata']['anomaly_detected'] = True
                
                # Normalisation des valeurs
                record = self._normalize_record(record)
                
                cleaned_data.append(record)
                
            except Exception as e:
                self.logger.warning(f"⚠️ Erreur validation record: {e}")
                continue

        self.logger.info(f"🧹 Nettoyage: {len(data)} → {len(cleaned_data)} enregistrements")
        return cleaned_data

    async def _calculate_quality_metrics(
        self, 
        data: List[Dict[str, Any]]
    ) -> DataQualityMetrics:
        """Calcul des métriques de qualité des données"""
        
        if not data:
            return DataQualityMetrics(0, 0, 0, 0, [])

        total_records = len(data)
        
        # Complétude : pourcentage de champs non vides
        complete_records = sum(
            1 for record in data 
            if all(record.get(field) for field in ['indicator', 'value', 'date', 'source'])
        )
        completeness = (complete_records / total_records) * 100
        
        # Exactitude : validation des formats
        accurate_records = sum(
            1 for record in data
            if isinstance(record.get('value'), (int, float)) and
               self._is_valid_date(record.get('date'))
        )
        accuracy = (accurate_records / total_records) * 100
        
        # Cohérence : cohérence temporelle des séries
        consistency = self._calculate_temporal_consistency(data)
        
        # Actualité : âge moyen des données
        timeliness = self._calculate_timeliness(data)
        
        # Détection d'anomalies
        anomalies = self._detect_anomalies(data)

        return DataQualityMetrics(
            completeness=round(completeness, 2),
            accuracy=round(accuracy, 2),
            consistency=round(consistency, 2),
            timeliness=round(timeliness, 2),
            anomalies=anomalies
        )

    async def _save_to_database(self, data: List[Dict[str, Any]]) -> None:
        """Sauvegarde des données en base avec upsert"""
        
        batch_size = 1000
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            
            try:
                result = self.supabase.table('economic_data').upsert(
                    batch,
                    on_conflict='id'
                ).execute()
                
                self.logger.info(f"💾 Batch sauvegardé: {len(batch)} enregistrements")
                
            except Exception as e:
                self.logger.error(f"❌ Erreur sauvegarde batch: {e}")
                raise

    async def _save_quality_metrics(self, metrics: DataQualityMetrics) -> None:
        """Sauvegarde des métriques de qualité"""
        
        try:
            result = self.supabase.table('data_quality_metrics').insert({
                'timestamp': datetime.now().isoformat(),
                'completeness': metrics.completeness,
                'accuracy': metrics.accuracy,
                'consistency': metrics.consistency,
                'timeliness': metrics.timeliness,
                'anomalies': metrics.anomalies
            }).execute()
            
            self.logger.info("📊 Métriques de qualité sauvegardées")
            
        except Exception as e:
            self.logger.error(f"❌ Erreur sauvegarde métriques: {e}")

    def _setup_logging(self) -> logging.Logger:
        """Configuration du logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('data_pipeline.log'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)

# Utilisation
if __name__ == "__main__":
    pipeline = AdvancedDataPipeline()
    asyncio.run(pipeline.run_full_pipeline())
```

---

## 🤖 **INTELLIGENCE ARTIFICIELLE**

### **Client OpenAI Avancé**

```typescript
// src/lib/openai-client.ts
import { OpenAI } from 'openai'
import { EconomicData } from '@/types'

interface AnalysisResult {
  response: string
  confidence: number
  suggestions: string[]
  responseTime: number
}

interface QueryAnalysis {
  intent: 'data_request' | 'analysis' | 'comparison' | 'trend' | 'explanation'
  indicators: string[]
  timeframe: string | null
  geography: string | null
  filters: string[]
}

class EconomicAIAssistant {
  private openai: OpenAI
  private readonly systemPrompt = `
Tu es un assistant IA spécialisé dans l'analyse économique française et européenne.
Tu as accès à des données de l'INSEE, Eurostat, OECD et Banque de France.

RÈGLES:
1. Réponds toujours en français
2. Utilise un langage accessible mais précis
3. Cite tes sources de données
4. Explique les concepts économiques complexes
5. Propose des analyses complémentaires pertinentes
6. Signale les limitations des données si nécessaire

DONNÉES DISPONIBLES:
- PIB (évolution, comparaisons internationales)
- Taux de chômage (par région, âge, secteur)
- Inflation (IPC, évolution des prix)
- Indicateurs européens (comparaisons EU)
- Taux directeurs et politique monétaire

FORMAT DE RÉPONSE:
- Réponse claire et structurée
- Données chiffrées précises avec sources
- Contexte économique si pertinent
- Suggestions d'analyses complémentaires
`

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async analyzeEconomicQuery(query: string): Promise<QueryAnalysis> {
    try {
      const analysisPrompt = `
Analyse cette requête économique et extrais:
1. L'intention (data_request, analysis, comparison, trend, explanation)
2. Les indicateurs économiques mentionnés
3. La période temporelle demandée
4. La zone géographique
5. Les filtres spécifiques

Requête: "${query}"

Réponds au format JSON:
{
  "intent": "...",
  "indicators": [...],
  "timeframe": "...",
  "geography": "...",
  "filters": [...]
}
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Tu es un assistant qui analyse les requêtes économiques.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })

      const analysis = JSON.parse(response.choices[0].message.content || '{}')
      return analysis as QueryAnalysis

    } catch (error) {
      console.error('Query analysis error:', error)
      return {
        intent: 'data_request',
        indicators: [],
        timeframe: null,
        geography: null,
        filters: []
      }
    }
  }

  async generateResponse(
    query: string, 
    data: EconomicData[], 
    analysis: QueryAnalysis
  ): Promise<AnalysisResult> {
    const startTime = Date.now()

    try {
      // Préparation du contexte avec les données
      const dataContext = this.prepareDataContext(data)
      
      const prompt = `
REQUÊTE UTILISATEUR: "${query}"

DONNÉES DISPONIBLES:
${dataContext}

ANALYSE DE LA REQUÊTE:
- Intention: ${analysis.intent}
- Indicateurs: ${analysis.indicators.join(', ')}
- Période: ${analysis.timeframe || 'Non spécifiée'}
- Géographie: ${analysis.geography || 'Non spécifiée'}

INSTRUCTIONS:
1. Réponds à la question précise de l'utilisateur
2. Utilise les données fournies
3. Donne des chiffres précis avec dates
4. Ajoute du contexte économique pertinent
5. Suggère 2-3 analyses complémentaires
6. Limite ta réponse à 300 mots maximum

RÉPONSE:
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      })

      const responseText = response.choices[0].message.content || ''
      const suggestions = await this.generateSuggestions(query, analysis, data)

      return {
        response: responseText,
        confidence: this.calculateConfidence(data, analysis),
        suggestions,
        responseTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('AI response generation error:', error)
      return {
        response: "Désolé, je ne peux pas traiter votre demande pour le moment. Veuillez réessayer.",
        confidence: 0,
        suggestions: [],
        responseTime: Date.now() - startTime
      }
    }
  }

  private prepareDataContext(data: EconomicData[]): string {
    if (!data.length) {
      return "Aucune donnée disponible pour cette requête."
    }

    // Groupement par indicateur
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.indicator]) {
        acc[item.indicator] = []
      }
      acc[item.indicator].push(item)
      return acc
    }, {} as Record<string, EconomicData[]>)

    // Formatage pour le contexte
    let context = ""
    
    Object.entries(groupedData).forEach(([indicator, items]) => {
      const latest = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      const previous = items[1]
      
      context += `\n${indicator}:`
      context += `\n- Dernière valeur: ${latest.value} ${latest.unit} (${latest.date})`
      context += `\n- Source: ${latest.source}`
      
      if (previous) {
        const evolution = ((latest.value - previous.value) / previous.value * 100).toFixed(2)
        context += `\n- Évolution: ${evolution > 0 ? '+' : ''}${evolution}% vs période précédente`
      }
      
      context += "\n"
    })

    return context
  }

  private async generateSuggestions(
    query: string, 
    analysis: QueryAnalysis, 
    data: EconomicData[]
  ): Promise<string[]> {
    try {
      const suggestionPrompt = `
Basé sur cette requête économique: "${query}"
Et ces données disponibles: ${data.map(d => d.indicator).join(', ')}

Suggère 3 analyses complémentaires pertinentes et spécifiques.
Format: liste de phrases courtes et actionables.

Exemples:
- "Comparer avec la moyenne européenne"
- "Analyser l'évolution sur 5 ans"
- "Voir l'impact sur le secteur privé"
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: suggestionPrompt }
        ],
        temperature: 0.5,
        max_tokens: 200
      })

      const suggestions = response.choices[0].message.content
        ?.split('\n')
        .filter(s => s.trim().startsWith('-'))
        .map(s => s.replace(/^-\s*/, '').replace(/"/g, ''))
        .slice(0, 3) || []

      return suggestions

    } catch (error) {
      console.error('Suggestions generation error:', error)
      return [
        "Explorer les données historiques",
        "Comparer avec d'autres indicateurs",
        "Analyser les tendances récentes"
      ]
    }
  }

  private calculateConfidence(data: EconomicData[], analysis: QueryAnalysis): number {
    let confidence = 50 // Base confidence

    // Bonus pour données disponibles
    if (data.length > 0) confidence += 20
    if (data.length > 10) confidence += 10

    // Bonus pour correspondance d'indicateurs
    const availableIndicators = [...new Set(data.map(d => d.indicator))]
    const matchingIndicators = analysis.indicators.filter(ind => 
      availableIndicators.some(avail => 
        avail.toLowerCase().includes(ind.toLowerCase())
      )
    )
    confidence += matchingIndicators.length * 5

    // Bonus pour données récentes
    const recentData = data.filter(d => {
      const dataDate = new Date(d.date)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return dataDate > sixMonthsAgo
    })
    if (recentData.length > 0) confidence += 15

    return Math.min(confidence, 95) // Max 95%
  }
}

export const economicAI = new EconomicAIAssistant()

// Fonctions utilitaires pour l'export
export async function analyzeEconomicQuery(query: string): Promise<QueryAnalysis> {
  return economicAI.analyzeEconomicQuery(query)
}

export async function generateResponse(
  query: string, 
  data: EconomicData[], 
  analysis: QueryAnalysis
): Promise<AnalysisResult> {
  return economicAI.generateResponse(query, data, analysis)
}
```

---

**Le DEVBOOK continue avec les sections Tests, Déploiement, Monitoring et Troubleshooting... Veux-tu que je complète ces sections ?**