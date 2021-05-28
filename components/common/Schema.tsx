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
  SquareProductUpload: {
    request: SquareProductUploadRequest;
    response: SquareProductUploadResponse;
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

export interface UploadTypeSettings {
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
  departments: string;
  homepages: {
    homepage: string;
    etsyHomepage?: string;
    shopifyHomepage?: string;
    squareHomepage?: string;
  };
  uploadSettings: {
    Etsy?: UploadTypeSettings;
    Shopify?: UploadTypeSettings;
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
  homepages: {
    homepage: string;
    etsyHomepage?: string;
    shopifyHomepage?: string;
    squareHomepage?: string;
  };
}

export interface HomepagesUpdateResponse extends BaseResponse {
  homepages: {
    homepage: string;
    etsyHomepage?: string;
    shopifyHomepage?: string;
    squareHomepage?: string;
  };
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
  preview: string;
}

export interface Product extends BaseProduct {
  business: string;
  departments: Array<string>;
  description: Array<string>;
  link: string;
  priceRange: Array<number>;
  tags: Array<string>;
  variantImages: Array<string>;
  variantTags: Array<string>;
  wishlist?: boolean;
}

export const EmptyProduct: Product = {
  objectId: "",
  name: "",
  preview: "",
  business: "",
  departments: [],
  description: [],
  link: "",
  priceRange: [-1, -1],
  tags: [],
  variantImages: [],
  variantTags: [],
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

export interface SquareProductUploadRequest extends ProductUploadRequest {
  csv: string;
}

export interface SquareProductUploadResponse extends ProductUploadResponse {}

export interface UserSignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserSignUpResponse extends SignUpResponse {}

export interface UploadSettingsUpdateRequest extends BaseResponse {
  businessId: number;
  Etsy?: UploadTypeSettings;
  Shopify?: UploadTypeSettings;
}

export interface UploadSettingsUpdateResponse extends BaseResponse {
  Etsy?: UploadTypeSettings;
  Shopify?: UploadTypeSettings;
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
    business: { [key: string]: number };
    departments: { [key: string]: number };
  };
  hits: Array<Product>;
  nbHits: number;
}

export const EmptySearchResponse: SearchResponse = {
  facets: {
    business: {},
    departments: {},
  },
  hits: [],
  nbHits: 0,
};

export interface WishListResponse extends BaseResponse {
  products: Array<Product>;
}
