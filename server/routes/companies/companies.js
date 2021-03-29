import psql from "../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";

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
          companies: companies.rows,
        })
      );
    }
  }
);

export default router;
