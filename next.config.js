module.exports = {
  poweredByHeader: false,

  // Compression is done by the server
  compress: false,

  redirects: async () => {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/inventory",
        permanent: true,
      },
    ];
  },
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
  reactStrictMode: true,
};
