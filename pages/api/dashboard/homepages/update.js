import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

const addHttpsProtocol = (url) => {
  if (!url.match(/^https:\/\/www\..*$/)) {
    if (url.match(/^https:\/\/(?!www.).*$/)) {
      url = `https://www.${url.slice(8)}`;
    } else if (url.match(/^http:\/\/(?!www.).*$/)) {
      url = `https://www.${url.slice(7)}`;
    } else if (url.match(/^http:\/\/www\..*$/)) {
      url = `https://www.${url.slice(11)}`;
    } else if (url.match(/^www\..*$/)) {
      url = `https://${url}`;
    } else {
      url = `https://www.${url}`;
    }
  }
  return url;
};

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const f = async (businessId, homepage, shopifyHomepage, etsyHomepage) => {
    const [, psqlError] = await Psql.query(
      SqlString.format(
        "UPDATE businesses SET homepage=E?, shopify_homepage=E?, etsy_homepage=E? WHERE id=?",
        [homepage, shopifyHomepage, etsyHomepage, businessId]
      )
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }
    res.status(200).json({ homepage, shopifyHomepage, etsyHomepage });
  };

  let homepage = Xss(req.body.homepage || "");
  if (homepage === "") {
    res.status(400).json({ error: "Invalid homepage" });
    return;
  }
  homepage = addHttpsProtocol(homepage);
  try {
    new URL(homepage);
  } catch (error) {
    res.status(400).json({ error: "Invalid homepage" });
    return;
  }

  let shopifyHomepage = Xss(req.body.shopifyHomepage || "");
  if (shopifyHomepage !== "") {
    shopifyHomepage = addHttpsProtocol(shopifyHomepage);
    if (
      !shopifyHomepage.match(
        /^https:\/\/www\.[a-zA-Z0-9_\-]+\.myshopify\.com(\/?)$/g
      )
    ) {
      res.status(400).json({ error: "Invalid Shopify Website" });
      return;
    }
  }

  let etsyHomepage = Xss(req.body.etsyHomepage || "");
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

  const { id } = req.locals.user;
  const businessId = id;
  if (businessId === 0) {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id, homepage, shopifyHomepage, etsyHomepage);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(id, homepage, shopifyHomepage, etsyHomepage);
  }
}
