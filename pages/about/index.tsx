import AboutPage from "components/about/About";
import RootLayout from "components/common/RootLayout";
import { useWindowSize } from "lib/common";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface AboutProps {
  session: Session | null;
}

const About: FC<AboutProps> = ({ session }) => {
  const size = useWindowSize();
  if (typeof size.width !== "number") {
    return <RootLayout session={session} />;
  }

  return (
    <RootLayout session={session}>
      <AboutPage isMobile={size.width <= 720} width={size.width} />
    </RootLayout>
  );
};

export default About;
