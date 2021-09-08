import { Formik, FormikConfig } from "formik";

import LocalityLogo from "components/common/images/LocalityLogo";
import { BusinessSignUpSchema } from "common/ValidationSchema";
import Stack from "components/common/Stack";
import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
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
  subscribe: boolean;
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
              subscribe: true,
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
              </Stack>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
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
                      aria-label="Phone Number"
                      aria-details="Enter phone number here"
                      id="phoneNumber"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      type="text"
                      value={values.phoneNumber}
                    />
                  </InputGroup>
                  <ErrorMessage name="phoneNumber" />
                </FormGroup>
              </Stack>
              <FormGroup>
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="Business Name"
                    aria-details="Enter business name here"
                    id="businessName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Business Name"
                    type="text"
                    value={values.businessName}
                  />
                </InputGroup>
                <ErrorMessage name="businessName" />
              </FormGroup>
              <FormGroup>
                <InputGroup>
                  <Input
                    required
                    aria-required
                    aria-label="Business Homepage"
                    aria-details="Enter business homepage here"
                    id="businessHomepage"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Business Homepage"
                    type="text"
                    value={values.businessHomepage}
                  />
                </InputGroup>
                <ErrorMessage name="businessHomepage" />
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
              <div
                color="red"
                style={{
                  textAlign: "right",
                }}
              >
                {error}
              </div>
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

export default SignupBusiness;
