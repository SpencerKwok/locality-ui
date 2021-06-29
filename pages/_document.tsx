import React from "react";
import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";
import Script from "next/script";
import { ServerStyleSheet } from "styled-components";

import { NODE_ENV } from "lib/env";

import type { DocumentInitialProps } from "next/document";
import type { JSXElementConstructor, ReactElement } from "react";
import type { RenderPageResult } from "next/dist/next-server/lib/utils";

const prod = NODE_ENV === "production";
export default class MyDocument extends Document {
  public static async getInitialProps(
    context: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = context.renderPage;

    try {
      context.renderPage = (): Promise<RenderPageResult> | RenderPageResult =>
        originalRenderPage({
          enhanceApp:
            (App) =>
            (
              props
            ): ReactElement<
              { sheet: ServerStyleSheet },
              JSXElementConstructor<any> | string
            > =>
              sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(context);
      return {
        ...initialProps,
        styles: (
          <React.Fragment>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </React.Fragment>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  public render(): JSX.Element {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />

          <meta name="application-name" content="Locality" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Locality" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#449ed7" />

          <meta name="title" content="Locality | Online Local Marketplace" />
          <meta
            name="description"
            content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
          />
          <meta name="robots" content="index, follow" />

          <meta
            property="og:description"
            content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
          />
          <meta property="og:image" content="/locality-logo.png" />
          <meta
            property="og:title"
            content="Locality | Online Local Marketplace"
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.mylocality.shop" />
          <meta property="og:site_name" content="Locality" />

          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:creator" content="@Localit56322295" />
          <meta
            property="twitter:description"
            content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
          />
          <meta property="twitter:image" content="/locality-logo.png" />
          <meta
            property="twitter:title"
            content="Locality | Online Local Marketplace"
          />
          <meta property="twitter:url" content="https://www.mylocality.shop" />

          <link
            rel="apple-touch-icon"
            href="/icons/locality-icon-192x192.png"
          />
          <link rel="shortcut icon" href="/icons/locality-icon-192x192.png" />
          <link rel="icon" href="/locality-icon.ico" />
          <link rel="manifest" href="/manifest.json" />

          <link rel="canonical" href="https://www.mylocality.shop" />

          {prod && <Script src="/js/hotjar.js" strategy="afterInteractive" />}
          {prod && <Script src="/js/gtag.js" strategy="afterInteractive" />}
        </Head>
        <body>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WR9KB5K"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
