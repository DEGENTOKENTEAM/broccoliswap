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
        destination: '/trade/trade',
        permanent: true,
      },
      {
        source: '/trade',
        destination: '/trade/trade',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
