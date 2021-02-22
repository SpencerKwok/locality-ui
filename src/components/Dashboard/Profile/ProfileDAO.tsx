import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  PasswordUpdateRequest,
  PasswordUpdateResponse,
} from "../../../common/rpc/Schema";

let instance: ProfileDAO;
export default class ProfileDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new ProfileDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async passwordUpdate(
    passwordUpdateRequest: PasswordUpdateRequest
  ): Promise<PasswordUpdateResponse> {
    return await this.rpc.call(
      "PasswordUpdate",
      passwordUpdateRequest,
      "/api/dashboard/profile/password/update"
    );
  }
}
