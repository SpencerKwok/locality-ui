const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER,
});

export const MainListId = process.env.MAILCHIMP_LOCALITY_ID || "";

export interface Subscriber {
  firstName: string;
  lastName: string;
  email: string;
}

const mailchimpClient: { [key: string]: any } = {};
mailchimpClient.addSubscriber = async (
  subscriber: Subscriber,
  listId: string
) => {
  try {
    return [
      await mailchimp.lists.addListMember(listId, {
        email_address: subscriber.email,
        status: "subscribed",
        merge_fields: {
          FNAME: subscriber.firstName,
          LNAME: subscriber.lastName,
        },
      }),
      null,
    ];
  } catch (error) {
    return [null, error.message];
  }
};

export default mailchimpClient;
