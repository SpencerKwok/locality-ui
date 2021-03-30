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
      "Too many products requests from this IP, please try again after 24hrs",
  }),
  async (req, res) => {
    const f = async (companyId) => {
      const [products, error] = await psql.query(
        sqlString.format(
          "SELECT CONCAT(company_id, '_', id) AS object_id, name, image FROM products WHERE company_id=? ORDER BY name",
          [companyId]
        )
      );
      if (error) {
        res.send(JSON.stringify(error));
      } else {
        res.send(
          JSON.stringify({
            products: products.rows.map(({ object_id, name, image }) => {
              return {
                objectID: object_id,
                name,
                image,
              };
            }),
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
