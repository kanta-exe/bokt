import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/lib/theme-context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="bokt-ui-theme">
      <SessionProvider session={(pageProps as any)?.session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </ThemeProvider>
  );
}
