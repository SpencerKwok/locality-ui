import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CompaniesRequest,
  CompaniesResponse,
  ProductsRequest,
  ProductsResponse,
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
  ProductUpdateResponse,
} from "../../../common/rpc/Schema";

let instance: InventoryDAO;
export default class InventoryDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new InventoryDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async companies(
    companiesRequest: CompaniesRequest
  ): Promise<CompaniesResponse> {
    return await this.rpc.call("Companies", companiesRequest, "/api/companies");
  }

  async products(productsRequest: ProductsRequest): Promise<ProductsResponse> {
    return await this.rpc.call("Products", productsRequest, "/api/products");
  }

  async product(productRequest: ProductRequest): Promise<ProductResponse> {
    return await this.rpc.call("Product", productRequest, "/api/product");
  }

  async productUpdate(
    productUpdateRequest: ProductUpdateRequest
  ): Promise<ProductUpdateResponse> {
    return await this.rpc.call(
      "ProductUpdate",
      productUpdateRequest,
      "/api/productUpdate"
    );
  }
}
