import { createRef } from "react";
import dynamic from "next/dynamic";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Select from "react-dropdown-select";

import { BaseBusiness } from "../common/Schema";
import DashboardLayout from "./Layout";
import { Departments, DepartmentsToId } from "./Departments";
import { InputGroup, Label, SubmitButton, ErrorMessage } from "../common/form";
import { Base64, fileToBase64, urlToBase64 } from "./ImageHelpers";
import Stack from "../common/Stack";
import styles from "./Business.module.css";

const BusinessList = dynamic(() => import("./BusinessList"));
const NewBusiness = dynamic(() => import("../common/popups/NewBusiness"));

export interface UpdateLogoRequest {
  logo: Base64;
}

export interface UpdateHomepagesRequest {
  homepage: string;
  shopifyHomepage?: string;
  etsyHomepage?: string;
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
  updateDepartmentsStatus: UpdateStatus;
  updateHomepagesStatus: UpdateStatus;
  updateLogoStatus: UpdateStatus;
  height: number;
  onBusinessClick: (index: number) => void;
  onSubmitDepartments: FormikConfig<UpdateDepartmentsRequest>["onSubmit"];
  onSubmitLogo: FormikConfig<UpdateLogoRequest>["onSubmit"];
  onSubmitHomepages: FormikConfig<UpdateHomepagesRequest>["onSubmit"];
}

const UpdateLogoSchema = yup.object().shape({
  logo: yup.string().required("Invalid image url or image file"),
});

const UpdateHomepagesSchema = yup.object().shape({
  homepage: yup.string().required("Required").max(255, "Too long"),
  shopifyHomepage: yup.string().optional().max(255, "Too long"),
  etsyHomepage: yup
    .string()
    .optional()
    .test(
      "EtsyFormat",
      "Must have the following format: etsy.com/shop/[SHOP_ID]",
      (page) => {
        return (!page ||
          page.length === 0 ||
          page.match(/etsy\.com\/([^\/]+\/)*shop\/[a-zA-Z0-9]+$/g)) as boolean;
      }
    )
    .max(255, "Too long"),
});

const UpdateDepartmentsSchema = yup.object().shape({
  departments: yup.array().of(yup.string()).optional(),
});

export default function Business({
  isNewBusiness,
  businesses,
  businessIndex,
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

  return (
    <DashboardLayout tab="business">
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
                    {businesses[businessIndex].name}
                  </h1>
                </div>
                <h1 className={styles.label}>Logo</h1>
                <Formik
                  enableReinitialize
                  initialValues={
                    {
                      logo: businesses[businessIndex].logo,
                    } as UpdateLogoRequest
                  }
                  onSubmit={onSubmitLogo}
                  validationSchema={UpdateLogoSchema}
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
                                  const logo = await urlToBase64(url);
                                  setFieldValue("logo", logo, true);
                                  if (logoFileRef.current) {
                                    logoFileRef.current.value = "";
                                  }
                                } catch {}
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
                                } catch {}
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
              </Stack>
              <Stack direction="column" rowAlign="flex-start" spacing={32}>
                <div style={{ width: 300 }}>
                  <h1 className={styles.label}>Homepages</h1>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        homepage: businesses[businessIndex].homepage,
                        shopifyHomepage:
                          businesses[businessIndex].shopifyHomepage,
                        etsyHomepage: businesses[businessIndex].etsyHomepage,
                      } as UpdateHomepagesRequest
                    }
                    onSubmit={onSubmitHomepages}
                    validationSchema={UpdateHomepagesSchema}
                  >
                    {({
                      isSubmitting,
                      values,
                      handleBlur,
                      handleChange,
                      handleSubmit,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Label
                          required
                          description="This is the website you want new customers to land on!"
                        >
                          Homepage
                        </Label>
                        <Form.Group>
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
                        <Label
                          description={
                            'Adding your Shopify website (if applicable) will enable you to upload your products to Locality from your Shopify website in the "Inventory" tab'
                          }
                        >
                          Shopify Website
                        </Label>
                        <Form.Group>
                          <InputGroup>
                            <FormControl
                              aria-label="Shopify Homepage"
                              aria-details="Enter Shopify homepage here"
                              id="shopifyHomepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.bombshell-boxing.myshopify.com"
                              type="text"
                              value={values.shopifyHomepage}
                            />
                          </InputGroup>
                          <ErrorMessage name="shopifyHomepage" />
                        </Form.Group>
                        <Label
                          description={
                            'Adding your Etsy storefront (if applicable) will enable you to upload your products to Locality from your Etsy storefront in the "Inventory" tab'
                          }
                        >
                          Etsy Storefront
                        </Label>
                        <Form.Group>
                          <InputGroup>
                            <FormControl
                              aria-label="Etsy Homepage"
                              aria-details="Enter Etsy homepage here"
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
                        {updateHomepagesStatus.error && (
                          <div style={{ color: "red" }}>
                            {updateHomepagesStatus.error}
                          </div>
                        )}
                        {updateHomepagesStatus.successful && (
                          <div style={{ color: "green" }}>
                            Successfully updated homepage!
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
                <div style={{ width: 300 }}>
                  <h1 className={styles.label}>Departments</h1>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        departments: businesses[businessIndex].departments
                          .split(":")
                          .filter(Boolean),
                      } as UpdateDepartmentsRequest
                    }
                    onSubmit={onSubmitDepartments}
                    validationSchema={UpdateDepartmentsSchema}
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
                              multi
                              color="#449ed7"
                              onChange={(departments) => {
                                setFieldValue(
                                  "departments",
                                  departments.map(({ name }) => name),
                                  true
                                );
                              }}
                              options={Departments}
                              style={{ width: 300 }}
                              labelField="name"
                              valueField="name"
                              values={values.departments.map((name) => ({
                                id: DepartmentsToId.get(name),
                                name,
                              }))}
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
            </Stack>
          )}
        </Stack>
      </Stack>
    </DashboardLayout>
  );
}
