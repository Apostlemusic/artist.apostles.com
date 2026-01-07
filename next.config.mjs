/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://server-apostle-com.onrender.com'
    return [
      {
        source: '/api/artist/:path*',
        destination: `${base}/api/artist/:path*`,
      },
      {
        source: '/api/content/:path*',
        destination: `${base}/api/content/:path*`,
      },
    ]
  },
}

export default nextConfig
