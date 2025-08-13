import type { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useState } from "react";
import { useRouter } from "next/router";

type Photo = { id: string; url: string; caption?: string | null };
type Model = {
  id: string;
  displayName: string;
  category?: string | null;
  gender?: string | null;
  location?: string | null;
  available?: boolean | null;
  heightCm?: number | null;
  bustCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  shoeEu?: number | null;
  eyes?: string | null;
  hair?: string | null;
  shirtSize?: string | null;
  pantSize?: string | null;
  birthDate?: string | null;
  photos: Photo[];
};

export default function TalentProfile({ model }: { model: Model }) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    setShowBookingModal(false);
  };

  const age = model.birthDate ? Math.max(0, Math.floor((Date.now() - new Date(model.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : undefined;

  return (
    <div className="container-page py-10">
      {/* Photo-first gallery */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          {model.photos[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.photos[0].url} alt={model.photos[0].caption ?? model.displayName} className="aspect-[3/4] w-full rounded-lg object-cover" />
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
          {model.photos.slice(1, 7).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.url} alt={p.caption ?? model.displayName} className="aspect-[3/4] w-full rounded-md object-cover" />
          ))}
        </div>
      </div>

      {/* Header & CTA */}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{model.displayName}</h1>
          <p className="mt-1 text-muted-foreground">{[model.category, model.gender, model.location].filter(Boolean).join(" • ")}</p>
        </div>
        <button onClick={() => setShowBookingModal(true)} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-black">Book {model.displayName}</button>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-6 rounded-xl border border-border bg-muted p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Availability" value={model.available ? "Available" : "Unavailable"} />
        {age !== undefined && <Detail label="Age" value={`${age}`} />}
        <Detail label="Height" value={model.heightCm ? `${model.heightCm} cm` : undefined} />
        <Detail label="Eyes" value={model.eyes ?? undefined} />
        <Detail label="Chest" value={model.bustCm ? `${model.bustCm} cm"` : undefined} />
        <Detail label="Waist" value={model.waistCm ? `${model.waistCm} cm` : undefined} />
        <Detail label="Hips" value={model.hipsCm ? `${model.hipsCm} cm` : undefined} />
        <Detail label="Shoe" value={model.shoeEu ? `EU ${model.shoeEu}` : undefined} />
        <Detail label="Shirt" value={model.shirtSize ?? undefined} />
        <Detail label="Pants" value={model.pantSize ?? undefined} />
      </div>

      {/* Accessible booking modal */}
      {showBookingModal && (
        <BookingModal
          modelId={model.id}
          modelName={model.displayName}
          onClose={onClose}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      )}
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

function BookingModal({ modelId, modelName, onClose, isSubmitting, setIsSubmitting }: { modelId: string; modelName: string; onClose: () => void; isSubmitting: boolean; setIsSubmitting: (submitting: boolean) => void }) {
  const router = useRouter();
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState("HALF_DAY");
  const [note, setNote] = useState("");
  const [budget, setBudget] = useState<number | string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [brand, setBrand] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [brandInstagram, setBrandInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [whatsApp, setWhatsApp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const getMinBudget = () => duration === "HALF_DAY" ? 2000 : 3000;

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setBudget("");
    } else {
      const numValue = parseInt(value, 10);
      setBudget(numValue);
    }
  };

  const validateBudget = () => {
    const budgetValue = getBudgetValue();
    if (budgetValue === 0) {
      setError("Please enter a budget amount");
      return false;
    }
    const minBudget = getMinBudget();
    if (budgetValue < minBudget) {
      setError(`Minimum budget for ${duration === "HALF_DAY" ? "half-day" : "full-day"} is ${minBudget.toLocaleString()} EGP`);
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!date) {
      setError("Please select a date and time");
      return false;
    }
    if (!validateBudget()) {
      return false;
    }
    return true;
  };

  const getBudgetValue = () => {
    if (typeof budget === "number") return budget;
    if (budget === "" || budget === "0") return 0;
    const parsed = parseInt(budget as string, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Clean up the data before sending
    const cleanData = {
      modelId,
      startAt: new Date(date).toISOString(),
      duration,
      note: note.trim() || undefined,
      requesterName: name.trim(),
      requesterPhone: phone.trim(),
      requesterBrand: brand?.trim() || undefined,
      brandWebsite: brandWebsite?.trim() || undefined,
      brandInstagram: brandInstagram?.trim() || undefined,
      requesterEmail: email?.trim() || undefined,
      contactWhatsApp: whatsApp,
      offeredBudgetEgp: getBudgetValue(),
    };

    console.log("📤 Sending booking data:", cleanData);

    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Redirect to success page with booking details
        const successUrl = `/booking/success?${new URLSearchParams({
          bookingId: result.id,
          modelName: modelName,
          requesterName: name.trim(),
          startDate: date,
          duration: duration,
          budget: getBudgetValue().toString(),
        }).toString()}`;
        
        router.push(successUrl);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send booking request");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const prettyDate = () => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-3xl overflow-hidden rounded-xl bg-background border border-border shadow-xl">
        <div className="max-h-[85vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-extrabold text-foreground">
          Book <span className="text-accent">{modelName}</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Half-day min 2K EGP, full/multiple days min 3K EGP.</p>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="block text-sm text-foreground text-foreground">Your name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" required />
          </label>
          <label className="block text-sm text-foreground">Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" required />
          </label>
          <label className="block text-sm text-foreground sm:col-span-2">Brand
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" />
          </label>
          <label className="block text-sm text-foreground">Website
            <input value={brandWebsite} onChange={(e) => setBrandWebsite(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" />
          </label>
          <label className="block text-sm text-foreground">Instagram
            <input value={brandInstagram} onChange={(e) => setBrandInstagram(e.target.value)} placeholder="@brand" className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" />
          </label>
          <label className="block text-sm text-foreground">Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" />
          </label>
          <label className="block text-sm text-foreground">Date & time
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" required />
          </label>
          <label className="block text-sm text-foreground">Duration
            <select
              value={duration}
              onChange={(e) => {
                const v = e.target.value;
                setDuration(v);
                // Don't pre-fill budget, let user enter it
              }}
              className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground"
            >
              <option value="HALF_DAY">Half day</option>
              <option value="FULL_DAY">Full day</option>
            </select>
          </label>
          <label className="block text-sm text-foreground">Budget (EGP)
            <input type="number" min={getMinBudget()} value={budget}
              onChange={handleBudgetChange}
              placeholder={`Min ${getMinBudget().toLocaleString()} EGP`}
              className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={whatsApp} onChange={(e) => setWhatsApp(e.target.checked)} className="h-4 w-4" />
            Prefer WhatsApp updates
          </label>
          <label className="block text-sm text-foreground sm:col-span-2">Notes
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full rounded-md border-border bg-muted text-foreground px-3 py-2 focus:bg-background focus:border-accent placeholder:text-muted-foreground" rows={3} />
          </label>
          {/* Live summary */}
          <div className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm">
          <div className="font-semibold text-foreground">Summary</div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div><span className="text-muted-foreground">Talent:</span> <span className="text-foreground">{modelName}</span></div>
            <div><span className="text-muted-foreground">When:</span> <span className="text-foreground">{prettyDate()}</span></div>
            <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{duration === 'HALF_DAY' ? 'Half day' : 'Full day'}</span></div>
            <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground">{budget ? `EGP ${typeof budget === 'number' ? budget.toLocaleString() : budget}` : 'Not set'}</span></div>
            {brand && <div><span className="text-muted-foreground">Brand:</span> <span className="text-foreground">{brand}</span></div>}
            {brandWebsite && <div><span className="text-muted-foreground">Website:</span> <span className="text-foreground">{brandWebsite}</span></div>}
            {brandInstagram && <div><span className="text-muted-foreground">Instagram:</span> <span className="text-foreground">{brandInstagram}</span></div>}
            <div><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{email || phone} {whatsApp ? '(WhatsApp preferred)' : ''}</span></div>
          </div>
        </div>
        </div>
        {error && <div className="px-6 pt-2 text-sm text-red-600">{error}</div>}
        {status && <div className="px-6 pt-2 text-sm text-green-700">{status}</div>}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background p-4">
          <button type="button" onClick={onClose} className="rounded-md border border-border bg-muted text-foreground px-4 py-2 hover:bg-background transition-colors" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="rounded-md bg-accent px-4 py-2 font-semibold text-black flex items-center gap-2" disabled={isSubmitting}>
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? "Booking..." : "Book"} {modelName}
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = String(params?.id);

  async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try { return await fn(); } catch { return fallback; }
  }

  const data = await safe(
    () => prisma.modelProfile.findUnique({ where: { id }, include: { photos: { orderBy: { createdAt: "desc" } } } }) as any,
    null as any
  );

  if (!data) return { notFound: true };

  const model: Model = {
    id: data.id,
    displayName: data.displayName,
    category: data.category,
    gender: data.gender,
    location: data.location,
    available: data.available,
    heightCm: data.heightCm,
    bustCm: data.bustCm,
    waistCm: data.waistCm,
    hipsCm: data.hipsCm,
    shoeEu: data.shoeEu,
    eyes: data.eyes,
    hair: data.hair,
    shirtSize: data.shirtSize,
    pantSize: data.pantSize,
    birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : null,
    photos: (data.photos || []).map((p: any) => ({ id: p.id, url: p.url, caption: p.caption ?? null })),
  };

  return { props: { model } };
};


