import React, { useState } from "react";
import Cookie from "js-cookie";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import XSS from "xss";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";
import { IoLogoFacebook } from "react-icons/io";

import SignInDAO from "./SignInDAO";
import { ReactComponent as LocalityLogo } from "./locality-logo.svg";
import Stack from "../../common/components/Stack/Stack";
import {
  FormInputGroup,
  FormLabel,
  FormButton,
  createFormErrorMessage,
} from "../../common/components/Form/Form";
import { Redirect } from "react-router";
const { REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_FACEBOOK_APP_ID } = process.env;
import "./SignIn.css";

export interface SignInProps extends React.HTMLProps<HTMLElement> {}

interface SignInRequest {
  username: string;
  password: string;
}

const SignInSchema = yup.object().shape({
  username: yup.string().required("Required").max(255, "Too long"),
  password: yup.string().required("Required").max(255, "Too long"),
});

function SignIn(props: SignInProps) {
  const [error, setError] = useState("");
  const companyId = Cookie.get("companyId");
  const username = Cookie.get("username");
  if (companyId) {
    window.location.href = "/dashboard";
    return <Redirect to="/dashboard" />;
  } else if (username) {
    window.location.href = "/";
    return <Redirect to="/" />;
  }

  const onSubmit: FormikConfig<SignInRequest>["onSubmit"] = async (values) => {
    await SignInDAO.getInstance()
      .signin({
        username: XSS(values.username),
        password: values.password,
      })
      .then(({ error, redirectTo }) => {
        if (error) {
          setError(error.message);
        } else if (redirectTo) {
          window.location.href = redirectTo;
        }
      })
      .catch((err) => setError(err.message));
  };

  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" spacing={-24}>
        <header
          style={{
            width: props.width,
            maxWidth: 500,
            margin: "auto",
            overflow: "hidden",
          }}
        >
          <LocalityLogo />
        </header>
        <main style={{ width: 300 }}>
          <div style={{ marginBottom: 24 }} id={"facebook-sign-in-container"}>
            <FacebookLogin
              appId={REACT_APP_FACEBOOK_APP_ID || ""}
              fields="name,email"
              scope="public_profile"
              callback={async (response) => {
                if ("accessToken" in response) {
                  await SignInDAO.getInstance()
                    .signinFacebook({
                      username: XSS(response.id || ""),
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
              cssClass={"facebook-sign-in"}
              textButton={"Sign in with Facebook"}
              icon={<IoLogoFacebook />}
            />
          </div>
          <GoogleLogin
            buttonText="Sign in with Google"
            className="google-sign-in"
            clientId={REACT_APP_GOOGLE_CLIENT_ID || ""}
            cookiePolicy={"single_host_origin"}
            onSuccess={async (response) => {
              if ("accessToken" in response) {
                await SignInDAO.getInstance()
                  .signinGoogle({
                    username: XSS(response.profileObj.email),
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
                setError("Failed to sign in with Google");
              }
            }}
            onFailure={() => {
              setError("Failed to sign in with Google");
            }}
          />
          <Formik
            initialValues={
              {
                username: "",
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
                  <FormLabel required>Email</FormLabel>
                  <FormInputGroup size="lg" width="100%">
                    <FormControl
                      aria-label="Large"
                      id="username"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="email"
                      value={values.username}
                    />
                  </FormInputGroup>
                  {createFormErrorMessage("username")}
                </Form.Group>
                <Form.Group>
                  <FormLabel required>Password</FormLabel>
                  <FormInputGroup size="lg" width="100%">
                    <FormControl
                      aria-label="Large"
                      id="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.password}
                    />
                  </FormInputGroup>
                  {createFormErrorMessage("password")}
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
                        Signing in...
                      </React.Fragment>
                    ) : (
                      <React.Fragment>Sign in</React.Fragment>
                    )}
                  </FormButton>
                </Stack>
              </Form>
            )}
          </Formik>
        </main>
      </Stack>
    </Stack>
  );
}

export default SignIn;
