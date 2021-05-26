import Md5 from "md5";
const mailchimp = require("@mailchimp/mailchimp_marketing");

import {
  MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER,
  MAILCHIMP_LOCALITY_ID,
} from "../env";

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

const mailchimpClient: { [key: string]: any } = {};
mailchimpClient.addSubscriber = async (
  { firstName, lastName, email }: Subscriber,
  listId: string
) => {
  const subscriberHash = Md5(email.toLowerCase());
  try {
    const response = await mailchimp.lists.setListMember(
      listId,
      subscriberHash,
      {
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      }
    );
    return [response, null];
  } catch (error) {
    return [null, error.message];
  }
};

export default mailchimpClient;
