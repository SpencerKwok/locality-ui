import React, { useState } from "react";
import Cookie from "js-cookie";
import { Formik, FormikConfig, Form } from "formik";
import { Button, FormGroup, TextField } from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";

import LoginDAO from "./LoginDAO";

interface User {
  usernameField: string;
  passwordField: string;
}

export interface LoginProps extends RouteComponentProps {}

function Login(props: LoginProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit: FormikConfig<User>["onSubmit"] = async (values) => {
    try {
      LoginDAO.getInstance()
        .login(values)
        .then((response) => {
          setErrorMessage(response.message);
        });
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to make login attempt");
    }
  };

  // Redirect to home page if logged in successfully
  const firstName = Cookie.get("firstName");
  const lastName = Cookie.get("lastName");
  if (firstName && lastName) {
    props.history.push("/");
  }

  return (
    <div>
      <Formik
        initialValues={{
          usernameField: "",
          passwordField: "",
        }}
        onSubmit={onSubmit}
      >
        {({ values, handleSubmit, handleChange, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <TextField
                id="usernameField"
                label="Username"
                value={values.usernameField}
                onChange={handleChange}
              />
              <TextField
                id="passwordField"
                label="Password"
                type="password"
                value={values.passwordField}
                onChange={handleChange}
              />
            </FormGroup>
            <Button
              style={{ marginTop: "8px" }}
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              Send
            </Button>
            <p>{errorMessage}</p>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default withRouter(Login);
