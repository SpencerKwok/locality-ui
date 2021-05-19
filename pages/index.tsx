import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { GetRpcClient } from "../components/common/RpcClient";
import HomePage from "../components/home/Home";
import RootLayout from "../components/common/RootLayout";
import { useWindowSize } from "../lib/common";

import { helper } from "./api/businesses";

import type { GetStaticProps } from "next";
import type { BaseBusiness } from "../components/common/Schema";

function fetcher(url: string) {
  return GetRpcClient.getInstance().call("Businesses", url);
}

export default function Home() {
  const { query } = useRouter();
  const size = useWindowSize();
  const [businesses, setBusinesses] = useState<Array<BaseBusiness>>([]);

  useEffect(() => {
    fetcher("/api/businesses").then(({ businesses }) =>
      setBusinesses(businesses)
    );
  }, []);

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
