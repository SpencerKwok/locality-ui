import { useRouter } from "next/router";

import HomePage from "components/home/Home";
import HomeMobilePage from "components/home/HomeMobile";
import RootLayout from "components/common/RootLayout";
import { IsMobile, useWindowSize } from "lib/common";

import type { FC } from "react";
import type { BaseBusiness } from "../common/Schema";
import type { Session } from "next-auth";

interface HomeProps {
  businesses: Array<BaseBusiness>;
  session: Session | null;
}

const Home: FC<HomeProps> = ({ session }) => {
  const { query } = useRouter();
  const size = useWindowSize();
  if (typeof size.width !== "number") {
    return <RootLayout session={session} />;
  }

  const isNewUser = query.newUser === "true";
  const isMobile = IsMobile() || size.width <= 840;
  return (
    <RootLayout session={session}>
      {isMobile ? (
        <HomeMobilePage width={size.width} />
      ) : (
        <HomePage isNewUser={isNewUser} width={size.width} />
      )}
    </RootLayout>
  );
};

export default Home;
