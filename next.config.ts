import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Bundle size最適化
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2'],
  },
  // Bundle Analyzerの設定（開発用）
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any, { webpack }: { webpack: any }) => {
      if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: true,
            generateStatsFile: true,
          })
        );
      }
      return config;
    },
  }),
};

export default nextConfig;
