import * as yup from "yup";

const CommaListValidator = yup
  .string()
  .optional()
  .max(255, "Too long")
  .matches(/^\s*[^,]*\s*(,(\s*[^,\s]\s*)+)*\s*$/g, "Must be a comma list");

const StringArrayValidator = yup
  .array()
  .of(yup.string().strict(true).required("Required"));

export const ContactSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  name: yup.string().strict(true).required("Required").max(255, "Too long"),
  message: yup.string().strict(true).required("Required").max(500, "Too long"),
});

export const UserSignUpSchema = yup.object().shape({
  firstName: yup
    .string()
    .strict(true)
    .required("Required")
    .max(255, "Too long"),
  lastName: yup.string().strict(true).required("Required").max(255, "Too long"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  password1: yup
    .string()
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long"),
  password2: yup
    .string()
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long")
    .oneOf([yup.ref("password1")], "Passwords do not match"),
  subscribe: yup.boolean().strict(true).required("Required"),
});

export const BusinessSignUpSchema = yup.object().shape({
  firstName: yup
    .string()
    .strict(true)
    .required("Required")
    .max(255, "Too long"),
  lastName: yup.string().strict(true).required("Required").max(255, "Too long"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  phoneNumber: yup.string().optional().max(255, "Too long"),
  businessName: yup
    .string()
    .strict(true)
    .required("Required")
    .max(255, "Too long"),
  businessHomepage: yup
    .string()
    .strict(true)
    .required("Required")
    .max(255, "Too long"),
  subscribe: yup.boolean().strict(true).required("Requred"),
});

export const DepartmentsUpdateSchema = yup.object().shape({
  departments: StringArrayValidator.required("Required"),
});

export const HomepagesUpdateSchema = yup.object().shape({
  homepage: yup.string().strict(true).required("Required").max(255, "Too long"),
  etsyHomepage: yup
    .string()
    .optional()
    .test(
      "EtsyFormat",
      "Must have the following format: etsy.com/shop/[SHOP_ID]",
      (page) => {
        return ((page?.length ?? 0) === 0 ||
          page?.match(
            /^(http(s?):\/\/)?(www\.)?etsy\.com\/([a-zA-Z]+\/)*shop\/[a-zA-Z0-9_\-%']+(\/?)(\?.*)*$/g
          )) as boolean;
      }
    )
    .max(255, "Too long"),
  shopifyHomepage: yup.string().strict(true).optional().max(255, "Too long"),
  squareHomepage: yup.string().strict(true).optional().max(255, "Too long"),
});

export const LogoUpdateSchema = yup.object().shape({
  logo: yup.string().strict(true).required("Invalid image url or image file"),
});

export const PasswordUpdateSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .strict(true)
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long"),
  newPassword1: yup
    .string()
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long"),
  newPassword2: yup
    .string()
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long")
    .oneOf([yup.ref("newPassword1")], "New passwords do not match"),
});

export const ProductAddSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  product: yup
    .object()
    .required()
    .shape({
      name: yup.string().strict(true).required("Required").max(255, "Too long"),
      departments: StringArrayValidator.required("Required"),
      description: yup.string().strict(true).optional().max(2048, "Too long"),
      link: yup.string().strict(true).required("Required").max(255, "Too long"),
      priceRange: yup
        .array()
        .of(yup.number().required("Required").min(0, "Must be non-negative"))
        .length(2, "Invalid range"),
      tags: StringArrayValidator.required("Required"),
      variantImages: StringArrayValidator.required("Required").min(
        1,
        "Must contain at least 1 image"
      ),
      variantTags: StringArrayValidator.required("Required"),
    }),
});

export const ProductDeleteSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  product: yup
    .object()
    .required()
    .shape({
      id: yup
        .number()
        .required("Required")
        .integer("Must be integer")
        .min(0, "Must be non-negative"),
    }),
});

export const ProductUpdateSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  product: yup
    .object()
    .required()
    .shape({
      id: yup
        .number()
        .required("Required")
        .integer("Must be integer")
        .min(0, "Must be non-negative"),
      name: yup.string().strict(true).required("Required").max(255, "Too long"),
      departments: StringArrayValidator.required("Required"),
      description: yup.string().strict(true).optional().max(2048, "Too long"),
      link: yup.string().strict(true).required("Required").max(255, "Too long"),
      priceRange: yup
        .array()
        .of(yup.number().required("Required").min(0, "Must be non-negative"))
        .length(2, "Invalid range"),
      tags: StringArrayValidator.required("Required"),
      variantImages: StringArrayValidator.required("Required").min(
        1,
        "Must contain at least 1 image"
      ),
      variantTags: StringArrayValidator.required("Required"),
    }),
});

