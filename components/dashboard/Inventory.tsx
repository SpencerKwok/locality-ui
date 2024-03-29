import React, { createRef, useState } from "react";
import dynamic from "next/dynamic";
import { decode } from "html-entities";
import { Formik, FormikConfig } from "formik";
import Tab from "components/common/tabs/Tab";
import Tabs from "components/common/tabs/Tabs";

import AddProduct, { UploadType } from "./AddProduct";
import { Base64, fileToBase64 } from "./ImageHelpers";
import { BaseBusiness, Product } from "common/Schema";
import {
  ErrorMessage,
  FormGroup,
  InputGroup,
  Input,
  Label,
  SubmitButton,
  CancelButton,
  TextArea,
} from "components/common/form";
import { ProductFormSchema, VariantFormSchema } from "common/ValidationSchema";
import ProductGrid from "./ProductGrid";
import Stack from "components/common/Stack";
import Select from "components/common/select/VirtualSelect";
import styles from "components/dashboard/Inventory.module.css";

import type { ChangeEvent, FC } from "react";
import type { FuseBaseProduct } from "./ProductGrid";
import type { CSSObject } from "@emotion/serialize";

const BusinessList = dynamic(async () => import("./BusinessList"));

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
  option: "add" | "delete" | "update";
}

export interface VariantRequest {
  variantIndex: number;
  variantTag: string;
  image: Base64;
  option: "add" | "delete" | "update";
}

