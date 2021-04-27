import SqlString from "sqlstring";
import Xss from "xss";

import Cloudinary from "../../../lib/api/cloudinary";
import Psql from "../../../lib/api/postgresql";
import { runMiddlewareCompany } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareCompany(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const f = async (companyId, image) => {
    const [url, cloudinaryError] = await Cloudinary.upload(image, {
      exif: false,
      format: "webp",
      public_id: `logo/${companyId}`,
      unique_filename: false,
      overwrite: true,
    });

    if (cloudinaryError) {
      res.status(500).json({ error: cloudinaryError });
      return;
    }
    
    const [_, psqlError] = await Psql.query(
      SqlString.format("UPDATE companies SET logo=? WHERE id=?", [
        url,
        companyId,
      ])
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
    } else {
      res.status(200).json({ url: url });
    }
  };

  const image = Xss(req.body.image || "");
  if (image === "") {
    res.status(400).json({ error: "Invalid logo" });
    return;
  }

  const companyId = req.cookies["companyId"];
  if (companyId === "0") {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id, image);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(parseInt(companyId), image);
  }
  */
}
