import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production") return res.status(403).json({ error: "Disabled in production" });
  const email = (req.query.email as string) || "admin@bokt.dev";
  const password = (req.query.password as string) || "admin1234";
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash },
      create: { email, name: "Admin", role: "ADMIN", passwordHash },
    });
    return res.status(200).json({ ok: true, email: user.email, password });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}



