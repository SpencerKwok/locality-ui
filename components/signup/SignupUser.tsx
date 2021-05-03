import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import LocalityLogo from "../../components/common/images/LocalityLogo";
import Stack from "../common/Stack";
import { SubmitButton, ErrorMessage, InputGroup, Label } from "../common/form";
import styles from "./Signup.module.css";

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

export interface SignUpRequest {
  email: string;
  password1: string;
  password2: string;
}

export interface SignInProps {
  error: string;
  onSubmit: FormikConfig<SignUpRequest>["onSubmit"];
}

export default function Customer({ error, onSubmit }: SignInProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ width: 300 }}>
        <LocalityLogo width={200} style={{ padding: "12px 24px 24px 24px" }} />
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
          {({
            isSubmitting,
            values,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Label required>Email</Label>
                <InputGroup>
                  <FormControl
                    aria-required
                    aria-label="Email"
                    aria-description="Enter email here"
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
                <Label required>Password</Label>
                <InputGroup>
                  <FormControl
                    aria-required
                    aria-label="Password"
                    aria-description="Enter password here"
                    id="password1"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter password"
                    type="password"
                    value={values.password1}
                  />
                </InputGroup>
                <ErrorMessage name="password1" />
              </Form.Group>
              <Form.Group>
                <Label required>Re-enter password</Label>
                <InputGroup>
                  <FormControl
                    aria-required
                    aria-label="Re-enter Password"
                    aria-description="Re-enter password here"
                    id="password2"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    type="password"
                    value={values.password2}
                  />
                </InputGroup>
                <ErrorMessage name="password2" />
              </Form.Group>
              <div className={styles.error}>{error}</div>
              <Stack direction="row-reverse">
                <SubmitButton
                  text="Sign up"
                  submittingText="Signing up..."
                  isSubmitting={isSubmitting}
                />
              </Stack>
            </Form>
          )}
        </Formik>
      </Stack>
    </Stack>
  );
}
