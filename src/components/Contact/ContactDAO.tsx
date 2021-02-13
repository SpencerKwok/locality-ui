import { PostRpcClient } from "../../common/rpc/RpcClient";
import { MailRequest, MailResponse } from "../../common/rpc/Schema";

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

  async mail(mailRequest: MailRequest): Promise<MailResponse> {
    return await this.rpc.call("Mail", mailRequest, "/api/mail");
  }
}
