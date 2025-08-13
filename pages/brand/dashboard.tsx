import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import Tabs from "@/components/Tabs";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BrandDashboard() {
  const [saved, setSaved] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/brand/saved").then((r) => r.json()).then((d) => setSaved(d.items ?? []));
    fetch("/api/brand/bookings").then((r) => r.json()).then((d) => setBookings(d.items ?? []));
  }, []);
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Brand dashboard</h1>
      <Tabs tabs={[{ id: "saved", label: "Saved Talents" }, { id: "bookings", label: "Booking History" }]} />
      <div className="mt-6 grid gap-4">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Saved talents</h2>
          <ul className="space-y-2">
            {saved.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-md border p-3">
                <span>{s.model.displayName}</span>
                <Link className="text-accent underline" href={`/talent/${s.modelId}`}>View</Link>
              </li>
            ))}
            {!saved.length && <div className="text-sm text-neutral-500">No saved talents yet.</div>}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Bookings</h2>
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="rounded-md border p-3 text-sm">
                {new Date(b.startAt).toLocaleString()} • {b.duration} • {b.status}
              </li>
            ))}
            {!bookings.length && <div className="text-sm text-neutral-500">No bookings yet.</div>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "BRAND" && role !== "ADMIN")) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};


