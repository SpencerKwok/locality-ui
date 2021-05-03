import SqlString from "sqlstring";
import Xss from "xss";

import Algolia from "../../../../lib/api/algolia";
import Cloudinary from "../../../../lib/api/cloudinary";
import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const f = async (product) => {
    const {
      companyId,
      departments,
      description,
      image,
      link,
      name,
      price,
      priceRange,
      primaryKeywords,
      productId,
    } = product;

    const [url, cloudinaryError] = await Cloudinary.upload(image, {
      exif: false,
      format: "webp",
      public_id: `${companyId}/${productId}`,
      unique_filename: false,
      overwrite: true,
    });
    if (cloudinaryError) {
      res.status(500).json({ errror: cloudinaryError });
      return;
    }

    const algoliaError = await Algolia.partialUpdateObject(
      {
        objectID: `${companyId}_${productId}`,
        name: name,
        primary_keywords: primaryKeywords,
        departments: departments,
        description: description,
        price: price,
        price_range: priceRange,
        link: link,
        image: url,
      },
      { createIfNotExists: false }
    );

    if (algoliaError) {
      res.status(500).json({ error: algoliaError });
      return;
    }

    const query = SqlString.format(
      `UPDATE products SET name=E?, image=? WHERE company_id=? AND id=?`,
      [name, url, companyId, productId]
    );
    const [_, psqlError] = await Psql.query(query);
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }

    res.staus(200).json({
      product: {
        objectID: `${companyId}_${productId}`,
        name: name,
        image: url,
      },
    });
  };

  const productId = req.body.product.id;
  if (!Number.isInteger(productId)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const image = Xss(req.body.product.image || "");
  if (image === "") {
    res.status(400).json({ error: "Invalid product image" });
    return;
  }

  const name = Xss(req.body.product.name || "");
  if (name === "") {
    res.status(400).json({ error: "Invalid product name" });
    return;
  }

  let primaryKeywords = req.body.product.primaryKeywords;
  if (!Array.isArray(primaryKeywords)) {
    res.status(400).json({ error: "Invalid primary keywords" });
    return;
  }
  try {
    primaryKeywords = primaryKeywords.map((keyword) => Xss(keyword));
  } catch {
    res.status(400).json({ error: "Invalid primary keywords" });
    return;
  }

  let departments = req.body.product.departments;
  if (!Array.isArray(departments)) {
    res.status(400).json({ error: "Invalid departments" });
    return;
  }
  try {
    departments = departments
      .map((department) => Xss(department.trim()))
      .filter(Boolean);
  } catch (err) {
    res.status(400).json({ error: "Invalid departments" });
    return;
  }

  const description = Xss(req.body.product.description || "");

  let price = req.body.product.price;
  if (typeof price !== "number") {
    res.status(400).json({ error: "Invalid price" });
    return;
  }
  price = parseFloat(price.toFixed(2));

  let priceRange = req.body.product.priceRange;
  if (!Array.isArray(priceRange) || priceRange.length !== 2) {
    res.status(400).json({ error: "Invalid price range" });
    return;
  }
  try {
    priceRange[0] = parseFloat(priceRange[0]);
    priceRange[1] = parseFloat(priceRange[1]);
  } catch {
    res.status(400).json({ error: "Invalid price range" });
    return;
  }

  const link = Xss(req.body.product.link || "");
  if (link === "") {
    res.status(400).json({ error: "Invalid product link" });
    return;
  }
  // Add "https://" to link URL if not included
  if (!link.includes("https://") && !link.includes("http://")) {
    link = `https://${link}`;
  }

  const companyId = req.cookies["companyId"];
  if (companyId === "0") {
    if (Number.isInteger(req.body.companyId)) {
      await f({
        companyId: req.body.companyId,
        departments,
        description,
        image,
        link,
        name,
        price,
        priceRange,
        primaryKeywords,
        productId,
      });
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f({
      companyId: parseInt(companyId),
      departments,
      description,
      image,
      link,
      name,
      price,
      priceRange,
      primaryKeywords,
      productId,
    });
  }
  */
}
