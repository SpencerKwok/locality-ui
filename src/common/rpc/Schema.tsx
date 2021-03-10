export interface PostMethods {
  ContactUs: {
    request: ContactUsRequest;
    response: ContactUsResponse;
  };
  SignIn: {
    request: SignInRequest;
    response: SignInResponse;
  };
  SignUp: {
    request: SignUpRequest;
    response: SignUpResponse;
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
  PasswordUpdate: {
    request: PasswordUpdateRequest;
    response: PasswordUpdateResponse;
  };
}

export interface BaseResponse {
  error?: {
    code: number;
    message: string;
  };
}

export interface ContactUsRequest {
  email: string;
  message: string;
  name: string;
}

export interface ContactUsResponse extends BaseResponse {}

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
}

export interface CompaniesRequest {}

export interface CompaniesResponse extends BaseResponse {
  companies?: Array<BaseCompany>;
}

export interface BaseProduct {
  objectID: string;
  name: string;
  image: string;
}

export interface Product extends BaseProduct {
  company: string;
  primaryKeywords: Array<string>;
  secondaryKeywords: Array<string>;
  link: string;
  price: number;
}

export const EmptyProduct: Product = {
  objectID: "",
  name: "",
  image: "",
  company: "",
  primaryKeywords: [],
  secondaryKeywords: [],
  link: "",
  price: -1,
};

export interface ProductsRequest {
  companyId: number;
}

export interface ProductsResponse extends BaseResponse {
  products?: Array<BaseProduct>;
}

export interface ProductRequest {
  companyId: number;
  productId: number;
}

export interface ProductResponse extends BaseResponse {
  product?: Product;
}

export interface ProductUpdateRequest {
  companyId: number;
  product: {
    name: string;
    id: number;
    primaryKeywords: Array<string>;
    secondaryKeywords: Array<string>;
    price: number;
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
    primaryKeywords: Array<string>;
    secondaryKeywords: Array<string>;
    price: number;
    link: string;
    image: string;
  };
}

export interface ProductAddResponse extends BaseResponse {
  product?: BaseProduct;
}

export interface ProductDeleteRequest {
  companyId: number;
  productId: number;
}

export interface ProductDeleteResponse extends BaseResponse {}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordUpdateResponse extends BaseResponse {}

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

export interface SignOutResponse extends BaseResponse {
  redirectTo?: string;
}
