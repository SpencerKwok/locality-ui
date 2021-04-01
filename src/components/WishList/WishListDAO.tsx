import { PostRpcClient } from "../../common/rpc/RpcClient";
import { WishListRequest, WishListResponse } from "../../common/rpc/Schema";

let instance: WishListDAO;
export default class WishListDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new WishListDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async wishlist(wishListRequest: WishListRequest): Promise<WishListResponse> {
    return await this.rpc.call(
      "WishList",
      wishListRequest,
      "/api/wishlist/get"
    );
  }
}
