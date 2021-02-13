export interface PostMethods {
  Mail: {
    request: MailRequest;
    response: MailResponse;
  };
}

export interface MailRequest {
  email: string;
  name: string;
  productTypes: string;
  productNum: number;
  message: string;
}

export interface MailResponse {}

export interface GetMethods {
  Search: SearchResponse;
}

export interface Product {
  company: string;
  img: string;
  link: string;
  price: number;
  product: string;
}

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  hits: Array<Product>;
}
