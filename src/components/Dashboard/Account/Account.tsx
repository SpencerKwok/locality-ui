import React, { useState } from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import { Redirect } from "react-router-dom";

import AccountDAO from "./AccountDAO";
import Stack from "../../../common/components/Stack/Stack";
import LocalityForm from "../../../common/components/Form";

export interface AccountProps extends React.HTMLProps<HTMLDivElement> {}

const FieldLabel = styled.div`
  font-size: 32px;
`;

const FieldValue = styled.div`
  font-size: 24px;
`;

interface UpdatePasswordForm {
  currentPassword: string;
  newPassword1: string;
  newPassword2: string;
}

const UpdatePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required("Required"),
  newPassword1: yup
    .string()
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long"),
  newPassword2: yup
    .string()
    .required("Required")
    .min(8, "Too short")
    .max(255, "Too long")
    .oneOf([yup.ref("newPassword1")], "New passwords do not match"),
});

function Account(props: AccountProps) {
  const firstName = Cookie.get("firstName");
  const lastName = Cookie.get("lastName");
  const [updatePasswordStatus, setUpdatePasswordStatus] = useState({
    error: "",
    success: false,
  });

  if (!firstName || !lastName) {
    return <Redirect to="/signin" />;
  }

  const onSubmitPassword: FormikConfig<UpdatePasswordForm>["onSubmit"] = async (
    values
  ) => {
    await AccountDAO.getInstance()
      .passwordUpdate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword1,
      })
      .then(({ error }) => {
        if (error) {
          setUpdatePasswordStatus({ error: error.message, success: false });
          return;
        }
        setUpdatePasswordStatus({ error: "", success: true });
      })
      .catch((error) => {
        setUpdatePasswordStatus({ error: error.message, success: false });
      });
  };

  return (
    <Stack direction="row" columnAlign="flex-start" style={{ marginTop: 12 }}>
      <Stack direction="column" rowAlign="flex-start" spacing={32}>
        <Stack direction="row" columnAlign="flex-start" spacing={64}>
          <Stack direction="column" rowAlign="flex-start">
            <FieldLabel>First Name</FieldLabel>
            <FieldValue>{firstName}</FieldValue>
          </Stack>
          <Stack direction="column" rowAlign="flex-start">
            <FieldLabel>Last Name</FieldLabel>
            <FieldValue>{lastName}</FieldValue>
          </Stack>
        </Stack>
        <Stack direction="column" rowAlign="flex-start">
          <FieldLabel>Change Password</FieldLabel>
          <Formik
            initialValues={
              {
                currentPassword: "",
                newPassword1: "",
                newPassword2: "",
              } as UpdatePasswordForm
            }
            onSubmit={onSubmitPassword}
            validationSchema={UpdatePasswordSchema}
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
                  <LocalityForm.Label required>
                    Current password
                  </LocalityForm.Label>
                  <LocalityForm.InputGroup size="lg">
                    <FormControl
                      aria-label="Current password"
                      aria-details="Enter current password here"
                      id="currentPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.currentPassword}
                    />
                  </LocalityForm.InputGroup>
                  <LocalityForm.ErrorMessage name="currentPassword" />
                </Form.Group>
                <Form.Group>
                  <LocalityForm.Label required>New password</LocalityForm.Label>
                  <LocalityForm.InputGroup size="lg">
                    <FormControl
                      aria-label="New password"
                      aria-details="Enter new password here"
                      id="newPassword1"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.newPassword1}
                    />
                  </LocalityForm.InputGroup>
                  <LocalityForm.ErrorMessage name="newPassword1" />
                </Form.Group>
                <Form.Group>
                  <LocalityForm.Label required>
                    Re-enter new password
                  </LocalityForm.Label>
                  <LocalityForm.InputGroup size="lg">
                    <FormControl
                      aria-label="Re-enter new password"
                      aria-details="Re-enter new password here"
                      id="newPassword2"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.newPassword2}
                    />
                  </LocalityForm.InputGroup>
                  <LocalityForm.ErrorMessage name="newPassword2" />
                </Form.Group>
                {updatePasswordStatus.error !== "" && (
                  <div style={{ color: "red" }}>
                    {updatePasswordStatus.error}
                  </div>
                )}
                {updatePasswordStatus.success && (
                  <div style={{ color: "green" }}>
                    Successfully updated password!
                  </div>
                )}
                <Stack direction="row-reverse">
                  <LocalityForm.Button
                    isSubmitting={isSubmitting}
                    text="Update"
                    submittingText="Updating..."
                  />
                </Stack>
              </Form>
            )}
          </Formik>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default Account;
