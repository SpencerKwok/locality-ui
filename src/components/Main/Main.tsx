import React from "react";
import { ReactComponent as LocalityLogo } from "./locality-logo.svg";

import { Search, GeolocationSearch } from "../Search/Search";
import Stack from "../../common/components/Stack/Stack";
import Window from "../../utils/window";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
}

function Main(props: MainProps) {
  const windowSize = Window();

  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center">
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
            <GeolocationSearch query={props.query} width={windowSize.width} />
          ) : (
            <Search query={props.query} width={windowSize.width} />
          )}
        </main>
      </Stack>
    </Stack>
  );
}

export default Main;
