/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  output: 'standalone',
  // Configure Turbopack for Next.js 16+ (default build tool)
  turbopack: {
    // Resolve aliases work similarly to webpack
    resolveAlias: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scottradjusting.com',
      },
      {
        protocol: 'https',
        hostname: 'amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Skip static error pages to avoid SSG issues with error boundaries
    staticGenerationRetryCount: 0,
  },
  // Server external packages (not bundled)
  // Includes heavy AI/ML packages and unused database drivers
  serverExternalPackages: [
    'onnxruntime-node',
    'chromadb',
    '@prisma/client',
    '@tensorflow/tfjs-node',
    '@huggingface/transformers',
    'sharp',
    'canvas',
    'puppeteer',
    'playwright',
    // Database drivers (we only use PostgreSQL via pg package)
    'neo4j-driver',
    'mysql',
    'mysql2',
    'mssql',
    'sql.js',
    'sqlite3',
    'better-sqlite3',
    'oracledb',
    'react-native-sqlite-storage',
    'mongodb',
    'redis',
    'ioredis',
    'typeorm-aurora-data-api-driver',
  ],
}

module.exports = nextConfig
