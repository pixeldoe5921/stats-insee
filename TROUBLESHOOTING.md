# 🛠️ Troubleshooting Guide - INSEE Economic Dashboard

> Complete troubleshooting guide for common issues with Vercel, Supabase, Next.js, and CI/CD

## 🏗️ Build & Development Issues

### TypeScript Errors

#### `Type 'any' is not assignable`
```bash
# Error
Type 'any' is not assignable to type 'string'

# Solution
# 1. Enable strict mode progressively
"strict": true,
"noImplicitAny": true

# 2. Add explicit types
const data: EconomicData[] = response.data;

# 3. Use type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

#### `Cannot find module '@/*'`
```bash
# Error
Cannot find module '@/components/Dashboard'

# Solution
# Check tsconfig.json paths configuration
"paths": {
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"]
}

# Restart TypeScript server in VS Code
Cmd+Shift+P > "TypeScript: Restart TS Server"
```

#### `Property does not exist on type`
```bash
# Error
Property 'indicator' does not exist on type 'unknown'

# Solution
# 1. Define proper types
interface EconomicData {
  indicator: string;
  value: number;
  date: string;
}

# 2. Use type assertion with validation
const data = response.data as EconomicData;
if (!data.indicator) throw new Error('Invalid data');

# 3. Use Zod for runtime validation
const schema = z.object({
  indicator: z.string(),
  value: z.number(),
  date: z.string()
});
const data = schema.parse(response.data);
```

### ESLint Errors

#### `'React' must be in scope`
```bash
# Error (with React 18)
'React' must be in scope when using JSX

# Solution
# Update .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
```

#### `Expected 0 arguments, but got 1`
```bash
# Error
ESLint: Expected 0 arguments, but got 1. (@typescript-eslint/no-unused-vars)

# Solution
# Configure unused vars rule
"@typescript-eslint/no-unused-vars": [
  "error",
  { 
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }
]

# Use underscore prefix for unused parameters
const handler = (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
};
```

### Next.js Build Issues

#### `Module not found: Can't resolve`
```bash
# Error
Module not found: Can't resolve 'fs' in '/app/components'

# Solution
# Update next.config.mjs for client-side modules
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

#### `Error: Text content does not match server-rendered HTML`
```bash
# Error (Hydration mismatch)
Warning: Text content does not match server-rendered HTML

# Solution
# 1. Use useEffect for client-only content
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return null;

# 2. Suppress hydration warning (last resort)
<div suppressHydrationWarning={true}>
  {new Date().toLocaleString()}
</div>

# 3. Use dynamic imports for client components
const ClientOnlyComponent = dynamic(
  () => import('./ClientOnly'),
  { ssr: false }
);
```

### Package Manager Issues

#### `ERESOLVE unable to resolve dependency tree`
```bash
# Error
ERESOLVE unable to resolve dependency tree

# Solution
# 1. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
pnpm install

# 2. Use force flag (temporarily)
pnpm install --force

# 3. Check for conflicting dependencies
pnpm list --depth=0
```

#### `Cannot resolve dependency`
```bash
# Error
Cannot resolve dependency '@types/node' from different versions

# Solution
# 1. Check pnpm-lock.yaml conflicts
git checkout pnpm-lock.yaml

# 2. Reinstall with specific version
pnpm add @types/node@^20.19.1 --save-dev

# 3. Use overrides in package.json
"pnpm": {
  "overrides": {
    "@types/node": "^20.19.1"
  }
}
```

## 🗄️ Supabase Issues

### Connection Problems

#### `Invalid API URL or key`
```bash
# Error
supabase-js: Invalid API URL or key

# Solution
# 1. Verify environment variables
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20));

# 2. Check .env.local file exists and is loaded
# 3. Restart development server
pnpm dev

# 4. Verify Supabase project is active
# Check Supabase dashboard status
```

#### `SSL connection failed`
```bash
# Error
connection to server at "xxx.supabase.co" failed: SSL connection failed

# Solution
# 1. Check Supabase project status
# 2. Verify network connectivity
ping xxx.supabase.co

# 3. Add SSL configuration
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
```

### Authentication Issues

#### `User not authenticated`
```bash
# Error
Row Level Security policy violation

# Solution
# 1. Check RLS policies in Supabase dashboard
# 2. Verify user authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

# 3. Update RLS policy
CREATE POLICY "Users can view own data" ON profiles
    FOR SELECT USING (auth.uid() = id);

