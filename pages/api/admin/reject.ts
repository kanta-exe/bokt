import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if ((session.user as any)?.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { id, reason } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Model profile ID is required" });
    }

    // Get the model profile and user info before deletion
    const modelProfile = await prisma.modelProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!modelProfile) {
      return res.status(404).json({ error: "Model profile not found" });
    }

    // Delete the model profile and user account in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete photos first (due to foreign key constraints)
      await tx.photo.deleteMany({
        where: { modelId: id }
      });

      // Delete the model profile
      await tx.modelProfile.delete({
        where: { id }
      });

      // Delete the user account
      await tx.user.delete({
        where: { id: modelProfile.user.id }
      });
    });

    console.log(`❌ Model application rejected: ${modelProfile.user.email} (${modelProfile.user.name})`);
    if (reason) {
      console.log(`📝 Rejection reason: ${reason}`);
    }

    // TODO: Send rejection email to the model with reason
    // TODO: Send notification to admins

    return res.status(200).json({ 
      message: "Model application rejected successfully",
      rejectedModel: {
        email: modelProfile.user.email,
        name: modelProfile.user.name,
        reason: reason || "No reason provided"
      }
    });

  } catch (error: any) {
    console.error("Error rejecting model application:", error);
    
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Model profile not found" });
    }
    
    return res.status(500).json({ 
      error: "Internal server error. Please try again." 
    });
  }
}

