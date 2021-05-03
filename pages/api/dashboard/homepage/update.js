import SqlString from "sqlstring";
import Xss from "xss";

import Psql from "../../../../lib/api/postgresql";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";

export default async function handler(req, res) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const f = async (businessId, homepage) => {
    const [_, psqlError] = await Psql.query(
      SqlString.format("UPDATE businesses SET homepage=? WHERE id=?", [
        homepage,
        businessId,
      ])
    );
    if (psqlError) {
      res.status(500).json({ error: psqlError });
      return;
    }

    res.status(200).json({ homepage: homepage });
  };

  let homepage = Xss(req.body.homepage || "");
  if (homepage === "") {
    res.status(400).json({ error: "Invalid homepage" });
    return;
  }

  // Add "https://www" to homepage URL if not included
  if (!homepage.match(/^https:\/\/www\..*$/)) {
    if (homepage.match(/^https:\/\/(?!www.).*$/)) {
      homepage = `https://www.${homepage.slice(8)}`;
    } else if (homepage.match(/^http:\/\/(?!www.).*$/)) {
      homepage = `https://www.${homepage.slice(7)}`;
    } else if (homepage.match(/^http:\/\/www\..*$/)) {
      homepage = `https://www.${homepage.slice(11)}`;
    } else if (homepage.match(/^www\..*$/)) {
      homepage = `https://${homepage}`;
    } else {
      homepage = `https://www.${homepage}`;
    }
  }

  const { id } = req.locals.user;
  const businessId = id;
  if (businessId === 0) {
    if (Number.isInteger(req.body.id)) {
      await f(req.body.id, homepage);
    } else {
      res.status(400).json({ error: "Invalid company id" });
    }
  } else {
    await f(id, homepage);
  }
}
