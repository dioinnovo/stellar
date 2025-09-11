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
}

module.exports = nextConfig