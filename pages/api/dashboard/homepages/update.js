import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { addHttpsProtocol } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.id : id;
  if (!Number.isInteger(businessId)) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  let homepage = Xss(req.body.homepages.homepage || "");
  if (homepage === "") {
    res.status(400).json({ error: "Invalid homepage" });
    return;
  }
  try {
    homepage = addHttpsProtocol(homepage);
    new URL(homepage);
  } catch (error) {
    res.status(400).json({ error: "Invalid homepage" });
    return;
  }

  let etsyHomepage = Xss(req.body.homepages.etsyHomepage || "");
  if (etsyHomepage !== "") {
    etsyHomepage = addHttpsProtocol(etsyHomepage);
    if (
      !etsyHomepage.match(
        /^https:\/\/www\.etsy\.com\/([^\/]+\/)*shop\/[a-zA-Z0-9_\-]+(\/?)$/g
      )
    ) {
      res.status(400).json({ error: "Invalid Etsy Storefront" });
      return;
    }
  }

  let shopifyHomepage = Xss(req.body.homepages.shopifyHomepage || "");
  if (shopifyHomepage !== "") {
    try {
      shopifyHomepage = addHttpsProtocol(shopifyHomepage);
      new URL(shopifyHomepage);
    } catch (error) {
      res.status(400).json({ error: "Invalid Shopify Website" });
      return;
    }
  }

  let squareHomepage = Xss(req.body.homepages.squareHomepage || "");
  if (squareHomepage !== "") {
    try {
      squareHomepage = addHttpsProtocol(squareHomepage);
      new URL(squareHomepage);
    } catch (error) {
      res.status(400).json({ error: "Invalid Square Website" });
      return;
    }
  }

  const [prevHomepages, psqlGetHomepagesError] = await Psql.query(
    SqlString.format("SELECT homepages FROM businesses WHERE id=?", [
      businessId,
    ])
  );
  if (psqlGetHomepagesError) {
    res.status(500).json({ error: psqlGetHomepagesError });
    return;
  } else if (prevHomepages.rows.length !== 1) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  const homepages = JSON.parse(prevHomepages.rows[0].homepages);
  homepages.homepage = homepage;
  if (etsyHomepage !== "") {
    homepages.etsyHomepage = etsyHomepage;
  }
  if (shopifyHomepage !== "") {
    homepages.shopifyHomepage = shopifyHomepage;
  }
  if (squareHomepage !== "") {
    homepages.squareHomepage = squareHomepage;
  }

  const [, psqlError] = await Psql.query(
    SqlString.format("UPDATE businesses SET homepages=E? WHERE id=?", [
      JSON.stringify(homepages),
      businessId,
    ])
  );
  if (psqlError) {
    res.status(500).json({ error: psqlError });
    return;
  }
  res.status(200).json({ homepages });
}
