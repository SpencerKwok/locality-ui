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

  const f = async (
    businessId,
    homepage,
    etsyHomepage,
    shopifyHomepage,
    squareHomepage
  ) => {
    const [, psqlError] = await Psql.query(
      SqlString.format(
        "UPDATE businesses SET homepage=E?, etsy_homepage=E?, shopify_homepage=E?, square_homepage=E? WHERE id=?",
        [homepage, etsyHomepage, shopifyHomepage, squareHomepage, businessId]
      )
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }
    res
      .status(200)
      .json({ homepage, etsyHomepage, shopifyHomepage, squareHomepage });
  };

  let homepage = Xss(req.body.homepage || "");
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

  let shopifyHomepage = Xss(req.body.shopifyHomepage || "");
  if (shopifyHomepage !== "") {
    try {
      shopifyHomepage = addHttpsProtocol(shopifyHomepage);
      new URL(shopifyHomepage);
    } catch (error) {
      res.status(400).json({ error: "Invalid Shopify Website" });
      return;
    }
  }

  let squareHomepage = Xss(req.body.squareHomepage || "");
  if (squareHomepage !== "") {
    try {
      squareHomepage = addHttpsProtocol(squareHomepage);
      new URL(squareHomepage);
    } catch (error) {
      res.status(400).json({ error: "Invalid Square Website" });
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
      await f(
        req.body.id,
        homepage,
        etsyHomepage,
        shopifyHomepage,
        squareHomepage
      );
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(id, homepage, etsyHomepage, shopifyHomepage, squareHomepage);
  }
}
