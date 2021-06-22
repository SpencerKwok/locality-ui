import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { UpdateUploadSettingsSchema } from "common/ValidationSchema";

import type {
  EtsyUploadSettingsUpdateRequest,
  ShopifyUploadSettingsUpdateRequest,
  SquareUploadSettingsUpdateRequest,
  EtsyUploadSettingsUpdateResponse,
  ShopifyUploadSettingsUpdateResponse,
  SquareUploadSettingsUpdateResponse,
  BaseUploadTypeSettings,
  UploadTypeSettings,
} from "common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/upload/settings/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: EtsyUploadSettingsUpdateRequest &
    ShopifyUploadSettingsUpdateRequest &
    SquareUploadSettingsUpdateRequest = req.body;
  try {
    await UpdateUploadSettingsSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/settings/update",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  const prevUploadSettings = await Psql.select<{ upload_settings: string }>({
    table: "businesses",
    values: ["upload_settings"],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (!prevUploadSettings) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/settings/update",
      message: "Failed to SELECT from Heroku PSQL: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  } else if (prevUploadSettings.rowCount !== 1) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/upload/settings/update",
      message: "Invalid payload",
      params: { body: reqBody },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const uploadSettings: EtsyUploadSettingsUpdateResponse &
    ShopifyUploadSettingsUpdateResponse &
    SquareUploadSettingsUpdateResponse = JSON.parse(
    prevUploadSettings.rows[0].upload_settings
  );
  const etsy: BaseUploadTypeSettings | undefined = reqBody.etsy;
  const shopify: UploadTypeSettings | undefined = reqBody.shopify;
  const square: UploadTypeSettings | undefined = reqBody.square;
  if (etsy) {
    uploadSettings.etsy = {
      includeTags: etsy.includeTags
        ? etsy.includeTags.map((tag) => Xss(tag.trim()))
        : undefined,
      excludeTags: etsy.excludeTags
        ? etsy.excludeTags.map((tag) => Xss(tag.trim()))
        : undefined,
    };
  }
  if (shopify) {
    uploadSettings.shopify = {
      includeTags: shopify.includeTags
        ? shopify.includeTags.map((tag) => Xss(tag.trim()))
        : undefined,
      excludeTags: shopify.excludeTags
        ? shopify.excludeTags.map((tag) => Xss(tag.trim()))
        : undefined,
      departmentMapping: shopify.departmentMapping
        ? shopify.departmentMapping.map(({ key, departments }) => ({
            key: Xss(key.trim()),
            departments: departments.map((department) =>
              Xss(department.trim())
            ),
          }))
        : undefined,
    };
  }
  if (square) {
    uploadSettings.square = {
      includeTags: square.includeTags
        ? square.includeTags.map((tag) => Xss(tag.trim()))
        : undefined,
      excludeTags: square.excludeTags
        ? square.excludeTags.map((tag) => Xss(tag.trim()))
        : undefined,
      departmentMapping: square.departmentMapping
        ? square.departmentMapping.map(({ key, departments }) => ({
            key: Xss(key.trim()),
            departments: departments.map((department) =>
              Xss(department.trim())
            ),
          }))
        : undefined,
    };
  }

  const psqlSetUploadSettingsError = await Psql.update({
    table: "businesses",
    values: [{ key: "upload_settings", value: JSON.stringify(uploadSettings) }],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (psqlSetUploadSettingsError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/upload/settings/update",
      message: `Failed to UPDATE Heroku PSQL: ${psqlSetUploadSettingsError.message}`,
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: EtsyUploadSettingsUpdateResponse &
    ShopifyUploadSettingsUpdateResponse &
    SquareUploadSettingsUpdateResponse = uploadSettings;

  res.status(200).json(body);
}
