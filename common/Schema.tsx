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
  EtsyUploadSettingsUpdate: {
    request: EtsyUploadSettingsUpdateRequest;
    response: EtsyUploadSettingsUpdateResponse;
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
  ShopifyUploadSettingsUpdate: {
    request: ShopifyUploadSettingsUpdateRequest;
    response: ShopifyUploadSettingsUpdateResponse;
  };
  SquareProductUpload: {
    request: SquareProductUploadRequest;
    response: SquareProductUploadResponse;
  };
  SquareUploadSettingsUpdate: {
    request: SquareUploadSettingsUpdateRequest;
    response: SquareUploadSettingsUpdateResponse;
  };
  UserSignUp: {
    request: UserSignUpRequest;
    response: UserSignUpResponse;
  };
  VariantAdd: {
    request: VariantAddRequest;
    response: VariantAddResponse;
  };
  VariantUpdate: {
    request: VariantUpdateRequest;
    response: VariantUpdateResponse;
  };
  VariantDelete: {
    request: VariantDeleteRequest;
    response: VariantDeleteResponse;
  };
}

export interface BaseResponse {
  error?: string;
}

export interface AddToWishListRequest {
  id: string;
}

export type AddToWishListResponse = BaseResponse;

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

export type BusinessSignUpResponse = SignUpResponse;

export interface BaseUploadTypeSettings {
  includeTags?: Array<string>;
  excludeTags?: Array<string>;
}

export interface UploadTypeSettings extends BaseUploadTypeSettings {
  departmentMapping?: Array<{ key: string; departments: Array<string> }>;
}

export interface BaseBusiness {
  id: number;
  name: string;
  logo: string;
  departments: Array<string>;
  homepages: {
    homepage: string;
    etsyHomepage?: string;
    shopifyHomepage?: string;
    squareHomepage?: string;
  };
  uploadSettings: {
    etsy?: BaseUploadTypeSettings;
    shopify?: UploadTypeSettings;
    square?: UploadTypeSettings;
  };
}

export interface ContactRequest {
  email: string;
  message: string;
  name: string;
}

export type ContactResponse = BaseResponse;

export interface DepartmentsUpdateRequest {
  id: number;
  departments: Array<string>;
}

export interface DepartmentsUpdateResponse extends BaseResponse {}

export interface DeleteFromWishListRequest {
  id: string;
}

export type DeleteFromWishListResponse = BaseResponse;

export interface HomepagesUpdateRequest {
  id: number;
  homepage: string;
  etsyHomepage?: string;
  shopifyHomepage?: string;
  squareHomepage?: string;
}

export interface HomepagesUpdateResponse extends BaseResponse {}

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

export interface DatabaseProduct {
  name: string;
  departments: Array<string>;
  description: string;
  link: string;
  priceRange: FixedLengthArray<[number, number]>;
  tags: Array<string>;
  variantImages: Array<string>;
  variantTags: Array<string>;
  nextProductId?: number;
}

export interface Product extends BaseProduct {
  business: string;
  departments: Array<string>;
  description: string;
  link: string;
  priceRange: FixedLengthArray<[number, number]>;
  tags: Array<string>;
  variantImages: Array<string>;
  variantTags: Array<string>;
  variantIndex: number;
  wishlist?: boolean;
}

export const EmptyProduct: Product = {
  objectId: "",
  name: "",
  preview: "",
  business: "",
  departments: [],
  description: "",
  link: "",
  priceRange: [-1, -1],
  tags: [""],
  variantImages: [""],
  variantTags: [""],
  variantIndex: 0,
};

export interface ProductUpdateRequest extends ProductAddRequest {
  id: number;
  product: {
    id: number;
    name: string;
    departments: Array<string>;
    description: string;
    link: string;
    priceRange: FixedLengthArray<[number, number]>;
    tags: Array<string>;
    variantImages: Array<string>;
    variantTags: Array<string>;
  };
}

export interface ProductUpdateResponse extends BaseResponse {
  product: BaseProduct;
}

export interface ProductAddRequest {
  id: number;
  product: {
    name: string;
    departments: Array<string>;
    description: string;
    link: string;
    priceRange: FixedLengthArray<[number, number]>;
    tags: Array<string>;
    variantImages: Array<string>;
    variantTags: Array<string>;
  };
}

export interface ProductAddResponse extends BaseResponse {
  product: BaseProduct;
}

export interface ProductDeleteRequest {
  id: number;
  product: {
    id: number;
  };
}

export type ProductDeleteResponse = BaseResponse;

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword1: string;
  newPassword2: string;
}

export type PasswordUpdateResponse = BaseResponse;

export interface ProductUploadRequest {
  id: number;
}

export type ProductUploadResponse = BaseResponse;

export interface SquareProductUploadRequest extends ProductUploadRequest {
  csv: string;
}

export type SquareProductUploadResponse = ProductUploadResponse;

export interface UserSignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password1: string;
  password2: string;
}

export type UserSignUpResponse = SignUpResponse;

export interface EtsyUploadSettingsUpdateRequest {
  id: number;
  etsy?: BaseUploadTypeSettings;
}

export interface EtsyUploadSettingsUpdateResponse extends BaseResponse {
  etsy?: BaseUploadTypeSettings;
}

export interface ShopifyUploadSettingsUpdateRequest {
  id: number;
  shopify?: UploadTypeSettings;
}

export interface ShopifyUploadSettingsUpdateResponse extends BaseResponse {
  shopify?: UploadTypeSettings;
}

export interface SquareUploadSettingsUpdateRequest {
  id: number;
  square?: UploadTypeSettings;
}

export interface SquareUploadSettingsUpdateResponse extends BaseResponse {
  square?: UploadTypeSettings;
}

export interface VariantAddRequest {
  id: number;
  product: {
    id: number;
    variantImage: string;
    variantTag: string;
  };
}

export interface VariantAddResponse extends BaseResponse {
  variantImage: string;
  variantTag: string;
}

export interface VariantUpdateRequest {
  id: number;
  product: {
    id: number;
    index: number;
    variantImage: string;
    variantTag: string;
  };
}

export interface VariantUpdateResponse extends BaseResponse {
  variantImage: string;
  variantTag: string;
}

export interface VariantDeleteRequest {
  id: number;
  product: {
    id: number;
    index: number;
  };
}

export type VariantDeleteResponse = BaseResponse;

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
    business: Record<string, number>;
    departments: Record<string, number>;
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

/// Extension Interfaces
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse extends BaseResponse {
  id: number;
  token: string;
}
