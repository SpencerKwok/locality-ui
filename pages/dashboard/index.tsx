import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import AccountPage from "components/dashboard/Account";
import BusinessPage from "components/dashboard/Business";
import InventoryPage from "components/dashboard/Inventory";
import SettingsPage from "components/dashboard/Settings";
import { GetRpcClient, PostRpcClient } from "components/common/RpcClient";
import RootLayout from "components/common/RootLayout";
import { EmptyProduct } from "common/Schema";
import { useWindowSize } from "lib/common";
import styles from "components/dashboard/Dashboard.module.css";

import type { ChangeEvent, FC } from "react";
import type { GetServerSideProps } from "next";
import type { FuseBaseProduct } from "components/dashboard/ProductGrid";
import type { Session } from "next-auth";
import type { PasswordUpdateRequest } from "components/dashboard/Account";
import type { UploadType } from "components/dashboard/AddProduct";
import type {
  BaseBusiness,
  BaseProduct,
  BusinessResponse,
  BusinessesResponse,
  DepartmentsResponse,
  ProductResponse,
  ProductsResponse,
} from "common/Schema";
import type {
  UpdateDepartmentsRequest,
  UpdateHomepagesRequest,
  UpdateLogoRequest,
} from "components/dashboard/Business";
import type {
  ProductRequest,
  VariantRequest,
} from "components/dashboard/Inventory";
import type {
  EtsyUpdateUploadSettingsRequest,
  ShopifyUpdateUploadSettingsRequest,
  SquareUpdateUploadSettingsRequest,
} from "components/dashboard/Settings";

async function getDepartments(url: string): Promise<DepartmentsResponse> {
  return GetRpcClient.getInstance().call("Departments", url);
}

async function getProduct(url: string): Promise<ProductResponse> {
  return GetRpcClient.getInstance().call("Product", url);
}

async function getProducts(url: string): Promise<ProductsResponse> {
  return GetRpcClient.getInstance().call("Products", url);
}

async function getBusiness(url: string): Promise<BusinessResponse> {
  return GetRpcClient.getInstance().call("Business", url);
}

async function getBusinesses(url: string): Promise<BusinessesResponse> {
  return GetRpcClient.getInstance().call("Businesses", url);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const isNewBusiness = context.query.newBusiness === "true";
  const initialTab = decodeURIComponent(
    (context.query["tab"] ?? "inventory") as string
  );

  let businesses = Array<BaseBusiness>();
  let initialProducts = Array<BaseProduct>();
  if (session?.user) {
    const user: any = session.user;
    if (user.id === 0) {
      businesses = await getBusinesses("/api/businesses").then(
        ({ businesses }) => businesses
      );
      initialProducts = await getProducts(
        `/api/products?id=${businesses[0].id}`
      ).then(({ products }) => products);
    } else if (typeof user.id === "number") {
      businesses = await getBusiness(`/api/business?id=${user.id}`).then(
        ({ business }) => [business]
      );
      initialProducts = await getProducts(`/api/products?id=${user.id}`).then(
        ({ products }) =>
          products.map((product, index) => ({ ...product, index }))
      );
    }
  }

  return {
    props: {
      businesses,
      isNewBusiness,
      session,
      initialProducts,
      initialTab,
    },
  };
};

interface DashboardProps {
  businesses: Array<BaseBusiness>;
  isNewBusiness: boolean;
  session: Session | null;
  initialProducts: Array<BaseProduct>;
  initialTab: string;
}

