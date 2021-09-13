import Navigation from "components/common/navigation/Navigation";
import NavigationMobile from "components/common/navigation/NavigationMobile";
import Footer from "components/common/footer/Footer";
import FooterMobile from "components/common/footer/FooterMobile";
import { useWindowSize, IsMobile } from "lib/common";

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

  const scale = Math.round((size.width / 1519) * 10) / 10;
  const isMobile = IsMobile() || size.width <= 840;

  return (
    <div className="top-middle-column" style={{ display: "flex" }}>
      {isMobile ? (
        <NavigationMobile user={session?.user} />
      ) : (
        <Navigation user={session?.user} scale={scale} />
      )}
      <main style={{ marginTop: isMobile ? 80 : 100 * scale }}>{children}</main>
      {isMobile ? <FooterMobile /> : <Footer />}
    </div>
  );
};

export default RootLayout;
