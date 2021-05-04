import SqlString from "sqlstring";
import Xss from "xss";

import Algolia from "../../../../lib/api/algolia";
import Cloudinary from "../../../../lib/api/cloudinary";
import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const f = async (product) => {
    const {
      businessId,
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
      public_id: `${businessId}/${productId}`,
      unique_filename: false,
      overwrite: true,
    });
    if (cloudinaryError) {
      res.status(500).json({ error: cloudinaryError });
      return;
    }

    const algoliaError = await Algolia.partialUpdateObject(
      {
        objectID: `${businessId}_${productId}`,
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
      `UPDATE products SET name=E?, image=? WHERE business_id=? AND id=?`,
      [name, url, businessId, productId]
    );
    const [_, psqlError] = await Psql.query(query);
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }

    res.status(200).json({
      product: {
        objectId: `${businessId}_${productId}`,
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

  let link = Xss(req.body.product.link || "");
  if (link === "") {
    res.status(400).json({ error: "Invalid product link" });
    return;
  }
  // Add "https://www" to link URL if not included
  if (!link.match(/^https:\/\/www\..*$/)) {
    if (link.match(/^https:\/\/(?!www.).*$/)) {
      link = `https://www.${link.slice(8)}`;
    } else if (link.match(/^http:\/\/(?!www.).*$/)) {
      link = `https://www.${link.slice(7)}`;
    } else if (link.match(/^http:\/\/www\..*$/)) {
      link = `https://www.${link.slice(11)}`;
    } else if (link.match(/^www\..*$/)) {
      link = `https://${link}`;
    } else {
      link = `https://www.${link}`;
    }
  }

  const { id } = req.locals.user;
  if (id === 0) {
    if (Number.isInteger(req.body.businessId)) {
      await f({
        businessId: req.body.businessId,
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
      res.status(400).json({ error: "Invalid business id" });
    }
  } else {
    await f({
      businessId: id,
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
}
