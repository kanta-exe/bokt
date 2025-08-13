import TalentCard, { Talent } from "./TalentCard";

export default function FeaturedSlider({ items }: { items: Talent[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4">
        {items.map((t) => (
          <div key={t.id} className="w-48 sm:w-56 md:w-64 shrink-0">
            <TalentCard talent={t} />
          </div>
        ))}
      </div>
    </div>
  );
}



