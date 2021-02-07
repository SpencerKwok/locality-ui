export interface PostMethods {}

export interface GetMethods {
  Search: SearchResponse;
}

export interface SearchRequest {
  query: string;
}

export interface Product {
  company: string;
  img: string;
  price: number;
  product: string;
}

export interface SearchResponse {
  hits: Array<Product>;
}
