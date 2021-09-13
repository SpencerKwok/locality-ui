import { Formik } from "formik";
import Button from "components/common/button/Button";
import Papa from "papaparse";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
  SubmitButton,
} from "components/common/form";
import { UploadSquareProductsSchema } from "common/ValidationSchema";
import Stack, { StackProps } from "components/common/Stack";
import styles from "components/dashboard/AddProduct.module.css";

import type { FC, JSXElementConstructor, ReactElement } from "react";

export type UploadType = "" | "etsy" | "shopify" | "square";

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
      rowAlign="center"
      priority={[0, 1, 0]}
      spacing={24}
    >
      <Button
        variant="dark"
        className={styles["button"]}
        onClick={onAddProduct}
      >
        Add +
      </Button>
      <div />
      <Stack
        direction="row-reverse"
        columnAlign="flex-start"
        rowAlign="flex-start"
        spacing={8}
      >
        <Popup
          modal
          closeOnDocumentClick={!!error || !loading}
          closeOnEscape={!!error || !loading}
          open={open}
          trigger={
            <Button
              variant="dark"
              className={styles["button"]}
              disabled={!uploadType}
              style={{ width: "100%" }}
            >
              Upload
            </Button>
          }
          onOpen={(): void => {
            if (uploadType === "etsy" || uploadType === "shopify") {
              onUpload(uploadType);
            }
          }}
        >
          {(
            close: () => void
          ): ReactElement<StackProps, JSXElementConstructor<StackProps>> => (
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              height={400}
              style={{ margin: 24 }}
            >
              {uploadType === "square" && !loading && !successful && (
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
                    <form onSubmit={handleSubmit}>
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
                      <FormGroup>
                        <InputGroup>
                          <Input
                            required
                            aria-required
                            aria-label="2. Upload your CSV file here:"
                            aria-details='Click the "Choose File" button to upload your CSV file'
                            id="csv"
                            type="file"
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
                      </FormGroup>
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
                    </form>
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
        <select
          className={styles["select"]}
          onClick={(ev): void => {
            onUploadTypeChange(ev.currentTarget.value as UploadType);
          }}
        >
          <option
            value=""
            onClick={(): void => {
              onUploadTypeChange("");
            }}
          >
            Select Upload Type
          </option>
          <option
            value="etsy"
            onClick={(): void => {
              onUploadTypeChange("etsy");
            }}
          >
            Etsy
          </option>
          <option
            value="shopify"
            onClick={(): void => {
              onUploadTypeChange("shopify");
            }}
          >
            Shopify
          </option>
          <option
            value="square"
            onClick={(): void => {
              onUploadTypeChange("square");
            }}
          >
            Square
          </option>
        </select>
      </Stack>
    </Stack>
  );
};

export default AddProduct;
