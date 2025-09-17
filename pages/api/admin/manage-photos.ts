import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

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
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB safety cap per file
        allowEmptyFiles: false,
        multiples: true
      });
      
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

      // Enforce 5-photo limit per model (count existing and only accept remaining)
      const existingCount = await prisma.photo.count({ where: { modelId } });
      const remainingSlots = Math.max(0, 5 - existingCount);
      if (remainingSlots <= 0) {
        return res.status(400).json({ error: "Photo limit reached (5 per model)" });
      }

      const toProcess = photoArray.slice(0, remainingSlots);
      const sharp = require('sharp');
      const fs = require('fs');
      const path = require('path');

      const uploadedUrls: string[] = [];

      for (const photo of toProcess) {
        try {
          const originalBuffer: Buffer = fs.readFileSync(photo.filepath);

          // Basic mime guard
          const mimetype: string = photo.mimetype || '';
          if (!/^image\/(jpeg|png|webp|avif)$/i.test(mimetype)) {
            // Try to proceed; sharp can sniff many formats. If it fails, we skip.
          }

          // Create webp variants: main (1600px) and thumb (400px)
          const mainWebp: Buffer = await sharp(originalBuffer)
            .rotate()
            .resize({ width: 1600, withoutEnlargement: true })
            .webp({ quality: 70 })
            .toBuffer();

          const thumbWebp: Buffer = await sharp(originalBuffer)
            .rotate()
            .resize({ width: 400, withoutEnlargement: true })
            .webp({ quality: 70 })
            .toBuffer();

          const uuid = crypto.randomUUID();
          const basePath = `models/${modelId}/${uuid}`;
          const mainPath = `${basePath}-main.webp`;
          const thumbPath = `${basePath}-thumb.webp`;

          // Upload to unified public bucket 'photos'
          const { error: upErr1 } = await supabase.storage
            .from('photos')
            .upload(mainPath, mainWebp, { contentType: 'image/webp', upsert: false });
          if (upErr1) {
            console.error('Upload main error:', upErr1);
            continue;
          }

          const { error: upErr2 } = await supabase.storage
            .from('photos')
            .upload(thumbPath, thumbWebp, { contentType: 'image/webp', upsert: false });
          if (upErr2) {
            console.error('Upload thumb error (will remove main):', upErr2);
            // best-effort cleanup for main
            try { await supabase.storage.from('photos').remove([mainPath]); } catch {}
            continue;
          }

          const { data: { publicUrl: mainUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(mainPath);

          uploadedUrls.push(mainUrl);
        } catch (e) {
          console.error('Processing/upload failed for a photo:', e);
          continue;
        } finally {
          // Ensure temp file is removed
          try { if (photo.filepath) fs.unlinkSync(photo.filepath); } catch {}
        }
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

      // Try removing storage objects (main + thumb) from 'photos' bucket if path can be derived
      try {
        // public URL format: .../storage/v1/object/public/<bucket>/<path>
        const url: string = photoToDelete.url;
        const marker = "/storage/v1/object/public/photos/";
        const pos = url.indexOf(marker);
        if (pos !== -1) {
          const objectPath = url.substring(pos + marker.length);
          const pathsToRemove = [objectPath];
          if (objectPath.endsWith('-main.webp')) {
            pathsToRemove.push(objectPath.replace('-main.webp', '-thumb.webp'));
          }
          await supabase.storage.from('photos').remove(pathsToRemove);
        }
      } catch (e) {
        console.warn('Failed to remove storage files (continuing):', e);
      }

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
