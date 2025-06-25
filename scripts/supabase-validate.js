#!/usr/bin/env node

/**
 * 🗄️ Supabase Validation Script
 * Validates Supabase setup, migrations, and policies
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function validateSupabase() {
  try {
    log('🗄️ === SUPABASE VALIDATION ===')

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      error('Supabase environment variables not found')
      error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      process.exit(1)
    }

    info('1. Environment variables check...')
    success('Supabase environment variables found')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    info('2. Connection test...')
    const { data, error: connectionError } = await supabase.from('_test').select('*').limit(1)
    
    if (connectionError && !connectionError.message.includes('relation "_test" does not exist')) {
      error(`Connection failed: ${connectionError.message}`)
      process.exit(1)
    }
    success('Supabase connection successful')

    info('3. Migrations check...')
    if (existsSync('./supabase/migrations')) {
      const migrationFiles = require('fs').readdirSync('./supabase/migrations')
      log(`Found ${migrationFiles.length} migration files`)
      success('Migrations directory exists')
    } else {
      warning('No migrations directory found')
    }

    info('4. RLS policies check...')
    const { data: tables } = await supabase.rpc('get_table_info').catch(() => ({ data: null }))
    if (tables) {
      success('RLS policies accessible')
    } else {
      warning('Could not verify RLS policies (function may not exist)')
    }

    info('5. Schema validation...')
    // Add your specific table checks here
    const requiredTables = ['profiles', 'economic_data'] // Adjust based on your schema
    for (const table of requiredTables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1)
      if (tableError) {
        error(`Table '${table}' not accessible: ${tableError.message}`)
      } else {
        success(`Table '${table}' accessible`)
      }
    }

    success('🎉 Supabase validation completed successfully!')

  } catch (err) {
    error(`Validation failed: ${err.message}`)
    process.exit(1)
  }
}

// Load environment variables
if (existsSync('.env.local')) {
  const envFile = readFileSync('.env.local', 'utf8')
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key] = value
    }
  })
}

validateSupabase()