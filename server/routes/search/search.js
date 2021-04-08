import algolia from "../../algolia/client.js";
import psql from "../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

const router = Router();
router.get(
  "/",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24hrs
    max: 500,
    message:
      "Too many search requests from this IP, please try again after 24hrs",
  }),
  async (req, res) => {
    const q = xss(req.query["q"] || "");
    const ip = xss(req.query["ip"] || "");
    const lat = xss(req.query["lat"] || "");
    const lng = xss(req.query["lng"] || "");
    const ext = xss(req.query["ext"] || "");

    let page = 0;
    if (req.query["pg"]) {
      page = parseInt(req.query["pg"]);
      if (Number.isNaN(page)) {
        res.send(
          JSON.stringify({
            error: {
              code: 400,
              message: "Invalid page",
            },
          })
        );
        return;
      }
    }

    const restrictSearchableAttributes = ["name", "primary_keywords"];
    const attributesToRetrieve = [
      "objectID",
      "company",
      "image",
      "link",
      "name",
      "price",
      "price_range",
    ];

    const username = req.cookies["username"];
    let wishlist = [];
    if (username) {
      const [productIDs, wishlistError] = await psql.query(
        sqlString.format("SELECT wishlist FROM users WHERE username=E?", [
          username,
        ])
      );

      // Don't error out because we failed
      // to retrieve the wishlist
      if (!wishlistError) {
        wishlist = productIDs.rows[0].wishlist.split(",").filter(Boolean);
      } else {
        console.log(wishlistError);
      }
    }

    if (lat !== "" && lng !== "") {
      const [results, error] = await algolia.search(q, {
        aroundLatLng: `${lat}, ${lng}`,
        page: page,
        attributesToRetrieve,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
        return;
      }

      if (wishlist.length > 0) {
        results.hits = results.hits.map((hit) => {
          return {
            ...hit,
            wishlist: wishlist.includes(hit.objectID),
          };
        });
      }

      res.send(JSON.stringify(results));
    } else if (ip !== "") {
      const [results, error] = await algolia.search(q, {
        aroundLatLngViaIP: true,
        headers: { "X-Forwarded-For": ip },
        page: page,
        attributesToRetrieve,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
        return;
      }

      if (wishlist.length > 0) {
        results.hits = results.hits.map((hit) => {
          return {
            ...hit,
            wishlist: wishlist.includes(hit.objectID),
          };
        });
      }

      res.send(JSON.stringify(results));
    } else {
      const [results, error] = await algolia.search(q, {
        page: page,
        attributesToRetrieve,
        restrictSearchableAttributes,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
        return;
      }

      if (wishlist.length > 0) {
        results.hits = results.hits.map((hit) => {
          return {
            ...hit,
            wishlist: wishlist.includes(hit.objectID),
          };
        });
      }

      res.send(JSON.stringify(results));
    }
  }
);

export default router;
