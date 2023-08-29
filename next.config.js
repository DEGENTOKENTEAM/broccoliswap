/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
     "rubic-sdk",
  ],
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: !!process.env.NEXT_PUBLIC_SOURCEMAPS,
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
