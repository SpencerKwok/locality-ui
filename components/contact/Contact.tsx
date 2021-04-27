import React, { useState } from "react";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import { Button, ErrorMessage, InputGroup, Label } from "../common/form";
import { PostRpcClient } from "../common/RpcClient";
import Stack from "../common/Stack";
import { useWindowSize } from "../../lib/common";

interface FormRequest {
  email: string;
  name: string;
  message: string;
}

const FormSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  name: yup.string().required("Required").max(255, "Too long"),
  message: yup.string().required("Required").max(500, "Too long"),
});

export default function Contact() {
  const [contactStatus, setContactStatus] = useState({
    error: null as string | null,
    success: false,
  });

  const size = useWindowSize();
  if (!size.width) {
    return <div></div>;
  }

  const onSubmit: FormikConfig<FormRequest>["onSubmit"] = async (values) => {
    await PostRpcClient.getInstance()
      .call("Contact", {
        email: values.email,
        name: values.name,
        message: values.message,
      })
      .then(({ error }) => {
        if (error) {
          setContactStatus({ error, success: false });
          return;
        }
        setContactStatus({ error: null, success: true });
      })
      .catch((error) => {
        setContactStatus({ error: error.message, success: false });
      });
  };

  const width = size.width * 0.9;
  return (
    <Stack direction="row" columnAlign="center">
      <Stack
        direction="column"
        rowAlign="center"
        style={{ marginBottom: 24, width: 600, maxWidth: width }}
      >
        <h1>Contact Us</h1>
        <p>
          If you are a small business owner looking to add your products to
          Locality, we are here to help! Fill out the form below and we will get
          in touch as soon as we can.
        </p>

        {contactStatus.success ? (
          <p>
            Thanks for reaching out! You should receive a confirmation email.
          </p>
        ) : (
          <Formik
            initialValues={
              {
                email: "",
                name: "",
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
              <Form
                onSubmit={handleSubmit}
                style={{ width: 600, maxWidth: width }}
              >
                <Form.Group>
                  <Label required>Name</Label>
                  <InputGroup>
                    <FormControl
                      aria-label="Large"
                      id="name"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter name"
                      type="text"
                      value={values.name}
                    />
                  </InputGroup>
                  <ErrorMessage name="name" />
                </Form.Group>
                <Form.Group>
                  <Label required>Email address</Label>
                  <InputGroup>
                    <FormControl
                      aria-label="Large"
                      id="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter email"
                      type="email"
                      value={values.email}
                    />
                  </InputGroup>
                  <ErrorMessage name="email" />
                </Form.Group>
                <Form.Group>
                  <Label required>Message</Label>
                  <InputGroup>
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
                  </InputGroup>
                  <div
                    style={{
                      textAlign: "right",
                      color: values.message.length > 500 ? "red" : "black",
                    }}
                  >{`${values.message.length}/500`}</div>
                  <ErrorMessage name="message" />
                </Form.Group>
                <Stack direction="row-reverse">
                  <Button
                    isSubmitting={isSubmitting}
                    text="Send"
                    submittingText="Sending..."
                  />
                </Stack>
                <div
                  color="red"
                  style={{
                    textAlign: "right",
                  }}
                >
                  {contactStatus.error}
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Stack>
    </Stack>
  );
}
