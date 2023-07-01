/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/simple',
        permanent: true,
      },
      {
        source: '/pro',
        destination: '/pro/trade/trade',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
