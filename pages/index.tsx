import React from "react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { BaseBusiness } from "../components/common/Schema";
import { GetRpcClient } from "../components/common/RpcClient";
import HomePage from "../components/home/Home";
import RootLayout from "../components/common/RootLayout";
import { useWindowSize } from "../lib/common";

interface HomeProps {
  businesses: Array<BaseBusiness>;
}

function fetcher(url: string) {
  return GetRpcClient.getInstance().call("Businesses", url);
}

export const getStaticProps: GetStaticProps = async () => {
  return await fetcher("/api/businesses?cache=true")
    .then((res) => ({
      props: {
        businesses: res.businesses,
      },
      revalidate: 60 * 60,
    }))
    .catch(() => ({
      props: { businesses: [] },
      revalidate: 1,
    }));
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
