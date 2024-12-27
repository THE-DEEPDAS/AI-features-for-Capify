/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['python-shell'],
    appDir: true
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('python-shell');
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/app/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
