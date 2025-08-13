import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  try {
    const userId = (session.user as any)?.id as string;
    const profile = await prisma.modelProfile.findUnique({
      where: { userId },
      include: { photos: { orderBy: { createdAt: "desc" } } },
    });
    return res.status(200).json({ profile });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}



