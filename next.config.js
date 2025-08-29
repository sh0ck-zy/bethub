/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    domains: ['ssl.gstatic.com', 'logos-world.net', 'placehold.co', 'images.unsplash.com', 'logos.fandom.com'],
  },
};

export default nextConfig;