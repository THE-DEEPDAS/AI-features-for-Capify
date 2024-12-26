/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  async redirects() {
    return [
      {
        source: '/results',
        destination: '/results',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
