import { PostRpcClient } from "../../common/rpc/RpcClient";
import { LoginRequest, LoginResponse } from "../../common/rpc/Schema";

let instance: LoginDAO;
export default class LoginDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new LoginDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    return await this.rpc.call("Login", loginRequest, "/login");
  }
}
