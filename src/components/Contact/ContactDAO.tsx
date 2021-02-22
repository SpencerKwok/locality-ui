import { PostRpcClient } from "../../common/rpc/RpcClient";
import { ContactUsRequest, ContactUsResponse } from "../../common/rpc/Schema";

let instance: ContactDAO;
export default class ContactDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new ContactDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async contactus(
    contactUsRequest: ContactUsRequest
  ): Promise<ContactUsResponse> {
    return await this.rpc.call("ContactUs", contactUsRequest, "/api/contactus");
  }
}
