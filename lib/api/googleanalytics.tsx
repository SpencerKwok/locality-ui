import SumoLogic from "lib/api/sumologic";
import { GOOGLE_ANALYTICS_API_SECRET, GOOGLE_MEASUREMENT_ID } from "lib/env";

const googleAnalyticsClient: {
  sendEvent: (
    name: string,
    params: Record<string, any>
  ) => Promise<Error | null>;
} = {
  sendEvent: async (name, params) => {
    let error: Error | null = null;
    await fetch(
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
    ).catch((err) => {
      SumoLogic.log({
        level: "warning",
        method: "extension/analytics/event",
        message: "Failed to send event to Google Analytics",
        params: { name, params, error: err },
      });
      error = err;
    });
    return error;
  },
};

export default googleAnalyticsClient;
