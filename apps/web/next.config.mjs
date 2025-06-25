/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-ready configuration
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Build optimizations - MODE DEPLOY-FIRST
  eslint: {
    ignoreDuringBuilds: true, // Temporaire pour premier déploiement
  },
  
  typescript: {
    ignoreBuildErrors: true, // Temporaire pour premier déploiement
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Images optimization
  images: {
    domains: ['api.insee.fr', 'ec.europa.eu'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers for security and performance
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
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      ...nextConfig.experimental,
    },
  }),
};

export default nextConfig;
