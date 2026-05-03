/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [ {
        protocol: 'https',
        hostname: 'lottie.host',
      },

      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [{
          loader: '@svgr/webpack',
          options: { icon: true },
        }],
        as: '*.js', // Tells Turbopack to treat the output as a JS module
      },
    },
  },
};


export default nextConfig;