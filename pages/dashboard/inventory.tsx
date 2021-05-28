import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { encode } from "html-entities";

import { EmptyProduct } from "../../components/common/Schema";
import DashboardLayout from "../../components/dashboard/Layout";
import InventoryPage from "../../components/dashboard/Inventory";
import RootLayout from "../../components/common/RootLayout";
import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import { useWindowSize } from "../../lib/common";

import type { BaseBusiness, BaseProduct } from "../../components/common/Schema";
import type { GetServerSideProps } from "next";
import type { ProductRequest } from "../../components/dashboard/Inventory";
import type { Session } from "next-auth";
import type { UploadType } from "../../components/dashboard/AddProduct";

function getDepartments(url: string) {
  return GetRpcClient.getInstance().call("Departments", url);
}

function getProduct(url: string) {
  return GetRpcClient.getInstance().call("Product", url);
}

function getProducts(url: string) {
  return GetRpcClient.getInstance().call("Products", url);
}

function getBusiness(url: string) {
  return GetRpcClient.getInstance().call("Business", url);
}

function getBusinesses(url: string) {
  return GetRpcClient.getInstance().call("Businesses", url);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie || "";
  const session = await getSession(context);
  let businesses = Array<BaseBusiness>();
  let initialProducts = Array<BaseProduct>();

  if (session && session.user) {
    const user: any = session.user;
    if (user.id === 0) {
      businesses = await getBusinesses("/api/businesses").then(
        ({ businesses }) => businesses
      );
      initialProducts = await getProducts(
        `/api/products?id=${businesses[0].id}`
      ).then(({ products }) => products);
    } else if (user.id) {
      businesses = await getBusiness(
        `/api/business?id=${user.id}`
      ).then(({ business }) => [business]);
      initialProducts = await getProducts(`/api/products?id=${user.id}`).then(
        ({ products }) => products
      );
    }
  }

  return {
    props: {
      cookie,
      session,
      businesses,
      initialProducts,
    },
  };
};

interface InventoryProps {
  businesses: Array<BaseBusiness>;
  initialProducts: Array<BaseProduct>;
  session: Session | null;
  cookie?: string;
}

