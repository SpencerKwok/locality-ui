import { PostMethods, GetMethods } from "./Schema";

export class PostRpcClient {
  async call<methodName extends keyof PostMethods>(
    method: methodName,
    request: PostMethods[methodName]["request"],
    endpoint: string
  ): Promise<PostMethods[methodName]["response"]> {
    const fetchRequest = new Request(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        secret: process.env.REACT_APP_SESSION_SECRET || "",
      },
      body: JSON.stringify(request),
    });

    let rawResponse: Response;
    try {
      rawResponse = await fetch(fetchRequest);
    } catch (err) {
      throw err;
    }

    if (rawResponse.status !== 200) {
      throw Error(`Post request failed: ${method}`);
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

export class GetRpcClient {
  async call<methodName extends keyof GetMethods>(
    method: methodName,
    endpoint: string
  ): Promise<GetMethods[methodName]> {
    const fetchRequest = new Request(endpoint, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        secret: process.env.REACT_APP_SESSION_SECRET || "",
      },
    });

    let rawResponse: Response;
    try {
      rawResponse = await fetch(fetchRequest);
    } catch (err) {
      throw err;
    }

    if (rawResponse.status !== 200) {
      throw Error(`Post request failed: ${method}`);
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
