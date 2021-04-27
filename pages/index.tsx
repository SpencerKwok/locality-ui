import React from "react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";

import { CompaniesResponse } from "../components/common/Schema";
import { GetRpcClient } from "../components/common/RpcClient";
import HomePage from "../components/home/Home";
import RootLayout from "../components/root-layout/RootLayout";

interface HomeProps {
  companies: CompaniesResponse;
}

function fetcher(url: string) {
  return GetRpcClient.getInstance().call("Companies", url);
}

export const getStaticProps: GetStaticProps = async () => {
  return fetcher("/api/companies")
    .then((companies) => ({ props: { companies }, revalidate: 60 * 60 }))
    .catch(() => ({
      props: { companies: { companies: [] } },
      revalidate: 1,
    }));
};

export default function Home({ companies }: HomeProps) {
  const { query } = useRouter();
  const isNewUser = query.newUser === "true";
  return (
    <RootLayout>
      <HomePage companies={companies.companies} isNewUser={isNewUser} />
    </RootLayout>
  );
}
