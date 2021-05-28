import SqlString from "sqlstring";
import Xss from "xss";
import { getSession } from "next-auth/client";

import Algolia from "../../lib/api/algolia";
import Psql from "../../lib/api/postgresql";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const q = Xss(req.query["q"] || "");
  const ip_header = Xss(req.headers["x-forwarded-for"] || "");
  const ip = Xss(req.query["ip"] || ip_header.split(/,\s*/)[0] || "");
  const filters = Xss(decodeURIComponent(req.query["filters"] || ""));

  let page = 0;
  if (req.query["pg"]) {
    page = parseInt(req.query["pg"]);
    if (Number.isNaN(page)) {
      res.status(400).json({ error: "Invalid page" });
      return;
    }
  }

  const facets = ["business", "departments"];
  const attributesToRetrieve = [
    "objectId",
    "business",
    "variant_images",
    "link",
    "name",
    "price_range",
  ];
  const attributesToHighlight = [];

  let wishlist = [];
  const session = await getSession({ req });
  if (session && session.user) {
    const user = session.user;
    const [productIDs, wishlistError] = await Psql.query(
      SqlString.format("SELECT wishlist FROM users WHERE id=?", [user.id])
    );

    // Don't error out because we failed
    // to retrieve the wishlist
    if (!wishlistError) {
      wishlist = productIDs.rows[0].wishlist.split(",").filter(Boolean);
    } else {
      console.log(wishlistError);
    }
  }

  if (ip !== "") {
    const [results, error] = await Algolia.search(q, {
      aroundLatLngViaIP: true,
      facets,
      filters,
      headers: { "X-Forwarded-For": ip },
      page,
      attributesToRetrieve,
      attributesToHighlight,
    });
    if (error) {
      res.status(500).json({ error });
      return;
    }

    if (wishlist.length > 0) {
      results.hits = results.hits.map((hit) => {
        return {
          ...hit,
          wishlist: wishlist.includes(hit.objectId),
        };
      });
    }

    res.status(200).json(results);
  } else {
    const [results, error] = await Algolia.search(q, {
      facets,
      filters,
      page,
      attributesToRetrieve,
      attributesToHighlight,
    });
    if (error) {
      res.status(500).json({ error });
      return;
    }

    if (wishlist.length > 0) {
      results.hits = results.hits.map((hit) => {
        return {
          ...hit,
          wishlist: wishlist.includes(hit.objectId),
        };
      });
    }

    res.status(200).json(results);
  }
}
