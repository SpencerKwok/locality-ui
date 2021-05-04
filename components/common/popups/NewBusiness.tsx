import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import Stack from "../Stack";
import styles from "./Popup.module.css";

export default function NewBusiness() {
  return (
    <Popup modal open={true}>
      {(close: () => void) => (
        <Stack
          direction="column"
          rowAlign="center"
          columnAlign="center"
          height={300}
          style={{ margin: 24 }}
        >
          <button className={styles["close-button"]} onClick={close}>
            &times;
          </button>
          <Stack
            direction="column"
            rowAlign="center"
            columnAlign="center"
            style={{ margin: 24 }}
          >
            <h2>You're almost done!</h2>
            <p>
              Make sure to update your company logo and homepage so we can link
              users directly to your storefront!
            </p>
          </Stack>
        </Stack>
      )}
    </Popup>
  );
}
