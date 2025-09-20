import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { modelId, urls } = req.body as { modelId?: string; urls?: string[] };
    if (!modelId || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "modelId and urls[] are required" });
    }

    await prisma.photo.createMany({
      data: urls.map((url) => ({ url, modelId })),
      skipDuplicates: true,
    });

    const updated = await prisma.photo.findMany({
      where: { modelId },
      orderBy: { createdAt: "asc" },
      select: { url: true },
    });

    return res.status(200).json({
      success: true,
      message: `${urls.length} photo(s) added successfully`,
      photos: updated.map((p) => p.url),
    });
  } catch (error: any) {
    console.error("save-photo-urls error:", error);
    return res.status(500).json({ error: error?.message || "Failed to save photos" });
  }
}


