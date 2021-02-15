import React from "react";
import { ReactComponent as LocalityLogo } from "./locality-logo.svg";

import { Search, GeolocationSearch } from "../Search/Search";
import Stack from "../Stack/Stack";
import Window from "../../utils/window";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
}

function Main(props: MainProps) {
  const windowSize = Window();

  return (
    <main>
      <Stack direction="horizontal" columnAlign="center">
        <Stack direction="vertical" rowAlign="center">
          <header
            style={{
              width: windowSize.width,
              maxWidth: 500,
              margin: "auto",
              overflow: "hidden",
            }}
          >
            <LocalityLogo />
          </header>
          <main>
            {props.query ? (
              <GeolocationSearch query={props.query} />
            ) : (
              <Search query={props.query} />
            )}
          </main>
        </Stack>
      </Stack>
    </main>
  );
}

export default Main;
