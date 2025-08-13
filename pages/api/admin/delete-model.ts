import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { modelId } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: "Model ID is required" });
    }

    // Get model info before deletion for logging
    const modelToDelete = await prisma.modelProfile.findUnique({
      where: { id: modelId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        photos: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!modelToDelete) {
      return res.status(404).json({ error: "Model not found" });
    }

    // Delete the model profile and all related data
    // This will cascade delete photos and other related records
    await prisma.modelProfile.delete({
      where: { id: modelId },
    });

    console.log(`🗑️ Model deleted: ${modelToDelete.user.email} (${modelToDelete.user.name})`);
    console.log(`🗑️ Deleted ${modelToDelete.photos.length} photos`);

    return res.status(200).json({ 
      success: true, 
      message: "Model deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting model:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
