export interface PostMethods {
  AddToWishList: {
    request: AddToWishListRequest;
    response: AddToWishListResponse;
  };
  BusinessSignUp: {
    request: BusinessSignUpRequest;
    response: BusinessSignUpResponse;
  };
  Contact: {
    request: ContactRequest;
    response: ContactResponse;
  };
  DeleteFromWishList: {
    request: DeleteFromWishListRequest;
    response: DeleteFromWishListResponse;
  };
  DepartmentsUpdate: {
    request: DepartmentsUpdateRequest;
    response: DepartmentsUpdateResponse;
  };
  EtsyProductUpload: {
    request: ProductUploadRequest;
    response: ProductUploadResponse;
  };
  HomepagesUpdate: {
    request: HomepagesUpdateRequest;
    response: HomepagesUpdateResponse;
  };
  LogoUpdate: {
    request: LogoUpdateRequest;
    response: LogoUpdateResponse;
  };
  ProductAdd: {
    request: ProductAddRequest;
    response: ProductAddResponse;
  };
  ProductDelete: {
    request: ProductDeleteRequest;
    response: ProductDeleteResponse;
  };
  ProductUpdate: {
    request: ProductUpdateRequest;
    response: ProductUpdateResponse;
  };
  PasswordUpdate: {
    request: PasswordUpdateRequest;
    response: PasswordUpdateResponse;
  };
  ShopifyProductUpload: {
    request: ProductUploadRequest;
    response: ProductUploadResponse;
  };
  UserSignUp: {
    request: UserSignUpRequest;
    response: UserSignUpResponse;
  };
  UploadSettingsUpdate: {
    request: UploadSettingsUpdateRequest;
    response: UploadSettingsUpdateResponse;
  };
}

export interface BaseResponse {
  error?: string;
}

export interface AddToWishListRequest {
  id: string;
}

export interface AddToWishListResponse extends BaseResponse {}

interface SignUpResponse extends BaseResponse {
  redirectTo: string;
}

export interface BusinessSignUpRequest extends UserSignUpRequest {
  firstName: string;
  lastName: string;
  address: string;
  businessName: string;
  city: string;
  province: string;
  country: string;
}

export interface BusinessSignUpResponse extends SignUpResponse {}

export interface EtsyUploadTypeSettings {
  includeTags?: Array<string>;
  excludeTags?: Array<string>;
}

export interface ShopifyUploadTypeSettings {
  isHomepage?: boolean;
  includeTags?: Array<string>;
  excludeTags?: Array<string>;
}

export interface BaseBusiness {
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
  shopifyHomepage: string;
  etsyHomepage: string;
  departments: string;
  uploadSettings: {
    Etsy?: EtsyUploadTypeSettings;
    Shopify?: ShopifyUploadTypeSettings;
  };
}

export interface ContactRequest {
  email: string;
  message: string;
  name: string;
}

export interface ContactResponse extends BaseResponse {}

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

export interface HomepagesUpdateRequest {
  id: number;
  homepage: string;
  shopifyHomepage: string;
  etsyHomepage: string;
}

export interface HomepagesUpdateResponse extends BaseResponse {
  homepage: string;
  shopifyHomepage: string;
  etsyHomepage: string;
}

export interface LogoUpdateRequest {
  id: number;
  logo: string;
}

export interface LogoUpdateResponse extends BaseResponse {
  logo: string;
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

export interface ProductUpdateRequest {
  businessId: number;
  product: {
    name: string;
    id: number;
    primaryKeywords: Array<string>;
    departments: Array<string>;
    description: string;
    image: string;
    link: string;
    price: number;
    priceRange: Array<number>;
  };
}

export interface ProductUpdateResponse extends BaseResponse {
  product: BaseProduct;
}

export interface ProductAddRequest {
  businessId: number;
  product: {
    name: string;
    primaryKeywords: Array<string>;
    departments: Array<string>;
    description: string;
    image: string;
    link: string;
    price: number;
    priceRange: Array<number>;
  };
}

export interface ProductAddResponse extends BaseResponse {
  product: BaseProduct;
}

export interface ProductDeleteRequest {
  businessId: number;
  product: {
    id: number;
  };
}

export interface ProductDeleteResponse extends BaseResponse {}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordUpdateResponse extends BaseResponse {}

export interface ProductUploadRequest {
  businessId: number;
}

export interface ProductUploadResponse extends BaseResponse {}

export interface UserSignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserSignUpResponse extends SignUpResponse {}

export interface UploadSettingsUpdateRequest extends BaseResponse {
  businessId: number;
  Etsy?: EtsyUploadTypeSettings;
  Shopify?: ShopifyUploadTypeSettings;
}

export interface UploadSettingsUpdateResponse extends BaseResponse {
  Etsy?: EtsyUploadTypeSettings;
  Shopify?: ShopifyUploadTypeSettings;
}

export interface GetMethods {
  Business: BusinessResponse;
  Businesses: BusinessesResponse;
  Departments: DepartmentsResponse;
  Product: ProductResponse;
  Products: ProductsResponse;
  Search: SearchResponse;
  WishList: WishListResponse;
}

export interface BusinessResponse extends BaseResponse {
  business: BaseBusiness;
}

export interface BusinessesResponse extends BaseResponse {
  businesses: Array<BaseBusiness>;
}

export interface DepartmentsResponse extends BaseResponse {
  departments: Array<string>;
}

export interface ProductResponse extends BaseResponse {
  product: Product;
}

export interface ProductsResponse extends BaseResponse {
  products: Array<BaseProduct>;
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

export const EmptySearchResponse: SearchResponse = {
  facets: {
    company: {},
    departments: {},
  },
  hits: [],
  nbHits: 0,
};

export interface WishListResponse extends BaseResponse {
  products: Array<Product>;
}
