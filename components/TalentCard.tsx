







import Link from "next/link";

export type Talent = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  location?: string | null;
  category?: string | null;
  gender?: string | null;
  available?: boolean | null;
  heightCm?: number | null;
  age?: number | null;
  instagramHandle?: string | null;
};

export default function TalentCard({ talent }: { talent: Talent }) {
  return (
    <div className="group rounded-xl border border-border bg-background p-3 shadow-sm transition hover:shadow-md">
      <Link href={`/talent/${talent.id}`} className="block">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
          {talent.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={talent.avatarUrl} alt={talent.displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">Photo</div>
          )}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-none text-foreground text-sm sm:text-base truncate">{talent.displayName}</div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {[talent.category, talent.gender].filter(Boolean).join(" • ")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {[talent.heightCm ? `${talent.heightCm}cm` : null, talent.age ? `${talent.age}y` : null].filter(Boolean).join(" • ")}
          </div>
        </div>
        {talent.available !== false && (
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-black">Available</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span className="truncate flex-1 mr-2">{talent.location ?? ""}</span>
        <Link href={`/talent/${talent.id}`} className="text-accent underline underline-offset-2 hover:no-underline transition-all px-2 py-1 -m-1 rounded min-w-[44px] text-center">
          View
        </Link>
      </div>
    </div>
  );
}


