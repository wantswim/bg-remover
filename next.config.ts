import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 兼容 Cloudflare Pages
  trailingSlash: true,
}

export default nextConfig
