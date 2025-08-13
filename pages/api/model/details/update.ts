import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  const userId = (session.user as any)?.id as string;
  try {
    const { displayName, location, heightCm, bustCm, waistCm, hipsCm, shoeEu, hair, eyes, shirtSize, pantSize, available } = req.body || {};
    const profile = await prisma.modelProfile.update({
      where: { userId },
      data: { displayName, location, heightCm, bustCm, waistCm, hipsCm, shoeEu, hair, eyes, shirtSize, pantSize, available },
    });
    return res.status(200).json({ profile });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}



