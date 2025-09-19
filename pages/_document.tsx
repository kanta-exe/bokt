import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://boktco.com/" />
        <meta property="og:title" content="BOKT. Book Fashion Models" />
        <meta property="og:description" content="Book fashion models fast. Direct, transparent, and reliable." />
        <meta property="og:site_name" content="BOKT" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="https://boktco.com/" />
        <meta property="twitter:title" content="BOKT. Book Fashion Models" />
        <meta property="twitter:description" content="Book fashion models fast. Direct, transparent, and reliable." />

        {/* Additional SEO */}
        <meta name="description" content="Book fashion models fast. Direct, transparent, and reliable." />
        <meta name="keywords" content="models, fashion models, booking, talents, commercial, runway" />
        <meta name="author" content="BOKT" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