# 4. Disable RLS temporarily for testing
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

#### `Session not found`
```bash
# Error
Session not found for user

# Solution
# 1. Check session persistence
const { data: { session } } = await supabase.auth.getSession();

# 2. Refresh session
const { data, error } = await supabase.auth.refreshSession();

# 3. Handle session in middleware
// middleware.ts
export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  await supabase.auth.getSession();
  return res;
}
```

### Database Issues

#### `relation does not exist`
```bash
# Error
relation "economic_data" does not exist

# Solution
# 1. Run migration script
# Copy supabase/migrations/001_initial_schema.sql to Supabase SQL Editor

# 2. Check table names and schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

# 3. Verify database connection
node scripts/supabase-validate.js
```

#### `column does not exist`
```bash
# Error
column "created_at" of relation "economic_data" does not exist

# Solution
# 1. Check migration was applied correctly
# 2. Add missing column
ALTER TABLE economic_data ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

# 3. Update TypeScript types
interface EconomicData {
  id: string;
  indicator: string;
  value: number;
  created_at: string; // Add this
}
```

## 🚀 Vercel Deployment Issues

### Build Failures

#### `Command "build" exited with 1`
```bash
# Error
Error: Command "build" exited with 1

# Solution
# 1. Check build logs in Vercel dashboard
# 2. Test build locally
pnpm run build

# 3. Common fixes:
# - Fix TypeScript errors
# - Resolve ESLint warnings
# - Check environment variables
# - Verify imports are correct
```

#### `Module not found in production`
```bash
# Error
Module not found: Can't resolve './component' in production

# Solution
# 1. Check file case sensitivity
# component.tsx vs Component.tsx

# 2. Verify import paths
// Wrong
import { Button } from './button';
// Correct
import { Button } from './Button';

# 3. Use absolute imports
import { Button } from '@/components/ui/Button';
```

#### `Function exceeded maximum execution time`
```bash
# Error
Task timed out after 10.00 seconds

# Solution
# 1. Optimize API routes
export const config = {
  maxDuration: 30, // Increase timeout
};

# 2. Add timeout to database queries
const { data, error } = await supabase
  .from('economic_data')
  .select('*')
  .abortSignal(AbortSignal.timeout(5000));

# 3. Implement caching
export const revalidate = 3600; // Cache for 1 hour
```

### Environment Variables

#### `Environment variable not defined`
```bash
# Error
process.env.NEXT_PUBLIC_SUPABASE_URL is undefined

# Solution
# 1. Add to Vercel project settings
# Settings > Environment Variables

# 2. Check variable name exactly
# NEXT_PUBLIC_SUPABASE_URL (not SUPABASE_URL)

# 3. Deploy after adding variables
vercel --prod

# 4. Verify in function
console.log('Env vars:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});
```

#### `Environment variable contains invalid characters`
```bash
# Error
Invalid environment variable value

# Solution
# 1. Escape special characters
MY_VAR="value with spaces"

# 2. Use base64 for complex values
echo "complex value" | base64
# Then decode in code
const value = Buffer.from(process.env.ENCODED_VAR, 'base64').toString();

# 3. Check for newlines
# Remove \n at end of values
```

### Domain & SSL Issues

#### `Domain not found`
```bash
# Error
Domain verification failed

# Solution
# 1. Check DNS records are correct
# 2. Wait for propagation (up to 48 hours)
# 3. Use dig to verify
dig your-domain.com

# 4. Check domain configuration in Vercel
# Settings > Domains
```

#### `SSL certificate failed`
```bash
# Error
SSL certificate generation failed

# Solution
# 1. Wait for automatic retry (up to 24 hours)
# 2. Remove and re-add domain
# 3. Check CAA records
dig CAA your-domain.com

# 4. Contact Vercel support for custom certificates
```

## 🔄 CI/CD Pipeline Issues

### GitHub Actions Failures

#### `Action failed with exit code 1`
```bash
# Error
Process completed with exit code 1

# Solution
# 1. Check action logs for specific error
# 2. Common issues:
#    - Missing secrets
#    - Failed tests
#    - Build errors
#    - Wrong Node version

# 3. Debug locally
act # Tool to run GitHub Actions locally
```

#### `Secret not found`
```bash
# Error
Error: Input required and not supplied: vercel-token

# Solution
# 1. Add secrets in GitHub repository
# Settings > Secrets and variables > Actions

# 2. Check secret names match exactly
VERCEL_TOKEN (not VERCEL_API_TOKEN)

# 3. Update workflow file
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

#### `Permission denied`
```bash
# Error
Permission denied: push to main branch

