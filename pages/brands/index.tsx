import { prisma } from "@/lib/prisma";
import type { GetServerSideProps } from "next";

type BrandCard = { id: string; brandName: string; city: string | null };

export default function BrandsPage({ brands }: { brands: BrandCard[] }) {
  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Brands</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((b) => (
          <div key={b.id} className="rounded-lg border p-4">
            <div className="h-24 rounded bg-neutral-100" />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium">{b.brandName}</span>
              {b.city && <span className="text-neutral-500">{b.city}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const brands = await prisma.brandProfile.findMany({ select: { id: true, brandName: true, city: true }, take: 20 });
  return { props: { brands } };
};



