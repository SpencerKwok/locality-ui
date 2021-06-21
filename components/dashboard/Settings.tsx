import dynamic from "next/dynamic";
import * as yup from "yup";
import { Formik } from "formik";

import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import {
  InputGroup,
  Label,
  SubmitButton,
  ErrorMessage,
} from "components/common/form";
import {
  EtsyUpdateUploadSettingsSchema,
  ShopifyUpdateUploadSettingsSchema,
  SquareUpdateUploadSettingsSchema,
} from "common/ValidationSchema";
import Select from "components/common/select/VirtualSelect";
import Stack from "components/common/Stack";
import styles from "components/dashboard/Settings.module.css";

import type { FC } from "react";
import type { BaseBusiness } from "common/Schema";
import type { FormikConfig } from "formik";

const BusinessList = dynamic(() => import("./BusinessList"));

export interface UpdateStatus {
  error: string;
  successful: boolean;
}

export interface EtsyUpdateUploadSettingsRequest {
  includeTags?: string;
  excludeTags?: string;
}

export interface ShopifyUpdateUploadSettingsRequest {
  includeTags?: string;
  excludeTags?: string;
  departmentMapping?: Array<{ key: string; departments: Array<string> }>;
}

export interface SquareUpdateUploadSettingsRequest {
  includeTags?: string;
  excludeTags?: string;
  departmentMapping?: Array<{ key: string; departments: Array<string> }>;
}

export interface SettingsProps {
  businesses: Array<BaseBusiness>;
  businessIndex: number;
  departments: Array<string>;
  updateUploadSettingsStatus: UpdateStatus;
  height: number;
  onBusinessClick: (index: number) => void;
  onSubmitEtsyUploadSettings: FormikConfig<EtsyUpdateUploadSettingsRequest>["onSubmit"];
  onSubmitShopifyUploadSettings: FormikConfig<ShopifyUpdateUploadSettingsRequest>["onSubmit"];
  onSubmitSquareUploadSettings: FormikConfig<SquareUpdateUploadSettingsRequest>["onSubmit"];
}

