import NavigationDesktop from "components/common/navigation/NavigationDesktop";
import NavigationMobile from "components/common/navigation/NavigationMobile";
import { useWindowSize } from "lib/common";

import type { FC, ReactNode } from "react";
import type { Session } from "next-auth";
import type { NavigationType } from "components/common/navigation/NavigationProps";

export interface RootLayoutProps {
  children?: ReactNode;
  session: Session | null;
}

const RootLayout: FC<RootLayoutProps> = ({ children, session }) => {
  const size = useWindowSize();

  if (typeof size.width !== "number") {
    return null;
  }

  let navigationType: NavigationType = "none";
  let breakpoint = 680;
  if (session?.user) {
    const user: any = session.user;
    navigationType = user.isBusiness === true ? "business" : "user";
    breakpoint = user.isBusiness === true ? 800 : 680;
  }

  return (
    <div>
      {size.width <= breakpoint ? (
        <NavigationMobile type={navigationType} />
      ) : (
        <NavigationDesktop type={navigationType} />
      )}
      <main style={{ marginTop: 24 }}>{children}</main>
    </div>
  );
};

export default RootLayout;
