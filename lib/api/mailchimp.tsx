import Md5 from "md5";

import SumoLogic from "lib/api/sumologic";

const mailchimp = require("@mailchimp/mailchimp_marketing");

import {
  MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER,
  MAILCHIMP_LOCALITY_ID,
} from "lib/env";

mailchimp.setConfig({
  apiKey: MAILCHIMP_API_KEY,
  server: MAILCHIMP_SERVER,
});

export const MainListId = MAILCHIMP_LOCALITY_ID || "";

export interface Subscriber {
  firstName: string;
  lastName: string;
  email: string;
}

const mailchimpClient: {
  addSubscriber: (user: Subscriber, listId: string) => Promise<Error | null>;
} = {
  addSubscriber: async (user: Subscriber, listId: string) => {
    const { firstName, lastName, email } = user;
    const subscriberHash = Md5(email.toLowerCase());
    try {
      await mailchimp.lists.setListMember(listId, subscriberHash, {
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      });
      return null;
    } catch (error) {
      SumoLogic.log({
        level: "error",
        method: "signup/user",
        message: `Failed to add subscriber to Mail Chimp: ${error.message}`,
        params: user,
      });
      return error;
    }
  },
};

export default mailchimpClient;
