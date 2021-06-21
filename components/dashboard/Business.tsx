import { createRef, Fragment } from "react";
import dynamic from "next/dynamic";
import { Formik } from "formik";
import { decode } from "html-entities";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import { Base64, fileToBase64 } from "./ImageHelpers";
import {
  InputGroup,
  Label,
  SubmitButton,
  ErrorMessage,
} from "components/common/form";
import {
  DepartmentsUpdateSchema,
  HomepagesUpdateSchema,
  LogoUpdateSchema,
} from "common/ValidationSchema";
import Stack from "components/common/Stack";
import Select from "components/common/select/VirtualSelect";
import styles from "./Business.module.css";

import type { BaseBusiness } from "common/Schema";
import type { FormikConfig } from "formik";

const BusinessList = dynamic(() => import("./BusinessList"));
const NewBusiness = dynamic(
  () => import("components/common/popups/NewBusiness")
);

export interface UpdateLogoRequest {
  logo: Base64;
}

export interface UpdateHomepagesRequest {
  homepage: string;
  etsyHomepage?: string;
  shopifyHomepage?: string;
  squareHomepage?: string;
}

export interface UpdateDepartmentsRequest {
  departments: Array<string>;
}

export interface UpdateStatus {
  error: string;
  successful: boolean;
}

export interface BusinessProps {
  isNewBusiness: boolean;
  businesses: Array<BaseBusiness>;
  businessIndex: number;
  departments: Array<string>;
  updateDepartmentsStatus: UpdateStatus;
  updateHomepagesStatus: UpdateStatus;
  updateLogoStatus: UpdateStatus;
  height: number;
  onBusinessClick: (index: number) => void;
  onSubmitDepartments: FormikConfig<UpdateDepartmentsRequest>["onSubmit"];
  onSubmitLogo: FormikConfig<UpdateLogoRequest>["onSubmit"];
  onSubmitHomepages: FormikConfig<UpdateHomepagesRequest>["onSubmit"];
}

