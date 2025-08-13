import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { GetServerSideProps } from "next";

type ModelCard = { id: string; displayName: string; avatarUrl: string | null; city: string | null };

export default function ModelsPage({ models }: { models: ModelCard[] }) {
  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-bold text-foreground">Models</h1>
        {/* Filter section - hidden for now */}
        {/* <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input placeholder="City" className="rounded-md border border-border bg-muted text-foreground placeholder:text-muted-foreground px-3 py-2 focus:bg-background focus:border-accent" />
          <select className="rounded-md border border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent">
            <option>Height</option>
            <option>150+ cm</option>
            <option>165+ cm</option>
            <option>175+ cm</option>
          </select>
          <select className="rounded-md border border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent">
            <option>Hair</option>
            <option>Black</option>
            <option>Brown</option>
            <option>Blonde</option>
          </select>
          <button className="rounded-md bg-accent px-4 py-2 font-semibold text-black hover:bg-accent/90 transition-colors">Filter</button>
        </div> */}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {models.map((m) => (
          <Link key={m.id} href={`/talent/${m.id}`} className="group block">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatarUrl} alt={m.displayName} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <span>Photo</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{m.displayName}</span>
              {m.city && <span className="text-muted-foreground">{m.city}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try { return await fn(); } catch { return fallback; }
  }
  const models = await safe(
    () => prisma.modelProfile.findMany({
      where: { approved: true },
      take: 20,
      include: { photos: { take: 1, orderBy: { createdAt: "desc" } } },
    }),
    [] as any[]
  );
  const mapped: ModelCard[] = models.map((m: any) => ({ id: m.id, displayName: m.displayName, avatarUrl: m.avatarUrl || m.photos?.[0]?.url || null, city: m.location }));
  return { props: { models: mapped } };
};


