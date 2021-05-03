import Cors from "cors";
import HerokuSSL from "heroku-ssl-redirect";
import Helmet from "helmet";
import { getSession } from "next-auth/client";
import ShrinkRay from "shrink-ray-current";

const cors = Cors({
  origin: [
    "'self'",
    "https://www.etsy.com",
    "https://www.amazon.ca",
    "https://www.amazon.com",
    "https://www.walmart.ca",
    "https://www.walmart.com",
  ],
  allowedHeaders: ["X-Requested-With", "Content-Type"],
  credentials: true,
});

const additionalHeaders = (req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), screen-wake-lock=(), xr-spatial-tracking=()"
  );
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
};

const herokuSSL = HerokuSSL();

const helmet = Helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "blob:", "data:", "https://res.cloudinary.com"],
      connectSrc: [
        "'self'",
        "https://ipv4.icanhazip.com",
        "https://api.ipify.org",
        "https://api.cloudinary.com",
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'self'"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
    },
  },
});

const shrinkRay = ShrinkRay({
  useZopfliForGzip: false,
  cache: () => true,
  zlib: { level: 1 },
  brotli: { quality: 1 },
});

function runMiddlewareHelper(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function runMiddleware(req, res) {
  if (process.env.ENV === "PROD") {
    await runMiddlewareHelper(req, res, herokuSSL);
  }
  await runMiddlewareHelper(req, res, cors);
  await runMiddlewareHelper(req, res, helmet);
  await runMiddlewareHelper(req, res, additionalHeaders);
  await runMiddlewareHelper(req, res, shrinkRay);
}

export async function runMiddlewareUser(req, res) {
  await runMiddleware(req, res);
  await runMiddlewareHelper(req, res, async (req, res, next) => {
    const session = await getSession({ req });
    if (!session || !session.user) {
      res.status(403).json({ error: "Invalid user credentials" });
      return;
    }

    req.locals = { user: session.user };
    next();
  });
}

export async function runMiddlewareBusiness(req, res) {
  await runMiddleware(req, res);
  await runMiddlewareHelper(req, res, async (req, res, next) => {
    const session = await getSession({ req });
    if (!session || !session.user || !session.user.isBusiness) {
      res.status(403).json({ error: "Invalid business credentials" });
      return;
    }

    req.locals = { user: session.user };
    next();
  });
}
