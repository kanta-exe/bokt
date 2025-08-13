import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { modelId, available } = req.body;

    if (!modelId || typeof available !== 'boolean') {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Update the model's availability
    const updatedModel = await prisma.modelProfile.update({
      where: { id: modelId },
      data: { available },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Model availability updated: ${updatedModel.user.email} (${updatedModel.user.name}) - Available: ${available}`);

    return res.status(200).json({ 
      success: true, 
      message: `Model ${available ? 'made available' : 'made unavailable'} successfully`,
      model: updatedModel 
    });

  } catch (error) {
    console.error("Error toggling model availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
