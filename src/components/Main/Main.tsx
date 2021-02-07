import React from "react";
import { ReactSVG } from "react-svg";

import Search from "../Search/Search";
import Stack from "../Stack/Stack";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {}

function Main(props: MainProps) {
  return (
    <Stack direction="horizontal" columnAlign="center">
      <div>
        <div style={{ width: 500, margin: "auto" }}>
          <ReactSVG src="./locality-logo.svg" alt="Locality Logo" />
        </div>
        <Search />
      </div>
    </Stack>
  );
}

export default Main;
