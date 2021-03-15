import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CompanyRequest,
  CompanyResponse,
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
    return await this.rpc.call("Companies", companiesRequest, "/api/companies");
  }

  async company(companyRequest: CompanyRequest): Promise<CompanyResponse> {
    return await this.rpc.call("Company", companyRequest, "/api/company");
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
      "/api/dashboard/product/update"
    );
  }

  async productAdd(
    productAddRequest: ProductAddRequest
  ): Promise<ProductAddResponse> {
    return await this.rpc.call(
      "ProductAdd",
      productAddRequest,
      "/api/dashboard/product/add"
    );
  }

  async productDelete(
    productDeleteRequest: ProductDeleteRequest
  ): Promise<ProductDeleteResponse> {
    return await this.rpc.call(
      "ProductDelete",
      productDeleteRequest,
      "/api/dashboard/product/delete"
    );
  }
}
