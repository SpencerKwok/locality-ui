import { getSession } from "next-auth/client";

import DashboardPage from "components/dashboard/Dashboard";
import { GetRpcClient } from "components/common/RpcClient";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { GetServerSideProps } from "next";
import type { Session } from "next-auth";
import type {
  BaseBusiness,
  BaseProduct,
  BusinessResponse,
  BusinessesResponse,
  ProductsResponse,
} from "common/Schema";

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
  if (!session?.user) {
    // Need to refresh CSP
    window.location.assign("/signin");
    return null;
  }

  const user: any = session.user;
  const firstName: string = user.firstName;
  const lastName: string = user.lastName;
  return (
    <RootLayout session={session}>
      <DashboardPage
        businesses={businesses}
        isNewBusiness={isNewBusiness}
        initialProducts={initialProducts}
        initialTab={initialTab}
        firstName={firstName}
        lastName={lastName}
      />
    </RootLayout>
  );
};

export default Dashboard;
