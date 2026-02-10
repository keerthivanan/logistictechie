import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ⚡ SOVEREIGN PERFORMANCE CONFIG */
  reactStrictMode: true,
  poweredByHeader: false,

  // 📸 Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' }, // Carrier Logos
    ],
  },

  // 🚀 Experimental Speed
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },

  // 🛑 Logging Control
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
