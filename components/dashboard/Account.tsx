import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import {
  InputGroup,
  Label,
  SubmitButton,
  ErrorMessage,
} from "components/common/form";
import { PasswordUpdateSchema } from "common/ValidationSchema";
import Stack from "components/common/Stack";
import styles from "components/dashboard/Account.module.css";

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword1: string;
  newPassword2: string;
}

export interface AccountProps {
  error: string;
  updatedPassword: boolean;
  firstName: string;
  lastName: string;
  onSubmitPassword: FormikConfig<PasswordUpdateRequest>["onSubmit"];
}

export default function Account({
  error,
  firstName,
  lastName,
  updatedPassword,
  onSubmitPassword,
}: AccountProps) {
  return (
    <Stack direction="column" rowAlign="flex-start" spacing={16}>
      <div>
        <div className={styles.label}>Name</div>
        <div className={styles.value}>{`${firstName} ${lastName}`}</div>
      </div>
      <Stack direction="column" rowAlign="flex-start">
        <div className={styles.label}>Change Password</div>
        <Formik
          initialValues={
            {
              currentPassword: "",
              newPassword1: "",
              newPassword2: "",
            } as PasswordUpdateRequest
          }
          onSubmit={onSubmitPassword}
          validationSchema={PasswordUpdateSchema}
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
                <Label required>Current password</Label>
                <InputGroup>
                  <FormControl
                    aria-required
                    aria-label="Current password"
                    aria-details="Enter current password here"
                    id="currentPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="password"
                    value={values.currentPassword}
                  />
                </InputGroup>
                <ErrorMessage name="currentPassword" />
              </Form.Group>
              <Form.Group>
                <Label required>New password</Label>
                <InputGroup>
                  <FormControl
                    aria-required
                    aria-label="New password"
                    aria-details="Enter new password here"
                    id="newPassword1"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="password"
                    value={values.newPassword1}
                  />
                </InputGroup>
                <ErrorMessage name="newPassword1" />
              </Form.Group>
              <Form.Group>
                <Label required>Re-enter new password</Label>
                <InputGroup>
                  <FormControl
                    aria-required
                    aria-label="Re-enter new password"
                    aria-details="Re-enter new password here"
                    id="newPassword2"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="password"
                    value={values.newPassword2}
                  />
                </InputGroup>
                <ErrorMessage name="newPassword2" />
              </Form.Group>
              <div style={{ color: "red" }}>{error}</div>
              {updatedPassword && (
                <div style={{ color: "green" }}>
                  Successfully updated password!
                </div>
              )}
              <Stack direction="row-reverse">
                <SubmitButton
                  text="Update"
                  submittingText="Updating..."
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
