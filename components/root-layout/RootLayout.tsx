import React from "react";
import Head from "next/head";

import NavigationDesktop from "../navigation/NavigationDesktop";
import NavigationMobile from "../navigation/NavigationMobile";
import { useWindowSize } from "../../lib/common";

const headers = (
  <Head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <meta name="title" content="Locality | Online Local Marketplace" />
    <meta
      name="description"
      content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
    />
    <meta name="robots" content="index, follow" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.mylocality.shop" />
    <meta property="og:title" content="Locality | Online Local Marketplace" />
    <meta
      property="og:description"
      content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
    />
    <meta property="og:image" content="locality-logo.png" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://www.mylocality.shop" />
    <meta
      property="twitter:title"
      content="Locality | Online Local Marketplace"
    />
    <meta
      property="twitter:description"
      content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
    />
    <meta property="twitter:image" content="locality-logo.png" />

    <link rel="shortcut icon" href="locality-icon.ico" />
    <link rel="apple-touch-icon" href="locality-icon.ico" />

    <link rel="canonical" href="https://www.mylocality.shop" />

    <title>Locality | Online Local Marketplace</title>
  </Head>
);

export interface PageProps {
  children?: JSX.Element | Array<JSX.Element>;
}

export default function Page({ children }: PageProps) {
  const size = useWindowSize();
  if (!size.width) {
    return headers;
  }

  return (
    <div>
      {headers}
      {size.width <= 800 ? <NavigationMobile /> : <NavigationDesktop />}
      <main style={{ marginTop: 24 }}>{children}</main>
    </div>
  );
}