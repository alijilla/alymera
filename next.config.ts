import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts', '@xyflow/react', 'motion'],
  }, 
   typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