export default function Business({
  isNewBusiness,
  businesses,
  businessIndex,
  departments,
  updateDepartmentsStatus,
  updateHomepagesStatus,
  updateLogoStatus,
  height,
  onBusinessClick,
  onSubmitLogo,
  onSubmitHomepages,
  onSubmitDepartments,
}: BusinessProps) {
  const logoUrlRef = createRef<HTMLInputElement>();
  const logoFileRef = createRef<HTMLInputElement>();
  const departmentsWithIds = departments.map((department, index) => ({
    label: department,
    value: index,
  }));

  return (
    <Fragment>
      {isNewBusiness && <NewBusiness />}
      <Stack direction="row" columnAlign="flex-start" style={{ marginTop: 12 }}>
        {businesses.length > 1 && (
          <BusinessList
            onBusinessClick={onBusinessClick}
            businesses={businesses}
            height={height - 200}
            index={businessIndex}
            width={260}
            style={{ marginRight: 32 }}
          />
        )}
        <Stack direction="column" rowAlign="flex-start" spacing={32}>
          {businessIndex >= 0 && (
            <Stack direction="row" columnAlign="flex-start" spacing={32}>
              <Stack direction="column" rowAlign="flex-start">
                <div>
                  <h1 className={styles.label}>Name</h1>
                  <h1 className={styles.value}>
                    {decode(businesses[businessIndex].name)}
                  </h1>
                </div>
                <div style={{ width: 300 }}>
                  <h1 className={styles.label}>Departments</h1>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        departments: businesses[businessIndex].departments,
                      } as UpdateDepartmentsRequest
                    }
                    onSubmit={onSubmitDepartments}
                    validationSchema={DepartmentsUpdateSchema}
                  >
                    {({
                      isSubmitting,
                      values,
                      handleSubmit,
                      setFieldValue,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group>
                          <InputGroup>
                            <Select
                              isClearable
                              isMulti
                              isSearchable
                              searchable
                              clearable
                              onChange={(_, action) => {
                                switch (action.action) {
                                  case "select-option":
                                    if (action.option) {
                                      const label = action.option.label;
                                      if (!values.departments.includes(label))
                                        setFieldValue(
                                          "departments",
                                          [...values.departments, label],
                                          false
                                        );
                                    }
                                    break;
                                  case "remove-value":
                                    if (action.removedValue) {
                                      const label = action.removedValue.label;
                                      setFieldValue(
                                        "departments",
                                        values.departments.filter(
                                          (department) => department !== label
                                        ),
                                        false
                                      );
                                    }
                                    break;
                                  case "clear":
                                    setFieldValue("departments", [], false);
                                    break;
                                }
                              }}
                              options={departmentsWithIds}
                              value={values.departments.map((department) => ({
                                label: department,
                              }))}
                              styles={{
                                container: (obj) => ({ ...obj, width: 300 }),
                              }}
                            />
                          </InputGroup>
                          <ErrorMessage name="departments" />
                        </Form.Group>
                        {updateDepartmentsStatus.error && (
                          <div style={{ color: "red" }}>
                            {updateDepartmentsStatus.error}
                          </div>
                        )}
                        {updateDepartmentsStatus.successful && (
                          <div style={{ color: "green" }}>
                            Successfully updated departments!
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
                </div>
              </Stack>
              <div>
                <h1 className={styles.label}>Logo</h1>
                <Formik
                  enableReinitialize
                  initialValues={
                    {
                      logo: businesses[businessIndex].logo,
                    } as UpdateLogoRequest
                  }
                  onSubmit={onSubmitLogo}
                  validationSchema={LogoUpdateSchema}
                >
                  {({
                    isSubmitting,
                    values,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Stack
                        direction="column"
                        columnAlign="center"
                        rowAlign="center"
                        style={{ height: 250 }}
                      >
                        <picture className={styles.picture}>
                          <img
                            src={values.logo}
                            alt={businesses[businessIndex].name}
                            onError={() => {
                              setFieldValue("logo", "", true);
                            }}
                            style={{ maxHeight: 250, maxWidth: 300 }}
                          />
                        </picture>
                      </Stack>
                      <Form.Group>
                        <Label required>Image URL or Image File</Label>
                        <InputGroup>
                          <FormControl
                            aria-label="Image URL"
                            aria-details="Enter image url here"
                            id="logo"
                            onBlur={handleBlur}
                            onChange={async (event) => {
                              if (event.currentTarget.value !== "") {
                                try {
                                  const url = event.currentTarget.value;
                                  setFieldValue("logo", url, true);
                                  if (logoFileRef.current) {
                                    logoFileRef.current.value = "";
                                  }
                                } catch {
                                  setFieldValue("logo", "", true);
                                }
                              }
                            }}
                            placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
                            ref={logoUrlRef}
                            style={{ width: 300 }}
                          />
                        </InputGroup>
                        <InputGroup>
                          <Form.File
                            aria-label="Image file"
                            aria-details="Enter image file here"
                            id="logo"
                            onBlur={handleBlur}
                            onChange={async (
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              if (
                                event.target.files &&
                                event.target.files.length > 0
                              ) {
                                try {
                                  const file = event.target.files[0];
                                  const logo = await fileToBase64(file);
                                  setFieldValue("logo", logo, true);
                                  if (logoUrlRef.current) {
                                    logoUrlRef.current.value = "";
                                  }
                                } catch {
                                  setFieldValue("logo", "", true);
                                }
                              } else {
                                setFieldValue("logo", "", true);
                              }
                            }}
                            ref={logoFileRef}
                          />
                        </InputGroup>
                        <ErrorMessage name="logo" />
                      </Form.Group>

                      <div style={{ color: "red" }}>
                        {updateLogoStatus.error}
                      </div>
                      {updateLogoStatus.successful && (
                        <div style={{ color: "green" }}>
                          Successfully updated logo!
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
              </div>
              <Stack direction="column" rowAlign="flex-start" spacing={32}>
                <div style={{ width: 300 }}>
                  <h1 className={styles.label}>Homepages</h1>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        homepage: businesses[businessIndex].homepages.homepage,
                        etsyHomepage:
                          businesses[businessIndex].homepages.etsyHomepage ||
                          "",
                        shopifyHomepage:
                          businesses[businessIndex].homepages.shopifyHomepage ||
                          "",
                        squareHomepage:
                          businesses[businessIndex].homepages.squareHomepage ||
                          "",
                      } as UpdateHomepagesRequest
                    }
                    onSubmit={onSubmitHomepages}
                    validationSchema={HomepagesUpdateSchema}
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
                          <Label
                            required
                            description="This is the website you want new customers to land on!"
                          >
                            Homepage
                          </Label>
                          <InputGroup>
                            <FormControl
                              aria-required
                              aria-label="Homepage"
                              aria-details="Enter homepage here"
                              id="homepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.cantiqliving.com"
                              type="text"
                              value={values.homepage}
                            />
                          </InputGroup>
                          <ErrorMessage name="homepage" />
                        </Form.Group>
                        <Form.Group>
                          <Label
                            description={
                              'Adding your Etsy storefront (if applicable) will enable you to upload your products to Locality from your Etsy storefront in the "Inventory" tab.'
                            }
                          >
                            Etsy Storefront
                          </Label>
                          <InputGroup>
                            <FormControl
                              aria-label="Etsy Storefront"
                              aria-details="Enter Etsy storefront here"
                              id="etsyHomepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.etsy.com/shop/Dogzsquadarts"
                              type="text"
                              value={values.etsyHomepage}
                            />
                          </InputGroup>
                          <ErrorMessage name="etsyHomepage" />
                        </Form.Group>
                        <Form.Group>
                          <Label
                            description={
                              'Adding your Shopify website (if applicable) will enable you to upload your products to Locality from your Shopify website in the "Inventory" tab.'
                            }
                          >
                            Shopify Website
                          </Label>
                          <InputGroup>
                            <FormControl
                              aria-label="Shopify Homepage"
                              aria-details="Enter Shopify homepage here"
                              id="shopifyHomepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.cantiqliving.com"
                              type="text"
                              value={values.shopifyHomepage}
                            />
                          </InputGroup>
                          <ErrorMessage name="shopifyHomepage" />
                        </Form.Group>
                        <Form.Group>
                          <Label
                            description={
                              'Adding your Square website (if applicable) will enable you to upload your products to Locality from your Square website in the "Inventory" tab.'
                            }
                          >
                            Square Website
                          </Label>
                          <InputGroup>
                            <FormControl
                              aria-label="Square Website"
                              aria-details="Enter Square website here"
                              id="squareHomepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.cantiqliving.com"
                              type="text"
                              value={values.squareHomepage}
                            />
                          </InputGroup>
                          <ErrorMessage name="squareHomepage" />
                        </Form.Group>
                        {updateHomepagesStatus.error && (
                          <div style={{ color: "red" }}>
                            {updateHomepagesStatus.error}
                          </div>
                        )}
                        {updateHomepagesStatus.successful && (
                          <div style={{ color: "green" }}>
                            Successfully updated homepages!
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
                </div>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Fragment>
  );
}
