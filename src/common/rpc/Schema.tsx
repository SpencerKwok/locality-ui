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
  Product: {
    request: ProductRequest;
    response: ProductResponse;
  };
  Products: {
    request: ProductsRequest;
    response: ProductsResponse;
  };
  ProductUpdate: {
    request: ProductUpdateRequest;
    response: ProductUpdateResponse;
  };
  ProductAdd: {
    request: ProductAddRequest;
    response: ProductAddResponse;
  };
  ProductDelete: {
    request: ProductDeleteRequest;
    response: ProductDeleteResponse;
  };
  ProfilePasswordUpdate: {
    request: ProfilePasswordUpdateRequest;
    response: ProfilePasswordUpdateResponse;
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
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: string;
  longitude: string;
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
  primary_keywords: Array<string>;
  secondary_keywords: Array<string>;
  link: string;
  price: number;
}

export const EmptyProduct = {
  product_id: -1,
  name: "",
  image: "",
  company: "",
  primary_keywords: [],
  secondary_keywords: [],
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

export interface ProductUpdateRequest {
  companyId: number;
  productId: number;
  product: {
    name: string;
    primaryKeywords: Array<string>;
    secondaryKeywords: Array<string>;
    price: number;
    link: string;
    image: string;
  };
}

export interface ProductUpdateResponse {}

export interface ProductAddRequest {
  companyId: number;
  companyName: string;
  latitude: string;
  longitude: string;
  product: {
    name: string;
    primaryKeywords: Array<string>;
    secondaryKeywords: Array<string>;
    price: number;
    link: string;
    image: string;
  };
}

export interface ProductAddResponse {}

export interface ProductDeleteRequest {
  companyId: number;
  productId: number;
}

export interface ProductDeleteResponse {}

export interface ProfilePasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfilePasswordUpdateResponse {}

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
