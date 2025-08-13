import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category, gender, location, size, take } = req.query;
  const where: any = { approved: true };
  if (category) where.category = String(category);
  if (gender) where.gender = String(gender);
  if (location) where.location = { contains: String(location), mode: "insensitive" };
  if (size) where.size = String(size);
  const limit = Number(take ?? 30);
  try {
    const models = await prisma.modelProfile.findMany({
      where,
      take: isNaN(limit) ? 30 : limit,
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true, avatarUrl: true, location: true, category: true, gender: true, available: true },
    });
    return res.status(200).json({ items: models });
  } catch (e: any) {
    return res.status(200).json({ items: [] });
  }
}



