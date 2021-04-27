import React from "react";
import Popup from "reactjs-popup";

import Stack from "../common/Stack";
import styles from "./NewUser.module.css";

export default function NewUser() {
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
            spacing={24}
          >
            <h2>Welcome to Locality!</h2>
            <p>
              Make sure to check out products from locally owned small
              businesses near you!
            </p>
          </Stack>
        </Stack>
      )}
    </Popup>
  );
}