const Inventory: FC<InventoryProps> = ({
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
}) => {
  const [newVariant, setNewVariant] = useState<VariantRequest>({
    variantIndex: -1,
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
      style={{ margin: "12px 0px 0px 0px", overflow: "auto" }}
    >
      {businesses.length > 1 && (
        <BusinessList
          onBusinessClick={onBusinessClick}
          businesses={businesses}
          height={600}
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
                rowAlign="center"
                spacing={12}
                priority={[0, 1]}
                style={{ marginBottom: 4, width: 500 }}
              >
                <h2>Products</h2>
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
            height={600}
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
              onSelect={(key): void => {
                onTabClick(key);

                if (!isNewItem && key === `${product.variantTags.length + 1}`) {
                  setNewVariant(newVariant);
                }
              }}
            >
              <Tab
                eventKey="0"
                title={((): string => {
                  let title = decode(
                    product.variantTags[0] ? product.variantTags[0] : "Original"
                  );
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
                        variantTag: decode(product.variantTags[0] ?? ""),
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
                        image: product.variantImages[0] ?? "",
                        link: decode(product.link),
                        option: isNewItem ? "add" : "update",
                      } as ProductRequest
                    }
                    onSubmit={onProductSubmit}
                    validationSchema={ProductFormSchema}
                  >
                    {({
                      isSubmitting,
                      values,
                      handleBlur,
                      handleChange,
                      handleSubmit,
                      setFieldValue,
                    }): JSX.Element => (
                      <form onSubmit={handleSubmit}>
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
                            <FormGroup>
                              <Label required>Name</Label>
                              <InputGroup>
                                <Input
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
                            </FormGroup>
                            <FormGroup>
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
                                  onChange={(_, action): void => {
                                    switch (action.action) {
                                      case "select-option":
                                        if (action.option) {
                                          const label = action.option.label;
                                          if (
                                            !values.departments.includes(label)
                                          )
                                            setFieldValue(
                                              "departments",
                                              [...values.departments, label],
                                              false
                                            );
                                        }
                                        break;
                                      case "remove-value":
                                        const label = action.removedValue.label;
                                        setFieldValue(
                                          "departments",
                                          values.departments.filter(
                                            (department) => department !== label
                                          ),
                                          false
                                        );
                                        break;
                                      case "clear":
                                        setFieldValue("departments", [], false);
                                        break;
                                      // Other options are not necessary with multi select
                                      default:
                                        break;
                                    }
                                  }}
                                  options={departmentsWithIds}
                                  value={values.departments.map(
                                    (department): { label: string } => ({
                                      label: department,
                                    })
                                  )}
                                  styles={{
                                    container: (obj: CSSObject): CSSObject => ({
                                      ...obj,
                                      width: 270,
                                    }),
                                  }}
                                />
                              </InputGroup>
                              <ErrorMessage name="departments" />
                            </FormGroup>
                            {values.isRange ? (
                              <FormGroup>
                                <Stack direction="row" columnAlign="flex-start">
                                  <Label style={{ paddingRight: 12 }}>
                                    Price Range
                                  </Label>
                                  <Input
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
                                      <Input
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
                                      <Input
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
                              </FormGroup>
                            ) : (
                              <FormGroup>
                                <Stack direction="row" columnAlign="flex-start">
                                  <Label required style={{ paddingRight: 12 }}>
                                    Price
                                  </Label>
                                  <Input
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
                                  <Input
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
                              </FormGroup>
                            )}
                            <FormGroup>
                              <Label description="Sometimes the name of the product does not include the type of product and that's okay! You can add the type of product as tags here">
                                Tags (comma list)
                              </Label>
                              <InputGroup>
                                <Input
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
                            </FormGroup>
                          </Stack>
                          <Stack
                            direction="column"
                            rowAlign="flex-start"
                            spacing={-8}
                          >
                            <FormGroup style={{ width: 250 }}>
                              <Label description="If your product consists of multiple variants, please add a variant tag here to describe the uniqueness of this variant">
                                Variant Tag
                              </Label>
                              <InputGroup>
                                <Input
                                  aria-label="Variant tag"
                                  aria-details="Enter a variant tag for the product here"
                                  id="variantTag"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  placeholder="e.g. small size"
                                  type="text"
                                  value={values.variantTag}
                                />
                              </InputGroup>
                              <ErrorMessage name="variantTag" />
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label description="We use the description to help expose your products to the right people! Usually the description on your website is sufficient.">
                                Description
                              </Label>
                              <InputGroup>
                                <TextArea
                                  as="textarea"
                                  aria-label="Description"
                                  aria-details="Enter product description here"
                                  id="description"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  placeholder={`e.g. White and blue pouch\n1 spoon, 1 fork, 1 pair of chopsticks\nBPA free, toxic free\nLength: 23 cm`}
                                  type="text"
                                  value={values.description}
                                  style={{ height: 166, width: "100%" }}
                                />
                              </InputGroup>
                              <ErrorMessage name="description" />
                            </FormGroup>
                          </Stack>
                          <Stack
                            direction="column"
                            rowAlign="flex-start"
                            spacing={-8}
                          >
                            <FormGroup
                              style={{
                                border: "1px solid #ced4da",
                                height: 116,
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
                                  onError={(): void => {
                                    setFieldValue("image", "", true);
                                  }}
                                />
                              </picture>
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label required>Image URL or Image File</Label>
                              <InputGroup>
                                <Input
                                  aria-label="Image URL"
                                  aria-details="Enter image url here"
                                  id="image"
                                  onBlur={handleBlur}
                                  onChange={async (event): Promise<void> => {
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
                                />
                              </InputGroup>
                              <InputGroup>
                                <Input
                                  aria-label="Image file"
                                  aria-details="Enter image file here"
                                  id="image"
                                  type="file"
                                  onBlur={handleBlur}
                                  onChange={async (
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ): Promise<void> => {
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
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label
                                required
                                description="A product URL is the URL that goes to your product on your website. This allows us to redirect people directly to your website!"
                              >
                                Product URL
                              </Label>
                              <InputGroup>
                                <Input
                                  aria-required
                                  aria-label="Product URL"
                                  aria-details="Enter the URL to the product here"
                                  id="link"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  placeholder="e.g. www.mywebsite.com/wooden-cutlery"
                                  type="text"
                                  value={values.link}
                                />
                              </InputGroup>
                              <ErrorMessage name="link" />
                            </FormGroup>
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
                            <CancelButton
                              isSubmitting={
                                isSubmitting && values.option === "delete"
                              }
                              disabled={
                                isSubmitting &&
                                (values.option === "add" ||
                                  values.option === "update")
                              }
                              text="Delete"
                              submittingText="Deleting..."
                              style={{ padding: "9px 24px" }}
                              onClick={(): void => {
                                setFieldValue("option", "delete", false);
                                handleSubmit();
                              }}
                            />
                          )}
                          <SubmitButton
                            text="Save"
                            submittingText="Saving..."
                            isSubmitting={
                              isSubmitting &&
                              (values.option === "add" ||
                                values.option === "update")
                            }
                            disabled={
                              isSubmitting && values.option === "delete"
                            }
                            style={{ padding: "11px 32px 11px 32px" }}
                          />
                        </Stack>
                      </form>
                    )}
                  </Formik>
                </div>
              </Tab>
              {product.variantTags.slice(1).map((variantTag, index) => (
                <Tab
                  key={`${index + 1}`}
                  eventKey={`${index + 1}`}
                  title={((): string => {
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
                          variantIndex: index + 1,
                          variantTag: decode(variantTag),
                          image: product.variantImages[index + 1],
                          option: "update",
                        } as VariantRequest
                      }
                      onSubmit={onVariantSubmit}
                      validationSchema={VariantFormSchema}
                    >
                      {({
                        isSubmitting,
                        values,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                      }): JSX.Element => (
                        <form onSubmit={handleSubmit}>
                          <Stack
                            direction="column"
                            rowAlign="flex-start"
                            spacing={-8}
                          >
                            <FormGroup
                              style={{
                                border: "1px solid #ced4da",
                                height: 116,
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
                                  onError={(): void => {
                                    setFieldValue("image", "", true);
                                  }}
                                />
                              </picture>
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label description="If your product consists of multiple variants, please add a variant tag here to describe the uniqueness of this variant">
                                Variant Tag
                              </Label>
                              <InputGroup>
                                <Input
                                  aria-label="Variant tag"
                                  aria-details="Enter a variant tag for the product here"
                                  id="variantTag"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  placeholder="e.g. small size"
                                  type="text"
                                  value={values.variantTag}
                                />
                              </InputGroup>
                              <ErrorMessage name="variantTag" />
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label required>Image URL or Image File</Label>
                              <InputGroup>
                                <Input
                                  aria-label="Image URL"
                                  aria-details="Enter image url here"
                                  id="image"
                                  onBlur={handleBlur}
                                  onChange={async (event): Promise<void> => {
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
                                />
                              </InputGroup>
                              <InputGroup>
                                <Input
                                  aria-label="Image file"
                                  aria-details="Enter image file here"
                                  id="image"
                                  onBlur={handleBlur}
                                  onChange={async (
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ): Promise<void> => {
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
                            </FormGroup>
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
                            style={{ width: 250 }}
                          >
                            <CancelButton
                              isSubmitting={
                                isSubmitting && values.option === "delete"
                              }
                              disabled={
                                isSubmitting &&
                                (values.option === "add" ||
                                  values.option === "update")
                              }
                              text="Delete"
                              submittingText="Deleting..."
                              style={{ padding: "9px 24px" }}
                              onClick={(): void => {
                                setFieldValue("option", "delete", false);
                                handleSubmit();
                              }}
                            />
                            <SubmitButton
                              text="Save"
                              submittingText="Saving..."
                              isSubmitting={
                                isSubmitting &&
                                (values.option === "add" ||
                                  values.option === "update")
                              }
                              disabled={
                                isSubmitting && values.option === "delete"
                              }
                              style={{ padding: "11px 32px 11px 32px" }}
                            />
                          </Stack>
                        </form>
                      )}
                    </Formik>
                  </div>
                </Tab>
              ))}
              {!isNewItem && (
                <Tab
                  // We add 1 to avoid duplicate event keys
                  // since products can have no variant tags
                  eventKey={`${product.variantTags.length + 1}`}
                  title="Add New Variant +"
                >
                  <div style={{ marginTop: 12 }}>
                    <Formik
                      enableReinitialize
                      initialValues={newVariant}
                      onSubmit={onVariantSubmit}
                      validationSchema={VariantFormSchema}
                    >
                      {({
                        isSubmitting,
                        values,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                      }): JSX.Element => (
                        <form onSubmit={handleSubmit}>
                          <Stack
                            direction="column"
                            rowAlign="flex-start"
                            spacing={-8}
                          >
                            <FormGroup
                              style={{
                                border: "1px solid #ced4da",
                                height: 116,
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
                                  onError={(): void => {
                                    setFieldValue("image", "", true);
                                  }}
                                />
                              </picture>
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label
                                required
                                description="Add a variant tag here to describe the uniqueness of this variant"
                              >
                                Variant Tag
                              </Label>
                              <InputGroup>
                                <Input
                                  aria-label="Variant tag"
                                  aria-details="Enter a variant tag for the product here"
                                  id="variantTag"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  placeholder="e.g. small size"
                                  type="text"
                                  value={values.variantTag}
                                />
                              </InputGroup>
                              <ErrorMessage name="variantTag" />
                            </FormGroup>
                            <FormGroup style={{ width: 250 }}>
                              <Label required>Image URL or Image File</Label>
                              <InputGroup>
                                <Input
                                  aria-label="Image URL"
                                  aria-details="Enter image url here"
                                  id="image"
                                  onBlur={handleBlur}
                                  onChange={async (event): Promise<void> => {
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
                                />
                              </InputGroup>
                              <InputGroup>
                                <Input
                                  aria-label="Image file"
                                  aria-details="Enter image file here"
                                  id="image"
                                  type="file"
                                  onBlur={handleBlur}
                                  onChange={async (
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ): Promise<void> => {
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
                            </FormGroup>
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
                            style={{ width: 250 }}
                          >
                            <SubmitButton
                              text="Save"
                              submittingText="Saving..."
                              isSubmitting={isSubmitting}
                              disabled={values.option === "delete"}
                              style={{ padding: "11px 32px 11px 32px" }}
                            />
                          </Stack>
                        </form>
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
};

export default Inventory;
