import React, { useState } from "react";
import XSS from "xss";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";
import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login";
import { IoLogoFacebook } from "react-icons/io";

import CustomerDAO from "./CustomerDAO";
import Stack from "../../../common/components/Stack/Stack";
import {
  FormInputGroup,
  FormLabel,
  FormButton,
  createFormErrorMessage,
} from "../../../common/components/Form/Form";
const { REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_FACEBOOK_APP_ID } = process.env;
import "./Customer.css";

export interface CustomerProps extends React.HTMLProps<HTMLFormElement> {
  width: number;
}

interface SignUpRequest {
  email: string;
  password1: string;
  password2: string;
}

const SignUpSchema = yup.object().shape({
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
    .oneOf([yup.ref("password1")], "New passwords do not match"),
});

function Customer(props: CustomerProps) {
  const [error, setError] = useState("");

  const onSubmit: FormikConfig<SignUpRequest>["onSubmit"] = async (values) => {
    await CustomerDAO.getInstance()
      .signup({
        email: XSS(values.email),
        password: values.password1,
      })
      .then(({ error, redirectTo }) => {
        if (error) {
          setError(error.message);
        } else if (redirectTo) {
          window.location.href = redirectTo;
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 24 }} id={"facebook-sign-up-container"}>
        <FacebookLogin
          appId={REACT_APP_FACEBOOK_APP_ID || ""}
          scope="email,public_profile"
          callback={async (response) => {
            if ("accessToken" in response) {
              await CustomerDAO.getInstance()
                .signupFacebook({
                  accesstoken: XSS(response.accessToken),
                })
                .then(({ error, redirectTo }) => {
                  if (error) {
                    setError(error.message);
                  } else if (redirectTo) {
                    window.location.href = redirectTo;
                  }
                })
                .catch((err) => setError(err.message));
            } else {
              setError("Failed to sign in with Facebook");
            }
          }}
          cssClass={"facebook-sign-up"}
          redirectUri={`https://${window.location.hostname}/api/signup/customer/facebook`}
          textButton={"Sign up with Facebook"}
          icon={<IoLogoFacebook />}
        />
      </div>
      <GoogleLogin
        buttonText="Sign up with Google"
        className="google-sign-up"
        clientId={REACT_APP_GOOGLE_CLIENT_ID || ""}
        cookiePolicy={"single_host_origin"}
        onSuccess={async (response) => {
          if ("accessToken" in response) {
            await CustomerDAO.getInstance()
              .signupGoogle({
                accesstoken: response.accessToken,
              })
              .then(({ error, redirectTo }) => {
                if (error) {
                  setError(error.message);
                } else if (redirectTo) {
                  window.location.href = redirectTo;
                }
              })
              .catch((err) => setError(err.message));
          } else {
            setError("Failed to login with Google");
          }
        }}
        onFailure={(err) => {
          console.log(err);
          setError("Failed to login with Google");
        }}
      />
      <Formik
        initialValues={
          {
            email: "",
            password1: "",
            password2: "",
          } as SignUpRequest
        }
        onSubmit={onSubmit}
        validationSchema={SignUpSchema}
      >
        {({ isSubmitting, values, handleBlur, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <FormLabel required>Email</FormLabel>
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
              <FormLabel required>Password</FormLabel>
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
              <FormLabel required>Re-enter password</FormLabel>
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
            <div style={{ color: "red", marginTop: 12 }}>{error}</div>
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
    </div>
  );
}

export default Customer;
