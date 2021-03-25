import { PostRpcClient } from "../../../../common/rpc/RpcClient";
import {
  ShopifyProductUpdateRequest,
  ShopifyProductUpdateResponse,
} from "../../../../common/rpc/Schema";

let instance: AddProductDAO;
export default class AddProductDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new AddProductDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async shopifyProductUpdate(
    shopifyUpdateRequest: ShopifyProductUpdateRequest
  ): Promise<ShopifyProductUpdateResponse> {
    return await this.rpc.call(
      "ShopifyProductUpdate",
      shopifyUpdateRequest,
      "/api/dashboard/shopify/product/update"
    );
  }
}
