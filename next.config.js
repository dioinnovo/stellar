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
  webpack: (config, { isServer, dev, webpack }) => {
    if (isServer) {
      // Use IgnorePlugin to completely ignore heavy packages during build
      config.plugins = config.plugins || []

      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(onnxruntime-node|chromadb|@prisma\/client|\.prisma|@tensorflow|@huggingface|sharp|canvas|puppeteer|playwright)$/,
        })
      )

      // Also add externals as fallback
      config.externals = config.externals || []
      config.externals.push(
        'onnxruntime-node',
        'chromadb',
        '@prisma/client',
        '.prisma/client',
        '@tensorflow/tfjs-node',
        '@huggingface/transformers',
        'sharp',
        'canvas',
        'puppeteer',
        'playwright'
      )
    }

    return config
  },
}

module.exports = nextConfig