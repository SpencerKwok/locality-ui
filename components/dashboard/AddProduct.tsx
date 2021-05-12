import { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import Stack from "../common/Stack";
import styles from "./AddProduct.module.css";

export interface AddProductProps extends React.HTMLProps<HTMLDivElement> {
  error: boolean;
  open: boolean;
  loading: boolean;
  successful: boolean;
  onAddProduct: () => void;
  onShopifyUpload: () => void;
}

function AddProduct({
  error,
  open,
  loading,
  successful,
  onAddProduct,
  onShopifyUpload,
}: AddProductProps) {
  const [uploadType, setUploadType] = useState("Select Upload Type");

  return (
    <Stack direction="column" spacing={12}>
      <Stack
        direction="row"
        columnAlign="flex-start"
        priority={[1, 0]}
        spacing={12}
      >
        <Dropdown>
          <Dropdown.Toggle
            className={styles.dropdown}
            variant="primary"
            style={{ width: "100%" }}
          >
            {uploadType}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                setUploadType("Shopify");
              }}
            >
              Shopify
            </Dropdown.Item>
            <Dropdown.Item
              disabled={true}
              onClick={() => {
                setUploadType("Etsy");
              }}
            >
              Etsy (Coming soon)
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Popup
          modal
          closeOnDocumentClick={error}
          closeOnEscape={error}
          open={open}
          trigger={
            <Button
              className={styles.button}
              disabled={uploadType === "Select Upload Type"}
            >
              Upload
            </Button>
          }
          onOpen={onShopifyUpload}
        >
          {() => (
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              height={400}
              style={{ margin: 24 }}
            >
              {error && (
                <p color="red">
                  Error occurred when uploading Shopify data. Please make sure
                  your Shopify website is setup correctly in the "Business" tab
                  or contact us at locality.info@yahoo.com for assistance
                </p>
              )}
              {loading && (
                <Stack direction="column" rowAlign="center" spacing={24}>
                  <h3>Uploading Shopify data...</h3>
                  <div className={styles["animated-circular-border"]} />
                </Stack>
              )}
              {successful && (
                <Stack direction="column" rowAlign="center" spacing={24}>
                  <h3>Upload complete!</h3>
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
        style={{ width: 300 }}
      >
        Add Product
      </Button>
    </Stack>
  );
}

export default AddProduct;
