import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CustomerSignUpRequest,
  CustomerSignUpResponse,
} from "../../../common/rpc/Schema";

let instance: CompanyDAO;
export default class CompanyDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new CompanyDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async signup(
    signUpRequest: CustomerSignUpRequest
  ): Promise<CustomerSignUpResponse> {
    return await this.rpc.call(
      "CustomerSignUp",
      signUpRequest,
      "/api/signup/customer"
    );
  }
}
