import { ReactNode } from "react";

import NavigationDesktop from "components/common/navigation/NavigationDesktop";
import NavigationMobile from "components/common/navigation/NavigationMobile";
import { useWindowSize } from "lib/common";

import type { Session } from "next-auth";
import type { NavigationType } from "components/common/navigation/NavigationProps";

export interface RootLayoutProps {
  children?: ReactNode;
  session: Session | null;
}

export default function RootLayout({ children, session }: RootLayoutProps) {
  const size = useWindowSize();

  if (!size.width) {
    return null;
  }

  let navigationType: NavigationType = "none";
  let breakpoint = 680;
  if (session && session.user) {
    const user: any = session.user;
    navigationType = user.isBusiness ? "business" : "user";
    breakpoint = user.isBusiness ? 800 : 680;
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
}
