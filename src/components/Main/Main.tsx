import React, { useState } from "react";
import Popup from "reactjs-popup";

import { CloseButton } from "../../common/components/Popup/Popup";
import { Search, GeolocationSearch } from "../Search/Search";
import Stack from "../../common/components/Stack/Stack";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
  width: number;
}

function Main(props: MainProps) {
  const [newUser, setNewUser] = useState(false);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const isNewUser = urlParams.get("newUser") ? true : false;
  if (isNewUser !== newUser) {
    setNewUser(isNewUser);
  }

  return (
    <main>
      {newUser && (
        <Popup modal open={true}>
          {(close: () => void) => (
            <Stack
              direction="column"
              rowAlign="center"
              columnAlign="center"
              height={300}
              style={{ margin: 24 }}
            >
              <CloseButton onClick={close}>&times;</CloseButton>
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
      )}
      {props.query ? (
        <GeolocationSearch query={props.query} width={props.width} />
      ) : (
        <Search query={props.query} width={props.width} />
      )}
    </main>
  );
}

export default Main;
