import { Formik, FormikConfig } from "formik";

import LocalityLogo from "components/common/images/LocalityLogo";
import { BusinessSignUpSchema } from "common/ValidationSchema";
import Stack from "components/common/Stack";
import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
  Label,
  SubmitButton,
} from "components/common/form";

import type { FC } from "react";

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessHomepage: string;
}

export interface SignupBusinessProps {
  error: string;
  sent: boolean;
  onSubmit: FormikConfig<SignUpRequest>["onSubmit"];
}

const SignupBusiness: FC<SignupBusinessProps> = ({ error, sent, onSubmit }) => {
  if (sent) {
    return (
      <Stack direction="row" columnAlign="center" style={{ margin: 24 }}>
        <Stack
          direction="column"
          rowAlign="center"
          style={{ display: "block" }}
        >
          <Stack direction="row" columnAlign="center">
            <LocalityLogo width={200} />
          </Stack>
          <Stack direction="row" columnAlign="center">
            <h5>
              Thanks for reaching out! We'll be in touch as soon as possible.
            </h5>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="row" columnAlign="center" style={{ margin: 24 }}>
      <Stack direction="column" rowAlign="center" style={{ display: "block" }}>
        <Stack direction="row" columnAlign="center">
          <LocalityLogo width={200} />
        </Stack>
        <Stack direction="row" columnAlign="center">
          <h5>
            Fill out the form below and we'll be in touch as soon as possible.
          </h5>
        </Stack>
        <Formik
          initialValues={
            {
              firstName: "",
              lastName: "",
              email: "",
              phoneNumber: "",
              businessName: "",
              businessHomepage: "",
            } as SignUpRequest
          }
          onSubmit={onSubmit}
          validationSchema={BusinessSignUpSchema}
        >
          {({
            isSubmitting,
            values,
            handleBlur,
            handleChange,
            handleSubmit,
          }): JSX.Element => (
            <form onSubmit={handleSubmit}>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
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
              </Stack>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
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
                  <Label>Phone Number</Label>
                  <InputGroup>
                    <Input
                      aria-label="Phone number"
                      aria-details="Enter phone number here"
                      id="phoneNumber"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      type="text"
                      value={values.phoneNumber}
                    />
                  </InputGroup>
                  <ErrorMessage name="phoneNumber" />
                </FormGroup>
              </Stack>
              <FormGroup>
                <Label required>Business Name</Label>
                <InputGroup>
                  <Input
                    aria-required
                    aria-label="Business Name"
                    aria-details="Enter business name here"
                    id="businessName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    type="text"
                    value={values.businessName}
                  />
                </InputGroup>
                <ErrorMessage name="businessName" />
              </FormGroup>
              <FormGroup>
                <Label required>Business Website</Label>
                <InputGroup>
                  <Input
                    aria-required
                    aria-label="Business Homepage"
                    aria-details="Enter business homepage here"
                    id="businessHomepage"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter business homepage"
                    type="text"
                    value={values.businessHomepage}
                  />
                </InputGroup>
                <ErrorMessage name="businessHomepage" />
              </FormGroup>
              <div
                color="red"
                style={{
                  textAlign: "right",
                }}
              >
                {error}
              </div>
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

export default SignupBusiness;
