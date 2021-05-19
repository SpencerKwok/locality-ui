import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import Stack from "../common/Stack";
import styles from "./AddProduct.module.css";

export type UploadType = "" | "Shopify" | "Etsy";

export interface AddProductProps extends React.HTMLProps<HTMLDivElement> {
  error: string;
  open: boolean;
  loading: boolean;
  successful: boolean;
  uploadType: UploadType;
  onUploadTypeChange: (uploadType: UploadType) => void;
  onUpload: (uploadType: UploadType) => void;
  onAddProduct: () => void;
}

function AddProduct({
  error,
  open,
  loading,
  successful,
  uploadType,
  width,
  onUploadTypeChange,
  onAddProduct,
  onUpload,
}: AddProductProps) {
  return (
    <Stack direction="column" spacing={12}>
      <Stack
        direction="row"
        columnAlign="flex-start"
        priority={[2, 1]}
        spacing={12}
      >
        <Dropdown>
          <Dropdown.Toggle
            className={styles.dropdown}
            variant="primary"
            style={{ width: "100%" }}
          >
            {uploadType === "" ? "Select Upload Type" : uploadType}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => {
                onUploadTypeChange("Shopify");
              }}
            >
              Shopify
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => {
                onUploadTypeChange("Etsy");
              }}
            >
              Etsy
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Popup
          modal
          closeOnDocumentClick={error !== "" || successful}
          closeOnEscape={error !== "" || successful}
          open={open}
          trigger={
            <Button
              className={styles.button}
              disabled={uploadType === ""}
              style={{ width: "100%" }}
            >
              Upload
            </Button>
          }
          onOpen={() => {
            onUpload(uploadType);
          }}
        >
          {() => (
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              height={400}
              style={{ margin: 24 }}
            >
              {error !== "" && <p color="red">{error}</p>}
              {loading && (
                <Stack direction="column" rowAlign="center" spacing={24}>
                  <h4>
                    Uploading {uploadType} data (may take several minutes)...
                  </h4>
                  <div className={styles["animated-circular-border"]} />
                </Stack>
              )}
              {successful && (
                <Stack direction="column" rowAlign="center" spacing={24}>
                  <h4>
                    Upload has been queued! Please check back later to see your
                    uploaded products.
                  </h4>
                  <div className={styles["circular-border"]}>
                    <div className={styles.checkmark} />
                  </div>
                </Stack>
              )}
            </Stack>
          )}
        </Popup>
      </Stack>
      <Button
        className={styles.button}
        onClick={onAddProduct}
        style={{ width: width }}
      >
        Add Product
      </Button>
    </Stack>
  );
}

export default AddProduct;
