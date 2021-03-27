import cloudinary from "../../../cloudinary/client.js";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

const router = Router();
router.post(
  "/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many logo update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const f = async (companyId, image) => {
      const [url, cloudinaryError] = await cloudinary.upload(image, {
        exif: false,
        format: "webp",
        public_id: `logo/${companyId}`,
        unique_filename: false,
        overwrite: true,
      });

      if (cloudinaryError) {
        res.send(JSON.stringify({ error: cloudinaryError }));
      } else {
        const [_, psqlError] = await psql.query(
          sqlString.format("UPDATE companies SET logo=? WHERE id=?", [
            url,
            companyId,
          ])
        );
        if (psqlError) {
          res.send(JSON.stringify({ error: psqlError }));
        } else {
          res.send(JSON.stringify({ url: url }));
        }
      }
    };

    const image = xss(req.body.image || "");
    if (image === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid logo" },
        })
      );
      return;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id, image);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId), image);
    }
  }
);

export default router;