# Solution
# 1. Check branch protection rules
# Settings > Branches > Branch protection rules

# 2. Add bypass permissions for GitHub Actions
# Allow bypass of branch protection for GitHub Actions

# 3. Use PAT with correct permissions
# Settings > Developer settings > Personal access tokens
```

## 📊 Performance Issues

### Slow Page Load

#### `Large bundle size`
```bash
# Error
Warning: Bundle size exceeded 244 kB

# Solution
# 1. Analyze bundle
npm run analyze
# or
ANALYZE=true pnpm build

# 2. Dynamic imports for large components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
});

# 3. Code splitting by route
# Use Next.js App Router automatic code splitting
```

#### `Slow database queries`
```bash
# Error
API response time > 5 seconds

# Solution
# 1. Add database indexes
CREATE INDEX idx_economic_data_date ON economic_data(date DESC);

# 2. Optimize queries
# Use select() to limit columns
const { data } = await supabase
  .from('economic_data')
  .select('indicator, value, date')
  .limit(100);

# 3. Implement caching
export const revalidate = 3600; // ISR caching
```

### Memory Issues

#### `JavaScript heap out of memory`
```bash
# Error
FATAL ERROR: Ineffective mark-compacts near heap limit

# Solution
# 1. Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# 2. Optimize data processing
# Process data in chunks
const processInChunks = (data: any[], chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

# 3. Use streaming for large datasets
export async function* streamData() {
  const batchSize = 1000;
  let offset = 0;
  
  while (true) {
    const batch = await fetchBatch(offset, batchSize);
    if (batch.length === 0) break;
    yield batch;
    offset += batchSize;
  }
}
```

## 🔒 Security Issues

### CORS Errors

#### `Blocked by CORS policy`
```bash
# Error
Access to fetch at 'api/data' from origin 'localhost:3000' has been blocked by CORS policy

# Solution
# 1. Add CORS headers to API routes
export async function GET(request: Request) {
  const response = NextResponse.json({ data: 'example' });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

# 2. Use Next.js built-in CORS handling
# next.config.mjs
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
      ],
    },
  ];
}
```

### Authentication Errors

#### `JWT token expired`
```bash
# Error
JWT expired

# Solution
# 1. Implement token refresh
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    // Redirect to login
    router.push('/login');
  }
};

# 2. Use auth state change listener
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

## 🆘 Emergency Procedures

### Production Rollback

#### `Critical bug in production`
```bash
# Immediate rollback
# 1. Go to Vercel dashboard
# 2. Find previous working deployment
# 3. Click "Promote to Production"

# Or via CLI
vercel rollback https://your-app-vercel.app --target=production

# 4. Investigate and fix in separate branch
git checkout -b hotfix/critical-bug
# Fix the issue
git commit -m "fix: critical production bug"
# Test thoroughly before deploying
```

### Database Recovery

#### `Data corruption or loss`
```bash
# 1. Check Supabase backups
# Go to Supabase Dashboard > Settings > Database
# Download latest backup

# 2. Restore from backup
# Use Supabase CLI or dashboard restore function

# 3. Point-in-time recovery
# Available for Pro plans and above

# 4. Prevention
# Regular backups
supabase db dump --file=backup-$(date +%Y%m%d-%H%M%S).sql
```

### Complete System Failure

#### `Everything is down`
```bash
# 1. Check status pages
# https://www.vercel-status.com/
# https://status.supabase.com/

# 2. Verify DNS and domain
nslookup your-domain.com
curl -I https://your-domain.com

# 3. Check GitHub Actions
# Look for failed deployments

# 4. Emergency contact
# Have escalation procedures ready
# Contact platform support
```

---

## 📞 Getting Help

### Documentation Resources
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### Community Support
- **Next.js Discord**: https://discord.gg/nextjs
- **Vercel Discord**: https://discord.gg/vercel
- **Supabase Discord**: https://discord.supabase.com/

### Professional Support
- **Vercel Pro Support**: Available with Pro plans
- **Supabase Support**: Available with Pro plans
- **GitHub Support**: Available with paid plans

---

**💡 Remember: Most issues can be resolved by checking logs, verifying configuration, and testing locally first. Always backup before making changes in production!**

*Last updated: December 2024*