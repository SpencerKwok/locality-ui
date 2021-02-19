import { GetRpcClient } from "../../common/rpc/RpcClient";
import { SignOutRequest, SignOutResponse } from "../../common/rpc/Schema";

let instance: NavigationDAO;
export default class NavigationDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new NavigationDAO(new GetRpcClient());
    return instance;
  }

  constructor(private rpc: GetRpcClient) {}

  async signout(signOutRequest: SignOutRequest): Promise<SignOutResponse> {
    return await this.rpc.call("SignOut", "/api/signout");
  }
}
