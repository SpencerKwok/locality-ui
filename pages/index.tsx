import React from "react";
import { useRouter } from "next/router";

import { GetRpcClient } from "../components/common/RpcClient";
import HomePage from "../components/home/Home";
import RootLayout from "../components/common/RootLayout";
import { useWindowSize } from "../lib/common";

import type { GetServerSideProps } from "next";
import type { BaseBusiness } from "../components/common/Schema";

interface HomeProps {
  businesses: Array<BaseBusiness>;
}

function fetcher(url: string) {
  return GetRpcClient.getInstance().call("Businesses", url);
}

let cachedBusinesses: Array<BaseBusiness>;
export const getServerSideProps: GetServerSideProps = async () => {
  if (cachedBusinesses) {
    fetcher("/api/businesses").then(({ businesses }) => {
      cachedBusinesses = businesses;
    });
  } else {
    cachedBusinesses = await fetcher("/api/businesses").then(
      ({ businesses }) => businesses
    );
  }

  return {
    props: {
      businesses: cachedBusinesses,
    },
  };
};

export default function Home({ businesses }: HomeProps) {
  const { query } = useRouter();
  const size = useWindowSize();
  if (!size.width) {
    return <RootLayout />;
  }

  const isNewUser = query.newUser === "true";
  return (
    <RootLayout>
      <HomePage
        businesses={businesses}
        isNewUser={isNewUser}
        width={size.width * 0.9}
      />
    </RootLayout>
  );
}
