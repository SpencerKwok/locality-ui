export interface PostMethods {
  Mail: {
    request: MailRequest;
    response: MailResponse;
  };
  SignIn: {
    request: SignInRequest;
    response: SignInResponse;
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

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse {
  message: string;
  redirectTo?: string;
}

export interface GetMethods {
  Search: SearchResponse;
  SignOut: SignOutResponse;
  Company: CompanyResponse;
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
  ip?: string;
  latitude?: number;
  longitude?: number;
}

export interface SearchResponse {
  hits: Array<Product>;
}

export interface SignOutRequest {}

export interface SignOutResponse {
  redirectTo: string;
}

export interface CompanyRequest {}
export interface CompanyResponse {
  companies: Array<string>;
}
