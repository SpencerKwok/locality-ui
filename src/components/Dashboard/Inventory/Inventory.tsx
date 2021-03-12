import React, { CSSProperties, useState, useEffect } from "react";
import * as yup from "yup";
import styled from "styled-components";
import { ListGroup, Tabs, Tab } from "react-bootstrap";
import { List } from "react-virtualized";
import { decode } from "html-entities";
import { Formik, FormikConfig } from "formik";
import { Button, Form, FormControl } from "react-bootstrap";

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
  option: "add" | "edit" | "delete";
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

const StyledListGroupItem = styled(ListGroup.Item)`
  ${({ active }) =>
    active &&
    "background-color: #3880ae !important; border-color: #3880ae !important"}
  &:hover {
    background-color: #449ed7;
    color: #ffffff;
  }
`;

const StyledButton = styled(Button)`
  background-color: #449ed7;
  border-color: #449ed7;

  &:link,
  &:visited,
  &:focus {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }

  &:hover,
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

function Inventory(props: InventoryProps) {
  const [companyIndex, setCompanyIndex] = useState(-1);
  const [productIndex, setProductIndex] = useState(-1);
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);
  const [products, setProducts] = useState<Array<BaseProduct>>([]);
  const [product, setProduct] = useState<Product>(EmptyProduct);
  const [isNewItem, setIsNewItem] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    InventoryDAO.getInstance()
      .companies({})
      .then(({ error, companies }) => {
        if (error) {
          console.log(error);
        } else if (companies) {
          setCompanies(companies);
          if (companies.length === 1) {
            setCompanyIndex(0);
            (async () => {
              await InventoryDAO.getInstance()
                .products({ companyId: companies[0].id })
                .then(({ error, products }) => {
                  if (error) {
                    console.log(error);
                  } else {
                    products && setProducts(products);
                  }
                })
                .catch((err) => console.log(err));
            })();
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);

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

    if (values.option === "add") {
      const productToAdd: Product = {
        company: companies[companyIndex].name,
        name: values.name,
        primaryKeywords: values.primaryKeywords.split(",").map((x) => x.trim()),
        secondaryKeywords: values.secondaryKeywords
          .split(",")
          .map((x) => x.trim()),
        price: parseFloat(values.price),
        link: values.link,

        objectID: "",
        image: "",
      };

      await InventoryDAO.getInstance()
        .productAdd({
          companyName: companies[companyIndex].name,
          latitude: companies[companyIndex].latitude,
          longitude: companies[companyIndex].longitude,
          companyId: companies[companyIndex].id,
          product: {
            ...productToAdd,
            image: image,
          },
        })
        .then(({ product, error }) => {
          if (error) {
            console.log(error);
            setError(error.message);
          } else if (product) {
            let index = 0;
            for (; index < products.length; ++index) {
              if (products[index].name < product.name) {
                ++index;
              } else {
                break;
              }
            }
            setError("");
            setProducts([
              ...products.slice(0, index),
              product,
              ...products.slice(index),
            ]);
            setProduct({
              ...productToAdd,
              objectID: product.objectID,
              image: product.image,
            });
            setProductIndex(index);
            setIsNewItem(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setError(err.message);
        });
    } else if (values.option === "delete") {
      const productId = parseInt(products[productIndex].objectID.split("_")[1]);
      await InventoryDAO.getInstance()
        .productDelete({
          companyId: companies[companyIndex].id,
          id: productId,
        })
        .then(({ error }) => {
          if (error) {
            console.log(error);
            setError(error.message);
          } else {
            setError("");
            setProducts([
              ...products.slice(0, productIndex),
              ...products.slice(productIndex + 1),
            ]);
            setProductIndex(-1);
          }
        })
        .catch((err) => {
          console.log(err);
          setError(err.message);
        });
    } else {
      const productId = parseInt(products[productIndex].objectID.split("_")[1]);
      await InventoryDAO.getInstance()
        .productUpdate({
          companyId: companies[companyIndex].id,
          product: {
            name: values.name,
            id: productId,
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
        .then(({ product, error }) => {
          if (error) {
            console.log(error);
            setError(error.message);
          } else if (product) {
            setError("");
            setProducts([
              ...products.slice(0, productIndex),
              product,
              ...products.slice(productIndex + 1),
            ]);
          }
        })
        .catch((err) => {
          console.log(err);
          setError(err.message);
        });
    }
  };

  const createCompanyOnClick = (index: number) => {
    return async () => {
      if (index !== companyIndex) {
        await InventoryDAO.getInstance()
          .products({ companyId: companies[index].id })
          .then(({ products }) => products && setProducts(products))
          .catch((err) => console.log(err));
        setCompanyIndex(index);
      }
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
        {index === 0 ? (
          <StyledListGroupItem
            active={companyIndex === index}
            onClick={createCompanyOnClick(index)}
            style={{ height: 48 }}
          >
            {decode(companies[index].name)}
          </StyledListGroupItem>
        ) : (
          <StyledListGroupItem
            active={companyIndex === index}
            onClick={createCompanyOnClick(index)}
            style={{ height: 48, borderTop: "none" }}
          >
            {decode(companies[index].name)}
          </StyledListGroupItem>
        )}
      </div>
    );
  };

  const createProductOnClick = (index: number) => {
    return async () => {
      if (index !== productIndex) {
        await InventoryDAO.getInstance()
          .product({
            companyId: companies[companyIndex].id,
            id: parseInt(products[index].objectID.split("_")[1]),
          })
          .then(({ product }) => product && setProduct(product))
          .catch((err) => console.log(err));
        setProductIndex(index);
        setIsNewItem(false);
      }
    };
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
        {index === 0 ? (
          <StyledListGroupItem
            active={productIndex === index}
            onClick={createProductOnClick(index)}
            style={{ height: 92, paddingTop: 0, paddingBottom: 0 }}
          >
            <DescriptionImage
              direction="row"
              src={products[index].image}
              spacing={12}
              columnAlign="flex-start"
              rowAlign="center"
              style={{ height: 92, width: props.width * 0.3 }}
              width={48}
            >
              {decode(products[index].name)}
            </DescriptionImage>
          </StyledListGroupItem>
        ) : (
          <StyledListGroupItem
            active={productIndex === index}
            onClick={createProductOnClick(index)}
            style={{
              height: 92,
              paddingTop: 0,
              paddingBottom: 0,
              borderTop: "none",
            }}
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
                rowAlign="center"
                style={{ height: 92, width: props.width * 0.3 }}
                width={48}
              >
                {decode(products[index].name)}
              </DescriptionImage>
            </Stack>
          </StyledListGroupItem>
        )}
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
      {companies.length > 1 && (
        <Stack direction="column" rowAlign="flex-start">
          <h3>Company</h3>
          <StyledList
            width={Math.min(props.width * 0.2, 230)}
            height={props.height - 200}
            rowHeight={48}
            rowRenderer={companyRowRenderer}
            rowCount={companies.length}
          />
        </Stack>
      )}
      <Stack direction="column" rowAlign="flex-start">
        <Stack
          direction="row"
          columnAlign="flex-start"
          priority={[0, 1, 0]}
          style={{ width: Math.max(props.width * 0.25, 285) }}
        >
          <h3>Products</h3>
          <div></div>
          {companyIndex >= 0 && (
            <StyledButton
              onClick={() => {
                setProduct(EmptyProduct);
                setProductIndex(-1);
                setIsNewItem(true);
              }}
            >
              Add Item
            </StyledButton>
          )}
        </Stack>
        <StyledList
          width={Math.max(props.width * 0.25, 285)}
          height={props.height - 200}
          rowHeight={92}
          rowRenderer={productRowRenderer}
          rowCount={products.length}
        />
      </Stack>
      <Stack direction="column" rowAlign="flex-start">
        <h3>{isNewItem ? "New Item" : "Information"}</h3>
        {(productIndex >= 0 || isNewItem) && (
          <Formik
            initialValues={
              {
                name: product.name,
                primaryKeywords: product.primaryKeywords.join(", "),
                secondaryKeywords: product.secondaryKeywords.join(", "),
                price:
                  product.price >= 0 ? product.price.toFixed(2).toString() : "",
                image: product.image,
                link: product.link,
                option: isNewItem ? "add" : "edit",
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
                        placeholder="e.g. Wooden Cutlery"
                        type="text"
                        value={values.name}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("name")}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Primary Keywords (max 3 terms)</Form.Label>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="primaryKeywords"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="e.g. fork, knife, spoon"
                        type="text"
                        value={values.primaryKeywords}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("primaryKeywords")}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Secondary Keywords (max 5 terms)</Form.Label>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="secondaryKeywords"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="e.g. reusable, eco-friendly"
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
                        placeholder="e.g. 18.64"
                        type="text"
                        value={values.price}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("price")}
                  </Form.Group>
                  <Form.Group>
                    <FormLabel>Link to Product</FormLabel>
                    <FormInputGroup size="md" width="100%">
                      <FormControl
                        aria-label="Large"
                        id="link"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="e.g. www.mywebsite.com/wooden-cutlery"
                        type="text"
                        value={values.link}
                      />
                    </FormInputGroup>
                    {createFormErrorMessage("link")}
                  </Form.Group>
                  <div
                    style={{
                      color: "red",
                    }}
                  >
                    {error}
                  </div>
                  <Stack direction="row" columnAlign="flex-end" spacing={12}>
                    {!isNewItem && (
                      <Button
                        variant="danger"
                        type="submit"
                        disabled={isSubmitting}
                        style={{ padding: "11px 24px 11px 24px" }}
                        onClick={() => {
                          setFieldValue("option", "delete", false);
                          handleSubmit();
                        }}
                      >
                        {isSubmitting && values.option === "delete" ? (
                          <React.Fragment>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                              style={{ marginBottom: 2, marginRight: 12 }}
                            ></span>
                            Deleting...
                          </React.Fragment>
                        ) : (
                          <React.Fragment>Delete</React.Fragment>
                        )}
                      </Button>
                    )}
                    <FormButton
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      style={{ paddingLeft: 24, paddingRight: 24 }}
                      onClick={handleSubmit}
                    >
                      {isSubmitting &&
                      (values.option === "add" || values.option === "edit") ? (
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
                  </Stack>
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
                            {image !== "" && (
                              <React.Fragment>
                                <source srcSet={image} type="image/webp" />
                                <img
                                  src={image.replace(".webp", ".jpg")}
                                  alt={values.name}
                                  width={175}
                                />
                              </React.Fragment>
                            )}
                          </StyledPicture>
                        );
                      })()}
                    </div>
                    <Tabs defaultActiveKey="url">
                      <Tab eventKey="url" title="URL">
                        <Form.Group>
                          <FormLabel>Image URL</FormLabel>
                          <FormInputGroup size="md" width="100%">
                            <FormControl
                              aria-label="Large"
                              id="image"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
                              type="url"
                              value={values.image}
                            />
                          </FormInputGroup>
                          {createFormErrorMessage("image")}
                        </Form.Group>
                      </Tab>
                      <Tab eventKey="local" title="Local Browser">
                        <input
                          type="file"
                          id="image"
                          accept="image/jpeg, image/png, image/webp"
                          onBlur={handleBlur}
                          onChange={(event) => {
                            if (
                              event.target.files &&
                              event.target.files.length > 0
                            ) {
                              setFieldValue(
                                "image",
                                event.target.files[0],
                                false
                              );
                            }
                          }}
                        />
                      </Tab>
                    </Tabs>
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
