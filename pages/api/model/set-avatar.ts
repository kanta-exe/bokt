import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = (session.user as any)?.id as string;
  const { photoUrl } = req.body || {};

  if (!photoUrl || typeof photoUrl !== "string") {
    return res.status(400).json({ error: "photoUrl is required" });
  }

  try {
    const profile = await prisma.modelProfile.update({
      where: { userId },
      data: { avatarUrl: photoUrl },
      include: { photos: true },
    });
    return res.status(200).json({ success: true, profile });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to set avatar" });
  }
}


