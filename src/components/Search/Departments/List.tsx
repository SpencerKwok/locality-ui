import React from "react";
import styled from "styled-components";
import { ListGroup } from "react-bootstrap";
import { Product } from "../../../common/rpc/Schema";
import { decode } from "html-entities";

import Stack from "../../../common/components/Stack/Stack";

const StyledListItem = styled(ListGroup.Item)`
  background: none;
  border: none;
  padding: 0px 0px 0px 0px;
  outline: none;
`;

export interface DepartmentListProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  departments: Map<string, number>;
  selectedDepartments: Set<string>;
  onDepartmentClick: (name: string) => void;
}

function DepartmentList(props: DepartmentListProps) {
  const departments = Array.from(props.departments, ([name, value]) => ({
    name,
    value,
  }));
  departments.sort((a, b) => b.value - a.value);

  const departmentRowRenderer = ({
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
            checked={props.selectedDepartments.has(name)}
            onClick={() => props.onDepartmentClick(name)}
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
      style={props.style}
      width={260}
    >
      <h4>Departments</h4>
      <ListGroup>
        {departments.map((department) => departmentRowRenderer(department))}
      </ListGroup>
    </Stack>
  );
}

export default DepartmentList;
