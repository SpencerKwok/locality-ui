import React from "react";
import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(context: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = context.renderPage;

    try {
      context.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
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

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />

          <meta name="application-name" content="Locality" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />

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

          <link rel="apple-touch-icon" href="/locality-icon.ico" />
          <link rel="icon" href="/locality-icon.ico" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/locality-icon.ico" />

          <link rel="canonical" href="https://www.mylocality.shop" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
