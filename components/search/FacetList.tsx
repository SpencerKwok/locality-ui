import { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { decode } from "html-entities";

import Arrow from "../common/images/Arrow";
import Stack from "../common/Stack";
import styles from "./FacetList.module.css";

export interface FacetListProps {
  showAll: boolean;
  name: string;
  facets: Map<string, number>;
  selectedFacets: Set<string>;
  onFacetClick: (name: string) => void;
  toggleShowAll: () => void;
}

export default function FacetList({
  showAll,
  name,
  facets,
  selectedFacets,
  onFacetClick,
  toggleShowAll,
}: FacetListProps) {
  const sortedFacets = Array.from(facets, ([name, value]) => ({
    name,
    value,
  }));

  const facetRowRenderer = ({
    name,
    value,
  }: {
    name: string;
    value: number;
  }) => {
    return (
      <ListGroup.Item className={styles["list-item"]} key={name}>
        <Stack direction="row" spacing={12}>
          <input
            type="checkbox"
            checked={selectedFacets.has(name)}
            onChange={() => onFacetClick(name)}
          />
          <span>{`${decode(name)} (${value})`}</span>
        </Stack>
      </ListGroup.Item>
    );
  };

  return (
    <Stack direction="column" rowAlign="flex-start" style={{ width: 260 }}>
      <h4>{name}</h4>
      <ListGroup>
        {sortedFacets
          .slice(0, showAll ? sortedFacets.length : 8)
          .map((facet) => facetRowRenderer(facet))}
      </ListGroup>
      {sortedFacets.length > 8 && (
        <Stack direction="row" spacing={8}>
          <Arrow
            className={styles[showAll ? "up-arrow" : "down-arrow"]}
            width={8}
          />
          {showAll ? (
            <a className="" onClick={() => toggleShowAll()}>
              Show Less
            </a>
          ) : (
            <a className="" onClick={() => toggleShowAll()}>
              Show All {sortedFacets.length} {name}
            </a>
          )}
        </Stack>
      )}
    </Stack>
  );
}
