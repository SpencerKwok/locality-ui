import React, { useState } from "react";
import XSS from "xss";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";

import ContactDAO from "./ContactDAO";
import Stack from "../../common/components/Stack/Stack";
import {
  FormInputGroup,
  FormLabel,
  FormButton,
  createFormErrorMessage,
} from "../../common/components/Form/Form";

export interface ContactProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

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

function Contact(props: ContactProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit: FormikConfig<FormRequest>["onSubmit"] = async (values) => {
    await ContactDAO.getInstance()
      .contactus({
        email: XSS(values.email),
        name: XSS(values.name),
        productTypes: XSS(values.productTypes),
        productNum: parseInt(values.productNum),
        message: XSS(values.message),
      })
      .then((res) => {
        if (res.error) {
          console.log(res.error.message);
          setError(res.error.message);
        } else {
          setSent(true);
        }
      })
      .catch((err) => {
        console.log(err);
        setError(error);
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
          <h1>Contact Us</h1>
        </header>

        <main style={{ width: props.width * 0.5 }}>
          <p
            style={{
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            If you are a small business owner looking to add your products to
            Locality, we are here to help! Fill out the form below and we will
            get in touch as soon as we can.
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
                    <FormLabel>Name</FormLabel>
                    <FormInputGroup size="lg" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter name"
                        type="text"
                        value={values.name}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("name")}
                  </Form.Group>
                  <Form.Group>
                    <FormLabel>Email address</FormLabel>
                    <FormInputGroup size="lg" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter email"
                        type="text"
                        value={values.email}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("email")}
                  </Form.Group>
                  <Form.Group>
                    <FormLabel>What type of products do you sell?</FormLabel>
                    <FormInputGroup size="lg" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="productTypes"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter types"
                        type="text"
                        value={values.productTypes}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("productTypes")}
                  </Form.Group>
                  <Form.Group>
                    <FormLabel>
                      How many products do you want to add to Locality?
                    </FormLabel>
                    <FormInputGroup size="lg" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="productNum"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter number"
                        type="text"
                        value={values.productNum}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("productNum")}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Message (Optional)</Form.Label>
                    <FormInputGroup size="lg" width="100%">
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
                    </FormInputGroup>
                    <div
                      style={{
                        textAlign: "right",
                        color: values.message.length > 500 ? "red" : "black",
                      }}
                    >{`${values.message.length}/500`}</div>
                    {createFormErrorMessage("message")}
                  </Form.Group>
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
                          Submitting...
                        </React.Fragment>
                      ) : (
                        <React.Fragment>Submit</React.Fragment>
                      )}
                    </FormButton>
                  </Stack>
                  <div
                    color="red"
                    style={{
                      textAlign: "right",
                    }}
                  >
                    {error}
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </main>
      </Stack>
    </Stack>
  );
}

export default Contact;
