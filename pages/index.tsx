import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import HomePage from "components/home/Home";
import HomeMobilePage from "components/home/HomeMobile";
import RootLayout from "components/common/RootLayout";
import ThemeContext from "components/common/Theme";
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
  const [hash, setHash] = useState("");
  const size = useWindowSize();

  const hashchangeEventListener = (): void => {
    const width: number = size.width ?? 0;
    const isMobile = IsMobile() || width <= 840;
    if (isMobile) {
      let section = document.getElementById(hash);
      if (section) {
        const sectionPos = section.getBoundingClientRect().top - 85;
        window.scrollTo({
          top: window.scrollY + sectionPos,
          behavior: "smooth",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } else {
      const scale = Math.round((width / 1519) * 10) / 10;
      switch (hash) {
        case "#how-it-works":
          window.scrollTo({ behavior: "smooth", top: 800 * scale });
          break;
        case "#explore-goodies":
          window.scrollTo({ behavior: "smooth", top: 1600 * scale });
          break;
        case "#our-partners":
          window.scrollTo({ behavior: "smooth", top: 2400 * scale });
          break;
        case "#meet-the-team":
          window.scrollTo({ behavior: "smooth", top: 3200 * scale });
          break;
        default:
          window.scrollTo({ behavior: "smooth", top: 0 });
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("hashchange", hashchangeEventListener);
    return (): void => {
      window.removeEventListener("hashchange", hashchangeEventListener);
    };
  }, [hash, size]);

  useEffect(() => {
    hashchangeEventListener();
  }, [hash]);

  if (typeof size.width !== "number") {
    return <RootLayout session={session} />;
  }

  if (hash !== location.hash) {
    setHash(location.hash);
  }

  const isNewUser = query.newUser === "true";
  return (
    <ThemeContext.Consumer>
      {({ isMobile }): JSX.Element => (
        <RootLayout session={session}>
          {isMobile ? <HomeMobilePage /> : <HomePage isNewUser={isNewUser} />}
        </RootLayout>
      )}
    </ThemeContext.Consumer>
  );
};

export default Home;
