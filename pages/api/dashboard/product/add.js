import Xss from "xss";

import { productAdd } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const companyName = Xss(req.body.companyName || "");
  if (companyName === "") {
    res.status(400).json({ error: "Invalid company name" });
    return;
  }

  const productName = Xss(req.body.product.name || "");
  if (productName === "") {
    res.status(400).json({ error: "Invalid product name" });
    return;
  }

  const image = Xss(req.body.product.image || "");
  if (image === "") {
    res.status(400).json({ error: "Invalid product image" });
    return;
  }

  let latitude = Xss(req.body.latitude || "");
  if (latitude === "") {
    res.status(400).json({ error: "Invalid latitude" });
    return;
  }
  latitude = latitude.split(",").map((x) => Xss(x));
  for (let i = 0; i < latitude.length; ++i) {
    try {
      latitude[i] = parseFloat(latitude[i]);
    } catch (err) {
      res.status(400).json({ error: "Invalid latitude" });
      return;
    }
  }

  let longitude = Xss(req.body.longitude || "");
  if (longitude === "") {
    res.status(400).json({ error: "Invalid longitude" });
    return;
  }
  longitude = longitude.split(",").map((x) => Xss(x));
  for (let i = 0; i < longitude.length; ++i) {
    try {
      longitude[i] = parseFloat(longitude[i]);
    } catch (err) {
      res.status(400).json({ error: "Invalid longitude" });
      return;
    }
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
  // Add "https://" to link URL if not included
  if (!link.includes("https://") && !link.includes("http://")) {
    link = `https://${link}`;
  }

  const companyId = req.cookies["companyId"];
  if (companyId === "0") {
    if (Number.isInteger(req.body.companyId)) {
      const [product, error] = await productAdd({
        companyId: req.body.companyId,
        companyName,
        departments,
        description,
        image,
        latitude,
        link,
        longitude,
        price,
        priceRange,
        primaryKeywords,
        productName,
      });
      if (error) {
        res.status(500).json({ error });
      } else {
        res.status(200).json({ product });
      }
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    const [product, error] = await productAdd({
      companyId: parseInt(companyId),
      companyName,
      departments,
      description,
      image,
      latitude,
      link,
      longitude,
      price,
      priceRange,
      primaryKeywords,
      productName,
    });
    if (error) {
      res.status(500).json({ error });
    } else {
      res.status(200).json({ product });
    }
  }
  */
}
