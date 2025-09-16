/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['stellaradjusting.com', 'amazonaws.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Add externals for heavy dependencies
      config.externals = config.externals || []
      config.externals.push(
        // Exclude onnxruntime-node (404MB) from serverless bundles
        'onnxruntime-node',
        // Exclude chromadb to prevent ML dependencies
        'chromadb',
        // Other heavy ML/AI dependencies
        '@tensorflow/tfjs-node',
        'canvas',
        'puppeteer',
        'playwright'
      )
    }

    return config
  },
}

module.exports = nextConfig