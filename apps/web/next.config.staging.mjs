/** @type {import('next').NextConfig} */
// 🎯 CONFIGURATION STAGING - Checks stricts obligatoires
const stagingConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 🚨 VALIDATION STRICTE EN STAGING
  eslint: {
    ignoreDuringBuilds: false, // Bloque sur warnings ESLint
  },
  
  typescript: {
    ignoreBuildErrors: false, // Bloque sur erreurs TypeScript
  },
  
  // Performance et sécurité
  compress: true,
  poweredByHeader: false,
  
  // Images optimization
  images: {
    domains: ['api.insee.fr', 'ec.europa.eu'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default stagingConfig;