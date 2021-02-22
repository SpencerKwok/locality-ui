import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  ProfilePasswordUpdateRequest,
  ProfilePasswordUpdateResponse,
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
    profilePasswordUpdateRequest: ProfilePasswordUpdateRequest
  ): Promise<ProfilePasswordUpdateResponse> {
    return await this.rpc.call(
      "ProfilePasswordUpdate",
      profilePasswordUpdateRequest,
      "/api/profile/password/update"
    );
  }
}
