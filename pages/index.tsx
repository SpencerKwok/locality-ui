import { useRouter } from "next/router";

import HomePage from "components/home/Home";
import RootLayout from "components/common/RootLayout";
import SumoLogic from "lib/api/sumologic";
import { useWindowSize } from "lib/common";

import { helper } from "./api/businesses";

import type { FC } from "react";
import type { GetServerSideProps } from "next";
import type { BaseBusiness } from "../common/Schema";
import type { Session } from "next-auth";

interface HomeProps {
  businesses: Array<BaseBusiness>;
  session: Session | null;
}

let cachedBusinesses: Array<{
  id: number;
  logo: string;
  homepages: { homepage: string };
  name: string;
}> = [];
export const getServerSideProps: GetServerSideProps = async () => {
  await new Promise((resolve) => {
    void helper().then((res) => {
      if (!res) {
        // Don't update cached businesses
        // if we fail to fetch them
        SumoLogic.log({
          level: "error",
          method: "/",
          message: "Failed to fetch businesses",
        });
        resolve(false);
        return;
      }
      cachedBusinesses = res.businesses
        .map(({ id, logo, homepages, name }) => ({
          id,
          logo,
          homepages: { homepage: homepages.homepage },
          name,
        }))
        .sort((a: { id: number }, b: { id: number }) => b.id - a.id);
      resolve(true);
    });

    if (cachedBusinesses.length > 0) {
      resolve(true);
    }
  });
  return {
    props: {
      businesses: cachedBusinesses,
    },
  };
};

const Home: FC<HomeProps> = ({ session }) => {
  const { query } = useRouter();
  const size = useWindowSize();
  if (typeof size.width !== "number") {
    return <RootLayout session={session} />;
  }

  const isNewUser = query.newUser === "true";
  return (
    <RootLayout session={session}>
      <HomePage isNewUser={isNewUser} width={size.width} />
    </RootLayout>
  );
};

export default Home;
