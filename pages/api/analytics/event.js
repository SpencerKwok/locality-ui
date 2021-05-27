import Xss from "xss";

import {
  GOOGLE_ANALYTICS_API_SECRET,
  GOOGLE_MEASUREMENT_ID,
} from "../../../lib/env";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  // Redirect users immediately, users should
  // not wait on analytics to complete
  const redirectUrl = Xss(decodeURIComponent(req.query["redirect_url"] || ""));
  if (redirectUrl) {
    res.redirect(redirectUrl);
  } else {
    res.status(200).end();
  }

  // Log analytic query
  console.log(req.query);

  // If there are any issues with
  // the sent event, ignore it
  const name = Xss(decodeURIComponent(req.query["name"] || ""));
  if (!name) {
    return;
  }

  // Don't send name and redirect url to Google analytics
  req.query["name"] = undefined;
  req.query["redirect_url"] = undefined;

  const params = req.query.map((value) => Xss(decodeURIComponent(value || "")));
  fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GOOGLE_MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: "extension",
        events: [
          {
            name,
            params,
          },
        ],
      }),
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}
