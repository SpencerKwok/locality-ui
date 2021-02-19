export interface PostMethods {
  Mail: {
    request: MailRequest;
    response: MailResponse;
  };
  SignIn: {
    request: SignInRequest;
    response: SignInResponse;
  };
  Companies: {
    request: CompaniesRequest;
    response: CompaniesResponse;
  };
  Products: {
    request: ProductsRequest;
    response: ProductsResponse;
  };
  Product: {
    request: ProductRequest;
    response: ProductResponse;
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

export interface BaseCompany {
  company_id: number;
  name: string;
}

export interface CompaniesRequest {}

export interface CompaniesResponse {
  companies: Array<BaseCompany>;
}

export interface BaseProduct {
  product_id: number;
  name: string;
  image: string;
}

export interface Product extends BaseProduct {
  company: string;
  link: string;
  price: number;
}

export const EmptyProduct = {
  product_id: -1,
  name: "",
  image: "",
  company: "",
  link: "",
  price: -1,
};

export interface ProductsRequest {
  companyId: number;
}

export interface ProductsResponse {
  products: Array<BaseProduct>;
}

export interface ProductRequest {
  companyId: number;
  productId: number;
}

export interface ProductResponse {
  product: Product;
}

export interface GetMethods {
  Search: SearchResponse;
  SignOut: SignOutResponse;
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
