import { PostRpcClient } from "../../common/rpc/RpcClient";
import { SignInRequest, SignInResponse } from "../../common/rpc/Schema";

let instance: SignInDAO;
export default class SignInDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new SignInDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async signin(signInRequest: SignInRequest): Promise<SignInResponse> {
    return await this.rpc.call("SignIn", signInRequest, "/api/signin");
  }
}
