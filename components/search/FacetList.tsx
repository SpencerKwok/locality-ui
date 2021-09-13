import { decode } from "html-entities";
import { HTMLAttributes } from "react";

import Arrow from "components/common/images/Arrow";
import Stack from "components/common/Stack";
import styles from "components/search/FacetList.module.css";

import type { FC, JSXElementConstructor, ReactElement } from "react";

export interface FacetListProps {
  showAll: boolean;
  name: string;
  facets: Map<string, number>;
  selectedFacets: Set<string>;
  onFacetClick: (name: string) => void;
  toggleShowAll: () => void;
}

const FacetList: FC<FacetListProps> = ({
  showAll,
  name,
  facets,
  selectedFacets,
  onFacetClick,
  toggleShowAll,
}) => {
  const sortedFacets = Array.from(
    facets,
    ([name, value]): {
      name: string;
      value: number;
    } => ({
      name,
      value,
    })
  );

  const facetRowRenderer = ({
    name,
    value,
  }: {
    name: string;
    value: number;
  }): ReactElement<
    HTMLAttributes<HTMLDivElement>,
    JSXElementConstructor<HTMLAttributes<HTMLDivElement>>
  > => {
    return (
      <div className={styles["list-item"]} key={name}>
        <Stack direction="row" spacing={12}>
          <input
            type="checkbox"
            checked={selectedFacets.has(name)}
            onChange={(): void => {
              onFacetClick(name);
            }}
          />
          <span>{`${decode(name)} (${value})`}</span>
        </Stack>
      </div>
    );
  };

  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      spacing={4}
      style={{ width: 260 }}
    >
      <h3 style={{ marginBottom: 4 }}>{name}</h3>
      <div>
        {sortedFacets
          .slice(0, showAll ? sortedFacets.length : 8)
          .map((facet) => facetRowRenderer(facet))}
      </div>
      {sortedFacets.length > 8 && (
        <Stack direction="row" spacing={8}>
          <Arrow
            className={styles[showAll ? "up-arrow" : "down-arrow"]}
            width={8}
          />
          {showAll ? (
            <a
              className=""
              onClick={(): void => {
                toggleShowAll();
              }}
            >
              Show Less
            </a>
          ) : (
            <a
              className=""
              onClick={(): void => {
                toggleShowAll();
              }}
            >
              Show All {sortedFacets.length} {name}
            </a>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default FacetList;
