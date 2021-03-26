import algolia from "../../algolia/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
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
      "company",
      "image",
      "link",
      "name",
      "price",
      "price_range",
    ];

    if (lat !== "" && lng !== "") {
      const [results, error] = await algolia.search(q, {
        aroundLatLng: `${lat}, ${lng}`,
        page: page,
        attributesToRetrieve,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify(results));
      }
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
      } else {
        res.send(JSON.stringify(results));
      }
    } else {
      const [results, error] = await algolia.search(q, {
        page: page,
        attributesToRetrieve,
        restrictSearchableAttributes,
        ...(ext === "1" && { restrictSearchableAttributes }),
      });
      if (error) {
        res.send(JSON.stringify({ error }));
      } else {
        res.send(JSON.stringify(results));
      }
    }
  }
);

export default router;
