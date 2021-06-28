import Xss from "xss";

import GoogleAnalytics from "lib/api/googleanalytics";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "extension/analytics/event",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  // Requester shouldn't wait for analytics to complete
  res.status(204).end();

  // If there are any issues with
  // the sent event, ignore it
  const name: string = Xss(decodeURIComponent(req.body.name ?? ""));
  if (!name) {
    SumoLogic.log({
      level: "warning",
      method: "extension/analytics/event",
      message: "Missing name in analytic event",
      params: { body: req.body },
    });
    return;
  }

  // Don't send name to Google analytics as parameter
  delete req.body.name;

  // Remove any potential XSS attacks in the params
  for (const k of Object.keys(req.body)) {
    switch (typeof req.body[k]) {
      case "string":
        req.body[k] = Xss(req.body[k]);
        break;
      case "number":
      case "boolean":
        break;
      default:
        SumoLogic.log({
          level: "warning",
          method: "extension/analytics/event",
          message: "Unrecognized param type",
          params: { body: req.body },
        });
        delete req.body[k];
        break;
    }
  }

  const error = await GoogleAnalytics.sendEvent(name, req.body);
  if (error) {
    SumoLogic.log({
      level: "warning",
      method: "extension/analytics/event",
      message: "Failed to send event to google analytics",
      params: { body: req.body, error },
    });
  }
}
