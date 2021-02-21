import React, { CSSProperties, useState, useEffect } from "react";
import * as yup from "yup";
import styled from "styled-components";
import { Redirect } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { List } from "react-virtualized";
import Cookie from "js-cookie";
import { decode } from "html-entities";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";

import InventoryDAO from "./InventoryDAO";
import Stack from "../../../common/components/Stack/Stack";
import DescriptionImage from "../../../common/components/Image/DescriptionImage";
import {
  BaseCompany,
  BaseProduct,
  EmptyProduct,
  Product,
} from "../../../common/rpc/Schema";
import {
  FormInputGroup,
  FormLabel,
  FormButton,
  createFormErrorMessage,
} from "../../../common/components/Form/Form";

export interface InventoryProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
  height: number;
}

interface ProductRequest {
  name: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  price: string;
  image: any;
  link: string;
}

const ProductSchema = yup.object().shape({
  name: yup.string().required("Required").max(255, "Too long"),
  primaryKeywords: yup
    .string()
    .optional()
    .max(255, "Too long")
    .matches(
      /^\s*[^,]+\s*(,\s*[^,]+){0,2}\s*$/g,
      "Must be a comma seperated list with at most 3 terms"
    ),
  secondaryKeywords: yup
    .string()
    .optional()
    .max(255, "Too long")
    .matches(
      /^\s*[^,]+\s*(,\s*[^,]+){0,4}\s*$/g,
      "Must be a comma seperated list with at most 5 terms"
    ),
  price: yup
    .string()
    .required("Required")
    .max(255, "Too long")
    .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Must be a valid price number"),
  image: yup.string().required("Required").max(255, "Too long"),
  link: yup.string().required("Required").max(255, "Too long"),
});

const StyledList = styled(List)`
  border: none;
  outline: none;
`;

const StyledPicture = styled.picture`
  display: flex;
  overflow: hidden;
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

  const onSubmit: FormikConfig<ProductRequest>["onSubmit"] = async (values) => {
    const toBase64 = (file: File) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    let image = values.image;
    try {
      image = await toBase64(image);
    } catch (err) {}

    await InventoryDAO.getInstance()
      .productUpdate({
        companyId: companies[companyIndex].company_id,
        productId: products[productIndex].product_id,
        product: {
          name: values.name,
          primaryKeywords: values.primaryKeywords
            .split(",")
            .map((x) => x.trim()),
          secondaryKeywords: values.secondaryKeywords
            .split(",")
            .map((x) => x.trim()),
          price: parseFloat(values.price),
          link: values.link,
          image: image,
        },
      })
      .catch((err) => console.log(err));
  };

  const createCompanyOnClick = (index: number) => {
    return async () => {
      await InventoryDAO.getInstance()
        .products({ companyId: companies[index].company_id })
        .then(({ products }) => setProducts(products))
        .catch((err) => console.log(err));
      setCompanyIndex(index);
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
            {decode(companies[index].name)}
          </ListGroup.Item>
        ) : (
          <ListGroup.Item onClick={createCompanyOnClick(index)}>
            {decode(companies[index].name)}
          </ListGroup.Item>
        )}
      </div>
    );
  };

  const createProductOnClick = (index: number) => {
    return async () => {
      await InventoryDAO.getInstance()
        .product({
          companyId: companies[companyIndex].company_id,
          productId: products[index].product_id,
        })
        .then(({ product }) => setProduct(product))
        .catch((err) => console.log(err));
      setProductIndex(index);
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
            {decode(products[index].name)}
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
          width={props.width * 0.2}
          height={props.height - 200}
          rowHeight={48}
          rowRenderer={companyRowRenderer}
          rowCount={companies.length}
        />
      </Stack>
      <Stack direction="column" rowAlign="flex-start">
        <h3>Products</h3>
        <StyledList
          width={props.width * 0.2}
          height={props.height - 200}
          rowHeight={91}
          rowRenderer={productRowRenderer}
          rowCount={products.length}
        />
      </Stack>
      <Stack direction="column" rowAlign="flex-start">
        <h3>Information</h3>
        {productIndex >= 0 && (
          <Formik
            initialValues={
              {
                name: product.name,
                primaryKeywords: product.primary_keywords.join(", "),
                secondaryKeywords: product.secondary_keywords.join(", "),
                price: product.price.toFixed(2).toString(),
                image: product.image,
                link: product.link,
              } as ProductRequest
            }
            enableReinitialize={true}
            onSubmit={onSubmit}
            validationSchema={ProductSchema}
          >
            {({
              isSubmitting,
              values,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue,
            }) => (
              <Stack direction="row" columnAlign="flex-start" spacing={24}>
                <Form
                  onSubmit={handleSubmit}
                  style={{ width: props.width * 0.3 }}
                >
                  <Form.Group>
                    <FormLabel>Name</FormLabel>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter name"
                        type="text"
                        value={values.name}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("name")}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Primary Keywords</Form.Label>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="primaryKeywords"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter keywords"
                        type="text"
                        value={values.primaryKeywords}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("primaryKeywords")}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Secondary Keywords</Form.Label>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="secondaryKeywords"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter keywords"
                        type="text"
                        value={values.secondaryKeywords}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("secondaryKeywords")}
                  </Form.Group>
                  <Form.Group>
                    <FormLabel>Price</FormLabel>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="price"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter keywords"
                        type="text"
                        value={values.price}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("price")}
                  </Form.Group>
                  <Form.Group>
                    <FormLabel>Link</FormLabel>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="link"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Enter keywords"
                        type="text"
                        value={values.link}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("link")}
                  </Form.Group>
                  <FormButton
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <React.Fragment>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          style={{ marginBottom: 2, marginRight: 12 }}
                        ></span>
                        Saving...
                      </React.Fragment>
                    ) : (
                      <React.Fragment>Save</React.Fragment>
                    )}
                  </FormButton>
                </Form>
                <Stack direction="column">
                  <FormLabel>Image</FormLabel>
                  <Stack direction="column" spacing={12}>
                    <div
                      style={{
                        alignItems: "center",
                        border: "1px solid #449ed7",
                        display: "flex",
                        justifyContent: "center",
                        height: 225,
                        overflow: "hidden",
                        width: 175,
                      }}
                    >
                      {(() => {
                        let image = values.image;
                        try {
                          const tempUrl = URL.createObjectURL(image);
                          return (
                            <StyledPicture>
                              <img
                                src={tempUrl}
                                alt={values.name}
                                width={175}
                              />
                            </StyledPicture>
                          );
                        } catch (err) {}
                        return (
                          <StyledPicture>
                            <source srcSet={image} type="image/webp" />
                            <img
                              src={image.replace(".webp", ".jpg")}
                              alt={values.name}
                              width={175}
                            />
                          </StyledPicture>
                        );
                      })()}
                    </div>
                    <input
                      type="file"
                      id="image"
                      accept="image/jpeg, image/png"
                      onBlur={handleBlur}
                      onChange={(event) => {
                        if (
                          event.target.files &&
                          event.target.files.length > 0
                        ) {
                          setFieldValue("image", event.target.files[0]);
                        }
                      }}
                    />
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Formik>
        )}
      </Stack>
    </Stack>
  );
}

export default Inventory;
