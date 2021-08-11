import { Formik, FormikConfig } from "formik";
import Link from "next/link";

import FacebookLogo from "components/common/images/FacebookLogo";
import GoogleLogo from "components/common/images/GoogleLogo";
import LocalityLogo from "components/common/images/LocalityLogo";
import Stack from "components/common/Stack";
import ThemeContext from "components/common/Theme";
import { SignInSchema } from "common/ValidationSchema";
import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
  Label,
  SubmitButton,
} from "components/common/form";
import styles from "components/signin/Signin.module.css";

import type { FC } from "react";

export interface SignInProps {
  onProviderSignIn: (provider: string) => void;
  onSubmit: FormikConfig<SignInRequest>["onSubmit"];
  error: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

const SignIn: FC<SignInProps> = ({ error, onProviderSignIn, onSubmit }) => {
  return (
    <ThemeContext.Consumer>
      {(): JSX.Element => (
        <Stack direction="row" columnAlign="center">
          <Stack
            direction="column"
            rowAlign="center"
            style={{ width: 300, paddingBottom: 24 }}
          >
            <LocalityLogo width={200} style={{ padding: 24 }} />
            <Stack direction="column" rowAlign="center" spacing={16}>
              <button
                className={styles["signin"]}
                onClick={(): void => {
                  onProviderSignIn("google");
                }}
              >
                <Stack
                  direction="row"
                  rowAlign="center"
                  columnAlign="center"
                  spacing={12}
                  style={{ width: "100%" }}
                >
                  <GoogleLogo width={20} />
                  <span>Sign in with Google</span>
                </Stack>
              </button>
              <button
                className={styles["signin"]}
                onClick={(): void => {
                  onProviderSignIn("facebook");
                }}
              >
                <Stack
                  direction="row"
                  rowAlign="center"
                  columnAlign="center"
                  spacing={12}
                  style={{ marginLeft: 6, width: "100%" }}
                >
                  <FacebookLogo />
                  <span>Sign in with Facebook</span>
                </Stack>
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
                }): JSX.Element => (
                  <form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label required>Email</Label>
                      <InputGroup>
                        <Input
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
                    </FormGroup>
                    <FormGroup>
                      <Label required>Password</Label>
                      <InputGroup>
                        <Input
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
                    </FormGroup>
                    <Link href="/signup">
                      Don't have an account? Get started here
                    </Link>
                    <div className={styles.error}>{error}</div>
                    <Stack direction="row-reverse">
                      <SubmitButton
                        text="Sign in"
                        submittingText="Signing in..."
                        isSubmitting={isSubmitting}
                      />
                    </Stack>
                  </form>
                )}
              </Formik>
            </Stack>
          </Stack>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default SignIn;
