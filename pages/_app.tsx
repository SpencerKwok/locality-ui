import React, { Fragment } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Head>
        <title>Locality | Online Local Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </Fragment>
  );
}
