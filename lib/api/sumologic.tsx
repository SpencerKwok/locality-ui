import { SUMOLOGIC_URL } from "lib/env";

const url = SUMOLOGIC_URL ?? "";
const sumoLogicClient: {
  log: (params: Message) => void;
} = {
  log: ({ level, message, method, params }) => {
    const err = `${Date()} level=${level} message=${message} ${
      typeof method === "string" ? `method=${method}` : ""
    } ${params ? `params=${JSON.stringify(params)}` : ""}`;

    // Log to console for real-time debugging
    console.log(err);

    fetch(url, {
      method: "POST",
      body: err,
    }).catch((error) => {
      // Sumologic is our log console, so if logging
      // fails at least output an error to Heroku console
      console.log(error);
    });
  },
};

export interface Message {
  level: "error" | "info" | "warning";
  message: string;
  method?: string;
  params?: Record<string, any>;
}

export default sumoLogicClient;
