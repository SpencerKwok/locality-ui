import { Formik, FormikConfig } from "formik";

import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
  Label,
  SubmitButton,
} from "components/common/form";
import { PasswordUpdateSchema } from "common/ValidationSchema";
import Stack from "components/common/Stack";
import styles from "components/dashboard/Account.module.css";

import type { FC } from "react";

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

const Account: FC<AccountProps> = ({
  error,
  firstName,
  lastName,
  updatedPassword,
  onSubmitPassword,
}) => {
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
          }): JSX.Element => (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label required>Current password</Label>
                <InputGroup>
                  <Input
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
              </FormGroup>
              <FormGroup>
                <Label required>New password</Label>
                <InputGroup>
                  <Input
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
              </FormGroup>
              <FormGroup>
                <Label required>Re-enter new password</Label>
                <InputGroup>
                  <Input
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
              </FormGroup>
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
            </form>
          )}
        </Formik>
      </Stack>
    </Stack>
  );
};

export default Account;
