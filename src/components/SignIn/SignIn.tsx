import React, { useState } from "react";
import Cookie from "js-cookie";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import { IoLogoFacebook } from "react-icons/io";

import SignInDAO from "./SignInDAO";
import { ReactComponent as LocalityLogo } from "./locality-logo.svg";
import Stack from "../../common/components/Stack/Stack";
import LocalityForm from "../../common/components/Form";
import { Redirect } from "react-router";
import "./SignIn.css";

const { REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_FACEBOOK_APP_ID } = process.env;

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
        username: values.username,
        password: values.password,
      })
      .then(({ error, redirectTo }) => {
        if (error) {
          setError(error.message);
          return;
        }
        window.location.href = redirectTo;
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
              scope="email,public_profile"
              callback={async (response) => {
                if ("accessToken" in response) {
                  await SignInDAO.getInstance()
                    .signinFacebook({
                      accesstoken: response.accessToken,
                    })
                    .then(({ error, redirectTo }) => {
                      if (error) {
                        setError(error.message);
                        return;
                      }
                      window.location.href = redirectTo;
                    })
                    .catch((err) => setError(err.message));
                } else {
                  setError("Failed to sign in with Facebook");
                }
              }}
              cssClass={"facebook-sign-in"}
              textButton={"Sign in with Facebook"}
              redirectUri={`https://${window.location.hostname}/api/signin/facebook`}
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
                    accesstoken: response.accessToken,
                  })
                  .then(({ error, redirectTo }) => {
                    if (error) {
                      setError(error.message);
                      return;
                    }
                    window.location.href = redirectTo;
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
                  <LocalityForm.Label required>Email</LocalityForm.Label>
                  <LocalityForm.InputGroup size="lg">
                    <FormControl
                      aria-label="Email"
                      aria-details="Enter email here"
                      id="username"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="email"
                      value={values.username}
                    />
                  </LocalityForm.InputGroup>
                  <LocalityForm.ErrorMessage name="username" />
                </Form.Group>
                <Form.Group>
                  <LocalityForm.Label required>Password</LocalityForm.Label>
                  <LocalityForm.InputGroup size="lg">
                    <FormControl
                      aria-label="Password"
                      aria-details="Enter password here"
                      id="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.password}
                    />
                  </LocalityForm.InputGroup>
                  <LocalityForm.ErrorMessage name="password" />
                </Form.Group>
                {error && (
                  <div style={{ color: "red", marginTop: 12 }}>{error}</div>
                )}
                <Stack direction="row-reverse">
                  <LocalityForm.Button
                    isSubmitting={isSubmitting}
                    text="Sign in"
                    submittingText="Signing in..."
                  />
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
