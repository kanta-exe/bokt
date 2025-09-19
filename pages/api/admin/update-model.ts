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
    const { 
      modelId,
      displayName, 
      location, 
      heightCm, 
      bustCm, 
      waistCm, 
      shirtSize, 
      pantSize, 
      shoesSize,
      age,
      instagramHandle,
      modelingExperience,
      bio,
      categories,
      gender,
      approved,
      available,
      avatarUrl
    } = req.body || {};

    if (!modelId || typeof modelId !== 'string') {
      return res.status(400).json({ error: "Model ID is required" });
    }

    // Prepare update data
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (location !== undefined) updateData.location = location;
    if (heightCm !== undefined) updateData.heightCm = heightCm;
    if (bustCm !== undefined) updateData.bustCm = bustCm;
    if (waistCm !== undefined) updateData.waistCm = waistCm;
    if (shirtSize !== undefined) updateData.shirtSize = shirtSize;
    if (pantSize !== undefined) updateData.pantSize = pantSize;
    if (shoesSize !== undefined) updateData.shoesSize = shoesSize;
    if (age !== undefined) updateData.age = age;
    if (instagramHandle !== undefined) updateData.instagramHandle = instagramHandle;
    if (modelingExperience !== undefined) updateData.modelingExperience = modelingExperience;
    if (bio !== undefined) updateData.bio = bio;
    if (categories !== undefined) updateData.categories = Array.isArray(categories) ? JSON.stringify(categories) : categories;
    if (gender !== undefined) updateData.gender = gender;
    if (approved !== undefined) updateData.approved = approved;
    if (available !== undefined) updateData.available = available;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updatedProfile = await prisma.modelProfile.update({
      where: { id: modelId },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });

    return res.status(200).json({ 
      success: true,
      message: "Model profile updated successfully",
      modelProfile: updatedProfile
    });
  } catch (error: any) {
    console.error("Error updating model profile:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Model profile not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
