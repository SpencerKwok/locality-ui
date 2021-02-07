import { GetRpcClient } from "../../common/rpc/RpcClient";
import { SearchRequest, SearchResponse } from "../../common/rpc/Schema";

let instance: SearchDAO;
export default class SearchDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new SearchDAO(new GetRpcClient());
    return instance;
  }

  constructor(private rpc: GetRpcClient) {}

  async search(searchRequest: SearchRequest): Promise<SearchResponse> {
    return await this.rpc.call("Search", "/search?q=" + searchRequest.query);
  }
}
