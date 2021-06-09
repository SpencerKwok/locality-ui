import { distance } from "fastest-levenshtein";
import SqlString from "sqlstring";

import Algolia from "../../../lib/api/algolia";
import Psql from "../../../lib/api/postgresql";
import { cleanseString } from "../../../lib/api/common";

import DoubleMetaphone from "doublemetaphone";
import { decode } from "html-entities";
const encoder = new DoubleMetaphone();

/*
  Pick best variant from the hit to showcase.
  We do so by running double metaphone and
  using Levenshtein distancing algorithm
  on the resulting phonetics. We do not use
  Metaphone 3 (although better) due to
  licensing + it's $240 USD for source code.
*/
const getBestVariant = (query, hit) => {
  const { variantImages, variantTags } = hit;
  const uniqueTags = new Map();
  const uniqueImages = new Set(variantImages);
  variantTags.forEach((tag, index) => {
    if (uniqueTags.has(tag)) {
      return;
    }
    uniqueTags.set(tag, index);
  });
  if (uniqueImages.size <= 1 || uniqueTags.size <= 1) {
    hit.variantIndex = 0;
  } else {
    const queryPhonetic = encoder.doubleMetaphone(query);
    const queryPhoneticString = `${queryPhonetic.primary}${queryPhonetic.alternate}`;
    const firstTagPhonetic = encoder.doubleMetaphone(variantTags[0]);
    const firstTagPhoneticString = `${firstTagPhonetic.primary}${firstTagPhonetic.alternate}`;
    let bestIndex = 0;
    let bestScore = distance(firstTagPhoneticString, queryPhoneticString);
    uniqueTags.forEach((index, tag) => {
      const phonetic = encoder.doubleMetaphone(tag);
      const phoneticString = `${phonetic.primary}${phonetic.alternate}`;
      const score = distance(phoneticString, queryPhoneticString);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    hit.variantIndex = bestIndex;
  }
  return hit;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  const q = decode(cleanseString(req.query["q"] || ""));
  const ip_header = cleanseString(req.headers["x-forwarded-for"] || "");
  const ip = cleanseString(ip_header.split(/,\s*/)[0] || "");
  const filters = cleanseString(req.query["filters"] || "");

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
    "variant_tags",
    "link",
    "name",
    "price_range",
  ];
  const attributesToHighlight = [];

  let wishlist = [];
  const id = req.headers["id"] || "";
  const token = req.headers["token"] || "";
  if (id && token) {
    try {
      const [res, getToken] = await Psql.query(
        SqlString.format("SELECT * FROM tokens WHERE token=E? AND id=?", [
          token,
          parseInt(id),
        ])
      );
      if (getToken) {
        throw getToken;
      }

      if (res.rowCount > 0) {
        const [productIDs, wishlistError] = await Psql.query(
          SqlString.format("SELECT wishlist FROM users WHERE id=?", [
            parseInt(id),
          ])
        );
        if (wishlistError) {
          throw wishlistError;
        }

        wishlist = productIDs.rows[0].wishlist.split(",").filter(Boolean);
      }
    } catch (error) {
      // Don't error out because we failed
      // to retrieve the wishlist
      console.log(error);
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

    results.hits = results.hits.map((hit) => getBestVariant(q, hit));

    if (wishlist.length > 0) {
      results.hits = results.hits.map((hit) => {
        return {
          ...hit,
          wishlist: wishlist.includes(`${hit.objectId}_${hit.variantIndex}`),
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

    results.hits = results.hits.map((hit) => getBestVariant(q, hit));

    if (wishlist.length > 0) {
      results.hits = results.hits.map((hit) => {
        return {
          ...hit,
          wishlist: wishlist.includes(`${hit.objectId}_${hit.variantIndex}`),
        };
      });
    }

    res.status(200).json(results);
  }
}
