import { createRef } from "react";
import dynamic from "next/dynamic";
import * as yup from "yup";
import { Formik } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import DashboardLayout from "./Layout";
import { InputGroup, Label, SubmitButton, ErrorMessage } from "../common/form";
import { Base64, fileToBase64 } from "./ImageHelpers";
import Stack from "../common/Stack";
import Select from "../common/select/VirtualSelect";
import styles from "./Business.module.css";

import type { BaseBusiness, UploadTypeSettings } from "../common/Schema";
import type { FormikConfig } from "formik";

const BusinessList = dynamic(() => import("./BusinessList"));
const NewBusiness = dynamic(() => import("../common/popups/NewBusiness"));

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

export interface UpdateUploadSettingsRequest {
  Etsy?: {
    includeTags?: string;
    excludeTags?: string;
  };
  Shopify?: {
    includeTags?: string;
    excludeTags?: string;
  };
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
  updateUploadSettingsStatus: UpdateStatus;
  height: number;
  onBusinessClick: (index: number) => void;
  onSubmitDepartments: FormikConfig<UpdateDepartmentsRequest>["onSubmit"];
  onSubmitLogo: FormikConfig<UpdateLogoRequest>["onSubmit"];
  onSubmitHomepages: FormikConfig<UpdateHomepagesRequest>["onSubmit"];
  onSubmitUploadSettings: FormikConfig<UpdateUploadSettingsRequest>["onSubmit"];
}

const UpdateLogoSchema = yup.object().shape({
  logo: yup.string().required("Invalid image url or image file"),
});

const UpdateHomepagesSchema = yup.object().shape({
  homepage: yup.string().required("Required").max(255, "Too long"),
  etsyHomepage: yup
    .string()
    .optional()
    .test(
      "EtsyFormat",
      "Must have the following format: etsy.com/shop/[SHOP_ID]",
      (page) => {
        return (!page ||
          page.length === 0 ||
          page.match(
            /^(http(s?):\/\/)?(www\.)?etsy\.com\/([^\/]+\/)*shop\/[a-zA-Z0-9_\-]+(\/?)$/g
          )) as boolean;
      }
    )
    .max(255, "Too long"),
  shopifyHomepage: yup.string().optional().max(255, "Too long"),
  squareHomepage: yup.string().optional().max(255, "Too long"),
});

const UpdateDepartmentsSchema = yup.object().shape({
  departments: yup.array().of(yup.string()).optional(),
});

const CommaListValidator = yup
  .string()
  .optional()
  .max(255, "Too long")
  .matches(/^\s*[^,]+\s*(,(\s*[^,\s]\s*)+)*\s*$/g, "Must be a comma list");
const UpdateUploadSettingsSchema = yup.object().shape({
  Shopify: yup.object().optional().shape({
    includeTags: CommaListValidator,
    excludeTags: CommaListValidator,
  }),
  Etsy: yup.object().optional().shape({
    includeTags: CommaListValidator,
    excludeTags: CommaListValidator,
  }),
});

