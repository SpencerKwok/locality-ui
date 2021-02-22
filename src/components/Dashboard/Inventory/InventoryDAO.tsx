import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CompaniesRequest,
  CompaniesResponse,
  ProductsRequest,
  ProductsResponse,
  ProductRequest,
  ProductResponse,
  ProductAddRequest,
  ProductAddResponse,
  ProductUpdateRequest,
  ProductUpdateResponse,
  ProductDeleteRequest,
  ProductDeleteResponse,
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
    return await this.rpc.call(
      "Companies",
      companiesRequest,
      "/api/dashboard/inventory/companies"
    );
  }

  async products(productsRequest: ProductsRequest): Promise<ProductsResponse> {
    return await this.rpc.call(
      "Products",
      productsRequest,
      "/api/dashboard/inventory/products"
    );
  }

  async product(productRequest: ProductRequest): Promise<ProductResponse> {
    return await this.rpc.call(
      "Product",
      productRequest,
      "/api/dashboard/inventory/product/get"
    );
  }

  async productUpdate(
    productUpdateRequest: ProductUpdateRequest
  ): Promise<ProductUpdateResponse> {
    return await this.rpc.call(
      "ProductUpdate",
      productUpdateRequest,
      "/api/dashboard/inventory/product/update"
    );
  }

  async productAdd(
    productAddRequest: ProductAddRequest
  ): Promise<ProductAddResponse> {
    return await this.rpc.call(
      "ProductAdd",
      productAddRequest,
      "/api/dashboard/inventory/product/add"
    );
  }

  async productDelete(
    productDeleteRequest: ProductDeleteRequest
  ): Promise<ProductDeleteResponse> {
    return await this.rpc.call(
      "ProductDelete",
      productDeleteRequest,
      "/api/dashboard/inventory/product/delete"
    );
  }
}
