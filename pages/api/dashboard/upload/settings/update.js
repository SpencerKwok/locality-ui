import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../../lib/api/middleware";
import { isStringArray } from "../../../../../lib/api/common";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id === 0 ? req.body.businessId : id;
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
        ? etsy.includeTags.map((x) => Xss(x))
        : undefined,
      excludeTags: etsy.excludeTags
        ? etsy.excludeTags.map((x) => Xss(x))
        : undefined,
    };
  }
  if (shopify) {
    if (shopify.includeTags && !isStringArray(shopify.includeTags)) {
      res.status(400).json({ error: "Invalid Shopify Include Tags" });
      return;
    }
    if (shopify.excludeTags && !isStringArray(shopify.excludeTags)) {
      res.status(400).json({ error: "Invalid Shopify exclude Tags" });
      return;
    }

    uploadSettings.Shopify = {
      includeTags: shopify.includeTags
        ? shopify.includeTags.map((x) => Xss(x))
        : undefined,
      excludeTags: shopify.excludeTags
        ? shopify.excludeTags.map((x) => Xss(x))
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
  res
    .status(200)
    .json({ Etsy: uploadSettings.Etsy, Shopify: uploadSettings.Shopify });
}
