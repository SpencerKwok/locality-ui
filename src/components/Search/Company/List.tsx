import React from "react";
import styled from "styled-components";
import ListGroup from "react-bootstrap/ListGroup";
import { Product } from "../../../common/rpc/Schema";
import { decode } from "html-entities";

import Stack from "../../../common/components/Stack/Stack";

const StyledListItem = styled(ListGroup.Item)`
  background: none;
  border: none;
  padding: 0px 0px 0px 0px;
  outline: none;
`;

export interface CompanyListProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  companies: Map<string, number>;
  selectedCompanies: Set<string>;
  onCompanyClick: (name: string) => void;
}

function CompanyList(props: CompanyListProps) {
  const companies = Array.from(props.companies, ([name, value]) => ({
    name,
    value,
  }));
  companies.sort((a, b) => b.value - a.value);

  const companyRowRenderer = ({
    name,
    value,
  }: {
    name: string;
    value: number;
  }) => {
    return (
      <StyledListItem key={name}>
        <Stack direction="row" spacing={12}>
          <input
            type="checkbox"
            checked={props.selectedCompanies.has(name)}
            onClick={() => props.onCompanyClick(name)}
          />
          <span>{`${decode(name)} (${value})`}</span>
        </Stack>
      </StyledListItem>
    );
  };

  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ ...props.style, width: 260 }}
    >
      <h4>Companies</h4>
      <ListGroup>
        {companies.map((company) => companyRowRenderer(company))}
      </ListGroup>
    </Stack>
  );
}

export default CompanyList;
