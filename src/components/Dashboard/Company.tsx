import React, { CSSProperties } from "react";
import { decode } from "html-entities";

import { BaseCompany } from "../../common/rpc/Schema";
import { VirtualList, ListGroupItem } from "../../common/components/List/List";
import Stack from "../../common/components/Stack/Stack";

export interface CompanyProps extends React.HTMLProps<HTMLDivElement> {
  createCompanyOnClick: (index: number) => () => void;
  companies: Array<BaseCompany>;
  height: number;
  index: number;
  width: number;
}

function Company(props: CompanyProps) {
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
          <ListGroupItem
            active={props.index === index}
            onClick={props.createCompanyOnClick(index)}
            style={{ height: 48 }}
          >
            {decode(props.companies[index].name)}
          </ListGroupItem>
        ) : (
          <ListGroupItem
            active={props.index === index}
            onClick={props.createCompanyOnClick(index)}
            style={{ height: 48, borderTop: "none" }}
          >
            {decode(props.companies[index].name)}
          </ListGroupItem>
        )}
      </div>
    );
  };

  return (
    <Stack direction="column" rowAlign="flex-start">
      <h3>Company</h3>
      <VirtualList
        width={props.width}
        height={props.height}
        rowHeight={48}
        rowRenderer={companyRowRenderer}
        rowCount={props.companies.length}
      />
    </Stack>
  );
}

export default Company;
