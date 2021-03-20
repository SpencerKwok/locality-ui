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
    let endpoint = `/api/search?q=${searchRequest.query}`;
    if (searchRequest.ip) {
      endpoint += `&ip=${searchRequest.ip}`;
    } else if (searchRequest.latitude && searchRequest.longitude) {
      endpoint += `&lat=${searchRequest.latitude}&lng=${searchRequest.longitude}`;
    }
    if (searchRequest.page) {
      endpoint += `&pg=${searchRequest.page}`;
    }
    return await this.rpc.call("Search", endpoint);
  }
}
