import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import Stack from "components/common/Stack";
import styles from "components/common/popups/Popup.module.css";

import type { FC, ReactElement } from "react";

const NewUser: FC<{}> = () => {
  return (
    <Popup modal open={true}>
      {(close: () => void): ReactElement => (
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
              Use the search bar to find products from locally owned small
              businesses near you!
            </p>
          </Stack>
        </Stack>
      )}
    </Popup>
  );
};

export default NewUser;
