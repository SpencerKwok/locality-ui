import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../lib/api/postgresql";
import { runMiddlewareCompany } from "../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareCompany(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  /* TODO: Add sign-in
  const f = async (companyId, homepage) => {
    const [_, psqlError] = await Psql.query(
      SqlString.format("UPDATE companies SET homepage=? WHERE id=?", [
        homepage,
        companyId,
      ])
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
    } else {
      res.status(200).json({ homepage: homepage });
    }
  };

  let homepage = Xss(req.body.homepage || "");
  if (homepage === "") {
    res.status(400).json({ error: "Invalid homepage" });
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
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(parseInt(companyId), homepage);
  }
  */
}
