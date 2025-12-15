/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@tiptap/react', '@tiptap/pm', 'framer-motion'],
  },

  // Bundle analyzer (conditionally enabled)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!dev && !isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html',
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression and optimization
  compress: true,

  // Enable SWC minification


  // Output optimization
  output: 'standalone',

  // Performance optimizations
  poweredByHeader: false,

  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/{{member}}',
    },
  },
};

export default nextConfig;
