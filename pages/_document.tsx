import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bokt.com/" />
        <meta property="og:title" content="Bokt - Connect Models with Brands" />
        <meta property="og:description" content="Discover talented models and connect with brands for professional photoshoots. Join the platform that brings creativity and business together." />
        <meta property="og:image" content="https://bokt.com/og-image.jpg" />
        <meta property="og:site_name" content="Bokt" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://bokt.com/" />
        <meta property="twitter:title" content="Bokt - Connect Models with Brands" />
        <meta property="twitter:description" content="Discover talented models and connect with brands for professional photoshoots. Join the platform that brings creativity and business together." />
        <meta property="twitter:image" content="https://bokt.com/og-image.jpg" />

        {/* Additional SEO */}
        <meta name="description" content="Discover talented models and connect with brands for professional photoshoots. Join the platform that brings creativity and business together." />
        <meta name="keywords" content="models, modeling, brands, photoshoots, fashion, commercial, talent, booking" />
        <meta name="author" content="Bokt" />
        
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
