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
            <Link href="/faqs" className="text-lg font-semibold px-4 py-2 text-foreground hover:text-accent transition-colors">FAQs</Link>
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
                <Link href="/faqs" className="py-4 text-lg font-semibold text-foreground hover:text-accent border-b border-border" onClick={() => setOpen(false)}>FAQs</Link>
              {!isLoading && session && (session.user as any)?.role === 'ADMIN' && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                  <Link href="/admin" className="text-sm text-accent hover:underline">Admin</Link>
                  <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-black hover:bg-accent/90">Sign out</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Floating theme toggle for mobile */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>

      <footer className="border-t border-border bg-background">
        <div className="container-page py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="font-bold tracking-tight text-2xl text-foreground mb-4">BOKT.</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Connecting brands with professional models for exceptional photoshoots and modelling projects.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/bokt.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/models" className="text-muted-foreground hover:text-accent transition-colors">
                    Browse Models
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-muted-foreground hover:text-accent transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/auth/model-application" className="text-muted-foreground hover:text-accent transition-colors">
                    Apply as Model
                  </Link>
                </li>

              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support & Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/faqs" className="text-muted-foreground hover:text-accent transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-accent transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="https://wa.me/+201158889002" className="text-muted-foreground hover:text-accent transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="tel:+201158889002" className="text-muted-foreground hover:text-accent transition-colors">
                    
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BOKT. All rights reserved. | Connecting talent with opportunity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



