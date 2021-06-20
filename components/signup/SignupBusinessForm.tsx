export { BusinessSignUpSchema } from "../../common/ValidationSchema";

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  address: string;
  city: string;
  province: string;
  country: string;
  password1: string;
  password2: string;
}
