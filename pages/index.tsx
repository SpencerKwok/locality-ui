import { useRouter } from "next/router";

import HomePage from "components/home/Home";
import RootLayout from "components/common/RootLayout";
import SumoLogic from "lib/api/sumologic";
import { useWindowSize } from "lib/common";

import { helper } from "./api/businesses";

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
    helper().then((res) => {
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

export default function Home({ businesses, session }: HomeProps) {
  const { query } = useRouter();
  const size = useWindowSize();
  if (!size.width) {
    return <RootLayout session={session} />;
  }

  const isNewUser = query.newUser === "true";
  return (
    <RootLayout session={session}>
      <HomePage
        businesses={businesses}
        isNewUser={isNewUser}
        width={size.width * 0.9}
      />
    </RootLayout>
  );
}
