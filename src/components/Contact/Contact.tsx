import React, { useState } from "react";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import ContactDAO from "./ContactDAO";
import LocalityForm from "../../common/components/Form";
import Stack from "../../common/components/Stack/Stack";

export interface ContactProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

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

function Contact(props: ContactProps) {
  const [contactStatus, setContactStatus] = useState({
    error: null as string | null,
    success: false,
  });

  const onSubmit: FormikConfig<FormRequest>["onSubmit"] = async (values) => {
    await ContactDAO.getInstance()
      .contact({
        email: values.email,
        name: values.name,
        message: values.message,
      })
      .then(({ error }) => {
        if (error) {
          setContactStatus({ error: error.message, success: false });
          return;
        }
        setContactStatus({ error: null, success: true });
      })
      .catch((error) => {
        setContactStatus({ error: error.message, success: false });
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

          {contactStatus.success ? (
            <p>Thanks! You should receive a confirmation email</p>
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
                <Form onSubmit={handleSubmit}>
                  <Form.Group>
                    <LocalityForm.Label required>Name</LocalityForm.Label>
                    <LocalityForm.InputGroup size="lg">
                      <FormControl
                        aria-label="Name"
                        aria-details="Enter name here"
                        id="name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter name"
                        type="text"
                        value={values.name}
                      />
                    </LocalityForm.InputGroup>
                    <LocalityForm.ErrorMessage name="name" />
                  </Form.Group>
                  <Form.Group>
                    <LocalityForm.Label required>
                      Email Address
                    </LocalityForm.Label>
                    <LocalityForm.InputGroup size="lg">
                      <FormControl
                        aria-label="Email Address"
                        aria-details="Enter email here"
                        id="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter email"
                        type="email"
                        value={values.email}
                      />
                    </LocalityForm.InputGroup>
                    <LocalityForm.ErrorMessage name="email" />
                  </Form.Group>
                  <Form.Group>
                    <LocalityForm.Label required>Message</LocalityForm.Label>
                    <LocalityForm.InputGroup size="lg">
                      <FormControl
                        as="textarea"
                        aria-label="Message"
                        aria-details="Enter message here"
                        id="message"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter message"
                        type="text"
                        value={values.message}
                      />
                    </LocalityForm.InputGroup>
                    <LocalityForm.CharacterLimit
                      message={values.message}
                      maxCharacters={500}
                    />
                    <LocalityForm.ErrorMessage name="message" />
                  </Form.Group>
                  <Stack direction="row-reverse">
                    <LocalityForm.Button
                      isSubmitting={isSubmitting}
                      text="Send"
                      submittingText="Sending..."
                    />
                  </Stack>
                  {contactStatus.error && (
                    <div
                      color="red"
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {contactStatus.error}
                    </div>
                  )}
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
