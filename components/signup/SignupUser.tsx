import { Formik, FormikConfig } from "formik";

import LocalityLogo from "components/common/images/LocalityLogo";
import Stack from "components/common/Stack";
import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
  Label,
  SubmitButton,
} from "components/common/form";
import { UserSignUpSchema } from "common/ValidationSchema";
import styles from "./Signup.module.css";

import type { FC } from "react";

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password1: string;
  password2: string;
}

export interface SignInProps {
  error: string;
  onSubmit: FormikConfig<SignUpRequest>["onSubmit"];
}

const Customer: FC<SignInProps> = ({ error, onSubmit }) => {
  return (
    <Stack direction="row" columnAlign="center" style={{ margin: 24 }}>
      <Stack direction="column" rowAlign="center" style={{ width: 300 }}>
        <LocalityLogo width={200} style={{ padding: "12px 24px 24px 24px" }} />
        <Formik
          initialValues={
            {
              firstName: "",
              lastName: "",
              email: "",
              password1: "",
              password2: "",
            } as SignUpRequest
          }
          onSubmit={onSubmit}
          validationSchema={UserSignUpSchema}
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
                <Label required>First Name</Label>
                <InputGroup>
                  <Input
                    aria-required
                    aria-label="First Name"
                    aria-details="Enter first name here"
                    id="firstName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    type="text"
                    value={values.firstName}
                  />
                </InputGroup>
                <ErrorMessage name="firstName" />
              </FormGroup>
              <FormGroup>
                <Label required>Last Name</Label>
                <InputGroup>
                  <Input
                    aria-required
                    aria-label="Last Name"
                    aria-details="Enter last name here"
                    id="lastName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    type="text"
                    value={values.lastName}
                  />
                </InputGroup>
                <ErrorMessage name="lastName" />
              </FormGroup>
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
                    placeholder="Enter email"
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
                    id="password1"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter password"
                    type="password"
                    value={values.password1}
                  />
                </InputGroup>
                <ErrorMessage name="password1" />
              </FormGroup>
              <FormGroup>
                <Label required>Re-enter password</Label>
                <InputGroup>
                  <Input
                    aria-required
                    aria-label="Re-enter Password"
                    aria-details="Re-enter password here"
                    id="password2"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    type="password"
                    value={values.password2}
                  />
                </InputGroup>
                <ErrorMessage name="password2" />
              </FormGroup>
              <div className={styles.error}>{error}</div>
              <Stack direction="row-reverse">
                <SubmitButton
                  text="Sign up"
                  submittingText="Signing up..."
                  isSubmitting={isSubmitting}
                />
              </Stack>
            </form>
          )}
        </Formik>
      </Stack>
    </Stack>
  );
};

export default Customer;
