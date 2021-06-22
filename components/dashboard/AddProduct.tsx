import { Formik } from "formik";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Papa from "papaparse";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import { InputGroup, SubmitButton, ErrorMessage } from "components/common/form";
import { UploadSquareProductsSchema } from "common/ValidationSchema";
import Stack, { StackProps } from "components/common/Stack";
import styles from "components/dashboard/AddProduct.module.css";

import type { FC, ReactElement } from "react";
import type { DropdownItemProps } from "react-bootstrap/esm/DropdownItem";

export type UploadType = "" | "Etsy" | "Shopify" | "Square";

export interface UploadSquareProductsRequest {
  csv: string;
}

export interface AddProductProps extends React.HTMLProps<HTMLDivElement> {
  error: string;
  open: boolean;
  loading: boolean;
  successful: boolean;
  uploadType: UploadType;
  onUploadTypeChange: (uploadType: UploadType) => void;
  onUpload: (uploadType: UploadType, file?: string) => void;
  onAddProduct: () => void;
}

const parseCsv = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Array<string>>(file, {
      complete: (results) => {
        resolve(
          results.data
            .map((value) =>
              value.map((x) => (x.includes(",") ? `"${x}"` : x)).join(",")
            )
            .join("\n")
        );
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

const AddProduct: FC<AddProductProps> = ({
  error,
  open,
  loading,
  successful,
  uploadType,
  onUploadTypeChange,
  onAddProduct,
  onUpload,
}) => {
  return (
    <Stack
      direction="row"
      columnAlign="flex-start"
      priority={[0, 1, 0]}
      spacing={24}
    >
      <Button className={styles.button} onClick={onAddProduct}>
        Add +
      </Button>
      <div />
      <Stack direction="row-reverse" columnAlign="flex-start" spacing={8}>
        <Popup
          modal
          closeOnDocumentClick={!!error || !loading}
          closeOnEscape={!!error || !loading}
          open={open}
          trigger={
            <Button
              className={styles.button}
              disabled={!uploadType}
              style={{ width: "100%" }}
            >
              Upload
            </Button>
          }
          onOpen={(): void => {
            if (uploadType === "Etsy" || uploadType === "Shopify") {
              onUpload(uploadType);
            }
          }}
        >
          {(close: () => void): ReactElement<StackProps> => (
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              height={400}
              style={{ margin: 24 }}
            >
              {uploadType === "Square" && !loading && !successful && (
                <Formik
                  enableReinitialize
                  initialValues={{} as UploadSquareProductsRequest}
                  onSubmit={(value): void => {
                    onUpload(uploadType, value.csv);
                  }}
                  validationSchema={UploadSquareProductsSchema}
                >
                  {({
                    isSubmitting,
                    values,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                  }): JSX.Element => (
                    <Form onSubmit={handleSubmit}>
                      <h3>Instructions</h3>
                      <p>
                        1. Export a CSV file of your Square products as seen{" "}
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href="https://squareup.com/help/us/en/article/5153-import-items-online"
                        >
                          here
                        </a>
                      </p>
                      <Form.Group>
                        <InputGroup>
                          <Form.File
                            required
                            aria-required
                            aria-label="2. Upload your CSV file here:"
                            aria-details='Click the "Choose File" button to upload your CSV file'
                            id="csv"
                            label="2. Upload your CSV file here:"
                            accept=".csv"
                            onBlur={handleBlur}
                            onChange={async (
                              event: React.ChangeEvent<HTMLInputElement>
                            ): Promise<void> => {
                              if (
                                event.target.files &&
                                event.target.files.length > 0
                              ) {
                                const file = event.target.files[0];
                                try {
                                  const csv = await parseCsv(file);
                                  setFieldValue("csv", csv, true);
                                } catch {
                                  setFieldValue("csv", "", true);
                                }
                              } else {
                                setFieldValue("csv", "", true);
                              }
                            }}
                          />
                        </InputGroup>
                        <ErrorMessage name="csv" />
                      </Form.Group>
                      <p>3. Click upload</p>
                      <Stack direction="row-reverse">
                        <SubmitButton
                          text="Upload"
                          submittingText="Uploading..."
                          isSubmitting={isSubmitting}
                          onClick={(): void => {
                            setFieldValue("csv", values.csv || "", true);
                          }}
                        />
                      </Stack>
                    </Form>
                  )}
                </Formik>
              )}
              {error !== "" && <p style={{ textAlign: "center" }}>{error}</p>}
              {!loading && (
                <button className={styles["close-button"]} onClick={close}>
                  &times;
                </button>
              )}
              {loading && (
                <Stack direction="column" rowAlign="center" spacing={24}>
                  <h4>Uploading {uploadType} data...</h4>
                  <div className={styles["animated-circular-border"]} />
                </Stack>
              )}
              {successful && (
                <Stack direction="column" rowAlign="center">
                  <h4 style={{ textAlign: "center" }}>
                    Upload has been queued!
                  </h4>
                  <h6 style={{ marginBottom: 24 }}>
                    Please check back later to see your uploaded products.
                  </h6>
                  <div className={styles["circular-border"]}>
                    <div className={styles.checkmark} />
                  </div>
                </Stack>
              )}
            </Stack>
          )}
        </Popup>
        <Dropdown>
          <Dropdown.Toggle
            className={styles.dropdown}
            variant="primary"
            style={{ width: "100%" }}
          >
            {uploadType === "" ? "Select Upload Type" : uploadType}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {(["Etsy", "Shopify", "Square"] as Array<UploadType>).map(
              (value): ReactElement<DropdownItemProps> => (
                <Dropdown.Item
                  key={value}
                  className={styles["dropdown-item"]}
                  onClick={(): void => {
                    onUploadTypeChange(value);
                  }}
                >
                  {value}
                </Dropdown.Item>
              )
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Stack>
    </Stack>
  );
};

export default AddProduct;
