import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../../lib/api/middleware";
import {
  cleanseStringArray,
  isStringArray,
} from "../../../../../lib/api/common";

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

  const [prevUploadSettings, psqlGetUploadSettingsError] = await Psql.query(
    SqlString.format("SELECT upload_settings FROM businesses WHERE id=?", [
      businessId,
    ])
  );
  if (psqlGetUploadSettingsError) {
    res.status(500).json({ error: psqlGetUploadSettingsError });
    return;
  } else if (prevUploadSettings.rows.length !== 1) {
    res.status(400).json({ error: "Invalid business id" });
    return;
  }

  const uploadSettings = JSON.parse(prevUploadSettings.rows[0].upload_settings);
  const etsy = req.body.Etsy;
  const shopify = req.body.Shopify;
  const square = req.body.Square;
  if (etsy) {
    if (etsy.includeTags && !isStringArray(etsy.includeTags)) {
      res.status(400).json({ error: "Invalid Etsy Include Tags" });
      return;
    }
    if (etsy.excludeTags && !isStringArray(etsy.excludeTags)) {
      res.status(400).json({ error: "Invalid Etsy exclude Tags" });
      return;
    }

    uploadSettings.Etsy = {
      includeTags: etsy.includeTags
        ? cleanseStringArray(etsy.includeTags)
        : undefined,
      excludeTags: etsy.excludeTags
        ? cleanseStringArray(etsy.excludeTags)
        : undefined,
    };
  }
  if (shopify) {
    if (shopify.includeTags && !isStringArray(shopify.includeTags)) {
      res.status(400).json({ error: "Invalid Shopify include tags" });
      return;
    }
    if (shopify.excludeTags && !isStringArray(shopify.excludeTags)) {
      res.status(400).json({ error: "Invalid Shopify exclude tags" });
      return;
    }
    if (shopify.departmentMapping) {
      if (!Array.isArray(shopify.departmentMapping)) {
        res.status(400).json({ error: "Invalid Shopify department mapping" });
        return;
      }
      for (let i = 0; i < shopify.departmentMapping.length; ++i) {
        if (
          !shopify.departmentMapping[i].key ||
          typeof shopify.departmentMapping[i].key !== "string"
        ) {
          res.status(400).json({ error: "Invalid Shopify department mapping" });
          return;
        }
        if (!Array.isArray(shopify.departmentMapping[i].departments)) {
          res.status(400).json({ error: "Invalid Shopify department mapping" });
          return;
        }
        for (
          let j = 0;
          j < shopify.departmentMapping[i].departments.length;
          ++j
        ) {
          if (
            !shopify.departmentMapping[i].departments[j] ||
            typeof shopify.departmentMapping[i].departments[j] !== "string"
          ) {
            res
              .status(400)
              .json({ error: "Invalid Shopify department mapping" });
            return;
          }
        }
      }
    }

    uploadSettings.Shopify = {
      includeTags: shopify.includeTags
        ? cleanseStringArray(shopify.includeTags)
        : undefined,
      excludeTags: shopify.excludeTags
        ? cleanseStringArray(shopify.excludeTags)
        : undefined,
      departmentMapping: shopify.departmentMapping
        ? shopify.departmentMapping.map(({ key, departments }) => ({
            key: Xss(key),
            departments: departments.map((department) => Xss(department)),
          }))
        : undefined,
    };
  }
  if (square) {
    if (square.includeTags && !isStringArray(square.includeTags)) {
      res.status(400).json({ error: "Invalid Square include tags" });
      return;
    }
    if (square.excludeTags && !isStringArray(square.excludeTags)) {
      res.status(400).json({ error: "Invalid Square exclude tags" });
      return;
    }
    if (square.departmentMapping) {
      if (!Array.isArray(square.departmentMapping)) {
        res.status(400).json({ error: "Invalid Shopify department mapping" });
        return;
      }
      for (let i = 0; i < square.departmentMapping.length; ++i) {
        if (
          !square.departmentMapping[i].key ||
          typeof square.departmentMapping[i].key !== "string"
        ) {
          res.status(400).json({ error: "Invalid Shopify department mapping" });
          return;
        }
        if (!Array.isArray(square.departmentMapping[i].departments)) {
          res.status(400).json({ error: "Invalid Shopify department mapping" });
          return;
        }
        for (
          let j = 0;
          j < square.departmentMapping[i].departments.length;
          ++j
        ) {
          if (
            !square.departmentMapping[i].departments[j] ||
            typeof square.departmentMapping[i].departments[j] !== "string"
          ) {
            res
              .status(400)
              .json({ error: "Invalid Shopify department mapping" });
            return;
          }
        }
      }
    }

    uploadSettings.Square = {
      includeTags: square.includeTags
        ? cleanseStringArray(square.includeTags)
        : undefined,
      excludeTags: square.excludeTags
        ? cleanseStringArray(square.excludeTags)
        : undefined,
      departmentMapping: square.departmentMapping
        ? square.departmentMapping.map(({ key, departments }) => ({
            key: Xss(key),
            departments: departments.map((department) => Xss(department)),
          }))
        : undefined,
    };
  }

  const [, psqlSetUploadSettingsError] = await Psql.query(
    SqlString.format("UPDATE businesses SET upload_settings=E? WHERE id=?", [
      JSON.stringify(uploadSettings),
      businessId,
    ])
  );
  if (psqlSetUploadSettingsError) {
    res.status(500).json({ error: psqlSetUploadSettingsError });
    return;
  }

  res.status(200).json({ ...uploadSettings });
}
