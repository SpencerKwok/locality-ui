import ListGroup from "react-bootstrap/ListGroup";
import { decode } from "html-entities";

import Arrow from "components/common/images/Arrow";
import Stack from "components/common/Stack";
import styles from "components/search/FacetList.module.css";

import type { FC, JSXElementConstructor, ReactElement } from "react";
import type { ListGroupItemProps } from "react-bootstrap/ListGroupItem";

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
    ListGroupItemProps,
    JSXElementConstructor<ListGroupItemProps>
  > => {
    return (
      <ListGroup.Item className={styles["list-item"]} key={name}>
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
