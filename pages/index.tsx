import React from "react";
import { useRouter } from "next/router";

import { GetRpcClient } from "../components/common/RpcClient";
import HomePage from "../components/home/Home";
import RootLayout from "../components/common/RootLayout";
import { useWindowSize } from "../lib/common";

import { helper } from "./api/businesses";

import type { GetStaticProps } from "next";
import type { BaseBusiness } from "../components/common/Schema";

interface HomeProps {
  businesses: Array<BaseBusiness>;
}

export const getStaticProps: GetStaticProps = async () => {
  const [{ businesses }, error] = await helper();
  if (error) {
    console.log(error);
    return {
      props: {
        businesses: [],
      },
      revalidate: 1,
    };
  }
  return {
    props: {
      businesses,
    },
    revalidate: 60 * 60,
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
