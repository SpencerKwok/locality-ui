import psql from "../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import base64Image from "base64-img";

const companyImageCache = new Map();
(async () => {
  const [companies, _] = await psql.query(
    "SELECT * FROM companies ORDER BY name"
  );
  companies.rows.map(async ({ logo }) => {
    // TODO: We get the .jpg image to ensure
    // backwards compatibility on older safari
    // versions. We should switch to server side
    // rendering so we can use .webp for everyone
    const smallerLogo = logo
      .replace("/upload", "/upload/w_400")
      .replace(".webp", ".jpg");
    base64Image.requestBase64(smallerLogo, (err, res, body) => {
      companyImageCache[logo] = body;
    });
  });
})();

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many companies requests from this IP, please try again after 5 minutes",
  }),
  async (_, res) => {
    const [companies, error] = await psql.query(
      "SELECT * FROM companies ORDER BY name"
    );
    if (error) {
      res.send(JSON.stringify(error));
    } else {
      res.send(
        JSON.stringify({
          companies: companies.rows.map((company) => {
            if (companyImageCache[company.logo]) {
              return {
                ...company,
                logo: companyImageCache[company.logo],
              };
            }

            // Cache for future requests
            const smallerLogo = company.logo
              .replace("/upload", "/upload/w_400")
              .replace(".webp", ".jpg");
            base64Image.requestBase64(smallerLogo, (err, res, body) => {
              companyImageCache[company.logo] = body;
            });
            return {
              ...company,
              logo: smallerLogo,
            };
          }),
        })
      );
    }
  }
);

export default router;
