import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    // Add photos
    try {
      const { modelId } = req.query;
      if (!modelId || typeof modelId !== "string") {
        return res.status(400).json({ error: "Model ID is required" });
      }

      // Handle file upload using formidable or similar
      const formidable = require('formidable');
      const form = formidable({});
      
      const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const uploadedPhotos = files.photos;
      if (!uploadedPhotos) {
        return res.status(400).json({ error: "No photos provided" });
      }

      const photoArray = Array.isArray(uploadedPhotos) ? uploadedPhotos : [uploadedPhotos];
      const uploadedUrls: string[] = [];

      for (const photo of photoArray) {
        const fileBuffer = require('fs').readFileSync(photo.filepath);
        const fileName = `models/${modelId}/${Date.now()}-${photo.originalFilename}`;
        
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, fileBuffer, {
            contentType: photo.mimetype,
          });

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Add photos to database using the Photo model
      for (const photoUrl of uploadedUrls) {
        await prisma.photo.create({
          data: {
            url: photoUrl,
            modelId: modelId,
          }
        });
      }

      // Get updated photos list
      const updatedPhotos = await prisma.photo.findMany({
        where: { modelId: modelId },
        orderBy: { createdAt: 'asc' },
        select: { url: true }
      });

      res.status(200).json({ 
        success: true, 
        message: `${uploadedUrls.length} photo(s) added successfully`,
        photos: updatedPhotos.map(p => p.url)
      });

    } catch (error) {
      console.error('Error adding photos:', error);
      res.status(500).json({ error: "Failed to add photos" });
    }
  } else if (req.method === "DELETE") {
    // Remove photos
    try {
      const { modelId, photoIndex } = req.query;
      
      console.log('DELETE request - modelId:', modelId, 'photoIndex:', photoIndex);
      
      if (!modelId || typeof modelId !== "string") {
        return res.status(400).json({ error: "Model ID is required" });
      }

      if (!photoIndex || typeof photoIndex !== "string") {
        return res.status(400).json({ error: "Photo index is required" });
      }

      const index = parseInt(photoIndex);
      if (isNaN(index) || index < 0) {
        return res.status(400).json({ error: "Invalid photo index" });
      }

      console.log('Looking for photos with modelId:', modelId);
      
      // Get all photos for this model
      const photos = await prisma.photo.findMany({
        where: { modelId: modelId },
        orderBy: { createdAt: 'asc' },
        select: { id: true, url: true }
      });

      console.log('Found photos:', photos.length, photos);

      if (index >= photos.length) {
        return res.status(400).json({ error: "Photo index out of range" });
      }

      // Delete the specific photo
      const photoToDelete = photos[index];
      console.log('Deleting photo:', photoToDelete);
      
      await prisma.photo.delete({
        where: { id: photoToDelete.id }
      });

      console.log('Photo deleted successfully');

      // Get updated photos list
      const updatedPhotos = await prisma.photo.findMany({
        where: { modelId: modelId },
        orderBy: { createdAt: 'asc' },
        select: { url: true }
      });

      console.log('Updated photos count:', updatedPhotos.length);

      res.status(200).json({ 
        success: true, 
        message: "Photo removed successfully",
        photos: updatedPhotos.map(p => p.url)
      });

    } catch (error) {
      console.error('Error removing photo:', error);
      res.status(500).json({ error: "Failed to remove photo" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
