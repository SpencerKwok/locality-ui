import { useState } from "react";
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/client";
import { useRouter } from "next/router";

import InventoryPage, {
  ProductRequest,
} from "../../components/dashboard/Inventory";
import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import {
  BaseBusiness,
  BaseProduct,
  EmptyProduct,
} from "../../components/common/Schema";
import { useWindowSize } from "../../lib/common";

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
  cookie,
}: InventoryProps) {
  const [session, loading] = useSession();
  const router = useRouter();
  const size = useWindowSize();

  const [isNewItem, setIsNewItem] = useState(false);
  const [businessIndex, setBusinessIndex] = useState(0);
  const [products, setProducts] = useState<Array<BaseProduct>>(initialProducts);
  const [productIndex, setProductIndex] = useState(-1);
  const [product, setProduct] = useState(EmptyProduct);
  const [productStatus, setProductStatus] = useState({
    error: "",
    success: "",
  });
  const [shopifyUploadStatus, setShopifyUploadStatus] = useState({
    error: false,
    open: false,
    loading: false,
    successful: false,
  });

  const onAddProduct = () => {
    setIsNewItem(true);
    setProduct(EmptyProduct);
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

  const onShopifyUpload = async () => {
    setShopifyUploadStatus({
      error: false,
      open: true,
      loading: true,
      successful: false,
    });
    await PostRpcClient.getInstance()
      .call(
        "ShopifyProductUpdate",
        { businessId: businesses[businessIndex].id },
        cookie
      )
      .then(({ products, error }) => {
        if (error) {
          setShopifyUploadStatus({
            error: true,
            open: true,
            loading: false,
            successful: false,
          });
          return;
        }

        setProduct(EmptyProduct);
        setProductIndex(-1);
        setProducts(products);
        setIsNewItem(false);
        setShopifyUploadStatus({
          error: false,
          open: true,
          loading: false,
          successful: true,
        });

        setTimeout(() => {
          setShopifyUploadStatus({
            error: false,
            open: false,
            loading: false,
            successful: false,
          });
        }, 2000);
      })
      .catch((error) => {
        setShopifyUploadStatus({
          open: true,
          error: true,
          loading: false,
          successful: false,
        });

        setTimeout(() => {
          setShopifyUploadStatus({
            error: false,
            open: false,
            loading: false,
            successful: false,
          });
        }, 5000);
      });
  };

  const onSubmit = async ({
    name,
    primaryKeywords,
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
              businessId: businesses[businessIndex].id,
              product: {
                name: name,
                primaryKeywords: primaryKeywords
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
                departments: departments,
                description: description,
                image: image,
                link: link,
                price: isRange ? parseFloat(priceLow) : parseFloat(price),
                priceRange: isRange
                  ? [parseFloat(priceLow), parseFloat(priceHigh)]
                  : [parseFloat(price), parseFloat(price)],
              },
            },
            cookie
          )
          .then(({ product, error }) => {
            if (error) {
              setProductStatus({ error: error, success: "" });
              return;
            }

            setProduct(EmptyProduct);
            setProducts(
              [...products, product].sort((a, b) =>
                a.name.localeCompare(b.name)
              )
            );
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
              businessId: businesses[businessIndex].id,
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
              businessId: businesses[businessIndex].id,
              product: {
                name: name,
                id: parseInt(products[productIndex].objectId.split("_")[1]),
                primaryKeywords: primaryKeywords
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
                departments: departments,
                description: description,
                image: image,
                link: link,
                price: isRange ? parseFloat(priceLow) : parseFloat(price),
                priceRange: isRange
                  ? [parseFloat(priceLow), parseFloat(priceHigh)]
                  : [parseFloat(price), parseFloat(price)],
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

  if (loading) {
    return null;
  }

  if (!session || !session.user) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  if (!size.height) {
    return <RootLayout />;
  }

  return (
    <RootLayout>
      <InventoryPage
        isNewItem={isNewItem}
        businesses={businesses}
        businessIndex={businessIndex}
        products={products}
        productIndex={productIndex}
        product={product}
        shopifyError={shopifyUploadStatus.error}
        shopifyOpen={shopifyUploadStatus.open}
        shopifyLoading={shopifyUploadStatus.loading}
        shopifySuccessful={shopifyUploadStatus.successful}
        error={productStatus.error}
        success={productStatus.success}
        height={size.height}
        onAddProduct={onAddProduct}
        onBusinessClick={onBusinessClick}
        onProductClick={onProductClick}
        onShopifyUpload={onShopifyUpload}
        onSubmit={onSubmit}
      />
    </RootLayout>
  );
}
