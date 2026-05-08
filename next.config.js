/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['khghiyvahojawixjmlsv.supabase.co'],
  },
}

module.exports = nextConfig
