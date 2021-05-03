import { PostMethods, GetMethods } from "./Schema";

const baseUrl = typeof window === "undefined" ? process.env.NEXTAUTH_URL : "";
const endpoints = new Map<keyof PostMethods, string>([
  ["AddToWishList", "/api/wishlist/add"],
  ["BusinessSignUp", "/api/signup/business"],
  ["Contact", "/api/contact"],
  ["DeleteFromWishList", "/api/wishlist/delete"],
  ["DepartmentsUpdate", "/api/dashboard/departments/update"],
  ["HomepageUpdate", "/api/dashboard/homepage/update"],
  ["LogoUpdate", "/api/dashboard/logo/update"],
  ["PasswordUpdate", "/api/dashboard/password/update"],
  ["UserSignUp", "/api/signup/user"],
]);

let postRpcClient: PostRpcClient;
export class PostRpcClient {
  static getInstance() {
    if (postRpcClient) {
      return postRpcClient;
    }

    postRpcClient = new PostRpcClient();
    return postRpcClient;
  }

  private constructor() {}

  async call<methodName extends keyof PostMethods>(
    method: methodName,
    request: PostMethods[methodName]["request"],
    cookie?: string
  ): Promise<PostMethods[methodName]["response"]> {
    const endpoint = endpoints.get(method);
    const fetchRequest = new Request(`${baseUrl}${endpoint}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        cookie: cookie || "",
      },
      body: JSON.stringify(request),
    });

    let rawResponse: Response;
    try {
      rawResponse = await fetch(fetchRequest);
    } catch (err) {
      throw err;
    }

    let response: PostMethods[methodName]["response"];
    try {
      response = await rawResponse.json();
    } catch (err) {
      throw err;
    }
    return response;
  }
}

let getRpcClient: GetRpcClient;
export class GetRpcClient {
  static getInstance() {
    if (getRpcClient) {
      return getRpcClient;
    }

    getRpcClient = new GetRpcClient();
    return getRpcClient;
  }

  private constructor() {}

  async call<methodName extends keyof GetMethods>(
    method: methodName,
    endpoint: string,
    cookie?: string
  ): Promise<GetMethods[methodName]> {
    const fetchRequest = new Request(`${baseUrl}${endpoint}`, {
      credentials: "same-origin",
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        cookie: cookie || "",
      },
    });

    let rawResponse: Response;
    try {
      rawResponse = await fetch(fetchRequest);
    } catch (err) {
      throw err;
    }

    let response: GetMethods[methodName];
    try {
      response = await rawResponse.json();
    } catch (err) {
      throw err;
    }
    return response;
  }
}
