import React, { CSSProperties, useState, useEffect } from "react";
import Cookie from "js-cookie";
import * as yup from "yup";
import { decode } from "html-entities";
import { Formik, FormikConfig } from "formik";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import { Redirect } from "react-router-dom";
import Select from "react-dropdown-select";

import AddProduct from "./AddProduct/AddProduct";
import CompanyList from "../Company";
import DescriptionImage from "../../../common/components/Image/DescriptionImage";
import Help from "../Help/Help";
import Image, { toBase64 } from "../Image";
import InventoryDAO from "./InventoryDAO";
import Stack from "../../../common/components/Stack/Stack";

import LocalityForm from "../../../common/components/Form";
import {
  BaseCompany,
  BaseProduct,
  EmptyProduct,
  Product,
} from "../../../common/rpc/Schema";
import {
  VirtualList,
  ListGroupItem,
} from "../../../common/components/List/List";

export interface InventoryProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
  height: number;
}

const Departments = [
  "Accessories/Jewelry",
  "Bags",
  "Baby",
  "Beauty & Personal Care",
  "Clothing/Shoes",
  "Entertainment",
  "Electronics",
  "Everything Else/Other",
  "Fitness",
  "Food & Drinks",
  "Groceries",
  "Health & Personal Care",
  "Home & Kitchen",
  "Pet",
  "Sports & Outdoors",
  "Toys & Games",
];

interface ProductRequest {
  name: string;
  primaryKeywords: string;
  departments: Array<string>;
  description: string;
  isRange: boolean;
  price: string;
  priceLow: string;
  priceHigh: string;
  image: any;
  link: string;
  option: "add" | "edit" | "delete";
}

const ProductSchema = yup.object().shape({
  name: yup.string().required("Required").max(255, "Too long"),
  primaryKeywords: yup
    .string()
    .optional()
    .max(128, "Too long")
    .matches(
      /^\s*[^,]+\s*(,(\s*[^,\s]\s*)+){0,2}\s*$/g,
      "Must be a comma seperated list with at most 3 terms"
    ),
  departments: yup.array().of(yup.string()).required("Required"),
  description: yup.string().optional().max(2048, "Too long"),
  price: yup.mixed().when("isRange", {
    is: false,
    then: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Invalid price"),
  }),
  priceLow: yup.mixed().when("isRange", {
    is: true,
    then: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Invalid price")
      .test(
        "Price Low Test",
        "Must be lower than the upper price range",
        (lowPrice, { parent }) => {
          try {
            const p1 = parseFloat(lowPrice || "");
            const p2 = parseFloat(parent.priceHigh);
            return p1 < p2;
          } catch {
            // Error is not a price range
            // error, so we return true
            return true;
          }
        }
      ),
  }),
  priceHigh: yup.mixed().when("isRange", {
    is: true,
    then: yup
      .string()
      .required("Required")
      .max(255, "Too long")
      .matches(/^\s*[0-9]+(\.[0-9][0-9])?\s*$/g, "Invalid price"),
  }),
  image: yup
    .mixed()
    .test("Not Null", "Required", (value) => value && value !== ""),
  link: yup.string().required("Required").max(255, "Too long"),
});

