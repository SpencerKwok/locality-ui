import React from "react";
import { ReactSVG } from "react-svg";

import Search from "../Search/Search";
import Stack from "../Stack/Stack";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
}

function Main(props: MainProps) {
  return (
    <Stack direction="horizontal" columnAlign="center">
      <Stack direction="vertical" rowAlign="center">
        <div style={{ width: 500, margin: "auto" }}>
          <ReactSVG src="./locality-logo.svg" alt="Locality Logo" />
        </div>
        <Search query={props.query} style={{ marginTop: "-24px" }} />
      </Stack>
    </Stack>
  );
}

export default Main;
