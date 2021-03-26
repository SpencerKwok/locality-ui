import algolia from "../../algolia/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";

const router = Router();
router.post(
  "/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message:
      "Too many product requests from this IP, please try again after 5 minutes",
  }),
  async (req, res, next) => {
    const f = async (companyId, productId) => {
      const objectID = `${companyId}_${productId}`;
      const [object, error] = await algolia.getObject(objectID);
      if (error) {
        res.send(JSON.stringify({ error }));
      } else if (!object) {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Product does not exist" },
          })
        );
      } else {
        res.send(
          JSON.stringify({
            product: { ...object },
          })
        );
      }
    };

    const productId = req.body.id;
    if (!Number.isInteger(productId)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid product id" },
        })
      );
      return;
    }

    if (Number.isInteger(req.body.companyId)) {
      await f(req.body.companyId, productId);
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
