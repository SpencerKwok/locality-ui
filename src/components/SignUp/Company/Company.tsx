import React, { useState } from "react";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import CompanyDAO from "./CompanyDAO";
import Stack from "../../../common/components/Stack/Stack";
import LocalityForm from "../../../common/components/Form";

export interface CompanyProps extends React.HTMLProps<HTMLFormElement> {
  width: number;
}

interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  address: string;
  city: string;
  province: string;
  country: string;
  password1: string;
  password2: string;
}

const SignUpSchema = yup.object().shape({
  firstName: yup.string().required("Required").max(255, "Too long"),
  lastName: yup.string().required("Required").max(255, "Too long"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Required")
    .max(255, "Too long"),
  companyName: yup.string().required("Required").max(255, "Too long"),
  address: yup.string().required("Required").max(255, "Too long"),
  city: yup.string().required("Required").max(255, "Too long"),
  province: yup.string().required("Required").max(255, "Too long"),
  country: yup.string().required("Required").max(255, "Too long"),
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

function Company(props: CompanyProps) {
  const [error, setError] = useState("");

  const onSubmit: FormikConfig<SignUpRequest>["onSubmit"] = async (values) => {
    const cleanValues = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      companyName: values.companyName,
      address: values.address,
      city: values.city,
      province: values.province,
      country: values.country,
    };

    await CompanyDAO.getInstance()
      .signup({
        ...cleanValues,
        password: values.password1,
      })
      .then(({ error, redirectTo }) => {
        if (error) {
          setError(error.message);
          return;
        }
        window.location.href = redirectTo;
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      });
  };

  return (
    <div style={{ width: props.width * 0.5, display: "block" }}>
      <Stack direction="row" columnAlign="center">
        <h5>
          Fill out the form below to start showcasing your business today!
        </h5>
      </Stack>
      <Formik
        initialValues={
          {
            firstName: "",
            lastName: "",
            email: "",
            companyName: "",
            address: "",
            city: "",
            province: "",
            country: "",
          } as SignUpRequest
        }
        onSubmit={onSubmit}
        validationSchema={SignUpSchema}
      >
        {({ isSubmitting, values, handleBlur, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={12} priority={[1, 1]}>
              <Form.Group>
                <LocalityForm.Label required>First Name</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="First Name"
                    aria-details="Enter first name here"
                    id="firstName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    type="text"
                    value={values.firstName}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="firstName" />
              </Form.Group>
              <Form.Group>
                <LocalityForm.Label required>Last Name</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Last Name"
                    aria-details="Enter last name here"
                    id="lastName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    type="text"
                    value={values.lastName}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="lastName" />
              </Form.Group>
            </Stack>
            <Stack direction="row" spacing={12} priority={[1, 1]}>
              <Form.Group>
                <LocalityForm.Label required>Email</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Email"
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
                <LocalityForm.Label required>Company Name</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Company Name"
                    aria-details="Enter company name here"
                    id="companyName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    type="text"
                    value={values.companyName}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="companyName" />
              </Form.Group>
            </Stack>
            <Stack direction="row" spacing={12} priority={[1, 1]}>
              <Form.Group>
                <LocalityForm.Label required>
                  Company address
                </LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Company address"
                    aria-details="Enter company address here"
                    id="address"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter address"
                    type="text"
                    value={values.address}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="address" />
              </Form.Group>
              <Form.Group>
                <LocalityForm.Label required>City</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="City"
                    aria-details="Enter city here"
                    id="city"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter city"
                    type="text"
                    value={values.city}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="city" />
              </Form.Group>
            </Stack>
            <Stack direction="row" spacing={12} priority={[1, 1]}>
              <Form.Group>
                <LocalityForm.Label required>Province</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Province"
                    aria-details="Enter province here"
                    id="province"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter province"
                    type="text"
                    value={values.province}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="province" />
              </Form.Group>
              <Form.Group>
                <LocalityForm.Label required>Country</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Country"
                    aria-details="Enter country here"
                    id="country"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter country"
                    type="text"
                    value={values.country}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="country" />
              </Form.Group>
            </Stack>
            <Stack direction="row" spacing={12} priority={[1, 1]}>
              <Form.Group>
                <LocalityForm.Label required>Password</LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Password"
                    aria-details="Enter password here"
                    id="password1"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter password"
                    type="password"
                    value={values.password1}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="password1" />
              </Form.Group>
              <Form.Group>
                <LocalityForm.Label required>
                  Re-enter password
                </LocalityForm.Label>
                <LocalityForm.InputGroup size="lg">
                  <FormControl
                    aria-label="Re-enter Password"
                    aria-details="Re-enter password here"
                    id="password2"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    type="password"
                    value={values.password2}
                  />
                </LocalityForm.InputGroup>
                <LocalityForm.ErrorMessage name="password2" />
              </Form.Group>
            </Stack>
            <div
              color="red"
              style={{
                textAlign: "right",
              }}
            >
              {error}
            </div>
            <Stack direction="row-reverse">
              <LocalityForm.Button
                isSubmitting={isSubmitting}
                text="Sign up"
                submittingText="Signing up..."
              />
            </Stack>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Company;