export const ProductFormSchema = yup.object().shape({
  name: yup.string().strict(true).required("Required").max(255, "Too long"),
  tags: yup
    .string()
    .optional()
    .max(255, "Too long")
    .matches(/^\s*[^,]+\s*(,(\s*[^,\s]\s*)+)*\s*$/g, "Must be a comma list"),
  variantTag: yup.string().strict(true).optional().max(255, "Too long"),
  departments: StringArrayValidator.required("Required"),
  description: yup.string().strict(true).optional().max(2048, "Too long"),
  price: yup.mixed().when("isRange", {
    is: false,
    then: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Invalid price"),
  }),
  priceLow: yup.mixed().when("isRange", {
    is: true,
    then: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Invalid price")
      .test(
        "Price Low Test",
        "Must be lower than the upper price range",
        (lowPrice, { parent }) => {
          try {
            const p1 = parseFloat(lowPrice ?? "");
            const p2 = parseFloat(parent.priceHigh);
            return p1 < p2;
          } catch {
            // Error is not a price range
            // error, so we return true
            return true;
          }
        }
      ),
  }),
  priceHigh: yup.mixed().when("isRange", {
    is: true,
    then: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Invalid price"),
  }),
  image: yup.string().strict(true).required("Invalid image url or image file"),
  link: yup.string().strict(true).required("Required").max(255, "Too long"),
});

export const VariantAddSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  product: yup.object().shape({
    id: yup
      .number()
      .required("Required")
      .integer("Must be integer")
      .min(0, "Must be non-negative"),
    variantImage: yup
      .string()
      .strict(true)
      .required("Invalid image url or image file"),
    variantTag: yup.string().strict(true).required().max(255, "Too long"),
  }),
});

export const VariantDeleteSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  product: yup.object().shape({
    id: yup
      .number()
      .required("Required")
      .integer("Must be integer")
      .min(0, "Must be non-negative"),
    variantIndex: yup
      .number()
      .required("Required")
      .integer("Must be integer")
      .min(0, "Must be non-negative"),
  }),
});

export const VariantUpdateSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  product: yup.object().shape({
    id: yup
      .number()
      .required("Required")
      .integer("Must be integer")
      .min(0, "Must be non-negative"),
    variantIndex: yup
      .number()
      .required("Required")
      .integer("Must be integer")
      .min(0, "Must be non-negative"),
    variantImage: yup
      .string()
      .strict(true)
      .required("Invalid image url or image file"),
    variantTag: yup.string().strict(true).required().max(255, "Too long"),
  }),
});

const departmentMappingSchema = yup
  .array()
  .max(50, "Too many mappings")
  .optional()
  .of(
    yup.object().shape({
      key: yup.string().strict(true).required(),
      departments: yup
        .array()
        .required()
        .of(
          yup
            .string()
            .strict(true)
            .required("Required")
            .min(1, "Cannot be empty string")
        )
        .length(1, "Cannot be empty array"),
    })
  );

export const VariantFormSchema = yup.object().shape({
  variantTag: yup.string().strict(true).required().max(255, "Too long"),
  image: yup.string().strict(true).required("Invalid image url or image file"),
});

export const EtsyUpdateUploadSettingsSchema = yup.object().shape({
  includeTags: CommaListValidator,
  excludeTags: CommaListValidator,
});

export const ShopifyUpdateUploadSettingsSchema = yup.object().shape({
  includeTags: CommaListValidator,
  excludeTags: CommaListValidator,
  departmentMapping: departmentMappingSchema,
});

export const SquareUpdateUploadSettingsSchema = yup.object().shape({
  includeTags: CommaListValidator,
  excludeTags: CommaListValidator,
  departmentMapping: departmentMappingSchema,
});

export const UpdateUploadSettingsSchema = yup.object().shape({
  id: yup
    .number()
    .required("Required")
    .integer("Must be integer")
    .min(0, "Must be non-negative"),
  etsy: yup.object().optional().shape({
    includeTags: StringArrayValidator.optional(),
    excludeTags: StringArrayValidator.optional(),
  }),
  shopify: yup.object().optional().shape({
    includeTags: StringArrayValidator.optional(),
    excludeTags: StringArrayValidator.optional(),
    departmentMapping: departmentMappingSchema.optional(),
  }),
  square: yup.object().optional().shape({
    includeTags: StringArrayValidator.optional(),
    excludeTags: StringArrayValidator.optional(),
    departmentMapping: departmentMappingSchema.optional(),
  }),
});

export const UploadSquareProductsSchema = yup.object().shape({
  csv: yup
    .string()
    .strict(true)
    .max(1000000, "File too large")
    .required("Required"),
});

export const SignInSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email")
    .required("Required")
    .max(255, "Too long"),
  password: yup
    .string()
    .strict(true)
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long"),
});

export const MonetizationMethodSchemas = {
  click: yup.object().shape({
    isMobile: yup.boolean().strict().required("Required"),
    objectId: yup.string().required("Required").max(255, "Too long"),
  }),
  view: yup.object().shape({
    isMobile: yup.boolean().strict().required("Required"),
    objectId: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\d+_\d+$/g, "Invalid object id"),
    offsetTop: yup
      .number()
      .required("Required")
      .integer("Must be integer")
      .min(0, "Must be non-negative"),
  }),
};
