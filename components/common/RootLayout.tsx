import Navigation from "components/common/navigation/Navigation";
import Footer from "components/common/footer/Footer";
import { useWindowSize } from "lib/common";

import type { FC, ReactNode } from "react";
import type { Session } from "next-auth";

export interface RootLayoutProps {
  children?: ReactNode;
  session: Session | null;
}

const RootLayout: FC<RootLayoutProps> = ({ children, session }) => {
  const size = useWindowSize();

  if (typeof size.width !== "number") {
    return null;
  }

  return (
    <div>
      <Navigation user={session?.user} width={size.width} />
      <main>{children}</main>
      <Footer width={size.width} />
    </div>
  );
};

export default RootLayout;
