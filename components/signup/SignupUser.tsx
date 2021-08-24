import { Formik, FormikConfig } from "formik";

import LocalityLogo from "components/common/images/LocalityLogo";
import Stack from "components/common/Stack";
import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
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
  subscribe: boolean;
}

export interface SignInProps {
  error: string;
  onSubmit: FormikConfig<SignUpRequest>["onSubmit"];
}

const Customer: FC<SignInProps> = ({ error, onSubmit }) => {
  return (
    <Stack direction="row" columnAlign="center" style={{ margin: 24 }}>
      <Stack direction="column" rowAlign="center" style={{ width: 300 }}>
        <Stack direction="row" columnAlign="center">
          <LocalityLogo width={200} />
        </Stack>
        <Stack direction="row" columnAlign="center">
          <h5>Start supporting local businesses today!</h5>
        </Stack>
        <Formik
          initialValues={
            {
              firstName: "",
              lastName: "",
              email: "",
              password1: "",
              password2: "",
              subscribe: true,
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
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="First Name"
                    aria-details="Enter first name here"
                    id="firstName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="First Name"
                    type="text"
                    value={values.firstName}
                  />
                </InputGroup>
                <ErrorMessage name="firstName" />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="Last Name"
                    aria-details="Enter last name here"
                    id="lastName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Last Name"
                    type="text"
                    value={values.lastName}
                  />
                </InputGroup>
                <ErrorMessage name="lastName" />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="Email"
                    aria-details="Enter email here"
                    id="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Email"
                    type="email"
                    value={values.email}
                  />
                </InputGroup>
                <ErrorMessage name="email" />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="Password"
                    aria-details="Enter password here"
                    id="password1"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Password"
                    type="password"
                    value={values.password1}
                  />
                </InputGroup>
                <ErrorMessage name="password1" />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="Re-enter Password"
                    aria-details="Re-enter password here"
                    id="password2"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Re-enter Password"
                    type="password"
                    value={values.password2}
                  />
                </InputGroup>
                <ErrorMessage name="password2" />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Stack direction="row" rowAlign="center" spacing={24}>
                    <Input
                      defaultChecked
                      aria-label="Occassional marketing email checkbox"
                      aria-details="Checkbox to opt in to occassional marketing emails"
                      id="subscribe"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="checkbox"
                      value={values.subscribe ? "true" : "false"}
                    />
                    <p style={{ fontSize: 12 }}>
                      I'd like to receive occasional marketing emails from
                      Locality.
                    </p>
                  </Stack>
                </InputGroup>
                <ErrorMessage name="subscribe" />
              </FormGroup>
              <div className={styles.error}>{error}</div>
              <Stack direction="row-reverse" priority={[1]}>
                <SubmitButton
                  text="Get Started"
                  submittingText="Getting started..."
                  isSubmitting={isSubmitting}
                  style={{ width: "100%" }}
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
