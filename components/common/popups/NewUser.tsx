import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import Stack from "components/common/Stack";
import styles from "components/common/popups/Popup.module.css";

import type { FC, JSXElementConstructor, ReactElement } from "react";
import type { StackProps } from "components/common/Stack";

const NewUser: FC<{}> = () => {
  return (
    <Popup modal open={true}>
      {(
        close: () => void
      ): ReactElement<StackProps, JSXElementConstructor<StackProps>> => (
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
              Use the search bar in the top right corner to start searching for
              local products! Also, make sure to download our Chrome extension
              to stay local wherever you go!
            </p>
          </Stack>
        </Stack>
      )}
    </Popup>
  );
};

export default NewUser;
