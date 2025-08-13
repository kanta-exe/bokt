import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all model profiles with their status
    const allModels = await prisma.modelProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        photos: {
          select: {
            url: true,
          },
        },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });

    // Get approved models specifically
    const approvedModels = await prisma.modelProfile.findMany({
      where: { approved: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        photos: {
          select: {
            url: true,
          },
        },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });

    return res.status(200).json({
      total: allModels.length,
      approved: approvedModels.length,
      allModels: allModels.map(model => ({
        id: model.id,
        name: model.user.name,
        email: model.user.email,
        approved: model.approved,
        available: model.available,
        createdAt: model.user.createdAt,
        photoCount: model.photos.length
      })),
      approvedModels: approvedModels.map(model => ({
        id: model.id,
        name: model.user.name,
        email: model.user.email,
        approved: model.approved,
        available: model.available,
        createdAt: model.user.createdAt,
        photoCount: model.photos.length
      }))
    });

  } catch (error) {
    console.error("Error fetching models:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
