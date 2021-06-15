import { SUMOLOGIC_URL } from "../env";

const url = SUMOLOGIC_URL || "";
const sumoLogicClient: {
  log: (params: Message) => void;
} = {
  log: ({ level, message, method, params }) => {
    fetch(url, {
      method: "POST",
      body: `${Date()} level=${level} message=${message} ${
        method ? `method=${method}` : ""
      } ${params ? `params=${JSON.stringify(params)}` : ""}`,
    }).catch((error) => {
      // Sumologic is our log console, so if logging
      // fails at least output an error to Heroku console
      console.log(error);
    });
  },
};

export interface Message {
  level: "info" | "warning" | "error";
  message: string;
  method?: string;
  params?: { [key: string]: any };
}

export default sumoLogicClient;
