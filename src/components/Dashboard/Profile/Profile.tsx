import React from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";
import { Redirect } from "react-router-dom";

import ProfileDAO from "./ProfileDAO";
import Stack from "../../../common/components/Stack/Stack";
import {
  FormInputGroup,
  FormLabel,
  FormButton,
  createFormErrorMessage,
} from "../../../common/components/Form/Form";

export interface ProfileProps extends React.HTMLProps<HTMLDivElement> {}

const FieldLabel = styled.div`
  font-size: 32px;
`;

const FieldValue = styled.div`
  font-size: 24px;
`;

interface ChangePasswordForm {
  currentPassword: string;
  newPassword1: string;
  newPassword2: string;
}

const ChangePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required("Required").max(255, "Too long"),
  newPassword1: yup.string().required("Required").max(255, "Too long"),
  newPassword2: yup
    .string()
    .required("Required")
    .max(255, "Too long")
    .oneOf([yup.ref("newPassword1")], "New passwords do not match"),
});

function Profile(props: ProfileProps) {
  const firstName = Cookie.get("firstName");
  const lastName = Cookie.get("lastName");
  const companyName = Cookie.get("companyName");

  if (!firstName || !lastName || !companyName) {
    return <Redirect to="/signin" />;
  }

  const onSubmit: FormikConfig<ChangePasswordForm>["onSubmit"] = async (
    values
  ) => {
    await ProfileDAO.getInstance()
      .passwordUpdate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword1,
      })
      .catch((err) => console.log(err));
  };

  return (
    <Stack direction="row" columnAlign="flex-start" style={{ padding: 12 }}>
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
          <FieldLabel>Company</FieldLabel>
          <FieldValue>{companyName}</FieldValue>
        </Stack>
        <Stack direction="column" rowAlign="flex-start">
          <FieldLabel>Change Password</FieldLabel>
          <Formik
            initialValues={
              {
                currentPassword: "",
                newPassword1: "",
                newPassword2: "",
              } as ChangePasswordForm
            }
            onSubmit={onSubmit}
            validationSchema={ChangePasswordSchema}
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
                  <FormLabel>Current Password</FormLabel>
                  <FormInputGroup size="lg" width="100%">
                    <FormControl
                      aria-label="Large"
                      id="currentPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.currentPassword}
                    />
                  </FormInputGroup>
                  {createFormErrorMessage("currentPassword")}
                </Form.Group>
                <Form.Group>
                  <FormLabel>New Password</FormLabel>
                  <FormInputGroup size="lg" width="100%">
                    <FormControl
                      aria-label="Large"
                      id="newPassword1"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.newPassword1}
                    />
                  </FormInputGroup>
                  {createFormErrorMessage("newPassword1")}
                </Form.Group>
                <Form.Group>
                  <FormLabel>Re-enter New Password</FormLabel>
                  <FormInputGroup size="lg" width="100%">
                    <FormControl
                      aria-label="Large"
                      id="newPassword2"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="password"
                      value={values.newPassword2}
                    />
                  </FormInputGroup>
                  {createFormErrorMessage("newPassword2")}
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
                        Saving...
                      </React.Fragment>
                    ) : (
                      <React.Fragment>Save</React.Fragment>
                    )}
                  </FormButton>
                </Stack>
              </Form>
            )}
          </Formik>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default Profile;
