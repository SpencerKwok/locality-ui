import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CompaniesRequest,
  CompaniesResponse,
} from "../../../common/rpc/Schema";

let instance: ShowcaseDAO;
export default class ShowcaseDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new ShowcaseDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async companies(
    companiesRequest: CompaniesRequest
  ): Promise<CompaniesResponse> {
    return await this.rpc.call("Companies", companiesRequest, "/api/companies");
  }
}
