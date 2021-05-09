import SqlString from "sqlstring";
import Xss from "xss";

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

  const f = async (businessId, logo) => {
    const [url, cloudinaryError] = await Cloudinary.upload(logo, {
      exif: false,
      format: "webp",
      public_id: `logo/${businessId}`,
      unique_filename: false,
      overwrite: true,
    });

    if (cloudinaryError) {
      res.status(500).json({ error: cloudinaryError });
      return;
    }

    const [, psqlError] = await Psql.query(
      SqlString.format("UPDATE businesses SET logo=? WHERE id=?", [
        url,
        businessId,
      ])
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }

    res.status(200).json({ logo: url });
  };

  const logo = Xss(req.body.logo || "");
  if (logo === "") {
    res.status(400).json({ error: "Invalid logo" });
    return;
  }

  const { id } = req.locals.user;
  const businessId = id;
  if (businessId === 0) {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id, logo);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(id, logo);
  }
}