const Settings: FC<SettingsProps> = ({
  businesses,
  businessIndex,
  departments,
  updateUploadSettingsStatus,
  height,
  onBusinessClick,
  onSubmitEtsyUploadSettings,
  onSubmitShopifyUploadSettings,
  onSubmitSquareUploadSettings,
}) => {
  const departmentsWithIds = departments.map((department, index) => ({
    label: department,
    value: index,
  }));
  const uploadSettings = businesses[businessIndex].uploadSettings;

  return (
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
        <div style={{ width: 300 }}>
          <h1 className={styles.label}>Upload</h1>
          <Tabs defaultActiveKey="Shopify">
            <Tab eventKey="Shopify" title="Shopify">
              <Formik
                enableReinitialize
                initialValues={
                  {
                    includeTags: (
                      uploadSettings.shopify?.includeTags || []
                    ).join(", "),
                    excludeTags: (
                      uploadSettings.shopify?.excludeTags || []
                    ).join(", "),
                    departmentMapping:
                      uploadSettings.shopify?.departmentMapping || [],
                  } as ShopifyUpdateUploadSettingsRequest
                }
                onSubmit={onSubmitShopifyUploadSettings}
                validate={async (values) => {
                  const errors: { [key: string]: string } = {};
                  try {
                    await ShopifyUpdateUploadSettingsSchema.validate(values, {
                      abortEarly: false,
                    });
                  } catch (e) {
                    e.inner.forEach((err: yup.ValidationError) => {
                      errors[`${err.path}`] = err.message;
                    });
                  }
                  return errors;
                }}
              >
                {({
                  isSubmitting,
                  errors,
                  values,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                }) => (
                  <Form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
                    <Stack direction="row" spacing={36}>
                      <Stack direction="column" style={{ width: 300 }}>
                        <Form.Group>
                          <Label description="When uploading products from Shopify, we will only upload products with at least one of the include tags. By default, we will include all products">
                            Tags to Include (comma list)
                          </Label>
                          <InputGroup>
                            <FormControl
                              as="textarea"
                              aria-label="Tags to Include"
                              aria-details="Enter tags to include here"
                              id="includeTags"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="feature,in-stock,..."
                              type="text"
                              value={values.includeTags || ""}
                            />
                          </InputGroup>
                          <div
                            style={{
                              textAlign: "right",
                              color:
                                (values.includeTags?.length || 0) > 255
                                  ? "red"
                                  : "black",
                            }}
                          >{`${values.includeTags?.length || 0}/255`}</div>
                          <ErrorMessage name="includeTags" />
                        </Form.Group>
                        <Form.Group>
                          <Label description="When uploading products from Shopify, we will exclude products with at least one of the exclusion tags. If the same tag is added as both an inclusion and exclusion tag, the product will not be uploaded. By default, we will not exclude any products">
                            Tags to Exclude (comma list)
                          </Label>
                          <InputGroup>
                            <FormControl
                              as="textarea"
                              aria-label="Tags to Exclude"
                              aria-details="Enter tags to exclude here"
                              id="excludeTags"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="out-of-stock,unavailable,..."
                              type="text"
                              value={values.excludeTags || ""}
                            />
                          </InputGroup>
                          <div
                            style={{
                              textAlign: "right",
                              color:
                                (values.excludeTags?.length || 0) > 255
                                  ? "red"
                                  : "black",
                            }}
                          >{`${values.excludeTags?.length || 0}/255`}</div>
                          <ErrorMessage name="excludeTags" />
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
                      </Stack>
                      <Stack direction="column">
                        <Label description="Assign departments to your Shopify product types so your products will be assigned to the right departments. By default, no departments will be assigned to your products">
                          Department Mapping
                        </Label>
                        {[
                          ...(values.departmentMapping || []),
                          { key: "", departments: [] },
                        ].map((value, index) => {
                          return (
                            <Stack direction="column" key={index}>
                              <Stack
                                direction="row"
                                rowAlign="flex-end"
                                spacing={12}
                              >
                                <Form.Group>
                                  <Label className={styles["sub-label"]}>
                                    {`Product Type ${index + 1}`}
                                  </Label>
                                  <InputGroup>
                                    <FormControl
                                      aria-required
                                      aria-label={`Product Type ${index}`}
                                      aria-details="Enter product type here"
                                      id={`departmentMapping[${index}].key`}
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      placeholder="e.g. cookies"
                                      type="text"
                                      value={value.key}
                                      style={{ width: 250 }}
                                    />
                                  </InputGroup>
                                  <ErrorMessage
                                    name={`departmentMapping[${index}].key`}
                                  />
                                </Form.Group>
                                <Form.Group>
                                  <Label className={styles["sub-label"]}>
                                    Departments
                                  </Label>
                                  <InputGroup>
                                    <Select
                                      isClearable
                                      isMulti
                                      isSearchable
                                      searchable
                                      clearable
                                      onChange={(newValues) => {
                                        setFieldValue(
                                          `departmentMapping[${index}].departments`,
                                          newValues.map(
                                            (value: any) => value.label
                                          ),
                                          true
                                        );
                                      }}
                                      options={departmentsWithIds}
                                      value={(value.departments || []).map(
                                        (department) => ({
                                          label: department,
                                        })
                                      )}
                                      styles={{
                                        container: (obj) => ({
                                          ...obj,
                                          width: 300,
                                        }),
                                      }}
                                    />
                                  </InputGroup>
                                </Form.Group>
                                {index <
                                  (values.departmentMapping?.length || 0) && (
                                  <Stack direction="column-reverse">
                                    <div style={{ height: "1rem" }} />
                                    <Button
                                      variant="danger"
                                      onClick={() => {
                                        setFieldValue(
                                          "departmentMapping",
                                          [
                                            ...(
                                              values.departmentMapping || []
                                            ).slice(0, index),
                                            ...(
                                              values.departmentMapping || []
                                            ).slice(index + 1),
                                          ],
                                          true
                                        );
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                )}
                              </Stack>
                              {(() => {
                                const keyError =
                                  //@ts-ignore
                                  errors[`departmentMapping[${index}].key`];
                                const departmentsError =
                                  //@ts-ignore
                                  errors[
                                    `departmentMapping[${index}].departments`
                                  ];
                                let err = "";
                                if (keyError && !departmentsError) {
                                  err = "Incomplete product type";
                                } else if (!keyError && departmentsError) {
                                  err = "Incomplete departments";
                                } else if (keyError && departmentsError) {
                                  err =
                                    "Empty mapping. If intended, please delete this row";
                                }
                                if (err) {
                                  return (
                                    <div style={{ color: "red" }}>{err}</div>
                                  );
                                }
                                return <div />;
                              })()}
                            </Stack>
                          );
                        })}
                        <Stack direction="row-reverse">
                          <SubmitButton
                            text="Update"
                            submittingText="Updating..."
                            isSubmitting={isSubmitting}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Tab>
            <Tab eventKey="Etsy" title="Etsy">
              <Formik
                enableReinitialize
                initialValues={
                  {
                    includeTags: (uploadSettings.etsy?.includeTags || []).join(
                      ", "
                    ),
                    excludeTags: (uploadSettings.etsy?.excludeTags || []).join(
                      ", "
                    ),
                  } as EtsyUpdateUploadSettingsRequest
                }
                onSubmit={onSubmitEtsyUploadSettings}
                validationSchema={EtsyUpdateUploadSettingsSchema}
              >
                {({
                  isSubmitting,
                  values,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                }) => (
                  <Form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
                    <Stack direction="column" style={{ width: 300 }}>
                      <Form.Group>
                        <Label description="When uploading products from Etsy, we will only upload products with at least one of the include tags. By default, we will include all products">
                          Tags to Include (comma list)
                        </Label>
                        <InputGroup>
                          <FormControl
                            as="textarea"
                            aria-label="Tags to Include"
                            aria-details="Enter tags to include here"
                            id="includeTags"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="feature,in-stock,..."
                            type="text"
                            value={values.includeTags || ""}
                          />
                        </InputGroup>
                        <div
                          style={{
                            textAlign: "right",
                            color:
                              (values.includeTags?.length || 0) > 255
                                ? "red"
                                : "black",
                          }}
                        >{`${values.includeTags?.length || 0}/255`}</div>
                        <ErrorMessage name="includeTags" />
                      </Form.Group>
                      <Form.Group>
                        <Label description="When uploading products from Etsy, we will exclude products with at least one of the exclusion tags. If the same tag is added as both an inclusion and exclusion tag, the product will not be uploaded. By default, we will not exclude any products">
                          Tags to Exclude (comma list)
                        </Label>
                        <InputGroup>
                          <FormControl
                            as="textarea"
                            aria-label="Tags to Exclude"
                            aria-details="Enter tags to exclude here"
                            id="excludeTags"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="out-of-stock,unavailable,..."
                            type="text"
                            value={values.excludeTags || ""}
                          />
                        </InputGroup>
                        <div
                          style={{
                            textAlign: "right",
                            color:
                              (values.excludeTags?.length || 0) > 255
                                ? "red"
                                : "black",
                          }}
                        >{`${values.excludeTags?.length || 0}/255`}</div>
                        <ErrorMessage name="excludeTags" />
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
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Tab>
            <Tab eventKey="Square" title="Square">
              <Formik
                enableReinitialize
                initialValues={
                  {
                    includeTags: (
                      uploadSettings.square?.includeTags || []
                    ).join(", "),
                    excludeTags: (
                      uploadSettings.square?.excludeTags || []
                    ).join(", "),
                    departmentMapping:
                      uploadSettings.square?.departmentMapping || [],
                  } as SquareUpdateUploadSettingsRequest
                }
                onSubmit={onSubmitSquareUploadSettings}
                validate={async (values) => {
                  const errors: { [key: string]: string } = {};
                  try {
                    await SquareUpdateUploadSettingsSchema.validate(values, {
                      abortEarly: false,
                    });
                  } catch (e) {
                    e.inner.forEach((err: yup.ValidationError) => {
                      errors[`${err.path}`] = err.message;
                    });
                  }
                  return errors;
                }}
              >
                {({
                  isSubmitting,
                  errors,
                  values,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                }) => (
                  <Form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
                    <Stack direction="row" spacing={36}>
                      <Stack direction="column" style={{ width: 300 }}>
                        <Form.Group>
                          <Label description="When uploading products from Square, we will only upload products with at least one of the include tags. By default, we will include all products">
                            Tags to Include (comma list)
                          </Label>
                          <InputGroup>
                            <FormControl
                              as="textarea"
                              aria-label="Tags to Include"
                              aria-details="Enter tags to include here"
                              id="includeTags"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="feature,in-stock,..."
                              type="text"
                              value={values.includeTags || ""}
                            />
                          </InputGroup>
                          <div
                            style={{
                              textAlign: "right",
                              color:
                                (values.includeTags?.length || 0) > 255
                                  ? "red"
                                  : "black",
                            }}
                          >{`${values.includeTags?.length || 0}/255`}</div>
                          <ErrorMessage name="includeTags" />
                        </Form.Group>
                        <Form.Group>
                          <Label description="When uploading products from Square, we will exclude products with at least one of the exclusion tags. If the same tag is added as both an inclusion and exclusion tag, the product will not be uploaded. By default, we will not exclude any products">
                            Tags to Exclude (comma list)
                          </Label>
                          <InputGroup>
                            <FormControl
                              as="textarea"
                              aria-label="Tags to Exclude"
                              aria-details="Enter tags to exclude here"
                              id="excludeTags"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="out-of-stock,unavailable,..."
                              type="text"
                              value={values.excludeTags || ""}
                            />
                          </InputGroup>
                          <div
                            style={{
                              textAlign: "right",
                              color:
                                (values.excludeTags?.length || 0) > 255
                                  ? "red"
                                  : "black",
                            }}
                          >{`${values.excludeTags?.length || 0}/255`}</div>
                          <ErrorMessage name="excludeTags" />
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
                      </Stack>
                      <Stack direction="column">
                        <Label description="Assign departments to your Square product types so your products will be assigned to the right departments. By default, no departments will be assigned to your products">
                          Department Mapping
                        </Label>
                        {[
                          ...(values.departmentMapping || []),
                          { key: "", departments: [] },
                        ].map((value, index) => {
                          return (
                            <Stack direction="column" key={index}>
                              <Stack
                                direction="row"
                                rowAlign="flex-end"
                                spacing={12}
                              >
                                <Form.Group>
                                  <Label className={styles["sub-label"]}>
                                    {`Category ${index + 1}`}
                                  </Label>
                                  <InputGroup>
                                    <FormControl
                                      aria-required
                                      aria-label={`Category ${index}`}
                                      aria-details="Enter category here"
                                      id={`departmentMapping[${index}].key`}
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      placeholder="e.g. cookies"
                                      type="text"
                                      value={value.key}
                                      style={{ width: 250 }}
                                    />
                                  </InputGroup>
                                  <ErrorMessage
                                    name={`departmentMapping[${index}].key`}
                                  />
                                </Form.Group>
                                <Form.Group>
                                  <Label className={styles["sub-label"]}>
                                    Departments
                                  </Label>
                                  <InputGroup>
                                    <Select
                                      isClearable
                                      isMulti
                                      isSearchable
                                      searchable
                                      clearable
                                      onChange={(newValues) => {
                                        setFieldValue(
                                          `departmentMapping[${index}].departments`,
                                          newValues.map(
                                            (value: any) => value.label
                                          ),
                                          true
                                        );
                                      }}
                                      options={departmentsWithIds}
                                      value={(value.departments || []).map(
                                        (department) => ({
                                          label: department,
                                        })
                                      )}
                                      styles={{
                                        container: (obj) => ({
                                          ...obj,
                                          width: 300,
                                        }),
                                      }}
                                    />
                                  </InputGroup>
                                </Form.Group>
                                {index <
                                  (values.departmentMapping?.length || 0) && (
                                  <Stack direction="column-reverse">
                                    <div style={{ height: "1rem" }} />
                                    <Button
                                      variant="danger"
                                      onClick={() => {
                                        setFieldValue(
                                          "departmentMapping",
                                          [
                                            ...(
                                              values.departmentMapping || []
                                            ).slice(0, index),
                                            ...(
                                              values.departmentMapping || []
                                            ).slice(index + 1),
                                          ],
                                          true
                                        );
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                )}
                              </Stack>
                              {(() => {
                                const keyError =
                                  //@ts-ignore
                                  errors[`departmentMapping[${index}].key`];
                                const departmentsError =
                                  //@ts-ignore
                                  errors[
                                    `departmentMapping[${index}].departments`
                                  ];
                                let err = "";
                                if (keyError && !departmentsError) {
                                  err = "Incomplete category";
                                } else if (!keyError && departmentsError) {
                                  err = "Incomplete departments";
                                } else if (keyError && departmentsError) {
                                  err =
                                    "Empty mapping. If intended, please delete this row";
                                }
                                if (err) {
                                  return (
                                    <div style={{ color: "red" }}>{err}</div>
                                  );
                                }
                                return <div />;
                              })()}
                            </Stack>
                          );
                        })}
                        <Stack direction="row-reverse">
                          <SubmitButton
                            text="Update"
                            submittingText="Updating..."
                            isSubmitting={isSubmitting}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Tab>
          </Tabs>
        </div>
      </Stack>
    </Stack>
  );
};

export default Settings;
