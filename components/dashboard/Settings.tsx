import dynamic from "next/dynamic";
import * as yup from "yup";
import { Formik } from "formik";
import { decode } from "html-entities";

import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { InputGroup, Label, SubmitButton, ErrorMessage } from "../common/form";
import Stack from "../common/Stack";
import styles from "./Settings.module.css";

import type { FC } from "react";
import type { BaseBusiness, UploadTypeSettings } from "../common/Schema";
import type { FormikConfig } from "formik";

const BusinessList = dynamic(() => import("./BusinessList"));

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

export interface UpdateStatus {
  error: string;
  successful: boolean;
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

export interface SettingsProps {
  businesses: Array<BaseBusiness>;
  businessIndex: number;
  updateUploadSettingsStatus: UpdateStatus;
  height: number;
  onBusinessClick: (index: number) => void;
  onSubmitUploadSettings: FormikConfig<UpdateUploadSettingsRequest>["onSubmit"];
}

const Settings: FC<SettingsProps> = ({
  businesses,
  businessIndex,
  updateUploadSettingsStatus,
  height,
  onBusinessClick,
  onSubmitUploadSettings,
}) => {
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
      includeTags: decode(includeTags.filter(Boolean).join(", ")),
      excludeTags: decode(excludeTags.filter(Boolean).join(", ")),
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
  );
};

export default Settings;
