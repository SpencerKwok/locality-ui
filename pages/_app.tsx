import { Fragment, useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import Head from "next/head";
import { useRouter } from "next/router";
import ThemeContext, { DefaultTheme } from "components/common/Theme";
import { polyfill } from "seamless-scroll-polyfill";
import "../styles.css";

import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import type { FC } from "react";
import { IsMobile, useWindowSize } from "lib/common";

const protectedPagesRegex = /^\/(dashboard|signin|signup|wishlist)/g;

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loaded, setLoaded] = useState(false);
  const [prevPath, setPrevPath] = useState("/");
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const windowSize = useWindowSize();

  useEffect(() => {
    // By-pass waiting if user is transitioning
    // within session protected pages
    if (
      prevPath.match(protectedPagesRegex) &&
      router.pathname.match(protectedPagesRegex)
    ) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }

    void getSession().then((value) => {
      setSession(value);
      setLoaded(true);
      setPrevPath(router.pathname);
    });
  }, [router.pathname]);

  // Wait for session data for session-protected pages
  const sessionProtected = router.pathname.match(protectedPagesRegex);
  if (sessionProtected && !loaded) {
    return (
      <Head>
        <title>Locality | Online Local Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    );
  }

  // Add polyfill to support smooth
  // scroll behaviour on Safari
  if (typeof window !== "undefined") {
    polyfill();
  }

  const scale =
    windowSize.width !== undefined
      ? Math.round((windowSize.width / 1519) * 10) / 10
      : 0;
  const clientWindowSize = {
    height: windowSize.height !== undefined ? windowSize.height : 0,
    width: windowSize.width !== undefined ? windowSize.width : 0,
  };
  const isMobile =
    windowSize.width !== undefined
      ? IsMobile() || windowSize.width <= 840
      : false;
  return (
    <Fragment>
      <Head>
        <title>Locality | Online Local Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeContext.Provider
        value={{
          ...DefaultTheme,
          size: clientWindowSize,
          scale,
          isMobile,
        }}
      >
        <Component {...pageProps} session={session} />
      </ThemeContext.Provider>
    </Fragment>
  );
};

export default App;
