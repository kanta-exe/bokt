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

    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Model profile ID is required" });
    }

    // Update the model profile to approved
    const updatedProfile = await prisma.modelProfile.update({
      where: { id },
      data: { 
        approved: true,
        available: true
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`✅ Model application approved: ${updatedProfile.user.email} (${updatedProfile.user.name})`);

    // TODO: Send approval email to the model
    // TODO: Send notification to admins

    return res.status(200).json({ 
      message: "Model application approved successfully",
      modelProfile: updatedProfile
    });

  } catch (error: any) {
    console.error("Error approving model application:", error);
    
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Model profile not found" });
    }
    
    return res.status(500).json({ 
      error: "Internal server error. Please try again." 
    });
  }
}



