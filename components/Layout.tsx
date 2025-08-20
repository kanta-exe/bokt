import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  
  // Prevent hydration mismatch by not rendering session-dependent content until loaded
  const isLoading = status === "loading";
  
  return (
    <div className="flex min-h-screen flex-col bg-background" suppressHydrationWarning>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-2xl text-foreground">
            BOKT.
          </Link>
          <nav className="hidden gap-8 md:flex">
            <Link href="/models" className="text-lg font-semibold px-4 py-2 text-foreground hover:text-accent transition-colors">Models</Link>
            <Link href="/auth/model-application" className="text-lg font-semibold px-4 py-2 text-foreground hover:text-accent transition-colors">Apply</Link>
            <Link href="/how-it-works" className="text-lg font-semibold px-4 py-2 text-foreground hover:text-accent transition-colors">How it works</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {!isLoading && session && (session.user as any)?.role === 'ADMIN' && (
              <>
                <span className="text-sm text-muted-foreground">{session.user?.email}</span>
                <Link href="/admin" className="text-sm text-accent hover:underline">Admin</Link>
                <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-black hover:bg-accent/90 transition-colors">Sign out</button>
              </>
            )}
          </div>
          <button className="md:hidden p-2 -m-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle Menu">
            <span className="text-xl">☰</span>
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container-page flex flex-col py-2">
              <Link href="/models" className="py-4 text-lg font-semibold text-foreground hover:text-accent border-b border-border" onClick={() => setOpen(false)}>Models</Link>
              <Link href="/auth/model-application" className="py-4 text-lg font-semibold text-foreground hover:text-accent border-b border-border" onClick={() => setOpen(false)}>Apply</Link>
              <Link href="/how-it-works" className="py-4 text-lg font-semibold text-foreground hover:text-accent border-b border-border" onClick={() => setOpen(false)}>How it works</Link>
              <div className="flex items-center gap-3 mt-2">
                <ThemeToggle />
                {!isLoading && session && (session.user as any)?.role === 'ADMIN' && (
                  <>
                    <Link href="/admin" className="text-sm text-accent hover:underline">Admin</Link>
                    <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-black hover:bg-accent/90">Sign out</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-background">
        <div className="container-page py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} BOKT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}



