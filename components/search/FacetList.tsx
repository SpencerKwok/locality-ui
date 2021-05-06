import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { decode } from "html-entities";

import Stack from "../common/Stack";
import styles from "./FacetList.module.css";

export interface FacetListProps {
  name: string;
  facets: Map<string, number>;
  selectedFacets: Set<string>;
  onFacetClick: (name: string) => void;
}

export default function FacetList({
  name,
  facets,
  selectedFacets,
  onFacetClick,
}: FacetListProps) {
  const sortedFacets = Array.from(facets, ([name, value]) => ({
    name,
    value,
  }));
  sortedFacets.sort((a, b) => b.value - a.value);

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
        {sortedFacets.map((facet) => facetRowRenderer(facet))}
      </ListGroup>
    </Stack>
  );
}
