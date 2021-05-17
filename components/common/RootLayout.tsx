import React, { ReactNode } from "react";
import { useSession } from "next-auth/client";

import NavigationDesktop from "./navigation/NavigationDesktop";
import NavigationMobile from "./navigation/NavigationMobile";
import { NavigationType } from "./navigation/NavigationProps";
import { useWindowSize } from "../../lib/common";

export interface RootLayoutProps {
  children?: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const size = useWindowSize();
  const [session, loading] = useSession();
  if (!size.width || loading) {
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
