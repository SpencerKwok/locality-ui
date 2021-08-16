import { useRouter } from "next/router";

import HomePage from "components/home/Home";
import RootLayout from "components/common/RootLayout";
import { useWindowSize } from "lib/common";

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
  return (
    <RootLayout session={session}>
      <HomePage isNewUser={isNewUser} width={size.width} />
    </RootLayout>
  );
};

export default Home;
