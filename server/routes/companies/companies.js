import psql from "../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import base64Image from "base64-img";

const companyImageCache = new Map();
(async () => {
  const [companies, _] = await psql.query(
    "SELECT * FROM companies ORDER BY name"
  );
  [companies.rows[0]].map(async ({ logo }) => {
    base64Image.requestBase64(logo, (err, res, body) => {
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
            base64Image.requestBase64(company.logo, (err, res, body) => {
              companyImageCache[company.logo] = body;
            });
            return company;
          }),
        })
      );
    }
  }
);

export default router;
