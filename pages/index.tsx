import { useRouter } from "next/router";

import HomePage from "../components/home/Home";
import RootLayout from "../components/common/RootLayout";
import { useWindowSize } from "../lib/common";

import { helper } from "./api/businesses";

import type { GetStaticProps } from "next";
import type { BaseBusiness } from "../components/common/Schema";
import type { Session } from "next-auth";

interface HomeProps {
  businesses: Array<BaseBusiness>;
  session: Session | null;
}

export const getStaticProps: GetStaticProps = async () => {
  const [rawBusinesses] = await helper();
  const businesses = rawBusinesses.businesses
    .map(({ id, logo, homepages, name }: BaseBusiness) => ({
      id,
      logo,
      homepages: { homepage: homepages.homepage },
      name,
    }))
    .sort((a: { id: number }, b: { id: number }) => b.id - a.id);
  return {
    props: {
      businesses,
      revalidate: 60 * 60,
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
