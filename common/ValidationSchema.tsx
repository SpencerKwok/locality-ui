import * as yup from "yup";

export const ContactSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  name: yup.string().required("Required").max(255, "Too long"),
  message: yup.string().required("Required").max(500, "Too long"),
});

export const UserSignUpSchema = yup.object().shape({
  firstName: yup.string().required("Required").max(255, "Too long"),
  lastName: yup.string().required("Required").max(255, "Too long"),
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
});

export const BusinessSignUpSchema = yup.object().shape({
  firstName: yup.string().required("Required").max(255, "Too long"),
  lastName: yup.string().required("Required").max(255, "Too long"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  businessName: yup.string().required("Required").max(255, "Too long"),
  address: yup.string().required("Required").max(255, "Too long"),
  city: yup.string().required("Required").max(255, "Too long"),
  province: yup.string().required("Required").max(255, "Too long"),
  country: yup.string().required("Required").max(255, "Too long"),
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
    .oneOf([yup.ref("password1")], "New passwords do not match"),
});

export const DepartmentsUpdateSchema = yup.object().shape({
  departments: yup.array().of(yup.string().required()).optional(),
});

export const HomepagesUpdateSchema = yup.object().shape({
  homepage: yup.string().required("Required").max(255, "Too long"),
  etsyHomepage: yup
    .string()
    .optional()
    .test(
      "EtsyFormat",
      "Must have the following format: etsy.com/shop/[SHOP_ID]",
      (page) => {
        return (!page ||
          page.length === 0 ||
          page.match(
            /^(http(s?):\/\/)?(www\.)?etsy\.com\/([^\/]+\/)*shop\/[a-zA-Z0-9_\-]+(\/?)$/g
          )) as boolean;
      }
    )
    .max(255, "Too long"),
  shopifyHomepage: yup.string().optional().max(255, "Too long"),
  squareHomepage: yup.string().optional().max(255, "Too long"),
});

export const LogoUpdateSchema = yup.object().shape({
  logo: yup.string().required("Invalid image url or image file"),
});

export const PasswordUpdateSchema = yup.object().shape({
  currentPassword: yup.string().required("Required"),
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
