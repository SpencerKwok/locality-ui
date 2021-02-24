import { PostRpcClient } from "../../common/rpc/RpcClient";
import { SignUpRequest, SignUpResponse } from "../../common/rpc/Schema";

let instance: SignUpDAO;
export default class SignUpDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new SignUpDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async signup(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    return await this.rpc.call("SignUp", signUpRequest, "/api/signup");
  }
}
