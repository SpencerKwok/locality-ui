import { createRef, Fragment, useState } from "react";
import dynamic from "next/dynamic";
import * as yup from "yup";
import { decode } from "html-entities";
import { Formik, FormikConfig } from "formik";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import AddProduct, { UploadType } from "./AddProduct";
import { Base64, fileToBase64 } from "./ImageHelpers";
import { BaseBusiness, Product } from "../common/Schema";
import { InputGroup, Label, SubmitButton, ErrorMessage } from "../common/form";
import ProductGrid from "./ProductGrid";
import Stack from "../common/Stack";
import Select from "../common/select/VirtualSelect";
import styles from "./Inventory.module.css";

import type { ChangeEvent } from "react";
import type { FuseBaseProduct } from "./ProductGrid";

const BusinessList = dynamic(() => import("./BusinessList"));

const ProductSchema = yup.object().shape({
  name: yup.string().required("Required").max(255, "Too long"),
  tags: yup
    .string()
    .optional()
    .max(255, "Too long")
    .matches(/^\s*[^,]+\s*(,(\s*[^,\s]\s*)+)*\s*$/g, "Must be a comma list"),
  variantTag: yup.string().optional().max(255, "Too long"),
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

const VariantSchema = yup.object().shape({
  variantTag: yup.string().required().max(255, "Too long"),
  image: yup.string().required("Invalid image url or image file"),
});

export interface RequestStatus {
  error: string;
  success: string;
}

export interface InventoryProps {
  isNewItem: boolean;
  businesses: Array<BaseBusiness>;
  businessIndex: number;
  departments: Array<string>;
  filter: string;
  products: Array<FuseBaseProduct>;
  productIndex: number;
  product: Product;
  requestStatus: RequestStatus;
  tab: string;
  uploadType: UploadType;
  uploadError: string;
  uploadOpen: boolean;
  uploadLoading: boolean;
  uploadSuccessful: boolean;
  height: number;
  onAddProduct: () => void;
  onBusinessClick: (index: number) => void;
  onFilterChange: (value: ChangeEvent<HTMLInputElement>) => void;
  onFilterClear: () => void;
  onProductClick: (index: number) => void;
  onProductSubmit: FormikConfig<ProductRequest>["onSubmit"];
  onVariantSubmit: FormikConfig<VariantRequest>["onSubmit"];
  onTabClick: (key: string) => void;
  onUploadTypeChange: (uploadType: UploadType) => void;
  onUpload: (UploadType: UploadType) => void;
}

export interface ProductRequest {
  name: string;
  tags: string;
  variantTag: string;
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

export interface VariantRequest {
  index: number;
  variantTag: string;
  image: Base64;
  option: "add" | "update" | "delete";
}

export default function Inventory({
  isNewItem,
  businesses,
  businessIndex,
  departments,
  filter,
  products,
  productIndex,
  product,
  requestStatus,
  tab,
  uploadType,
  uploadError,
  uploadOpen,
  uploadLoading,
  uploadSuccessful,
  height,
  onAddProduct,
  onBusinessClick,
  onFilterChange,
  onFilterClear,
  onProductClick,
  onProductSubmit,
  onVariantSubmit,
  onTabClick,
  onUpload,
  onUploadTypeChange,
}: InventoryProps) {
  const [newVariant, setNewVariant] = useState<VariantRequest>({
    index: -1,
    variantTag: "",
    image: "",
    option: "add",
  });

  const logoUrlRef = createRef<HTMLInputElement>();
  const logoFileRef = createRef<HTMLInputElement>();
  const departmentsWithIds = departments.map((department, index) => ({
    label: department,
    value: index,
  }));

  return (
    <Stack
      direction="row"
      columnAlign="flex-start"
      style={{ margin: "12px 0px 0px 0px" }}
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
      <Stack direction="row" columnAlign="flex-start" spacing={24}>
        {businessIndex >= 0 && (
          <ProductGrid
            label={
              <Stack
                direction="row"
                spacing={12}
                priority={[0, 1]}
                style={{ marginBottom: 4, width: 500 }}
              >
                <h1 className={styles.label}>Products</h1>
                <AddProduct
                  error={uploadError}
                  open={uploadOpen}
                  loading={uploadLoading}
                  successful={uploadSuccessful}
                  uploadType={uploadType}
                  onAddProduct={onAddProduct}
                  onUploadTypeChange={onUploadTypeChange}
                  onUpload={onUpload}
                />
              </Stack>
            }
            filter={filter}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
            onProductClick={onProductClick}
            products={products}
            height={height - 240}
            index={productIndex}
            width={500}
          />
        )}
        {(productIndex >= 0 || isNewItem) && (
          <Stack
            direction="column"
            rowAlign="flex-start"
            style={{ paddingRight: 24 }}
          >
            <h1 className={styles.label} style={{ marginBottom: 12 }}>
              {isNewItem ? "New Product" : "Product Details"}
            </h1>
            <Tabs
              activeKey={tab}
              onSelect={(key) => {
                onTabClick(key || "");
              }}
            >
              <Tab
                key="0"
                eventKey="0"
                title={(() => {
                  let title = decode(product.variantTags[0] || "Original");
                  if (title.length > 16) {
                    title = `${title.substr(0, 14)}...`;
                  }
                  return title;
                })()}
              >
                <div style={{ marginTop: 12 }}>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        name: decode(product.name),
                        tags: decode(product.tags.join(", ")),
                        variantTag: decode(product.variantTags[0] || ""),
                        departments: product.departments
                          .map((department) => decode(department))
                          .filter(Boolean),
                        description: decode(product.description),
                        isRange:
                          product.priceRange[0] !== product.priceRange[1],
                        price: isNewItem
                          ? ""
                          : product.priceRange[0].toFixed(2),
                        priceLow: isNewItem
                          ? ""
                          : product.priceRange[0].toFixed(2),
                        priceHigh: isNewItem
                          ? ""
                          : product.priceRange[1].toFixed(2),
                        image: product.variantImages[0] || "",
                        link: decode(product.link),
                        option: isNewItem ? "add" : "update",
                      } as ProductRequest
                    }
                    onSubmit={onProductSubmit}
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
                        <div style={{ width: 774 }}>
                          <Stack
                            direction="row"
                            columnAlign="flex-start"
                            spacing={12}
                          >
                            <Stack
                              direction="column"
                              rowAlign="flex-start"
                              spacing={-8}
                            >
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
                                    style={{ width: 250 }}
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
                                    isClearable
                                    isMulti
                                    isSearchable
                                    searchable
                                    clearable
                                    onChange={(newValues) => {
                                      setFieldValue(
                                        "departments",
                                        newValues.map(
                                          (value: any) => value.label
                                        ),
                                        true
                                      );
                                    }}
                                    options={departmentsWithIds}
                                    value={values.departments.map(
                                      (department) => ({
                                        label: department,
                                      })
                                    )}
                                    styles={{
                                      container: (obj) => ({
                                        ...obj,
                                        width: 250,
                                      }),
                                    }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="departments" />
                              </Form.Group>
                              {values.isRange ? (
                                <Form.Group>
                                  <Stack
                                    direction="row"
                                    columnAlign="flex-start"
                                  >
                                    <Label style={{ paddingRight: 12 }}>
                                      Price Range
                                    </Label>
                                    <Form.Check
                                      aria-label="Price range"
                                      aria-details="Check price range box if the product's price is a price range"
                                      aria-checked={true}
                                      id="isRange"
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      style={{ paddingTop: 1 }}
                                      type="checkbox"
                                      checked={true}
                                    />
                                    <Label required>Range</Label>
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    rowAlign="flex-start"
                                    spacing={12}
                                    priority={[1, 1]}
                                    style={{ width: 250 }}
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
                                  <Stack
                                    direction="row"
                                    columnAlign="flex-start"
                                  >
                                    <Label
                                      required
                                      style={{ paddingRight: 12 }}
                                    >
                                      Price
                                    </Label>
                                    <Form.Check
                                      aria-label="Price range"
                                      aria-details="Check price range box if the product's price is a price range"
                                      aria-checked={false}
                                      id="isRange"
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      style={{ paddingTop: 1 }}
                                      type="checkbox"
                                      checked={false}
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
                                      style={{ width: 250 }}
                                    />
                                  </InputGroup>
                                  <ErrorMessage name="price" />
                                </Form.Group>
                              )}
                              <Form.Group>
                                <Label description="Sometimes the name of the product does not include the type of product and that's okay! You can add the type of product as tags here">
                                  Tags (comma list)
                                </Label>
                                <InputGroup>
                                  <FormControl
                                    aria-label="Tags"
                                    aria-details="Enter tags for the product in a comma list with a maximum of 3 terms"
                                    id="tags"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="e.g. fork, knife, spoon"
                                    type="text"
                                    value={values.tags}
                                    style={{ width: 250 }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="tags" />
                              </Form.Group>
                            </Stack>
                            <Stack
                              direction="column"
                              rowAlign="flex-start"
                              spacing={-8}
                            >
                              <Form.Group>
                                <Label description="If your product consists of multiple variants, please add a variant tag here to describe the uniqueness of this variant">
                                  Variant Tag
                                </Label>
                                <InputGroup>
                                  <FormControl
                                    aria-label="Variant tag"
                                    aria-details="Enter a variant tag for the product here"
                                    id="variantTag"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="e.g. small size"
                                    type="text"
                                    value={values.variantTag}
                                    style={{ width: 250 }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="variantTag" />
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
                                    style={{ minHeight: 194, width: 250 }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="description" />
                              </Form.Group>
                            </Stack>
                            <Stack
                              direction="column"
                              rowAlign="flex-start"
                              spacing={-8}
                            >
                              <Form.Group>
                                <div
                                  style={{
                                    border: "1px solid #ced4da",
                                    height: 118,
                                    width: 250,
                                  }}
                                >
                                  <picture
                                    className={styles.picture}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      padding: 0,
                                    }}
                                  >
                                    <img
                                      src={values.image}
                                      alt={decode(values.name)}
                                      height={116}
                                      style={{
                                        maxWidth: 250,
                                      }}
                                      onError={() => {
                                        setFieldValue("image", "", true);
                                      }}
                                    />
                                  </picture>
                                </div>
                              </Form.Group>
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
                                        setFieldValue("image", url, true);
                                        if (logoFileRef.current) {
                                          logoFileRef.current.value = "";
                                        }
                                      } catch {
                                        setFieldValue("image", "", true);
                                      }
                                    }}
                                    placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
                                    ref={logoUrlRef}
                                    style={{ maxWidth: 250 }}
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
                                          const image = await fileToBase64(
                                            file
                                          );
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
                                    style={{ width: 250 }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="link" />
                              </Form.Group>
                            </Stack>
                          </Stack>
                          <div
                            style={{
                              color: "red",
                              textAlign: "end",
                            }}
                          >
                            {requestStatus.error}
                          </div>
                          <div
                            style={{
                              color: "green",
                              textAlign: "end",
                            }}
                          >
                            {requestStatus.success}
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
                                      style={{
                                        marginBottom: 2,
                                        marginRight: 12,
                                      }}
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
                      </Form>
                    )}
                  </Formik>
                </div>
              </Tab>
              {product.variantTags.slice(1).map((variantTag, index) => (
                <Tab
                  key={`${index + 1}`}
                  eventKey={`${index + 1}`}
                  title={(() => {
                    let title = decode(variantTag);
                    if (title.length > 16) {
                      title = `${title.substr(0, 14)}...`;
                    }
                    return title;
                  })()}
                >
                  <div style={{ marginTop: 12 }}>
                    <Formik
                      enableReinitialize
                      initialValues={
                        {
                          index: index + 1,
                          variantTag: decode(variantTag),
                          image: product.variantImages[index + 1],
                          option: "update",
                        } as VariantRequest
                      }
                      onSubmit={onVariantSubmit}
                      validationSchema={VariantSchema}
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
                          <div style={{ width: 774 }}>
                            <Stack
                              direction="column"
                              rowAlign="flex-start"
                              spacing={-8}
                            >
                              <Form.Group>
                                <div
                                  style={{
                                    border: "1px solid #ced4da",
                                    height: 118,
                                    width: 250,
                                  }}
                                >
                                  <picture
                                    className={styles.picture}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <img
                                      src={values.image}
                                      alt={decode(values.variantTag)}
                                      height={116}
                                      style={{
                                        maxWidth: 250,
                                      }}
                                      onError={() => {
                                        setFieldValue("image", "", true);
                                      }}
                                    />
                                  </picture>
                                </div>
                              </Form.Group>
                              <Form.Group>
                                <Label description="If your product consists of multiple variants, please add a variant tag here to describe the uniqueness of this variant">
                                  Variant Tag
                                </Label>
                                <InputGroup>
                                  <FormControl
                                    aria-label="Variant tag"
                                    aria-details="Enter a variant tag for the product here"
                                    id="variantTag"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="e.g. small size"
                                    type="text"
                                    value={values.variantTag}
                                    style={{ width: 250 }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="variantTag" />
                              </Form.Group>
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
                                        setFieldValue("image", url, true);
                                        if (logoFileRef.current) {
                                          logoFileRef.current.value = "";
                                        }
                                      } catch {
                                        setFieldValue("image", "", true);
                                      }
                                    }}
                                    placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
                                    ref={logoUrlRef}
                                    style={{ maxWidth: 250 }}
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
                                          const image = await fileToBase64(
                                            file
                                          );
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
                            </Stack>
                            <div
                              style={{
                                color: "red",
                                textAlign: "end",
                              }}
                            >
                              {requestStatus.error}
                            </div>
                            <div
                              style={{
                                color: "green",
                                textAlign: "end",
                              }}
                            >
                              {requestStatus.success}
                            </div>
                            <Stack
                              direction="row"
                              columnAlign="flex-end"
                              spacing={12}
                            >
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
                                      style={{
                                        marginBottom: 2,
                                        marginRight: 12,
                                      }}
                                    ></span>
                                    Deleting...
                                  </Fragment>
                                ) : (
                                  <Fragment>Delete</Fragment>
                                )}
                              </Button>
                              <SubmitButton
                                text="Save"
                                submittingText="Saving..."
                                isSubmitting={isSubmitting}
                                disabled={values.option === "delete"}
                                style={{ padding: "11px 32px 11px 32px" }}
                              />
                            </Stack>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Tab>
              ))}
              {!isNewItem && (
                <Tab
                  key={`${product.variantTags.length}`}
                  eventKey={`${product.variantTags.length}`}
                  title="Add New Variant +"
                  onEnter={() => {
                    setNewVariant(newVariant);
                  }}
                >
                  <div style={{ marginTop: 12 }}>
                    <Formik
                      enableReinitialize
                      initialValues={newVariant}
                      onSubmit={onVariantSubmit}
                      validationSchema={VariantSchema}
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
                          <div style={{ width: 774 }}>
                            <Stack
                              direction="column"
                              rowAlign="flex-start"
                              spacing={-8}
                            >
                              <Form.Group>
                                <div
                                  style={{
                                    border: "1px solid #ced4da",
                                    height: 118,
                                    width: 250,
                                  }}
                                >
                                  <picture
                                    className={styles.picture}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <img
                                      src={values.image}
                                      alt={decode(values.variantTag)}
                                      height={116}
                                      style={{
                                        maxWidth: 250,
                                      }}
                                      onError={() => {
                                        setFieldValue("image", "", true);
                                      }}
                                    />
                                  </picture>
                                </div>
                              </Form.Group>
                              <Form.Group>
                                <Label
                                  required
                                  description="Add a variant tag here to describe the uniqueness of this variant"
                                >
                                  Variant Tag
                                </Label>
                                <InputGroup>
                                  <FormControl
                                    aria-label="Variant tag"
                                    aria-details="Enter a variant tag for the product here"
                                    id="variantTag"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="e.g. small size"
                                    type="text"
                                    value={values.variantTag}
                                    style={{ width: 250 }}
                                  />
                                </InputGroup>
                                <ErrorMessage name="variantTag" />
                              </Form.Group>
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
                                        setFieldValue("image", url, true);
                                        if (logoFileRef.current) {
                                          logoFileRef.current.value = "";
                                        }
                                      } catch {
                                        setFieldValue("image", "", true);
                                      }
                                    }}
                                    placeholder="e.g. www.mywebsite.com/images/wooden-cutlery"
                                    ref={logoUrlRef}
                                    style={{ maxWidth: 250 }}
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
                                          const image = await fileToBase64(
                                            file
                                          );
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
                            </Stack>
                            <div
                              style={{
                                color: "red",
                                textAlign: "end",
                              }}
                            >
                              {requestStatus.error}
                            </div>
                            <div
                              style={{
                                color: "green",
                                textAlign: "end",
                              }}
                            >
                              {requestStatus.success}
                            </div>
                            <Stack
                              direction="row"
                              columnAlign="flex-end"
                              spacing={12}
                            >
                              <SubmitButton
                                text="Save"
                                submittingText="Saving..."
                                isSubmitting={isSubmitting}
                                disabled={values.option === "delete"}
                                style={{ padding: "11px 32px 11px 32px" }}
                              />
                            </Stack>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Tab>
              )}
            </Tabs>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
