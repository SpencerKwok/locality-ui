import rateLimit from "express-rate-limit";
import { Router } from "express";

import { productDelete } from "../../common/common.js";

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product delete requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const productId = req.body.id;
    if (!Number.isInteger(productId)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product id" },
        })
      );
      return;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.companyId)) {
        const error = await productDelete(req.body.companyId, [productId]);
        if (error) {
          res.send(JSON.stringify({ error }));
        } else {
          res.send(JSON.stringify({}));
        }
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      const error = await productDelete(parseInt(companyId), [productId]);
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify({}));
      }
    }
  }
);

export default router;
