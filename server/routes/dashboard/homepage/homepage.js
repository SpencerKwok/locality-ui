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
      "Too many homepage update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const f = async (companyId, homepage) => {
      const [_, psqlError] = await psql.query(
        sqlString.format("UPDATE companies SET homepage=? WHERE id=?", [
          homepage,
          companyId,
        ])
      );
      if (psqlError) {
        res.send(JSON.stringify({ error: psqlError }));
      } else {
        res.send(JSON.stringify({ homepage: homepage }));
      }
    };

    let homepage = xss(req.body.homepage || "");
    if (homepage === "") {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid homepage" },
        })
      );
      return;
    }

    // Add "https://www" to homepage URL if not included
    if (homepage.match(/^https:\/\/(?!www.).*$/)) {
      homepage = `https://www.${homepage.slice(8)}`;
    } else if (homepage.match(/^http:\/\/(?!www.).*$/)) {
      homepage = `https://www.${homepage.slice(7)}`;
    } else if (homepage.match(/^http:\/\/www\..*$/)) {
      homepage = `https://www.${homepage.slice(11)}`;
    } else if (homepage.match(/^www\..*$/)) {
      homepage = `https://${homepage}`;
    } else if (!homepage.match(/^http:\/\/www\..*$/)) {
      homepage = `https://www.${homepage}`;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id, homepage);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId), homepage);
    }
  }
);

export default router;
