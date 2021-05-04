import { createRef, Fragment } from "react";
import dynamic from "next/dynamic";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Select from "react-dropdown-select";

import AddProduct from "./AddProduct";
import { Base64, fileToBase64, urlToBase64 } from "./ImageHelpers";
import { BaseBusiness, BaseProduct, Product } from "../common/Schema";
import DashboardLayout from "./Layout";
import { Departments, DepartmentsToId } from "./Departments";
import { InputGroup, Label, SubmitButton, ErrorMessage } from "../common/form";
import ProductList from "./ProductList";
import Stack from "../common/Stack";
import styles from "./Inventory.module.css";

const BusinessList = dynamic(() => import("./BusinessList"));

const ProductSchema = yup.object().shape({
  name: yup.string().required("Required").max(255, "Too long"),
  primaryKeywords: yup
    .string()
    .optional()
    .max(128, "Too long")
    .matches(
      /^\s*[^,]+\s*(,(\s*[^,\s]\s*)+){0,2}\s*$/g,
      "Must be a comma list with at most 3 terms"
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
  image: yup.string().required("Invalid image url or image file"),
  link: yup.string().required("Required").max(255, "Too long"),
});

export interface InventoryProps {
  isNewItem: boolean;
  businesses: Array<BaseBusiness>;
  businessIndex: number;
  products: Array<BaseProduct>;
  productIndex: number;
  product: Product;
  error: string;
  shopifyError: boolean;
  shopifyOpen: boolean;
  shopifyLoading: boolean;
  shopifySuccessful: boolean;
  success: string;
  height: number;
  onAddProduct: () => void;
  onBusinessClick: (index: number) => void;
  onProductClick: (index: number) => void;
  onShopifyUpload: () => void;
  onSubmit: FormikConfig<ProductRequest>["onSubmit"];
}

export interface ProductRequest {
  name: string;
  primaryKeywords: string;
  departments: Array<string>;
  description: string;
  isRange: boolean;
  price: string;
  priceLow: string;
  priceHigh: string;
  image: Base64;
  link: string;
  option: "add" | "update" | "delete";
}

export default function Inventory({
  isNewItem,
  businesses,
  businessIndex,
  products,
  productIndex,
  product,
  error,
  shopifyError,
  shopifyOpen,
  shopifyLoading,
  shopifySuccessful,
  success,
  height,
  onAddProduct,
  onBusinessClick,
  onProductClick,
  onShopifyUpload,
  onSubmit,
}: InventoryProps) {
  const logoUrlRef = createRef<HTMLInputElement>();
  const logoFileRef = createRef<HTMLInputElement>();

  return (
    <DashboardLayout tab="inventory">
      <Stack
        direction="row"
        columnAlign="flex-start"
        style={{ margin: "12px 0px 12px 0px" }}
      >
        {businesses.length > 1 && (
          <BusinessList
            onBusinessClick={onBusinessClick}
            businesses={businesses}
            height={height - 200}
            index={businessIndex}
            width={260}
            style={{ marginRight: 32 }}
          />
        )}
        <Stack direction="row" columnAlign="flex-start" spacing={12}>
          {businessIndex >= 0 && (
            <ProductList
              label={
                <div style={{ marginBottom: 12 }}>
                  <h1 className={styles.label}>Products</h1>
                  <AddProduct
                    error={shopifyError}
                    open={shopifyOpen}
                    loading={shopifyLoading}
                    successful={shopifySuccessful}
                    onAddProduct={onAddProduct}
                    onShopifyUpload={onShopifyUpload}
                  />
                </div>
              }
              onProductClick={onProductClick}
              products={products}
              height={height - 249}
              index={productIndex}
              width={300}
              style={{ marginRight: 32 }}
            />
          )}
          {(productIndex >= 0 || isNewItem) && (
            <Stack direction="column" rowAlign="flex-start">
              <h1 className={styles.label}>
                {isNewItem ? "New Product" : "Product Details"}
              </h1>
              <Formik
                enableReinitialize
                initialValues={
                  {
                    name: product.name,
                    primaryKeywords: product.primaryKeywords.join(", "),
                    departments: product.departments,
                    description: product.description,
                    isRange: product.price !== product.priceRange[1],
                    price: isNewItem ? "" : product.price.toFixed(2),
                    priceLow: isNewItem ? "" : product.priceRange[0].toFixed(2),
                    priceHigh: isNewItem
                      ? ""
                      : product.priceRange[1].toFixed(2),
                    image: product.image,
                    link: product.link,
                    option: isNewItem ? "add" : "update",
                  } as ProductRequest
                }
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
                  <Form onSubmit={handleSubmit}>
                    <Stack
                      direction="row"
                      columnAlign="flex-start"
                      spacing={24}
                    >
                      <Stack direction="column" rowAlign="flex-start">
                        <Form.Group>
                          <Label required>Name</Label>
                          <InputGroup>
                            <FormControl
                              aria-required
                              aria-label="Name"
                              aria-details="Enter product name here"
                              id="name"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. Wooden Cutlery"
                              type="text"
                              value={values.name}
                              style={{ width: 300 }}
                            />
                          </InputGroup>
                          <ErrorMessage name="name" />
                        </Form.Group>
                        <Form.Group>
                          <Label
                            required
                            description="We use departments to help users find your products by category"
                          >
                            Departments
                          </Label>
                          <InputGroup>
                            <Select
                              multi
                              color="#449ed7"
                              onChange={(departments) => {
                                setFieldValue(
                                  "departments",
                                  departments.map(({ name }) => name),
                                  true
                                );
                              }}
                              options={Departments}
                              style={{ width: 300 }}
                              labelField="name"
                              valueField="name"
                              values={values.departments.map((name) => ({
                                id: DepartmentsToId.get(name),
                                name,
                              }))}
                            />
                          </InputGroup>
                          <ErrorMessage name="departments" />
                        </Form.Group>
                        {values.isRange ? (
                          <Form.Group>
                            <Stack direction="row" columnAlign="flex-start">
                              <Label style={{ paddingRight: 12 }}>
                                Price Range
                              </Label>
                              <Form.Check
                                aria-label="Price range"
                                aria-details="Check price range box if the product's price is a price range"
                                aria-checked={values.isRange}
                                id="isRange"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                style={{ paddingTop: 1 }}
                                type="checkbox"
                                checked={values.isRange}
                              />
                              <Label required>Range</Label>
                            </Stack>
                            <Stack
                              direction="row"
                              rowAlign="flex-start"
                              spacing={12}
                              priority={[1, 1]}
                              style={{ width: 300 }}
                            >
                              <Stack
                                direction="column"
                                columnAlign="flex-start"
                              >
                                <InputGroup>
                                  <FormControl
                                    aria-required
                                    aria-label="Bottom Price Range"
                                    aria-details="Enter bottom of product price range here"
                                    id="priceLow"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.50"
                                    type="text"
                                    value={values.priceLow}
                                  />
                                </InputGroup>
                              </Stack>
                              <Stack
                                direction="column"
                                columnAlign="flex-start"
                              >
                                <InputGroup>
                                  <FormControl
                                    aria-required
                                    aria-label="Top Price Range"
                                    aria-details="Enter top of product price range here"
                                    id="priceHigh"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="e.g. 5.50"
                                    type="text"
                                    value={values.priceHigh}
                                  />
                                </InputGroup>
                              </Stack>
                            </Stack>
                            <ErrorMessage name="priceLow" />
                            <ErrorMessage name="priceHigh" />
                          </Form.Group>
                        ) : (
                          <Form.Group>
                            <Stack direction="row" columnAlign="flex-start">
                              <Label required style={{ paddingRight: 12 }}>
                                Price
                              </Label>
                              <Form.Check
                                aria-label="Price range"
                                aria-details="Check price range box if the product's price is a price range"
                                aria-checked={values.isRange}
                                id="isRange"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                style={{ paddingTop: 1 }}
                                type="checkbox"
                                defaultChecked={values.isRange}
                              />
                              <Label>Range</Label>
                            </Stack>
                            <InputGroup>
                              <FormControl
                                aria-required
                                aria-label="Price"
                                aria-details="Enter product price here"
                                id="price"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="e.g. 19.99"
                                type="text"
                                value={values.price}
                                style={{ width: 300 }}
                              />
                            </InputGroup>
                            <ErrorMessage name="price" />
                          </Form.Group>
                        )}
                        <Form.Group>
                          <Label description="Sometimes the name of the product does not include the type of product and that's okay! You can add the type of product as primary keywords here">
                            Primary Keywords (comma list)
                          </Label>
                          <InputGroup>
                            <FormControl
                              aria-label="Primary Keywords"
                              aria-details="Enter primary keywords for the product in a comma list with a maximum of 3 terms"
                              id="primaryKeywords"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. fork, knife, spoon"
                              type="text"
                              value={values.primaryKeywords}
                              style={{ width: 300 }}
                            />
                          </InputGroup>
                          <ErrorMessage name="primaryKeywords" />
                        </Form.Group>
                        <Form.Group>
                          <Label description="We use the description to help expose your products to the right people! Usually the description on your website is sufficient.">
                            Description
                          </Label>
                          <InputGroup>
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
                              style={{ width: 300 }}
                            />
                          </InputGroup>
                          <ErrorMessage name="description" />
                        </Form.Group>
                      </Stack>
                      <div>
                        <picture className={styles.picture}>
                          <img
                            src={values.image}
                            alt={businesses[businessIndex].name}
                            width={175}
                          />
                        </picture>
                        <Form.Group>
                          <Label required>Image URL or Image File</Label>
                          <InputGroup>
                            <FormControl
                              aria-label="Image URL"
                              aria-details="Enter image url here"
                              id="image"
                              onBlur={handleBlur}
                              onChange={async (event) => {
                                try {
                                  const url = event.currentTarget.value;
                                  const image = await urlToBase64(url);
                                  setFieldValue("image", image, true);
                                  if (logoFileRef.current) {
                                    logoFileRef.current.value = "";
                                  }
                                } catch {
                                  setFieldValue("image", "", true);
                                }
                              }}
                              placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
                              ref={logoUrlRef}
                              style={{ width: 300 }}
                            />
                          </InputGroup>
                          <InputGroup>
                            <Form.File
                              aria-label="Image file"
                              aria-details="Enter image file here"
                              id="image"
                              onBlur={handleBlur}
                              onChange={async (
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                if (
                                  event.target.files &&
                                  event.target.files.length > 0
                                ) {
                                  try {
                                    const file = event.target.files[0];
                                    const image = await fileToBase64(file);
                                    setFieldValue("image", image, true);
                                    if (logoUrlRef.current) {
                                      logoUrlRef.current.value = "";
                                    }
                                  } catch {
                                    setFieldValue("image", "", true);
                                  }
                                } else {
                                  setFieldValue("image", "", true);
                                }
                              }}
                              ref={logoFileRef}
                            />
                          </InputGroup>
                          <ErrorMessage name="image" />
                        </Form.Group>
                        <Form.Group>
                          <Label
                            required
                            description="A product URL is the URL that goes to your product on your website. This allows us to redirect people directly to your website!"
                          >
                            Product URL
                          </Label>
                          <InputGroup>
                            <FormControl
                              aria-required
                              aria-label="Product URL"
                              aria-details="Enter the URL to the product here"
                              id="link"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.mywebsite.com/wooden-cutlery"
                              type="text"
                              value={values.link}
                              style={{ width: 300 }}
                            />
                          </InputGroup>
                          <ErrorMessage name="link" />
                        </Form.Group>
                        <div
                          style={{
                            color: "red",
                          }}
                        >
                          {error}
                        </div>
                        <div
                          style={{
                            color: "green",
                          }}
                        >
                          {success}
                        </div>
                        <Stack
                          direction="row"
                          columnAlign="flex-end"
                          spacing={12}
                        >
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
                                <Fragment>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                    style={{ marginBottom: 2, marginRight: 12 }}
                                  ></span>
                                  Deleting...
                                </Fragment>
                              ) : (
                                <Fragment>Delete</Fragment>
                              )}
                            </Button>
                          )}
                          <SubmitButton
                            text="Save"
                            submittingText="Saving..."
                            isSubmitting={isSubmitting}
                            disabled={values.option === "delete"}
                            style={{ padding: "11px 32px 11px 32px" }}
                          />
                        </Stack>
                      </div>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Stack>
          )}
        </Stack>
      </Stack>
    </DashboardLayout>
  );
}