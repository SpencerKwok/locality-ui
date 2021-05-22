import Bcrypt from "bcryptjs";
import EmailValidator from "email-validator";
import SqlString from "sqlstring";
import Xss from "xss";

import MailChimp, { MainListId } from "../../../lib/api/mailchimp";
import Psql from "../../../lib/api/postgresql";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const firstName = Xss(req.body.firstName || "");
  if (firstName === "") {
    res.status(400).json({ error: "Invalid first name" });
    return;
  }

  const lastName = Xss(req.body.lastName || "");
  if (lastName === "") {
    res.status(400).json({ error: "Invalid last name" });
    return;
  }

  const email = Xss(req.body.email || "");
  if (!EmailValidator.validate(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  const businessName = Xss(req.body.businessName || "");
  if (businessName === "") {
    res.status(400).json({ error: "Invalid company name" });
    return;
  }

  const address = Xss(req.body.address || "");
  if (address === "") {
    res.status(400).json({ error: "Invalid address" });
    return;
  }

  const city = Xss(req.body.city || "");
  if (city === "") {
    res.status(400).json({ error: "Invalid city" });
    return;
  }

  const province = Xss(req.body.province || "");
  if (province === "") {
    res.status(400).json({ error: "Invalid province" });
    return;
  }

  const country = Xss(req.body.country || "");
  if (country === "") {
    res.status(400).json({ error: "Invalid country" });
    return;
  }

  const password = req.body.password;
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }

  try {
    const latLng = await fetch(
      `http://www.mapquestapi.com/geocoding/v1/address?key=${process.env.MAPQUEST_KEY}&maxResults=1&location=${address},${city},${province},${country}`
    )
      .then((res) => res.json())
      .then(({ results }) => results[0].locations[0].latLng);

    const [user, psqlErrorUserId] = await Psql.query(
      "SELECT id FROM users ORDER BY id DESC LIMIT 1"
    );
    if (psqlErrorUserId) {
      res.status(500).json({ error: psqlErrorUserId });
      return;
    }

    const userId = user.rows[0].id + 1;
    const [, psqlErrorAddBusiness] = await Psql.query(
      SqlString.format(
        "INSERT INTO businesses (id, name, address, city, province, country, latitude, longitude, next_product_id, logo, homepage, etsy_homepage, shopify_homepage, square_homepage, departments, upload_settings) VALUES (?, E?, E?, E?, E?, E?, ?, ?, ?, E?, E?, E?, E?, E?, E?, E?)",
        [
          userId,
          businessName,
          address,
          city,
          province,
          country,
          latLng.lat,
          latLng.lng,
          0,
          "",
          "",
          "",
          "",
          "",
          "",
          "{}",
        ]
      )
    );
    if (psqlErrorAddBusiness) {
      res.status(500).json({ error: psqlErrorAddBusiness });
      return;
    }

    const hash = await Bcrypt.hash(password, 12);
    const [, psqlErrorAddUser] = await Psql.query(
      SqlString.format(
        "INSERT INTO users (username, email, password, first_name, last_name, id, wishlist) VALUES (E?, E?, ?, E?, E?, ?, E?)",
        [email, email, hash, firstName, lastName, userId, ""]
      )
    );
    if (psqlErrorAddUser) {
      res.status(500).json({ error: psqlErrorAddUser });
      return;
    }

    const [, mailchimpError] = await MailChimp.addSubscriber(
      {
        email,
        firstName,
        lastName,
      },
      MainListId
    );

    if (mailchimpError) {
      res.status(500).json({ error: mailchimpError });
      return;
    }

    res.status(200).json({});
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ error: { code: 400, message: err.message } }));
  }
}
