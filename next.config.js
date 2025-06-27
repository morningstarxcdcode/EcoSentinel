/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  // Service Worker support
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Deployment optimization
  images: {
    domains: ['localhost', 'ecosentinel-ai-demo.vercel.app'],
    unoptimized: process.env.NODE_ENV === 'development' || process.env.EXPORT === 'true',
  },
  // Static export for GitHub Pages (when EXPORT=true)
  ...(process.env.EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
    basePath: '/EcoSentinel',
    assetPrefix: '/EcoSentinel/',
  }),
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'EcoSentinel',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

module.exports = nextConfig;
