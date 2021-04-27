export interface PostMethods {
  AddToWishList: {
    request: AddToWishListRequest;
    response: AddToWishListResponse;
  };
  Contact: {
    request: ContactRequest;
    response: ContactResponse;
  };
  CompanySignUp: {
    request: CompanySignUpRequest;
    response: CompanySignUpResponse;
  };
  CustomerSignUp: {
    request: CustomerSignUpRequest;
    response: CustomerSignUpResponse;
  };
  CustomerSignUpGoogle: {
    request: CustomerSignUpGoogleRequest;
    response: CustomerSignUpGoogleResponse;
  };
  CustomerSignUpFacebook: {
    request: CustomerSignUpFacebookRequest;
    response: CustomerSignUpFacebookResponse;
  };
  Company: {
    request: CompanyRequest;
    response: CompanyResponse;
  };
  DeleteFromWishList: {
    request: DeleteFromWishListRequest;
    response: DeleteFromWishListResponse;
  };
  DepartmentsUpdate: {
    request: DepartmentsUpdateRequest;
    response: DepartmentsUpdateResponse;
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
  SignIn: {
    request: SignInRequest;
    response: SignInResponse;
  };
  SignInFacebook: {
    request: SignInFacebookRequest;
    response: SignInFacebookResponse;
  };
  SignInGoogle: {
    request: SignInGoogleRequest;
    response: SignInGoogleResponse;
  };
  WishList: {
    request: WishListRequest;
    response: WishListResponse;
  };
}

export interface BaseResponse {
  error?: string;
}

export interface AddToWishListRequest {
  id: string;
}

export interface AddToWishListResponse extends BaseResponse {}

export interface ContactRequest {
  email: string;
  message: string;
  name: string;
}

export interface ContactResponse extends BaseResponse {}

interface SignUpResponse extends BaseResponse {
  redirectTo: string;
}

export interface CustomerSignUpRequest {
  email: string;
  password: string;
}

export interface CustomerSignUpResponse extends SignUpResponse {}

export interface CustomerSignUpGoogleRequest {
  accesstoken: string;
}

export interface CustomerSignUpGoogleResponse extends SignUpResponse {}

export interface CustomerSignUpFacebookRequest {
  accesstoken: string;
}

export interface CustomerSignUpFacebookResponse extends SignUpResponse {}

export interface CompanySignUpRequest extends CustomerSignUpRequest {
  firstName: string;
  lastName: string;
  address: string;
  companyName: string;
  city: string;
  province: string;
  country: string;
}

export interface CompanySignUpResponse extends SignUpResponse {}

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
  departments: string;
}

export interface CompanyRequest {
  id: number;
}

export interface CompanyResponse extends BaseResponse {
  company: BaseCompany;
}

export interface DepartmentsUpdateRequest {
  id: number;
  departments: Array<string>;
}

export interface DepartmentsUpdateResponse extends BaseResponse {
  departments: Array<string>;
}

export interface DeleteFromWishListRequest {
  id: string;
}

export interface DeleteFromWishListResponse extends BaseResponse {}

export interface HomepageUpdateRequest {
  id: number;
  homepage: string;
}

export interface HomepageUpdateResponse extends BaseResponse {
  homepage?: string;
}

export interface LogoUpdateRequest {
  id: number;
  image: string;
}

export interface LogoUpdateResponse extends BaseResponse {
  url: string;
}

export interface BaseProduct {
  objectId: string;
  name: string;
  image: string;
}

export interface Product extends BaseProduct {
  company: string;
  primaryKeywords: Array<string>;
  departments: Array<string>;
  description: string;
  link: string;
  price: number;
  priceRange: Array<number>;
  wishlist?: boolean;
}

export const EmptyProduct: Product = {
  objectId: "",
  name: "",
  image: "",
  company: "",
  departments: [],
  primaryKeywords: [],
  description: "",
  link: "",
  price: -1,
  priceRange: [-1, -1],
};

export interface ProductsRequest {
  id: number;
}

export interface ProductsResponse extends BaseResponse {
  products: Array<BaseProduct>;
}

export interface ProductRequest {
  companyId: number;
  id: number;
}

export interface ProductResponse extends BaseResponse {
  product: Product;
}

export interface ProductUpdateRequest {
  companyId: number;
  product: {
    name: string;
    id: number;
    primaryKeywords: Array<string>;
    departments: Array<string>;
    description: string;
    price: number;
    priceRange: Array<number>;
    link: string;
    image: string;
  };
}

export interface ProductUpdateResponse extends BaseResponse {
  product: BaseProduct;
}

export interface ProductAddRequest {
  companyId: number;
  companyName: string;
  latitude: string;
  longitude: string;
  product: {
    name: string;
    primaryKeywords: Array<string>;
    departments: Array<string>;
    description: string;
    price: number;
    priceRange: Array<number>;
    link: string;
    image: string;
  };
}

export interface ProductAddResponse extends BaseResponse {
  product: BaseProduct;
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
  products: Array<BaseProduct>;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse extends BaseResponse {
  redirectTo: string;
}

export interface SignInGoogleRequest {
  accesstoken: string;
}

export interface SignInGoogleResponse extends BaseResponse {
  redirectTo: string;
}

export interface SignInFacebookRequest {
  accesstoken: string;
}

export interface SignInFacebookResponse extends BaseResponse {
  redirectTo: string;
}

export interface WishListRequest {}

export interface WishListResponse extends BaseResponse {
  products: Array<Product>;
}

export interface GetMethods {
  Companies: CompaniesResponse;
  Search: SearchResponse;
  SignOut: SignOutResponse;
}

export interface CompaniesRequest {}

export interface CompaniesResponse extends BaseResponse {
  companies: Array<BaseCompany>;
}

export interface SearchRequest {
  query: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  filters?: string;
}

export interface SearchResponse {
  facets: {
    company: { [key: string]: number };
    departments: { [key: string]: number };
  };
  hits: Array<Product>;
  nbHits: number;
}

export interface SignOutRequest {}

export interface SignOutResponse extends BaseResponse {}