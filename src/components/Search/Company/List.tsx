import React, { CSSProperties } from "react";
import styled from "styled-components";
import { List } from "react-virtualized";
import { ListGroup } from "react-bootstrap";
import { Product } from "../../../common/rpc/Schema";
import { decode } from "html-entities";

import Stack from "../../../common/components/Stack/Stack";

const StyledList = styled(List)`
  border: none;
  outline: none;
`;

const StyledListGroupItem = styled(ListGroup.Item)`
  ${({ active }) =>
    active &&
    "background-color: #3880ae !important; border-color: #3880ae !important"}
  &:hover {
    background-color: #449ed7;
    color: #ffffff;
  }
`;

export interface CompanyListProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  currentCompany: string;
  onCompanyClick: (name: string) => void;
}

function CompanyList(props: CompanyListProps) {
  const numProducts: { [name: string]: number } = {};
  const companies = Array<{ name: string; num: number }>();

  props.hits.forEach(({ company }) => {
    if (company in numProducts) {
      numProducts[company] += 1;
    } else {
      numProducts[company] = 1;
    }
  });

  for (const [name, num] of Object.entries(numProducts)) {
    companies.push({ name, num });
  }

  const companyRowRenderer = ({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    style: CSSProperties;
  }) => {
    return (
      <div key={key} style={style}>
        {index === 0 ? (
          <StyledListGroupItem
            active={companies[index].name === props.currentCompany}
            style={{ height: 48 }}
            onClick={() => {
              props.onCompanyClick(decode(companies[index].name));
            }}
          >
            {`${decode(companies[index].name)} (${companies[index].num})`}
          </StyledListGroupItem>
        ) : (
          <StyledListGroupItem
            active={companies[index].name === props.currentCompany}
            style={{ height: 48, borderTop: "none" }}
            onClick={() => {
              props.onCompanyClick(decode(companies[index].name));
            }}
          >
            {`${decode(companies[index].name)} (${companies[index].num})`}
          </StyledListGroupItem>
        )}
      </div>
    );
  };

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <h4>Companies</h4>
      <StyledList
        width={300}
        height={400}
        rowHeight={48}
        rowRenderer={companyRowRenderer}
        rowCount={companies.length}
      />
    </Stack>
  );
}

export default CompanyList;
