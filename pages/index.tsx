import Link from "next/link";
import Head from "next/head";
import { prisma } from "@/lib/prisma";
import type { GetServerSideProps } from "next";
import FeaturedSlider from "@/components/FeaturedSlider";
import TalentCard, { Talent } from "@/components/TalentCard";

type Props = {
  featured: Talent[];
  results: Talent[];
};

export default function Home({ featured, results }: Props) {
  return (
    <div>
      <Head>
        {/* Force text-only preview. No image */}
        <meta property="og:title" content="BOKT. Book Fashion Models" />
        <meta property="og:description" content="Book fashion models fast. Direct, transparent, and reliable." />
        <meta property="og:image" content="" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="BOKT. Book Fashion Models" />
        <meta name="twitter:description" content="Book fashion models fast. Direct, transparent, and reliable." />
        <meta name="twitter:image" content="" />
        <meta name="robots" content="noimageindex" />
      </Head>
      {/* Hero */}
      <section className="container-page py-8 sm:py-14 md:py-20 px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Book Your Talent Now
        </h1>
        <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          Discover and book fashion models. Fast, direct, and transparent.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link href="/models" className="rounded-lg bg-accent px-6 py-4 font-semibold text-black hover:bg-accent/90 transition-colors text-center min-h-[48px] flex items-center justify-center text-base">
            Browse talents
          </Link>
          <Link href="/auth/model-application" className="rounded-lg border border-accent px-6 py-4 font-semibold text-foreground hover:bg-accent hover:text-black transition-colors text-center min-h-[48px] flex items-center justify-center text-base">
            Join as a talent
          </Link>
        </div>
      </section>


      {/* 3-step explainer */}
      <section className="container-page px-4 sm:px-6">
        <div className="grid gap-4 sm:gap-6 py-8 sm:py-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Find", desc: "Explore our models and find the perfect match for your shoot." },
            { title: "Book", desc: "Request availability and confirm bookings directly." },
            { title: "Shoot", desc: "Show up and create. Payments and details handled transparently." },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl sm:text-2xl font-bold text-accent mb-3">{s.title}</div>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Talent grid */}
      <section className="container-page px-4 sm:px-6 pb-16">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Talents</h2>
          <div className="text-sm text-muted-foreground">{results?.length || 0} results</div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results?.map((t) => (
            <TalentCard key={t.id} talent={t} />
          )) || []}
        </div>
      </section>
      </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  // Make DB optional during local setup
  async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try { return await fn(); } catch { return fallback; }
  }

  const where: any = { approved: true };
  if (query.category) where.category = String(query.category);
  if (query.gender) where.gender = String(query.gender);
  if (query.location) where.location = { contains: String(query.location), mode: "insensitive" };
  if (query.size) where.size = String(query.size);

  const featuredRaw = await safe(
    () => prisma.modelProfile.findMany({ 
      where: { approved: true }, 
      take: 10, 
      orderBy: { user: { createdAt: "desc" } },
      include: { 
        photos: { take: 1, orderBy: { createdAt: "desc" } },
        user: { select: { createdAt: true } }
      }
    }),
    [] as any[]
  );
  const resultsRaw = await safe(
    () => prisma.modelProfile.findMany({ 
      where, 
      take: 30, 
      orderBy: { user: { createdAt: "desc" } },
      include: { 
        photos: { take: 1, orderBy: { createdAt: "desc" } },
        user: { select: { createdAt: true } }
      }
    }),
    [] as any[]
  );

  const map = (m: any): Talent => ({
    id: m.id,
    displayName: m.displayName,
    avatarUrl: m.avatarUrl || m.photos?.[0]?.url || null,
    location: m.location ?? null,
    category: m.category ?? null,
    gender: m.gender ?? null,
    available: m.available ?? null,
    heightCm: m.heightCm ?? null,
    age: m.age ?? null,
    instagramHandle: m.instagramHandle ?? null,
  });

  return { props: { featured: featuredRaw.map(map), results: resultsRaw.map(map) } };
};



