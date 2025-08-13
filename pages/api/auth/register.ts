import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Role } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["MODEL", "BRAND", "ADMIN"]).default("MODEL"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { email, password, name, role } = schema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: role as Role },
    });
    return res.status(201).json({ id: user.id });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}


