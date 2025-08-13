import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BRAND" });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Redirect models to application form
    if (form.role === "MODEL") {
      router.push("/auth/model-application");
      return;
    }
    
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/auth/signin");
    else setError((await res.json()).error ?? "Unable to register");
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>
      <form className="max-w-lg space-y-4" onSubmit={submit}>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">I am a</label>
          <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="BRAND">Brand</option>
            <option value="MODEL">Model</option>
          </select>
          {form.role === "MODEL" && (
            <p className="mt-2 text-sm text-gray-600">
              Models will be redirected to complete a detailed application form that requires approval.
            </p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-md bg-accent px-4 py-2 font-semibold text-black">Create account</button>
      </form>
    </div>
  );
}



