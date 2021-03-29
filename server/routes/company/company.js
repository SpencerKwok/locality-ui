import psql from "../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many company requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const f = async (companyId) => {
      const [companies, error] = await psql.query(
        sqlString.format("SELECT * FROM companies WHERE id=? ORDER BY name", [
          companyId,
        ])
      );
      if (error) {
        res.send(JSON.stringify(error));
      } else if (companies.rows.length != 1) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Company does not exist" },
          })
        );
      } else {
        res.send(
          JSON.stringify({
            company: companies.rows[0],
          })
        );
      }
    };

    if (Number.isInteger(req.body.id)) {
      await f(req.body.id);
    } else {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid company id" },
        })
      );
    }
  }
);

export default router;
