import { Fragment, useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import Head from "next/head";
import { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";

import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import type { FC } from "react";

const protectedPagesRegex = /^\/(dashboard|signin|signup|wishlist)/g;

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loaded, setLoaded] = useState(false);
  const [prevPath, setPrevPath] = useState("/");
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

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

  return (
    <Fragment>
      <Head>
        <title>Locality | Online Local Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} session={session} />
    </Fragment>
  );
};

export default App;
