import SqlString from "sqlstring";
import Xss from "xss";

import Cloudinary from "lib/api/cloudinary";
import SumoLogic from "lib/api/sumologic";
import Psql from "lib/api/postgresql";
import { runMiddlewareBusiness } from "lib/api/middleware";
import { LogoUpdateSchema } from "common/ValidationSchema";

import type { LogoUpdateRequest, LogoUpdateResponse } from "common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "lib/api/middleware";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
): Promise<void> {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/logo/update",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: LogoUpdateRequest = req.body;
  try {
    await LogoUpdateSchema.validate(reqBody, { abortEarly: false });
  } catch (error: unknown) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/logo/update",
      message: "Invalid payload",
      params: { body: reqBody, error },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  if (!Number.isInteger(businessId)) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/logo/update",
      message: "Invalid id",
      params: { body: req.body },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  const logo = Xss(reqBody.logo);

  const url = await Cloudinary.upload(logo, {
    exif: false,
    format: "webp",
    public_id: `logo/${businessId}`,
    unique_filename: false,
    overwrite: true,
  });
  if (url === null) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/logo/update",
      message: "Failed to upload logo to Cloudinary: Missing response",
      params: { body: req.body },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const psqlError = await Psql.update({
    table: "businesses",
    values: [{ key: "logo", value: url }],
    conditions: SqlString.format("id=?", [businessId]),
  });
  if (psqlError) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/logo/update",
      message: `Failed to UPDATE Heroku PSQL: ${psqlError.message}`,
      params: { body: req.body },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: LogoUpdateResponse = {
    logo: url,
  };

  res.status(200).json(body);
}
