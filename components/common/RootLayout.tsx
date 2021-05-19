import { ReactNode, useEffect, useState } from "react";
import { getSession } from "next-auth/client";

import NavigationDesktop from "./navigation/NavigationDesktop";
import NavigationMobile from "./navigation/NavigationMobile";
import { useWindowSize } from "../../lib/common";

import type { Session } from "next-auth";
import type { NavigationType } from "./navigation/NavigationProps";

export interface RootLayoutProps {
  children?: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const size = useWindowSize();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession().then((value) => {
      if (value !== session) {
        setSession(value);
      }
    });
  }, []);

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