export default function Business({
  isNewBusiness,
  businesses,
  businessIndex,
  departments,
  updateDepartmentsStatus,
  updateHomepagesStatus,
  updateLogoStatus,
  updateUploadSettingsStatus,
  height,
  onBusinessClick,
  onSubmitLogo,
  onSubmitHomepages,
  onSubmitDepartments,
  onSubmitUploadSettings,
}: BusinessProps) {
  const logoUrlRef = createRef<HTMLInputElement>();
  const logoFileRef = createRef<HTMLInputElement>();
  const departmentsWithIds = departments.map((department, index) => ({
    label: department,
    value: index,
  }));

  const UpdateUploadSettings = ({
    uploadType,
  }: {
    uploadType: "Shopify" | "Etsy";
  }) => {
    const uploadSettings = businesses[businessIndex].uploadSettings;
    const uploadTypeSettings: UploadTypeSettings =
      uploadSettings[uploadType] || {};
    const includeTags = uploadTypeSettings.includeTags || [];
    const excludeTags = uploadTypeSettings.excludeTags || [];
    const initialValues: UpdateUploadSettingsRequest = {};
    initialValues[uploadType] = {
      includeTags: includeTags.filter(Boolean).join(", "),
      excludeTags: excludeTags.filter(Boolean).join(", "),
    };

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues as UpdateUploadSettingsRequest}
        onSubmit={onSubmitUploadSettings}
        validationSchema={UpdateUploadSettingsSchema}
      >
        {({ isSubmitting, values, handleBlur, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
            <Form.Group>
              <Label
                description={`When uploading products from ${uploadType}, we will only upload products with at least one of the include tags. By default, we will include all products`}
              >
                Tags to Include (comma list)
              </Label>
              <InputGroup>
                <FormControl
                  as="textarea"
                  aria-label="Tags to Include"
                  aria-details="Enter tags to include here"
                  id={`${uploadType}.includeTags`}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="feature,in-stock,..."
                  type="text"
                  value={values[uploadType]?.includeTags || ""}
                />
              </InputGroup>
              <div
                style={{
                  textAlign: "right",
                  color:
                    (values[uploadType]?.includeTags?.length || 0) > 255
                      ? "red"
                      : "black",
                }}
              >{`${values[uploadType]?.includeTags?.length || 0}/255`}</div>
              <ErrorMessage name={`${uploadType}.includeTags`} />
            </Form.Group>
            <Form.Group>
              <Label
                description={`When uploading products from ${uploadType}, we will exclude products with at least one of the exclusion tags. If the same tag is added as both an inclusion and exclusion tag, the product will not be uploaded. By default, we will not exclude any products`}
              >
                Tags to Exclude (comma list)
              </Label>
              <InputGroup>
                <FormControl
                  as="textarea"
                  aria-label="Tags to Exclude"
                  aria-details="Enter tags to exclude here"
                  id={`${uploadType}.excludeTags`}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="out-of-stock,unavailable,..."
                  type="text"
                  value={values[uploadType]?.excludeTags || ""}
                />
              </InputGroup>
              <div
                style={{
                  textAlign: "right",
                  color:
                    (values[uploadType]?.excludeTags?.length || 0) > 255
                      ? "red"
                      : "black",
                }}
              >{`${values[uploadType]?.excludeTags?.length || 0}/255`}</div>
              <ErrorMessage name={`${uploadType}.excludeTags`} />
            </Form.Group>
            {updateUploadSettingsStatus.error && (
              <div style={{ color: "red" }}>
                {updateUploadSettingsStatus.error}
              </div>
            )}
            {updateUploadSettingsStatus.successful && (
              <div style={{ color: "green" }}>
                Successfully updated upload settings!
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
    );
  };

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
                              isClearable
                              isMulti
                              isSearchable
                              searchable
                              clearable
                              onChange={(newValues) => {
                                setFieldValue(
                                  "departments",
                                  newValues.map((value: any) => value.label),
                                  true
                                );
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
                        homepage: businesses[businessIndex].homepage,
                        etsyHomepage: businesses[businessIndex].etsyHomepage,
                        shopifyHomepage:
                          businesses[businessIndex].shopifyHomepage,
                        squareHomepage:
                          businesses[businessIndex].squareHomepage,
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
              <Stack direction="column" rowAlign="flex-start" spacing={32}>
                <div style={{ width: 300 }}>
                  <h1 className={styles.label}>Upload Settings</h1>
                  <Tabs defaultActiveKey="Shopify">
                    <Tab eventKey="Shopify" title="Shopify">
                      <UpdateUploadSettings uploadType="Shopify" />
                    </Tab>
                    <Tab eventKey="Etsy" title="Etsy">
                      <UpdateUploadSettings uploadType="Etsy" />
                    </Tab>
                  </Tabs>
                </div>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </DashboardLayout>
  );
}
