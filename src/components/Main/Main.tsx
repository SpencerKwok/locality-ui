import React from "react";

import { Search, GeolocationSearch } from "../Search/Search";
import Stack from "../../common/components/Stack/Stack";

export interface MainProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
  width: number;
}

function Main(props: MainProps) {
  return (
    <main>
      {props.query ? (
        <GeolocationSearch query={props.query} width={props.width} />
      ) : (
        <Search query={props.query} width={props.width} />
      )}
    </main>
  );
}

export default Main;
