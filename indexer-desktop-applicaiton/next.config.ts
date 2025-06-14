/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  assetPrefix: isProd ? '/' : '/',
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;
