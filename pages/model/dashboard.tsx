import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import Tabs from "@/components/Tabs";
import { useEffect, useState } from "react";

export default function ModelDashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/model/me").then((r) => r.json()).then(setData); }, []);
  const p = data?.profile;
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Model dashboard</h1>
      <Tabs tabs={[{ id: "photos", label: "Photos" }, { id: "details", label: "Details" }, { id: "bookings", label: "Bookings" }]} />
      <div className="mt-6">
        {!p ? (
          <div className="text-sm text-neutral-500">Loading profile…</div>
        ) : (
          <div>
            <div className="mb-3 text-sm text-neutral-600">Welcome, {p.displayName}</div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
              {p.photos?.map((ph: any) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={ph.id} src={ph.url} alt="" className="aspect-[3/4] w-full rounded-md object-cover" />
              ))}
              {!p.photos?.length && <div className="text-sm text-neutral-500">No photos yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "MODEL" && role !== "ADMIN")) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};


