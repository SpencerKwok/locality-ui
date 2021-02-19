import { GetRpcClient } from "../../../common/rpc/RpcClient";
import { CompanyRequest, CompanyResponse } from "../../../common/rpc/Schema";

let instance: CompanyDAO;
export default class CompanyDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new CompanyDAO(new GetRpcClient());
    return instance;
  }

  constructor(private rpc: GetRpcClient) {}

  async company(companyRequest: CompanyRequest): Promise<CompanyResponse> {
    return await this.rpc.call("Company", "/api/company");
  }
}
