import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document'

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return await Document.getInitialProps(ctx)
  }

  render() {
    return (
      <Html>
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#603cba" />
          <meta name="theme-color" content="#ffffff" />
          <link
            crossOrigin="anonymous"
            rel="preconnect"
            href="https://fonts.bunny.net"
          />
          <link
            crossOrigin="anonymous"
            href="https://fonts.bunny.net/css?family=fira-code:500,700|inter:500,700|lobster:400"
            rel="stylesheet"
          />
        </Head>
        <body className="mocha bg-base text-text">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
