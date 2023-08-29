/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
     "rubic-sdk",
  ],
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/simple',
  //       permanent: true,
  //     },
  //   ];
  // },
  experimental: {
    esmExternals: 'loose'
  },
}

module.exports = nextConfig
