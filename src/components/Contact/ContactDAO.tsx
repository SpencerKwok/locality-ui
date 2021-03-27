import { PostRpcClient } from "../../common/rpc/RpcClient";
import { ContactRequest, ContactResponse } from "../../common/rpc/Schema";

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

  async contact(contactRequest: ContactRequest): Promise<ContactResponse> {
    return await this.rpc.call("Contact", contactRequest, "/api/contact");
  }
}
