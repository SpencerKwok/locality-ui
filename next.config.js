const zlib = require("zlib");

module.exports = {
  compress: {
    br: function () {
      return zlib.createBrotliCompress({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]:
            zlib.constants.BROTLI_MIN_QUALITY,
        },
      });
    },
    gzip: function () {
      return zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED });
    },
  },
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
