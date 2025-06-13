const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lupulos.app/api',
        port: '80',
      },
    ],
  },
};

export default nextConfig;
