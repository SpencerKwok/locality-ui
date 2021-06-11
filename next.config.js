const withPWA = require("next-pwa");

module.exports = withPWA({
  // Compression is done by the server
  compress: false,
  future: {
    webpack5: true,
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  poweredByHeader: false,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV !== "production",
    runtimeCaching: [],
    dynamicStartUrl: false,
  },
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/inventory",
        permanent: false,
      },
    ];
  },
});
