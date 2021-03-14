import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  PasswordUpdateRequest,
  PasswordUpdateResponse,
} from "../../../common/rpc/Schema";

let instance: AccountDAO;
export default class AccountDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new AccountDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async passwordUpdate(
    passwordUpdateRequest: PasswordUpdateRequest
  ): Promise<PasswordUpdateResponse> {
    return await this.rpc.call(
      "PasswordUpdate",
      passwordUpdateRequest,
      "/api/dashboard/password/update"
    );
  }
}
