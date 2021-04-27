import React from "react";
import { useRouter } from "next/router";

import Stack from "../common/Stack";
import SearchBar from "./SearchBar";
import LocalityLogo from "../common/images/LocalityLogo";
import { useWindowSize } from "../../lib/common";

export default function Search() {
  const router = useRouter();
  const size = useWindowSize();
  if (!size.width) {
    return <div></div>;
  }

  const onEnter = (query: string) => {
    router.push(`/search?q=${query}`);
  };

  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center">
        <LocalityLogo width={280} style={{ padding: "12px 24px 24px 24px" }} />
        <SearchBar
          autoFocus
          width={Math.min(size.width * 0.6, 584)}
          onEnter={onEnter}
        />
      </Stack>
    </Stack>
  );
}
