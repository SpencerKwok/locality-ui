import { CSSProperties, useState } from "react";
import { useRouter } from "next/router";

import MagnifyingGlass from "components/common/images/MagnifyingGlass";
import Stack from "components/common/Stack";
import styles from "components/search/SearchBar.module.css";

import type { FC } from "react";

export interface MiniSearchProps {
  style?: CSSProperties;
  width: number;
}

const MiniSearch: FC<MiniSearchProps> = ({ style, width }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onEnter = (): void => {
    void router.push({
      pathname: "/search",
      query: { q: encodeURIComponent(query) },
    });
  };

  return (
    <Stack direction="row" className={styles.search} style={style}>
      <input
        className={styles["search-input"]}
        placeholder="Search for local products or businesses"
        onChange={(e): void => {
          setQuery(e.target.value);
        }}
        onKeyPress={(e): void => {
          e.key === "Enter" && onEnter();
        }}
        style={{ width }}
        value={query}
      />
      <MagnifyingGlass
        height={40}
        width={40}
        style={{ cursor: "pointer", marginTop: -1, marginRight: -1 }}
        onClick={onEnter}
      />
    </Stack>
  );
};
export default MiniSearch;
