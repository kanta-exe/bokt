import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  const userId = (session.user as any)?.id as string;
  const items = await prisma.savedModel.findMany({ where: { brandUserId: userId }, include: { model: true } });
  return res.status(200).json({ items });
}



