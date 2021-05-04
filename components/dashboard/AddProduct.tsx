import Button from "react-bootstrap/Button";
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
  return (
    <Stack direction="row" columnAlign="flex-start" spacing={12}>
      <Popup
        modal
        closeOnDocumentClick={error}
        closeOnEscape={error}
        open={open}
        trigger={<Button className={styles.button}>Upload from Shopify</Button>}
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
                your homepage is correct or contact us at
                locality.info@yahoo.com
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
      <Button className={styles.button} onClick={onAddProduct}>
        Add Product
      </Button>
    </Stack>
  );
}

export default AddProduct;
