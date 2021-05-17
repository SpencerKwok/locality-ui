import React, { Fragment } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Provider } from "next-auth/client";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App({ Component, pageProps }: AppProps) {
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
