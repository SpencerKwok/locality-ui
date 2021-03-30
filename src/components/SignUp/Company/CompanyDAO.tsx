import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CompanySignUpRequest,
  CompanySignUpResponse,
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
    companySignUpRequest: CompanySignUpRequest
  ): Promise<CompanySignUpResponse> {
    return await this.rpc.call(
      "CompanySignUp",
      companySignUpRequest,
      "/api/signup/company"
    );
  }
}
