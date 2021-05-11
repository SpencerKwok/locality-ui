import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import LocalityLogo from "../../components/common/images/LocalityLogo";
import { SignUpRequest, SignUpSchema } from "./SignupBusinessForm";
import Stack from "../common/Stack";
import { SubmitButton, ErrorMessage, InputGroup, Label } from "../common/form";

export interface SignupBusinessProps {
  error: string;
  onSubmit: FormikConfig<SignUpRequest>["onSubmit"];
}

export default function SignupBusiness({
  error,
  onSubmit,
}: SignupBusinessProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ display: "block" }}>
        <Stack direction="row" columnAlign="center">
          <LocalityLogo
            width={200}
            style={{ padding: "12px 24px 24px 24px" }}
          />
        </Stack>
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
              businessName: "",
              address: "",
              city: "",
              province: "",
              country: "",
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
              <Stack direction="row" spacing={12} priority={[1, 1]}>
                <Form.Group>
                  <Label required>First Name</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="First Name"
                      aria-details="Enter first name here"
                      id="firstName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      type="text"
                      value={values.firstName}
                    />
                  </InputGroup>
                  <ErrorMessage name="firstName" />
                </Form.Group>
                <Form.Group>
                  <Label required>Last Name</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Last Name"
                      aria-details="Enter last name here"
                      id="lastName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      type="text"
                      value={values.lastName}
                    />
                  </InputGroup>
                  <ErrorMessage name="lastName" />
                </Form.Group>
              </Stack>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
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
                  <Label required>Business Name</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Business Name"
                      aria-details="Enter business name here"
                      id="businessName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      type="text"
                      value={values.businessName}
                    />
                  </InputGroup>
                  <ErrorMessage name="businessName" />
                </Form.Group>
              </Stack>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
                <Form.Group>
                  <Label required>Address</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Address"
                      aria-details="Enter address here"
                      id="address"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter address"
                      type="text"
                      value={values.address}
                    />
                  </InputGroup>
                  <ErrorMessage name="address" />
                </Form.Group>
                <Form.Group>
                  <Label required>City</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="City"
                      aria-details="Enter city here"
                      id="city"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter city"
                      type="text"
                      value={values.city}
                    />
                  </InputGroup>
                  <ErrorMessage name="city" />
                </Form.Group>
              </Stack>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
                <Form.Group>
                  <Label required>Province</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Province"
                      aria-details="Enter province here"
                      id="province"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter province"
                      type="text"
                      value={values.province}
                    />
                  </InputGroup>
                  <ErrorMessage name="province" />
                </Form.Group>
                <Form.Group>
                  <Label required>Country</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Country"
                      aria-details="Enter country here"
                      id="country"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter country"
                      type="text"
                      value={values.country}
                    />
                  </InputGroup>
                  <ErrorMessage name="country" />
                </Form.Group>
              </Stack>
              <Stack direction="row" spacing={12} priority={[1, 1]}>
                <Form.Group>
                  <Label required>Password</Label>
                  <InputGroup>
                    <FormControl
                      aria-required
                      aria-label="Password"
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
                      aria-label="Re-enter password"
                      aria-details="Re-enter password here"
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
