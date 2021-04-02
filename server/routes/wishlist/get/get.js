import algolia from "../../../algolia/client.js";
import psql from "../../../postgresql/client.js";
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
      "Too many wishlist requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const username = req.cookies["username"];
    if (!username) {
      res.status(403).end();
    }

    const [productIDs, productIDsError] = await psql.query(
      sqlString.format("SELECT wishlist FROM users WHERE username=E?", [
        username,
      ])
    );
    if (productIDsError) {
      res.send(JSON.stringify({ error: productIDsError }));
      return;
    }

    const wishlist = productIDs.rows[0].wishlist.split(",").filter(Boolean);
    const [products, productsError] = await algolia.getObjects(wishlist);
    if (productsError) {
      res.send(JSON.stringify({ error: productsError }));
      return;
    }

    res.send(JSON.stringify({ products }));
  }
);

export default router;
