import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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

    // Collect storage paths from photo URLs before DB deletion
    const pathsToDelete: string[] = [];
    for (const p of modelToDelete.photos) {
      if (!p.url) continue;
      try {
        // Expected public URL format: https://<project>.supabase.co/storage/v1/object/public/photos/<path>
        const idx = p.url.indexOf('/photos/');
        if (idx !== -1) {
          const path = p.url.substring(idx + '/photos/'.length);
          if (path) pathsToDelete.push(path);
        }
      } catch {}
    }

    // Delete the model profile and all related data (cascade removes DB photo rows)
    await prisma.modelProfile.delete({ where: { id: modelId } });

    // Best-effort: remove files from Supabase Storage
    if (pathsToDelete.length > 0) {
      const { error } = await supabase.storage.from('photos').remove(pathsToDelete.map(p => `models/${p.split('models/')[1] || p}`));
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
    }

    console.log(`🗑️ Model deleted: ${modelToDelete.user.email} (${modelToDelete.user.name})`);
    console.log(`🗑️ Requested deletion of ${modelToDelete.photos.length} storage files`);

    return res.status(200).json({ 
      success: true, 
      message: "Model deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting model:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
