import * as yup from "yup";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import { Formik, FormikConfig } from "formik";

import FacebookLogo from "../../components/common/images/FacebookLogo";
import GoogleLogo from "../../components/common/images/GoogleLogo";
import LocalityLogo from "../../components/common/images/LocalityLogo";
import Stack from "../../components/common/Stack";
import {
  SubmitButton,
  ErrorMessage,
  InputGroup,
  Label,
} from "../../components/common/form";
import styles from "./Signin.module.css";

const SignInSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email")
    .required("Required")
    .max(255, "Too long"),
  password: yup.string().required("Required").max(255, "Too long"),
});

export interface SignInProps {
  onProviderSignIn: (provider: string) => void;
  onSubmit: FormikConfig<SignInRequest>["onSubmit"];
  error: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export default function SignIn({
  error,
  onProviderSignIn,
  onSubmit,
}: SignInProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ width: 300 }}>
        <LocalityLogo width={200} style={{ padding: "12px 24px 24px 24px" }} />
        <Stack direction="column" rowAlign="center" spacing={16}>
          <button
            className={styles["signin"]}
            onClick={() => {
              onProviderSignIn("google");
            }}
          >
            <GoogleLogo />
            <span>Sign in with Google</span>
          </button>
          <button
            className={styles["signin"]}
            onClick={() => {
              onProviderSignIn("facebook");
            }}
          >
            <FacebookLogo />
            <span>Sign in with Facebook</span>
          </button>
          <Formik
            initialValues={
              {
                email: "",
                password: "",
              } as SignInRequest
            }
            onSubmit={onSubmit}
            validationSchema={SignInSchema}
          >
            {({
              isSubmitting,
              values,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Label required>Email</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Email"
                      aria-details="Enter email here"
                      id="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="email"
                      value={values.email}
                    />
                  </InputGroup>
                  <ErrorMessage name="email" />
                </Form.Group>
                <Form.Group>
                  <Label required>Password</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Password"
                      aria-details="Enter password here"
                      id="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.password}
                    />
                  </InputGroup>
                  <ErrorMessage name="password" />
                </Form.Group>
                <div className={styles.error}>{error}</div>
                <Stack direction="row-reverse">
                  <SubmitButton
                    text="Sign in"
                    submittingText="Signing in..."
                    isSubmitting={isSubmitting}
                  />
                </Stack>
              </Form>
            )}
          </Formik>
        </Stack>
      </Stack>
    </Stack>
  );
}
