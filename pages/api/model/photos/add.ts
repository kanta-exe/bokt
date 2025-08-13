import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  const userId = (session.user as any)?.id as string;
  const { urls } = req.body as { urls?: string[] };
  if (!urls?.length) return res.status(400).json({ error: "urls[] required" });
  try {
    const profile = await prisma.modelProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: "model profile not found" });
    await prisma.photo.createMany({ data: urls.map((url) => ({ url, modelId: profile.id })) });
    const photos = await prisma.photo.findMany({ where: { modelId: profile.id }, orderBy: { createdAt: "desc" } });
    return res.status(200).json({ photos });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}



