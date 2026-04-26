/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: { icon: true }, // Optional: sets height/width to 1em
          },
        ],
        as: '*.js', // Tells Turbopack to treat the output as JavaScript
      },
    },
  }
};


export default nextConfig;