export default function Inventory({
  businesses,
  initialProducts,
  session,
  cookie,
}: InventoryProps) {
  const router = useRouter();
  const size = useWindowSize();

  const [isNewItem, setIsNewItem] = useState(false);
  const [businessIndex, setBusinessIndex] = useState(0);
  const [departments, setDepartments] = useState<Array<string>>([]);
  const [products, setProducts] = useState<Array<BaseProduct>>(initialProducts);
  const [productIndex, setProductIndex] = useState(-1);
  const [product, setProduct] = useState(EmptyProduct);
  const [productStatus, setProductStatus] = useState({
    error: "",
    success: "",
  });
  const [uploadStatus, setUploadStatus] = useState({
    uploadType: "" as UploadType,
    error: "",
    open: false,
    loading: false,
    successful: false,
  });

  useEffect(() => {
    getDepartments("/api/departments/get").then(({ departments }) => {
      setDepartments(departments);
    });
    getSession().then((value) => {
      if (!value || !value.user) {
        router.push("/");
      }
    });
  }, []);

  const onAddProduct = () => {
    setIsNewItem(true);
    setProduct(EmptyProduct);
    setProductStatus({ error: "", success: "" });
  };

  const onBusinessClick = async (index: number) => {
    setProducts(
      await getProducts(`/api/products?id=${businesses[index].id}`).then(
        ({ products }) => products
      )
    );
    setBusinessIndex(index);
    setProductIndex(-1);
    setProduct(EmptyProduct);
    setIsNewItem(false);
    setProductStatus({ error: "", success: "" });
  };

  const onProductClick = async (index: number) => {
    setProduct(
      await getProduct(`/api/product?id=${products[index].objectId}`).then(
        ({ product }) => product
      )
    );
    setProductIndex(index);
    setIsNewItem(false);
    setProductStatus({ error: "", success: "" });
  };

  const onUploadTypeChange = (uploadType: UploadType) => {
    setUploadStatus({
      ...uploadStatus,
      uploadType,
    });
  };

  const onUpload = async (uploadType: UploadType, file?: string) => {
    let methodName:
      | "ShopifyProductUpload"
      | "EtsyProductUpload"
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
      .call(
        methodName,
        {
          id: businesses[businessIndex].id,
          csv: file,
        },
        cookie
      )
      .then(({ error }) => {
        if (error) {
          setUploadStatus({
            uploadType,
            error: error,
            open: true,
            loading: false,
            successful: false,
          });
          return;
        }

        setProduct(EmptyProduct);
        setProductIndex(-1);
        setProducts([]);
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
          error: error,
          loading: false,
          successful: false,
        });
      });
  };

  const onSubmit = async ({
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
  }: ProductRequest) => {
    switch (option) {
      case "add":
        await PostRpcClient.getInstance()
          .call(
            "ProductAdd",
            {
              id: businesses[businessIndex].id,
              product: {
                name: encode(name),
                departments: departments.map((value) => encode(value.trim())),
                description: encode(description),
                link: link,
                priceRange: isRange
                  ? [parseFloat(priceLow), parseFloat(priceHigh)]
                  : [parseFloat(price), parseFloat(price)],
                tags: tags
                  .split(",")
                  .map((value) => encode(value.trim()))
                  .filter(Boolean),
                variantImages: [image],
                variantTags: [],
              },
            },
            cookie
          )
          .then(({ product, error }) => {
            if (error) {
              setProductStatus({ error: error, success: "" });
              return;
            }

            setIsNewItem(false);
            setProducts([...products, product]);
            setProductIndex(products.length);
            setProductStatus({
              error: "",
              success: "Successfully added the product!",
            });
          })
          .catch((error) => {
            setProductStatus({ error: error.message, success: "" });
          });
        break;
      case "delete":
        await PostRpcClient.getInstance()
          .call(
            "ProductDelete",
            {
              id: businesses[businessIndex].id,
              product: {
                id: parseInt(products[productIndex].objectId.split("_")[1]),
              },
            },
            cookie
          )
          .then(({ error }) => {
            if (error) {
              setProductStatus({ error: error, success: "" });
              return;
            }

            setProduct(EmptyProduct);
            setProductIndex(-1);
            setProducts([
              ...products.slice(0, productIndex),
              ...products.slice(productIndex + 1),
            ]);
            setProductStatus({
              error: "",
              success: "Successfully deleted the product!",
            });
          })
          .catch((error) => {
            setProductStatus({ error: error.message, success: "" });
          });
        break;
      case "update":
        await PostRpcClient.getInstance()
          .call(
            "ProductUpdate",
            {
              id: businesses[businessIndex].id,
              product: {
                name: encode(name),
                id: parseInt(products[productIndex].objectId.split("_")[1]),
                departments: departments.map((value) => encode(value.trim())),
                description: encode(description),
                link: link,
                priceRange: isRange
                  ? [parseFloat(priceLow), parseFloat(priceHigh)]
                  : [parseFloat(price), parseFloat(price)],
                tags: tags
                  .split(",")
                  .map((value) => encode(value.trim()))
                  .filter(Boolean),
                variantImages: [image],
                variantTags: [],
              },
            },
            cookie
          )
          .then(({ product, error }) => {
            if (error) {
              setProductStatus({ error: error, success: "" });
              return;
            }

            setProducts([
              ...products.slice(0, productIndex),
              product,
              ...products.slice(productIndex + 1),
            ]);
            setProductStatus({
              error: "",
              success: "Successfully updated the product!",
            });
          })
          .catch((error) => {
            setProductStatus({ error: error.message, success: "" });
          });
        break;
    }
  };

  if (!session || !session.user) {
    return null;
  }

  if (!size.height) {
    return (
      <RootLayout session={session}>
        <DashboardLayout tab="inventory" />
      </RootLayout>
    );
  }

  return (
    <RootLayout session={session}>
      <DashboardLayout tab="inventory">
        <InventoryPage
          isNewItem={isNewItem}
          businesses={businesses}
          businessIndex={businessIndex}
          departments={departments}
          products={products}
          productIndex={productIndex}
          product={product}
          uploadType={uploadStatus.uploadType}
          uploadError={uploadStatus.error}
          uploadOpen={uploadStatus.open}
          uploadLoading={uploadStatus.loading}
          uploadSuccessful={uploadStatus.successful}
          error={productStatus.error}
          success={productStatus.success}
          height={size.height}
          onAddProduct={onAddProduct}
          onBusinessClick={onBusinessClick}
          onProductClick={onProductClick}
          onUpload={onUpload}
          onUploadTypeChange={onUploadTypeChange}
          onSubmit={onSubmit}
        />
      </DashboardLayout>
    </RootLayout>
  );
}
