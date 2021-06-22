import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import {
  SubmitButton,
  ErrorMessage,
  InputGroup,
  Label,
} from "components/common/form";
import { ContactSchema } from "common/ValidationSchema";
import Stack from "components/common/Stack";

import type { FC } from "react";

export interface ContactRequest {
  email: string;
  name: string;
  message: string;
}

export interface ContactProps {
  error: string;
  success: boolean;
  width: number;
  onSubmit: FormikConfig<ContactRequest>["onSubmit"];
}

const Contact: FC<ContactProps> = ({ error, success, width, onSubmit }) => {
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

        {success && (
          <p>
            Thanks for reaching out! You should receive a confirmation email.
          </p>
        )}
        {!success && (
          <Formik
            initialValues={
              {
                email: "",
                name: "",
                message: "",
              } as ContactRequest
            }
            onSubmit={onSubmit}
            validationSchema={ContactSchema}
          >
            {({
              isSubmitting,
              values,
              handleBlur,
              handleChange,
              handleSubmit,
            }): JSX.Element => (
              <Form
                onSubmit={handleSubmit}
                style={{ width: 600, maxWidth: width }}
              >
                <Form.Group>
                  <Label required>Name</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Name"
                      aria-details="Enter name here"
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
                  <Label required>Email</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Email"
                      aria-details="Enter email here"
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
                      aria-required
                      aria-label="Message"
                      aria-details="Enter message here"
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
                  <SubmitButton
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
                  {error}
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Stack>
    </Stack>
  );
};

export default Contact;
