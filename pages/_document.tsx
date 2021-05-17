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

          <meta name="title" content="Locality | Online Local Marketplace" />
          <meta
            name="description"
            content="Locality is an online marketplace that helps you find special and unique products from locally owned small businesses, making it easy to support and buy local."
          />
          <meta name="robots" content="index, follow" />

          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.mylocality.shop" />
          <meta
            property="og:title"
            content="Locality | Online Local Marketplace"
          />
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

          <link rel="shortcut icon" href="/locality-icon.ico" />
          <link rel="apple-touch-icon" href="/locality-icon.ico" />

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
