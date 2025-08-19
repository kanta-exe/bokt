import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import Tabs from "@/components/Tabs";
import { useEffect, useState } from "react";

export default function ModelDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("photos");
  useEffect(() => { fetch("/api/model/me").then((r) => r.json()).then(setData); }, []);
  const p = data?.profile;

  const renderPhotos = () => (
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
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="grid gap-6 rounded-xl border border-border bg-muted p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Display Name" value={p.displayName} />
        <Detail label="Location" value={p.location} />
        <Detail label="Age" value={p.age ? `${p.age} years` : undefined} />
        <Detail label="Height" value={p.heightCm ? `${p.heightCm} cm` : undefined} />
        <Detail label="Eyes" value={p.eyes} />
        <Detail label="Hair" value={p.hair} />
        <Detail label="Chest" value={p.bustCm ? `${p.bustCm} cm` : undefined} />
        <Detail label="Waist" value={p.waistCm ? `${p.waistCm} cm` : undefined} />
        <Detail label="Hips" value={p.hipsCm ? `${p.hipsCm} cm` : undefined} />
        <Detail label="Shoe EU" value={p.shoeEu ? `EU ${p.shoeEu}` : undefined} />
        <Detail label="Shoe Size" value={p.shoesSize} />
        <Detail label="Shirt" value={p.shirtSize} />
        <Detail label="Pants" value={p.pantSize} />
        <Detail label="Gender" value={p.gender} />
        <Detail label="Category" value={p.category} />
        <Detail label="Instagram" value={p.instagramHandle ? `@${p.instagramHandle}` : undefined} />
        <Detail label="Experience" value={p.modelingExperience} />
      </div>

      {p.categories && (
        <div className="rounded-xl border border-border bg-muted p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Modeling Categories</h3>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(p.categories).map((category: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-accent text-black rounded-full text-sm font-medium">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {p.bio && (
        <div className="rounded-xl border border-border bg-muted p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Bio</h3>
          <p className="text-foreground">{p.bio}</p>
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="text-sm text-neutral-500">Bookings will be displayed here.</div>
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Model dashboard</h1>
      <Tabs 
        tabs={[
          { id: "photos", label: "Photos" }, 
          { id: "details", label: "Details" }, 
          { id: "bookings", label: "Bookings" }
        ]} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="mt-6">
        {!p ? (
          <div className="text-sm text-neutral-500">Loading profile…</div>
        ) : (
          <div>
            {activeTab === "photos" && renderPhotos()}
            {activeTab === "details" && renderDetails()}
            {activeTab === "bookings" && renderBookings()}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
      <div className="text-base font-semibold text-foreground mt-1">{value}</div>
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


