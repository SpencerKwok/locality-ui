import { Fragment, useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import Head from "next/head";
import { Provider } from "next-auth/client";
import { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";

import type { AppProps } from "next/app";
import type { Session } from "next-auth";

export default function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    getSession().then((value) => {
      setSession(value);
    });
  }, [router]);

  // Only use the provider for the dashboard
  // since it improves performance navigating
  // the dashboard and is worth the worse first
  // paint tradeoff
  if (router.pathname.match(/^\/dashboard/g)) {
    return (
      <Fragment>
        <Head>
          <title>Locality | Online Local Marketplace</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Provider session={pageProps.session}>
          <Component {...pageProps} />
        </Provider>
      </Fragment>
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
}
