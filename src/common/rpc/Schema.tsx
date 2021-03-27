export interface PostMethods {
  Contact: {
    request: ContactRequest;
    response: ContactResponse;
  };
  SignIn: {
    request: SignInRequest;
    response: SignInResponse;
  };
  SignUp: {
    request: SignUpRequest;
    response: SignUpResponse;
  };
  Company: {
    request: CompanyRequest;
    response: CompanyResponse;
  };
  Companies: {
    request: CompaniesRequest;
    response: CompaniesResponse;
  };
  HomepageUpdate: {
    request: HomepageUpdateRequest;
    response: HomepageUpdateResponse;
  };
  LogoUpdate: {
    request: LogoUpdateRequest;
    response: LogoUpdateResponse;
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
  PasswordUpdate: {
    request: PasswordUpdateRequest;
    response: PasswordUpdateResponse;
  };
  ShopifyProductUpdate: {
    request: ShopifyProductUpdateRequest;
    response: ShopifyProductUpdateResponse;
  };
}

export interface BaseResponse {
  error?: {
    code: number;
    message: string;
  };
}

export interface ContactRequest {
  email: string;
  message: string;
  name: string;
}

export interface ContactResponse extends BaseResponse {}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse extends BaseResponse {
  redirectTo?: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  address: string;
  city: string;
  province: string;
  country: string;
  password: string;
}

export interface SignUpResponse extends BaseResponse {}

export interface BaseCompany {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: string;
  longitude: string;
  logo: string;
  homepage: string;
}

export interface CompanyRequest {
  id: number;
}

export interface CompanyResponse extends BaseResponse {
  company?: BaseCompany;
}

export interface CompaniesRequest {}

export interface CompaniesResponse extends BaseResponse {
  companies?: Array<BaseCompany>;
}

export interface HomepageUpdateRequest {
  id: number;
  homepage: string;
}

export interface HomepageUpdateResponse extends BaseResponse {}

export interface LogoUpdateRequest {
  id: number;
  image: string;
}

export interface LogoUpdateResponse extends BaseResponse {
  url?: string;
}

export interface BaseProduct {
  objectID: string;
  name: string;
  image: string;
}

export interface Product extends BaseProduct {
  company: string;
  primaryKeywords: string;
  description: string;
  link: string;
  price: number;
  priceRange: Array<number>;
}

export const EmptyProduct: Product = {
  objectID: "",
  name: "",
  image: "",
  company: "",
  primaryKeywords: "",
  description: "",
  link: "",
  price: -1,
  priceRange: [-1, -1],
};

export interface ProductsRequest {
  id: number;
}

export interface ProductsResponse extends BaseResponse {
  products?: Array<BaseProduct>;
}

export interface ProductRequest {
  companyId: number;
  id: number;
}

export interface ProductResponse extends BaseResponse {
  product?: Product;
}

export interface ProductUpdateRequest {
  companyId: number;
  product: {
    name: string;
    id: number;
    primaryKeywords: string;
    description: string;
    price: number;
    priceRange: Array<number>;
    link: string;
    image: string;
  };
}

export interface ProductUpdateResponse extends BaseResponse {
  product?: BaseProduct;
}

export interface ProductAddRequest {
  companyId: number;
  companyName: string;
  latitude: string;
  longitude: string;
  product: {
    name: string;
    primaryKeywords: string;
    description: string;
    price: number;
    priceRange: Array<number>;
    link: string;
    image: string;
  };
}

export interface ProductAddResponse extends BaseResponse {
  product?: BaseProduct;
}

export interface ProductDeleteRequest {
  companyId: number;
  id: number;
}

export interface ProductDeleteResponse extends BaseResponse {}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordUpdateResponse extends BaseResponse {}

export interface ShopifyProductUpdateRequest {
  id: number;
}

export interface ShopifyProductUpdateResponse extends BaseResponse {
  products?: Array<BaseProduct>;
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
  page?: number;
}

export interface SearchResponse {
  hits: Array<Product>;
  nbHits: number;
}

export interface SignOutRequest {}

export interface SignOutResponse extends BaseResponse {
  redirectTo?: string;
}
