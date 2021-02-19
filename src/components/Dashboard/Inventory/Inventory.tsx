import React, { CSSProperties, useState, useEffect } from "react";
import styled from "styled-components";
import { Redirect } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { List } from "react-virtualized";
import Cookie from "js-cookie";
import { AllHtmlEntities } from "html-entities";

import InventoryDAO from "./InventoryDAO";
import Stack from "../../../common/components/Stack/Stack";
import {
  BaseCompany,
  BaseProduct,
  EmptyProduct,
  Product,
} from "../../../common/rpc/Schema";
import DescriptionImage from "../../../common/components/Image/DescriptionImage";

export interface InventoryProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
  height: number;
}

const StyledList = styled(List)`
  border: none;
  outline: none;
`;

function Inventory(props: InventoryProps) {
  const [companyIndex, setCompanyIndex] = useState(-1);
  const [productIndex, setProductIndex] = useState(-1);
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);
  const [products, setProducts] = useState<Array<BaseProduct>>([]);
  const [product, setProduct] = useState<Product>(EmptyProduct);

  useEffect(() => {
    InventoryDAO.getInstance()
      .companies({})
      .then(({ companies }) => setCompanies(companies))
      .catch((err) => console.log(err));
  }, []);

  const companyId = Cookie.get("companyId");
  if (!companyId) {
    return <Redirect to="/" />;
  }

  const createCompanyOnClick = (index: number) => {
    return () => {
      setCompanyIndex(index);
      InventoryDAO.getInstance()
        .products({ companyId: companies[index].company_id })
        .then(({ products }) => setProducts(products))
        .catch((err) => console.log(err));
    };
  };

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
        {companyIndex === index ? (
          <ListGroup.Item active onClick={createCompanyOnClick(index)}>
            {AllHtmlEntities.decode(companies[index].name)}
          </ListGroup.Item>
        ) : (
          <ListGroup.Item onClick={createCompanyOnClick(index)}>
            {AllHtmlEntities.decode(companies[index].name)}
          </ListGroup.Item>
        )}
      </div>
    );
  };

  const createProductOnClick = (index: number) => {
    return () => {
      setProductIndex(index);
      InventoryDAO.getInstance()
        .product({
          companyId: companies[companyIndex].company_id,
          productId: products[index].product_id,
        })
        .then(({ product }) => setProduct(product))
        .catch((err) => console.log(err));
    };
  };

  const productRow = (index: number, a: boolean) => {
    return (
      <ListGroup.Item
        active={a}
        onClick={createProductOnClick(index)}
        style={{ height: 92 }}
      >
        <Stack
          direction="column"
          columnAlign="center"
          style={{ height: "100%" }}
        >
          <DescriptionImage
            direction="row"
            src={products[index].image}
            spacing={12}
            columnAlign="flex-start"
            style={{ width: props.width * 0.3 }}
            width={48}
          >
            {AllHtmlEntities.decode(products[index].name)}
          </DescriptionImage>
        </Stack>
      </ListGroup.Item>
    );
  };

  const productRowRenderer = ({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    style: CSSProperties;
  }) => {
    return (
      <Stack
        direction="column"
        key={key}
        rowAlign="flex-start"
        style={{ ...style, height: 92 }}
      >
        {productRow(index, productIndex === index)}
      </Stack>
    );
  };

  return (
    <Stack
      direction="row"
      columnAlign="flex-start"
      spacing={12}
      style={{ marginTop: 12 }}
    >
      <Stack direction="column" rowAlign="flex-start">
        <h3>Company</h3>
        <StyledList
          width={props.width * 0.3}
          height={props.height - 200}
          rowHeight={48}
          rowRenderer={companyRowRenderer}
          rowCount={companies.length}
        />
      </Stack>
      <Stack direction="column" rowAlign="flex-start">
        <h3>Products</h3>
        <StyledList
          width={props.width * 0.3}
          height={props.height - 200}
          rowHeight={91}
          rowRenderer={productRowRenderer}
          rowCount={products.length}
        />
      </Stack>
      <Stack direction="column" rowAlign="flex-start">
        <h3>Information</h3>
        {JSON.stringify(product)}
      </Stack>
    </Stack>
  );
}

export default Inventory;
