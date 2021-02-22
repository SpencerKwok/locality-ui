import React from "react";
import { ReactComponent as LocalityLogo } from "./locality-logo.svg";

import { Search, GeolocationSearch } from "../Search/Search";
import Stack from "../../common/components/Stack/Stack";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
  width: number;
}

function Main(props: MainProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center">
        <header
          style={{
            width: props.width,
            maxWidth: 500,
            margin: "auto",
            overflow: "hidden",
          }}
        >
          <LocalityLogo />
        </header>
        <main>
          {props.query ? (
            <GeolocationSearch query={props.query} width={props.width} />
          ) : (
            <Search query={props.query} width={props.width} />
          )}
        </main>
      </Stack>
    </Stack>
  );
}

export default Main;
