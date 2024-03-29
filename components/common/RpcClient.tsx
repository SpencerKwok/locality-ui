import { NEXTAUTH_URL } from "lib/env";
import { PostMethods, GetMethods } from "common/Schema";

const baseUrl = typeof window === "undefined" ? NEXTAUTH_URL : "";
const endpoints = new Map<keyof PostMethods, string>([
  ["AddToWishList", "/api/wishlist/add"],
  ["BusinessSignUp", "/api/signup/business"],
  ["Contact", "/api/contact"],
  ["DeleteFromWishList", "/api/wishlist/delete"],
  ["DepartmentsUpdate", "/api/dashboard/departments/update"],
  ["EtsyUploadSettingsUpdate", "/api/dashboard/upload/settings/update"],
  ["HomepagesUpdate", "/api/dashboard/homepages/update"],
  ["LogoUpdate", "/api/dashboard/logo/update"],
  ["PasswordUpdate", "/api/dashboard/password/update"],
  ["ProductAdd", "/api/dashboard/product/add"],
  ["ProductDelete", "/api/dashboard/product/delete"],
  ["ProductUpdate", "/api/dashboard/product/update"],
  ["EtsyProductUpload", "/api/dashboard/upload/etsy"],
  ["ShopifyProductUpload", "/api/dashboard/upload/shopify"],
  ["ShopifyUploadSettingsUpdate", "/api/dashboard/upload/settings/update"],
  ["SquareProductUpload", "/api/dashboard/upload/square"],
  ["SquareUploadSettingsUpdate", "/api/dashboard/upload/settings/update"],
  ["UserSignUp", "/api/signup/user"],
  ["VariantAdd", "/api/dashboard/variant/add"],
  ["VariantDelete", "/api/dashboard/variant/delete"],
  ["VariantUpdate", "/api/dashboard/variant/update"],
  ["ClickMonetization", "/api/monetization"],
  ["ViewMonetization", "/api/monetization"],
]);

let postRpcClient: PostRpcClient | null = null;
export class PostRpcClient {
  private constructor() {}

  public static getInstance(): PostRpcClient {
    if (postRpcClient !== null) {
      return postRpcClient;
    }

    postRpcClient = new PostRpcClient();
    return postRpcClient;
  }

  public async call<methodName extends keyof PostMethods>(
    method: methodName,
    request: PostMethods[methodName]["request"],
    headers?: Record<string, string | undefined>
  ): Promise<PostMethods[methodName]["response"]> {
    const endpoint = endpoints.get(method);
    const fetchRequest = new Request(`${baseUrl}${endpoint}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        ...headers,
      },
      body: JSON.stringify(request),
    });

    let rawResponse: Response;
    try {
      rawResponse = await fetch(fetchRequest);
    } catch (err: unknown) {
      throw err;
    }

    let response: PostMethods[methodName]["response"];
    if (rawResponse.status === 204) {
      return {};
    }

    try {
      response = await rawResponse.json();
    } catch (err: unknown) {
      throw err;
    }
    return response;
  }
}

let getRpcClient: GetRpcClient | null = null;
export class GetRpcClient {
  private constructor() {}

  public static getInstance(): GetRpcClient {
    if (getRpcClient !== null) {
      return getRpcClient;
    }

    getRpcClient = new GetRpcClient();
    return getRpcClient;
  }

  public async call<methodName extends keyof GetMethods>(
    method: methodName,
    endpoint: string,
    headers?: Record<string, string | undefined>
  ): Promise<GetMethods[methodName]> {
    const fetchRequest = new Request(`${baseUrl}${endpoint}`, {
      credentials: "same-origin",
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        ...headers,
      },
    });

    let rawResponse: Response;
    try {
      rawResponse = await fetch(fetchRequest);
    } catch (err: unknown) {
      throw err;
    }

    let response: GetMethods[methodName];
    try {
      response = await rawResponse.json();
    } catch (err: unknown) {
      throw err;
    }
    return response;
  }
}
