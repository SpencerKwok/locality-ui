import React, { useState } from "react";
import XSS from "xss";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";
import Cookie from "js-cookie";
import { Redirect } from "react-router-dom";

import SignUpDAO from "./SignUpDAO";
import Stack from "../../common/components/Stack/Stack";
import {
  FormInputGroup,
  FormLabel,
  FormButton,
  createFormErrorMessage,
} from "../../common/components/Form/Form";

export interface SignUpProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  address: string;
  city: string;
  province: string;
  country: string;
  password1: string;
  password2: string;
}

const SignUpSchema = yup.object().shape({
  firstName: yup.string().required("Required").max(255, "Too long"),
  lastName: yup.string().required("Required").max(255, "Too long"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  companyName: yup.string().required("Required").max(255, "Too long"),
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

function SignUp(props: SignUpProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const companyId = Cookie.get("companyId");
  if (companyId) {
    return <Redirect to="/dashboard" />;
  }

  const onSubmit: FormikConfig<SignUpRequest>["onSubmit"] = async (values) => {
    console.log(values);
    await SignUpDAO.getInstance()
      .signup({
        ...values,
        password: values.password1,
      })
      .then(({ error }) => {
        if (error) {
          setError(error.message);
        } else {
          setSent(true);
          setError("");
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      });
  };

  return (
    <Stack direction="row" columnAlign="center">
      <Stack
        direction="column"
        rowAlign="center"
        style={{ marginTop: 24, marginBottom: 24 }}
      >
        <header>
          <h1>Sign Up</h1>
        </header>

        <main style={{ width: props.width * 0.5 }}>
          {sent ? (
            <Stack direction="row" columnAlign="center">
              <p>
                Account created! <a href="/signin">Click here</a> to sign in
              </p>
            </Stack>
          ) : (
            <Formik
              initialValues={
                {
                  firstName: "",
                  lastName: "",
                  email: "",
                  companyName: "",
                  address: "",
                  city: "",
                  province: "",
                  country: "",
                } as SignUpRequest
              }
              onSubmit={onSubmit}
              validationSchema={SignUpSchema}
            >
              {({
                isSubmitting,
                values,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Stack direction="row" spacing={12} priority={[1, 1]}>
                    <Form.Group>
                      <FormLabel>First Name</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="firstName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          type="text"
                          value={values.firstName}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("firstName")}
                    </Form.Group>
                    <Form.Group>
                      <FormLabel>Last Name</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="lastName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          type="text"
                          value={values.lastName}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("lastName")}
                    </Form.Group>
                  </Stack>
                  <Stack direction="row" spacing={12} priority={[1, 1]}>
                    <Form.Group>
                      <FormLabel>Email</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="email"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter email"
                          type="email"
                          value={values.email}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("email")}
                    </Form.Group>
                    <Form.Group>
                      <FormLabel>Company Name</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="companyName"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter company name"
                          type="text"
                          value={values.companyName}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("companyName")}
                    </Form.Group>
                  </Stack>
                  <Stack direction="row" spacing={12} priority={[1, 1]}>
                    <Form.Group>
                      <FormLabel>Address</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="address"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter address"
                          type="text"
                          value={values.address}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("address")}
                    </Form.Group>
                    <Form.Group>
                      <FormLabel>City</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="city"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter city"
                          type="text"
                          value={values.city}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("city")}
                    </Form.Group>
                  </Stack>
                  <Stack direction="row" spacing={12} priority={[1, 1]}>
                    <Form.Group>
                      <FormLabel>Province</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="province"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter province"
                          type="text"
                          value={values.province}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("province")}
                    </Form.Group>
                    <Form.Group>
                      <FormLabel>Country</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="country"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter country"
                          type="text"
                          value={values.country}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("country")}
                    </Form.Group>
                  </Stack>
                  <Stack direction="row" spacing={12} priority={[1, 1]}>
                    <Form.Group>
                      <FormLabel>Password</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="password1"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Enter password"
                          type="password"
                          value={values.password1}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("password1")}
                    </Form.Group>
                    <Form.Group>
                      <FormLabel>Re-enter password</FormLabel>
                      <FormInputGroup size="lg">
                        <FormControl
                          aria-label="Large"
                          id="password2"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Re-enter password"
                          type="password"
                          value={values.password2}
                        />
                      </FormInputGroup>
                      {createFormErrorMessage("password2")}
                    </Form.Group>
                  </Stack>
                  <div
                    color="red"
                    style={{
                      textAlign: "right",
                    }}
                  >
                    {error}
                  </div>
                  <Stack direction="row-reverse">
                    <FormButton
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <React.Fragment>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                            style={{ marginBottom: 2, marginRight: 12 }}
                          ></span>
                          Signing up...
                        </React.Fragment>
                      ) : (
                        <React.Fragment>Sign up</React.Fragment>
                      )}
                    </FormButton>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </main>
      </Stack>
    </Stack>
  );
}

export default SignUp;
