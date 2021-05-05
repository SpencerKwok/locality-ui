const zlib = require("zlib");
const { createSecureHeaders } = require("next-secure-headers");

module.exports = {
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              childSrc: ["'self'"],
              connectSrc: [
                "'self'",
                "https://ipv4.icanhazip.com",
                "https://api.ipify.org",
                "https://api.cloudinary.com",
              ],
              defaultSrc: ["'self'"],
              fontSrc: ["'self'"],
              frameSrc: ["'self'"],
              imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com",
              ],
              manifestSrc: ["'self'"],
              mediaSrc: ["'self'", "https://res.cloudinary.com"],
              prefetchSrc: ["'self'"],
              objectSrc: ["'self'"],
              scriptSrc: ["'self'"],
              scriptSrcElem: ["'self'"],
              scriptSrcAttr: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              styleSrcElem: ["'self'", "'unsafe-inline'"],
              styleSrcAttr: ["'self'", "'unsafe-inline'"],
              workerSrc: ["'self'"],
            },
          },
          referrerPolicy: "same-origin",
          xssProtection: "block-rendering",
          "Permissions-Policy":
            "accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), screen-wake-lock=(), xr-spatial-tracking=()",
        }),
      },
    ];
  },
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
