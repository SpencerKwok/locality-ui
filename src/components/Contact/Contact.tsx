import React, { useState } from "react";
import styled from "styled-components";
import { ErrorMessage, Formik, FormikConfig } from "formik";
import { Button, InputGroup, Form, FormControl } from "react-bootstrap";
import XSS from "xss";
import * as yup from "yup";

import ContactDAO from "./ContactDAO";
import Stack from "../Stack/Stack";
import Window from "../../utils/window";

export interface ContactProps extends React.HTMLProps<HTMLDivElement> {}

interface FormRequest {
  email: string;
  name: string;
  productTypes: string;
  productNum: string;
  message: string;
}

const FormSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  name: yup.string().required("Required").max(255, "Too long"),
  productTypes: yup
    .string()
    .required("Required")
    .matches(/[a-zA-Z0-9,]+/g, "Alphanumeric and comma characters only")
    .max(255, "Too long"),
  productNum: yup
    .string()
    .required("Required")
    .matches(/^[1-9][0-9]*$/g, "Must be a positive integer")
    .max(255, "Too long"),
  message: yup.string().optional().max(500, "Too long"),
});

const StyledInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  width: ${({ width }) => width}px;
`;

const StyledFormLabel = styled(Form.Label)`
  &:after {
    content: " *";
    color: red;
  }
`;

const StyledButton = styled(Button)`
  padding: 11px;
  background-color: #449ed7;
  border-color: #449ed7;
  &:link {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }
  &:visited {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }
  &:focus {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }
  &:hover {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

const createStyledErrorMessage = (name: string) => {
  return (
    <div style={{ color: "red" }}>
      <ErrorMessage name={name} />
    </div>
  );
};

function Contact(props: ContactProps) {
  const windowSize = Window();
  const [sent, setSent] = useState(false);

  const onSubmit: FormikConfig<FormRequest>["onSubmit"] = async (values) => {
    await ContactDAO.getInstance()
      .mail({
        email: XSS(values.email),
        name: XSS(values.name),
        productTypes: XSS(values.productTypes),
        productNum: parseInt(values.productNum),
        message: XSS(values.message),
      })
      .then(() => setSent(true))
      .catch((err) => console.log(err));
  };

  return (
    <Stack direction="horizontal" columnAlign="center">
      <Stack
        direction="vertical"
        rowAlign="center"
        style={{ marginTop: "24px", marginBottom: "24px" }}
      >
        <h1>Contact Us</h1>

        <p
          style={{
            width: windowSize.width * 0.5,
            minWidth: "350px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          If you are a small business owner looking to add your products to
          Locality, we are here to help! Fill out the form below and we will get
          in touch as soon as we can.
        </p>

        {sent ? (
          <p>Thanks! You should receive a confirmation email</p>
        ) : (
          <Formik
            initialValues={
              {
                email: "",
                name: "",
                productTypes: "",
                productNum: "",
                message: "",
              } as FormRequest
            }
            onSubmit={onSubmit}
            validationSchema={FormSchema}
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
                  <StyledFormLabel>Name</StyledFormLabel>
                  <StyledInputGroup size="lg" width={windowSize.width * 0.5}>
                    <FormControl
                      aria-label="Large"
                      id="name"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter name"
                      type="text"
                      value={values.name}
                    />
                  </StyledInputGroup>
                  {createStyledErrorMessage("name")}
                </Form.Group>
                <Form.Group>
                  <StyledFormLabel>Email address</StyledFormLabel>
                  <StyledInputGroup size="lg" width={windowSize.width * 0.5}>
                    <FormControl
                      aria-label="Large"
                      id="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter email"
                      type="text"
                      value={values.email}
                    />
                  </StyledInputGroup>
                  {createStyledErrorMessage("email")}
                </Form.Group>
                <Form.Group>
                  <StyledFormLabel>
                    What type of products do you sell?
                  </StyledFormLabel>
                  <StyledInputGroup size="lg" width={windowSize.width * 0.5}>
                    <FormControl
                      aria-label="Large"
                      id="productTypes"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter types"
                      type="text"
                      value={values.productTypes}
                    />
                  </StyledInputGroup>
                  {createStyledErrorMessage("productTypes")}
                </Form.Group>
                <Form.Group>
                  <StyledFormLabel>
                    How many products do you want to add to Locality?
                  </StyledFormLabel>
                  <StyledInputGroup size="lg" width={windowSize.width * 0.5}>
                    <FormControl
                      aria-label="Large"
                      id="productNum"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter number"
                      type="text"
                      value={values.productNum}
                    />
                  </StyledInputGroup>
                  {createStyledErrorMessage("productNum")}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Message (Optional)</Form.Label>
                  <StyledInputGroup size="lg" width={windowSize.width * 0.5}>
                    <FormControl
                      as="textarea"
                      aria-label="Large"
                      id="message"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter message"
                      type="text"
                      value={values.message}
                    />
                  </StyledInputGroup>
                  <div
                    style={{
                      textAlign: "right",
                      color: values.message.length > 500 ? "red" : "black",
                    }}
                  >{`${values.message.length}/500`}</div>
                  {createStyledErrorMessage("message")}
                </Form.Group>
                <StyledButton
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
                        style={{ marginBottom: "2px", marginRight: "12px" }}
                      ></span>
                      Submitting...
                    </React.Fragment>
                  ) : (
                    <React.Fragment>Submit</React.Fragment>
                  )}
                </StyledButton>
              </Form>
            )}
          </Formik>
        )}
      </Stack>
    </Stack>
  );
}

export default Contact;
