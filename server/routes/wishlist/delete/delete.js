import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

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

    const objectId = xss(req.body.id || "");
    if (objectId === "") {
      res.send(
        JSON.stringify({ error: { code: 400, message: "Invalid object id" } })
      );
      return;
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

    const updatedWishlist = productIDs.rows[0].wishlist
      .split(",")
      .filter((x) => x !== "" && x !== objectId)
      .join(",");
    const [_, removeProductIdError] = await psql.query(
      sqlString.format("UPDATE users SET wishlist=E? WHERE username=E?", [
        updatedWishlist,
        username,
      ])
    );
    if (removeProductIdError) {
      res.send(JSON.stringify({ error: removeProductIdError }));
      return;
    }

    res.send(JSON.stringify({}));
  }
);

export default router;