const Dashboard: FC<DashboardProps> = ({
  businesses,
  isNewBusiness,
  session,
  initialProducts,
  initialTab,
}) => {
  const router = useRouter();
  const size = useWindowSize();

  const [isNewItem, setIsNewItem] = useState(false);
  const [businessIndex, setBusinessIndex] = useState(0);
  const [departments, setDepartments] = useState<Array<string>>([]);
  const [filter, setFilter] = useState("");
  const [productIndex, setProductIndex] = useState(-1);
  const [product, setProduct] = useState(EmptyProduct);
  const [tab, setTab] = useState(initialTab);
  const [variantTab, setVariantTab] = useState("0");
  const [products, setProducts] = useState<Array<FuseBaseProduct>>(
    initialProducts.map((product, index) => ({ ...product, index }))
  );
  const [productSearch, setProductSearch] = useState<Fuse<FuseBaseProduct>>(
    new Fuse(
      initialProducts.map((product, index) => ({ ...product, index })),
      { keys: ["name"], ignoreLocation: true, threshold: 0.3 }
    )
  );
  const [requestStatus, setRequestStatus] = useState({
    error: "",
    success: "",
  });
  const [updatePasswordStatus, setUpdatePasswordStatus] = useState({
    error: "",
    updatedPassword: false,
  });
  const [updateUploadSettingsStatus, setUpdateUploadSettingsStatus] = useState({
    error: "",
    successful: false,
  });
  const [updateDepartmentsStatus, setUpdateDepartmentsStatus] = useState({
    error: "",
    successful: false,
  });
  const [updateHomepagesStatus, setUpdateHomepageStatus] = useState({
    error: "",
    successful: false,
  });
  const [updateLogoStatus, setUpdateLogoStatus] = useState({
    error: "",
    successful: false,
  });
  const [uploadStatus, setUploadStatus] = useState({
    uploadType: "" as UploadType,
    error: "",
    open: false,
    loading: false,
    successful: false,
  });

  useEffect(() => {
    void getDepartments("/api/departments/get").then(({ departments }) => {
      setDepartments(departments);
    });
    void getSession().then((value) => {
      if (!value || !value.user) {
        // Need to refresh CSP
        window.location.assign("/");
      }
    });
  }, []);

  /// INVENTORY
  const onAddProduct = (): void => {
    setIsNewItem(true);
    setProduct(EmptyProduct);
    setRequestStatus({ error: "", success: "" });
    setTab("0");
  };

  const onInventoryBusinessClick = async (index: number): Promise<void> => {
    setFilter("");
    setBusinessIndex(index);
    setProductIndex(-1);
    setProduct(EmptyProduct);
    setIsNewItem(false);
    setRequestStatus({ error: "", success: "" });

    const products = await getProducts(
      `/api/products?id=${businesses[index].id}`
    ).then(({ products }) =>
      products.map((product, index) => ({ ...product, index }))
    );
    setProducts(products);
    setProductSearch(
      new Fuse(products, {
        keys: ["name"],
        ignoreLocation: true,
        threshold: 0.3,
      })
    );
  };

  const onProductClick = async (index: number): Promise<void> => {
    setProduct(
      await getProduct(`/api/product?id=${products[index].objectId}`).then(
        ({ product }) => product
      )
    );
    setVariantTab("0");
    setIsNewItem(false);
    setRequestStatus({ error: "", success: "" });
    setProductIndex(index);
  };

  const onFilterChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFilter(event.target.value);
  };

  const onFilterClear = (): void => {
    setFilter("");
  };

  const onUploadTypeChange = (uploadType: UploadType): void => {
    setUploadStatus({
      ...uploadStatus,
      uploadType,
    });
  };

  const onUpload = async (
    uploadType: UploadType,
    file?: string
  ): Promise<void> => {
    let methodName:
      | "EtsyProductUpload"
      | "ShopifyProductUpload"
      | "SquareProductUpload";
    switch (uploadType) {
      case "Etsy":
        methodName = "EtsyProductUpload";
        break;
      case "Shopify":
        methodName = "ShopifyProductUpload";
        break;
      case "Square":
        methodName = "SquareProductUpload";
        break;
      default:
        return;
    }

    setUploadStatus({
      uploadType,
      error: "",
      open: true,
      loading: true,
      successful: false,
    });
    await PostRpcClient.getInstance()
      .call(methodName, {
        id: businesses[businessIndex].id,
        csv: file,
      })
      .then(({ error }) => {
        if (typeof error === "string" && error) {
          setUploadStatus({
            uploadType,
            error,
            open: true,
            loading: false,
            successful: false,
          });
          return;
        }

        setProduct(EmptyProduct);
        setProductIndex(-1);
        setProducts([]);
        setProductSearch(
          new Fuse([], {
            keys: ["name"],
            ignoreLocation: true,
            threshold: 0.3,
          })
        );
        setIsNewItem(false);
        setUploadStatus({
          uploadType,
          error: "",
          open: true,
          loading: false,
          successful: true,
        });

        setTimeout(() => {
          setUploadStatus({
            uploadType,
            error: "",
            open: false,
            loading: false,
            successful: false,
          });
        }, 5000);
      })
      .catch((error) => {
        setUploadStatus({
          uploadType,
          open: true,
          error,
          loading: false,
          successful: false,
        });
      });
  };

  const onProductSubmit = async ({
    name,
    tags,
    departments,
    description,
    isRange,
    price,
    priceLow,
    priceHigh,
    image,
    link,
    option,
    variantTag,
  }: ProductRequest): Promise<void> => {
    switch (option) {
      case "add":
        await PostRpcClient.getInstance()
          .call("ProductAdd", {
            id: businesses[businessIndex].id,
            product: {
              name: name,
              departments: departments.map((value) => value.trim()),
              description: description,
              link: link,
              priceRange: isRange
                ? [parseFloat(priceLow), parseFloat(priceHigh)]
                : [parseFloat(price), parseFloat(price)],
              tags: tags
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
              variantImages: [image],
              variantTags: [variantTag].filter(Boolean),
            },
          })
          .then(async ({ product, error }) => {
            if (typeof error === "string" && error) {
              setRequestStatus({ error, success: "" });
              return;
            }

            // Wait for product to be uploaded to Algolia
            await new Promise((resolve) => setTimeout(resolve, 3000));

            setProduct(
              await getProduct(`/api/product?id=${product.objectId}`).then(
                ({ product }) => product
              )
            );
            setIsNewItem(false);
            setProducts([...products, { ...product, index: products.length }]);
            setProductIndex(products.length);
            setRequestStatus({
              error: "",
              success: "Successfully added the product!",
            });
          })
          .catch((error) => {
            setRequestStatus({ error: error.message, success: "" });
          });
        break;
      case "delete":
        await PostRpcClient.getInstance()
          .call("ProductDelete", {
            id: businesses[businessIndex].id,
            product: {
              id: parseInt(products[productIndex].objectId.split("_")[1]),
            },
          })
          .then(({ error }) => {
            if (typeof error === "string" && error) {
              setRequestStatus({ error, success: "" });
              return;
            }

            setProduct(EmptyProduct);
            setProductIndex(-1);
            setProducts([
              ...products.slice(0, productIndex),
              ...products.slice(productIndex + 1),
            ]);
            setRequestStatus({
              error: "",
              success: "",
            });
          })
          .catch((error) => {
            setRequestStatus({ error: error.message, success: "" });
          });
        break;
      case "update":
        await PostRpcClient.getInstance()
          .call("ProductUpdate", {
            id: businesses[businessIndex].id,
            product: {
              name: name,
              id: parseInt(products[productIndex].objectId.split("_")[1]),
              departments: departments.map((value) => value.trim()),
              description: description,
              link: link,
              priceRange: isRange
                ? [parseFloat(priceLow), parseFloat(priceHigh)]
                : [parseFloat(price), parseFloat(price)],
              tags: tags
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
              variantImages: [image, ...product.variantImages.slice(1)],
              variantTags: [variantTag, ...product.variantTags.slice(1)].filter(
                Boolean
              ),
            },
          })
          .then(({ product, error }) => {
            if (typeof error === "string" && error) {
              setRequestStatus({ error, success: "" });
              return;
            }

            setProducts([
              ...products.slice(0, productIndex),
              { ...product, index: productIndex },
              ...products.slice(productIndex + 1),
            ]);
            setRequestStatus({
              error: "",
              success: "Successfully updated the product!",
            });
          })
          .catch((error) => {
            setRequestStatus({ error: error.message, success: "" });
          });
        break;
    }
  };

  const onVariantSubmit = async ({
    index,
    variantTag,
    image,
    option,
  }: VariantRequest): Promise<void> => {
    switch (option) {
      case "add":
        await PostRpcClient.getInstance()
          .call("VariantAdd", {
            id: businesses[businessIndex].id,
            product: {
              id: parseInt(products[productIndex].objectId.split("_")[1]),
              variantImage: image,
              variantTag,
            },
          })
          .then(({ error, variantImage, variantTag }) => {
            if (typeof error === "string" && error) {
              setRequestStatus({ error, success: "" });
              return;
            }
            setProduct({
              ...product,
              variantImages: [...product.variantImages, variantImage],
              variantTags: [...product.variantTags, variantTag],
            });
            setRequestStatus({
              error: "",
              success: "Successfully added the variant!",
            });
          })
          .catch((error) => {
            setRequestStatus({ error: error.message, success: "" });
          });
        break;
      case "delete":
        await PostRpcClient.getInstance()
          .call("VariantDelete", {
            id: businesses[businessIndex].id,
            product: {
              id: parseInt(products[productIndex].objectId.split("_")[1]),
              index: index,
            },
          })
          .then(({ error }) => {
            if (typeof error === "string" && error) {
              setRequestStatus({ error, success: "" });
              return;
            }
            setTab("0");
            setProduct({
              ...product,
              variantImages: [
                ...product.variantImages.slice(0, index),
                ...product.variantImages.slice(index + 1),
              ],
              variantTags: [
                ...product.variantTags.slice(0, index),
                ...product.variantTags.slice(index + 1),
              ],
            });
            setRequestStatus({
              error: "",
              success: "",
            });
          })
          .catch((error) => {
            setRequestStatus({ error: error.message, success: "" });
          });
        break;
      case "update":
        await PostRpcClient.getInstance()
          .call("VariantUpdate", {
            id: businesses[businessIndex].id,
            product: {
              id: parseInt(products[productIndex].objectId.split("_")[1]),
              index: index,
              variantImage: image,
              variantTag,
            },
          })
          .then(({ error, variantImage, variantTag }) => {
            if (typeof error === "string" && error) {
              setRequestStatus({ error, success: "" });
              return;
            }
            setProduct({
              ...product,
              variantImages: [
                ...product.variantImages.slice(0, index),
                variantImage,
                ...product.variantImages.slice(index + 1),
              ],
              variantTags: [
                ...product.variantTags.slice(0, index),
                variantTag,
                ...product.variantTags.slice(index + 1),
              ],
            });
            setRequestStatus({
              error: "",
              success: "Successfully updated the variant!",
            });
          })
          .catch((error) => {
            setRequestStatus({ error: error.message, success: "" });
          });
        break;
    }
  };

  /// BUSINESS
  const onBusinessBusinessClick = (index: number): void => {
    setBusinessIndex(index);
    setUpdateDepartmentsStatus({
      error: "",
      successful: false,
    });
    setUpdateHomepageStatus({
      error: "",
      successful: false,
    });
    setUpdateLogoStatus({
      error: "",
      successful: false,
    });
  };

  const onSubmitDepartments = async ({
    departments,
  }: UpdateDepartmentsRequest): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("DepartmentsUpdate", {
        id: businesses[businessIndex].id,
        departments: departments.map((value) => value.trim()),
      })
      .then(({ error }) => {
        if (typeof error === "string" && error) {
          setUpdateDepartmentsStatus({ error, successful: false });
          return;
        }
        businesses[businessIndex].departments = departments;
        setUpdateDepartmentsStatus({ error: "", successful: true });
      })
      .catch((error) => {
        setUpdateDepartmentsStatus({ error, successful: false });
      });
  };

  const onSubmitHomepages = async ({
    homepage,
    etsyHomepage,
    shopifyHomepage,
    squareHomepage,
  }: UpdateHomepagesRequest): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("HomepagesUpdate", {
        id: businesses[businessIndex].id,
        homepage,
        etsyHomepage,
        shopifyHomepage,
        squareHomepage,
      })
      .then((res) => {
        if (typeof res.error === "string" && res.error) {
          setUpdateHomepageStatus({ error: res.error, successful: false });
          return;
        }
        businesses[businessIndex].homepages = res;
        setUpdateHomepageStatus({ error: "", successful: true });
      })
      .catch((error) => {
        setUpdateHomepageStatus({ error, successful: false });
      });
  };

  const onSubmitLogo = async ({ logo }: UpdateLogoRequest): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("LogoUpdate", {
        id: businesses[businessIndex].id,
        logo,
      })
      .then(({ logo, error }) => {
        if (typeof error === "string" && error) {
          setUpdateLogoStatus({ error, successful: false });
          return;
        }
        businesses[businessIndex].logo = logo;
        setUpdateLogoStatus({ error: "", successful: true });
      })
      .catch((error) => {
        setUpdateLogoStatus({ error, successful: false });
      });
  };

  /// SETTINGS
  const onSubmitEtsyUploadSettings = async ({
    includeTags,
    excludeTags,
  }: EtsyUpdateUploadSettingsRequest): Promise<void> => {
    const req = {
      id: businesses[businessIndex].id,
      etsy: {
        includeTags: (includeTags ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        excludeTags: (excludeTags ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      },
    };

    await PostRpcClient.getInstance()
      .call("EtsyUploadSettingsUpdate", req)
      .then(({ error, etsy }) => {
        if (typeof error === "string" && error) {
          setUpdateUploadSettingsStatus({
            error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          ...businesses[businessIndex].uploadSettings,
          etsy,
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onSubmitShopifyUploadSettings = async ({
    includeTags,
    excludeTags,
    departmentMapping,
  }: ShopifyUpdateUploadSettingsRequest): Promise<void> => {
    const req = {
      id: businesses[businessIndex].id,
      shopify: {
        includeTags: (includeTags ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        excludeTags: (excludeTags ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        departmentMapping: (departmentMapping ?? [])
          .map(({ key, departments }) => ({
            key: key.trim(),
            departments: departments.map((department) => department.trim()),
          }))
          .filter(
            ({ key, departments }) => key !== "" && departments.length !== 0
          ),
      },
    };

    await PostRpcClient.getInstance()
      .call("ShopifyUploadSettingsUpdate", req)
      .then(({ error, shopify }) => {
        if (typeof error === "string" && error) {
          setUpdateUploadSettingsStatus({
            error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          ...businesses[businessIndex].uploadSettings,
          shopify,
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onSubmitSquareUploadSettings = async ({
    includeTags,
    excludeTags,
    departmentMapping,
  }: SquareUpdateUploadSettingsRequest): Promise<void> => {
    const req = {
      id: businesses[businessIndex].id,
      square: {
        includeTags: (includeTags ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        excludeTags: (excludeTags ?? "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        departmentMapping: (departmentMapping ?? [])
          .map(({ key, departments }) => ({
            key: key.trim(),
            departments: departments.map((department) => department.trim()),
          }))
          .filter(
            ({ key, departments }) => key !== "" && departments.length !== 0
          ),
      },
    };

    await PostRpcClient.getInstance()
      .call("SquareUploadSettingsUpdate", req)
      .then(({ error, square }) => {
        if (typeof error === "string" && error) {
          setUpdateUploadSettingsStatus({
            error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          ...businesses[businessIndex].uploadSettings,
          square,
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onSettingsBusinessClick = (): void => {
    setUpdateUploadSettingsStatus({
      error: "",
      successful: false,
    });
  };

  /// ACCOUNT
  const onSubmitPassword = async (
    values: PasswordUpdateRequest
  ): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("PasswordUpdate", values)
      .then(({ error }) => {
        if (typeof error === "string" && error) {
          setUpdatePasswordStatus({ error, updatedPassword: false });
          return;
        }
        setUpdatePasswordStatus({ error: "", updatedPassword: true });
      })
      .catch((error) => {
        setUpdatePasswordStatus({ error, updatedPassword: false });
      });
  };

  if (!session?.user) {
    return null;
  }

  if (typeof size.height !== "number") {
    return null;
  }

  const user: any = session.user;
  const firstName: string = user.firstName;
  const lastName: string = user.lastName;
  return (
    <RootLayout session={session}>
      <Tabs
        defaultActiveKey={tab}
        onSelect={(key): void => {
          void router.replace(`/dashboard?tab=${key}`);
          setTab(key ?? "inventory");
        }}
      >
        <Tab className={styles.tab} eventKey="inventory" title="Inventory">
          <InventoryPage
            isNewItem={isNewItem}
            businesses={businesses}
            businessIndex={businessIndex}
            departments={departments}
            filter={filter}
            products={
              filter
                ? productSearch.search(filter).map(({ item }) => item)
                : products
            }
            productIndex={productIndex}
            product={product}
            requestStatus={requestStatus}
            tab={variantTab}
            uploadType={uploadStatus.uploadType}
            uploadError={uploadStatus.error}
            uploadOpen={uploadStatus.open}
            uploadLoading={uploadStatus.loading}
            uploadSuccessful={uploadStatus.successful}
            height={size.height}
            onAddProduct={onAddProduct}
            onBusinessClick={onInventoryBusinessClick}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
            onProductClick={onProductClick}
            onTabClick={(key): void => {
              setRequestStatus({ error: "", success: "" });
              setVariantTab(key);
            }}
            onUpload={onUpload}
            onUploadTypeChange={onUploadTypeChange}
            onProductSubmit={onProductSubmit}
            onVariantSubmit={onVariantSubmit}
          />
        </Tab>
        <Tab className={styles.tab} eventKey="business" title="Business">
          <BusinessPage
            isNewBusiness={isNewBusiness}
            businesses={businesses}
            businessIndex={businessIndex}
            departments={departments}
            updateDepartmentsStatus={updateDepartmentsStatus}
            updateHomepagesStatus={updateHomepagesStatus}
            updateLogoStatus={updateLogoStatus}
            height={size.height}
            onBusinessClick={onBusinessBusinessClick}
            onSubmitDepartments={onSubmitDepartments}
            onSubmitLogo={onSubmitLogo}
            onSubmitHomepages={onSubmitHomepages}
          />
        </Tab>
        <Tab className={styles.tab} eventKey="settings" title="Settings">
          <SettingsPage
            businesses={businesses}
            businessIndex={businessIndex}
            departments={departments}
            updateUploadSettingsStatus={updateUploadSettingsStatus}
            height={size.height}
            onBusinessClick={onSettingsBusinessClick}
            onSubmitEtsyUploadSettings={onSubmitEtsyUploadSettings}
            onSubmitShopifyUploadSettings={onSubmitShopifyUploadSettings}
            onSubmitSquareUploadSettings={onSubmitSquareUploadSettings}
          />
        </Tab>
        <Tab className={styles.tab} eventKey="account" title="Account">
          <AccountPage
            error={updatePasswordStatus.error}
            updatedPassword={updatePasswordStatus.updatedPassword}
            firstName={firstName}
            lastName={lastName}
            onSubmitPassword={onSubmitPassword}
          />
        </Tab>
      </Tabs>
    </RootLayout>
  );
};

export default Dashboard;
