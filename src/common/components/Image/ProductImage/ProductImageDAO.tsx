import { PostRpcClient } from "../../../rpc/RpcClient";
import {
  AddToWishListRequest,
  AddToWishListResponse,
  DeleteFromWishListRequest,
  DeleteFromWishListResponse,
} from "../../../rpc/Schema";

let instance: ProductImageDAO;
export default class ProductImageDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new ProductImageDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async addToWishlist(
    addToWishListRequest: AddToWishListRequest
  ): Promise<AddToWishListResponse> {
    return await this.rpc.call(
      "AddToWishList",
      addToWishListRequest,
      "/api/wishlist/add"
    );
  }

  async deleteFromWishlist(
    deleteFromWishListRequest: DeleteFromWishListRequest
  ): Promise<DeleteFromWishListResponse> {
    return await this.rpc.call(
      "DeleteFromWishList",
      deleteFromWishListRequest,
      "/api/wishlist/delete"
    );
  }
}
