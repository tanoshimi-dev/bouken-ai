import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // Resolve .js imports to .ts files in workspace packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'profile.line-scdn.net',
      },
    ],
  },
};

export default nextConfig;
