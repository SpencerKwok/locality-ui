import Xss from "xss";

import SumoLogic from "lib/api/sumologic";
import { GOOGLE_ANALYTICS_API_SECRET, GOOGLE_MEASUREMENT_ID } from "lib/env";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "extension/analytics/event",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  // Redirect users immediately, users should
  // not wait on analytics to complete
  const redirectUrl: string = Xss(
    decodeURIComponent((req.query["redirect_url"] as string) || "")
  );
  if (redirectUrl) {
    res.redirect(redirectUrl);
  } else {
    SumoLogic.log({
      level: "error",
      method: "extension/analytics/event",
      message: "Missing redirect url",
      params: { query: req.query },
    });
    res.status(200).end();
  }

  // If there are any issues with
  // the sent event, ignore it
  const name: string = Xss(
    decodeURIComponent((req.query["name"] as string) || "")
  );
  if (!name) {
    SumoLogic.log({
      level: "warning",
      method: "extension/analytics/event",
      message: "Missing name in analytic event",
      params: { query: req.query },
    });
    return;
  }

  // Don't send name and redirect url to Google analytics
  delete req.query["name"];
  delete req.query["redirect_url"];
  fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GOOGLE_MEASUREMENT_ID}&api_secret=${GOOGLE_ANALYTICS_API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: "extension",
        events: [
          {
            name,
            params: req.query,
          },
        ],
      }),
    }
  ).catch((err) => {
    SumoLogic.log({
      level: "warning",
      method: "extension/analytics/event",
      message: `Failed to send event to Google Analytics: ${err.message}`,
      params: { query: req.query },
    });
  });
}