function Inventory(props: InventoryProps) {
  const companyId = Cookie.get("companyId");
  const [companyIndex, setCompanyIndex] = useState(-1);
  const [productIndex, setProductIndex] = useState(-1);
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);
  const [products, setProducts] = useState<Array<BaseProduct>>([]);
  const [product, setProduct] = useState<Product>(EmptyProduct);
  const [isNewItem, setIsNewItem] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyId === "0") {
      InventoryDAO.getInstance()
        .companies({})
        .then(({ companies }) => {
          setCompanies(companies);
        })
        .catch((err) => console.log(err));
    } else if (companyId) {
      InventoryDAO.getInstance()
        .company({ id: parseInt(companyId) })
        .then(({ company }) => {
          setCompanies([company]);
          setCompanyIndex(0);
          (async () => {
            await InventoryDAO.getInstance()
              .products({ id: company.id })
              .then(({ products }) => {
                setProducts(products);
              })
              .catch((err) => console.log(err));
          })();
        })
        .catch((err) => console.log(err));
    }
  }, [companyId]);

  if (!companyId) {
    return <Redirect to="/signin" />;
  }

  const onSubmit: FormikConfig<ProductRequest>["onSubmit"] = async (values) => {
    let image = values.image;
    try {
      image = await toBase64(image);
    } catch (err) {}

    const price = values.isRange
      ? parseFloat(values.priceLow)
      : parseFloat(values.price);
    const priceRange = values.isRange
      ? [parseFloat(values.priceLow), parseFloat(values.priceHigh)]
      : [price, price];

    if (values.option === "add") {
      const productToAdd: Product = {
        company: companies[companyIndex].name,
        name: values.name,
        departments: values.departments,
        primaryKeywords: values.primaryKeywords
          .split(",")
          .filter(Boolean)
          .map((x) => x.trim()),
        description: values.description,
        price: price,
        priceRange: priceRange,
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
              .filter(Boolean)
              .map((x) => x.trim()),
            departments: values.departments,
            description: values.description,
            price: price,
            priceRange: priceRange,
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
          .products({ id: companies[index].id })
          .then(({ products }) => {
            if (products) {
              setProducts(products);
              setProductIndex(-1);
            }
          })
          .catch((err) => console.log(err));
        setCompanyIndex(index);
      }
    };
  };

  const createProductOnClick = (index: number) => {
    return async () => {
      if (index !== productIndex) {
        await InventoryDAO.getInstance()
          .product({
            companyId: companies[companyIndex].id,
            id: parseInt(products[index].objectID.split("_")[1]),
          })
          .then(({ product }) => {
            if (product) {
              setProduct(product);
              setError("");
            }
          })
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
          <ListGroupItem
            active={productIndex === index}
            onClick={createProductOnClick(index)}
            style={{ height: 92, paddingTop: 0, paddingBottom: 0, width: 400 }}
          >
            <DescriptionImage
              direction="row"
              src={products[index].image.replace("/upload", "/upload/w_128")}
              loading={"lazy"}
              spacing={12}
              columnAlign="flex-start"
              rowAlign="center"
              style={{ height: 92 }}
              width={48}
            >
              {decode(products[index].name)}
            </DescriptionImage>
          </ListGroupItem>
        ) : (
          <ListGroupItem
            active={productIndex === index}
            onClick={createProductOnClick(index)}
            style={{
              height: 92,
              paddingTop: 0,
              paddingBottom: 0,
              borderTop: "none",
              width: 400,
            }}
          >
            <Stack
              direction="column"
              columnAlign="center"
              style={{ height: "100%" }}
            >
              <DescriptionImage
                direction="row"
                src={products[index].image.replace("/upload", "/upload/w_128")}
                loading={"lazy"}
                spacing={12}
                columnAlign="flex-start"
                rowAlign="center"
                style={{ height: 92 }}
                width={48}
              >
                {decode(products[index].name)}
              </DescriptionImage>
            </Stack>
          </ListGroupItem>
        )}
      </Stack>
    );
  };

  return (
    <Stack
      direction="row"
      columnAlign="flex-start"
      style={{ marginTop: 12, marginBottom: 24 }}
    >
      {companyId === "0" && (
        <CompanyList
          createCompanyOnClick={createCompanyOnClick}
          companies={companies}
          height={props.height - 200}
          index={companyIndex}
          width={260}
          style={{ marginRight: 12 }}
        />
      )}
      <Stack direction="row" columnAlign="flex-start" spacing={12}>
        {companyIndex >= 0 && (
          <Stack direction="column" rowAlign="flex-start" spacing={8}>
            <h3 style={{ marginBottom: 0 }}>Products</h3>
            <AddProduct
              companyId={companies[companyIndex].id}
              onAddProduct={() => {
                setProduct(EmptyProduct);
                setProductIndex(-1);
                setIsNewItem(true);
              }}
              onShopifyUpload={(products) => {
                setProducts(products);
                setProduct(EmptyProduct);
                setProductIndex(-1);
                setIsNewItem(false);
              }}
            />
            <VirtualList
              width={400}
              height={props.height - 200}
              rowHeight={92}
              rowRenderer={productRowRenderer}
              rowCount={products.length}
            />
          </Stack>
        )}
        {(productIndex >= 0 || isNewItem) && (
          <Stack direction="column" rowAlign="flex-start">
            <h3>{isNewItem ? "New Product" : "Product Details"}</h3>
            <Formik
              initialValues={
                {
                  name: product.name,
                  primaryKeywords: product.primaryKeywords.join(", "),
                  departments: product.departments,
                  description: product.description,
                  isRange: product.price !== product.priceRange[1],
                  price: isNewItem ? "" : product.price.toFixed(2),
                  priceLow: isNewItem ? "" : product.priceRange[0].toFixed(2),
                  priceHigh: isNewItem ? "" : product.priceRange[1].toFixed(2),
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
                      <LocalityForm.Label required>Name</LocalityForm.Label>
                      <LocalityForm.InputGroup>
                        <FormControl
                          aria-label="Name"
                          aria-details="Enter product name here"
                          id="name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="e.g. Wooden Cutlery"
                          type="text"
                          value={values.name}
                        />
                      </LocalityForm.InputGroup>
                      <LocalityForm.ErrorMessage name="name" />
                    </Form.Group>
                    <Form.Group>
                      <LocalityForm.Label description="Sometimes the name of the product does not include the type of product and that's okay! You can add the type of product as primary keywords here">
                        Primary Keywords (comma list, max 3 terms)
                      </LocalityForm.Label>
                      <LocalityForm.InputGroup>
                        <FormControl
                          aria-label="Primary Keywords (comma list, max 3 terms)"
                          aria-details="Enter product primary keywords here"
                          id="primaryKeywords"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="e.g. fork, knife, spoon"
                          type="text"
                          value={values.primaryKeywords}
                        />
                      </LocalityForm.InputGroup>
                      <LocalityForm.ErrorMessage name="primaryKeywords" />
                    </Form.Group>
                    <Form.Group>
                      <LocalityForm.Label
                        required
                        description="We use departments to help users find your products by category"
                      >
                        Departments
                      </LocalityForm.Label>
                      <LocalityForm.InputGroup>
                        <Select
                          clearable
                          multi
                          color="#449ed7"
                          onChange={(departments) => {
                            setFieldValue("departments", departments, true);
                          }}
                          options={Departments}
                          style={{ width: 300 }}
                          labelField="name"
                          valueField="name"
                          values={values.departments}
                        />
                      </LocalityForm.InputGroup>
                      <LocalityForm.ErrorMessage name="departments" />
                    </Form.Group>
                    <Form.Group>
                      <LocalityForm.Label description="We use the description to help expose your products to the right people! Usually the description on your website is sufficient.">
                        Description
                      </LocalityForm.Label>
                      <LocalityForm.InputGroup>
                        <FormControl
                          as="textarea"
                          aria-label="Description"
                          aria-details="Enter product description here"
                          id="description"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder={`e.g. White and blue pouch\n1 spoon, 1 fork, 1 pair of chopsticks\nBPA free, toxic free\nLength: 23 cm`}
                          type="text"
                          value={values.description}
                        />
                      </LocalityForm.InputGroup>
                      <LocalityForm.ErrorMessage name="description" />
                    </Form.Group>
                    {values.isRange ? (
                      <Form.Group>
                        <Stack direction="row" columnAlign="flex-start">
                          <LocalityForm.Label style={{ paddingRight: 12 }}>
                            Price Range
                          </LocalityForm.Label>
                          <Form.Check
                            aria-label="Price Range"
                            aria-description="Check if product price is a price range"
                            id="isRange"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            style={{ paddingTop: 1 }}
                            type="checkbox"
                            checked={values.isRange}
                          />
                          <LocalityForm.Label required>
                            Range
                          </LocalityForm.Label>
                        </Stack>
                        <Stack
                          direction="row"
                          rowAlign="flex-start"
                          spacing={12}
                          priority={[1, 1]}
                        >
                          <Stack direction="column" columnAlign="flex-start">
                            <LocalityForm.InputGroup>
                              <FormControl
                                aria-label="Lower Price Range"
                                aria-details="Enter bottom of price range here"
                                id="priceLow"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="e.g. 1.50"
                                type="text"
                                value={values.priceLow}
                              />
                            </LocalityForm.InputGroup>
                          </Stack>
                          <Stack direction="column" columnAlign="flex-start">
                            <LocalityForm.InputGroup>
                              <FormControl
                                aria-label="Upper Price Range"
                                aria-details="Enter top of price range here"
                                id="priceHigh"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="e.g. 5.50"
                                type="text"
                                value={values.priceHigh}
                              />
                            </LocalityForm.InputGroup>
                          </Stack>
                        </Stack>
                        <LocalityForm.ErrorMessage name="priceLow" />
                        <LocalityForm.ErrorMessage name="priceHigh" />
                      </Form.Group>
                    ) : (
                      <Form.Group>
                        <Stack direction="row" columnAlign="flex-start">
                          <LocalityForm.Label
                            required
                            style={{ paddingRight: 12 }}
                          >
                            Price
                          </LocalityForm.Label>
                          <Form.Check
                            aria-label="Price Range"
                            aria-description="Check if product price is a price range"
                            id="isRange"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            style={{ paddingTop: 1 }}
                            type="checkbox"
                            checked={values.isRange}
                          />
                          <LocalityForm.Label>Range</LocalityForm.Label>
                        </Stack>
                        <LocalityForm.InputGroup>
                          <FormControl
                            aria-label="Price"
                            aria-details="Enter product price here"
                            id="price"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="e.g. 18.64"
                            type="text"
                            value={values.price}
                          />
                        </LocalityForm.InputGroup>
                        <LocalityForm.ErrorMessage name="price" />
                      </Form.Group>
                    )}
                    <Form.Group>
                      <LocalityForm.Label
                        description="A product link is the URL that goes to your product on your website. This allows us to redirect people directly to your website!"
                        required
                      >
                        Link to Product
                      </LocalityForm.Label>
                      <LocalityForm.InputGroup>
                        <FormControl
                          aria-label="Link to product"
                          aria-details="Enter link to product here"
                          id="link"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="e.g. www.mywebsite.com/wooden-cutlery"
                          style={{ marginBottom: "0.5rem" }}
                          type="text"
                          value={values.link}
                        />
                      </LocalityForm.InputGroup>
                      <LocalityForm.ErrorMessage name="link" />
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
                      {values.option === "add" && (
                        <LocalityForm.Button
                          isSubmitting={isSubmitting}
                          text="Add"
                          submittingText="Adding..."
                        />
                      )}
                      {values.option === "edit" && (
                        <LocalityForm.Button
                          isSubmitting={isSubmitting}
                          text="Update"
                          submittingText="Updating..."
                        />
                      )}
                    </Stack>
                  </Form>
                  <Image
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    setFieldValue={setFieldValue}
                    alt={values.name}
                    imageId="image"
                    label="Image"
                    values={values}
                    description={`An image URL is the URL that goes directly to the image you would like to use to display your product. You can get this URL by right clicking a picture on your website and selecting "Copy Image Location"`}
                  />
                </Stack>
              )}
            </Formik>
          </Stack>
        )}
      </Stack>
      {(productIndex >= 0 || isNewItem) && <Help />}
    </Stack>
  );
}

export default Inventory;
