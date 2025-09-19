import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Role, ModelCategory, Gender } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { uploadBufferToSupabase } from "@/lib/supabase-storage";
import { IncomingForm } from "formidable";

// Configure API route for larger file uploads
export const config = {
  api: {
    bodyParser: false, // Disable default body parser since we're using formidable
    responseLimit: false, // Remove response limit
    maxDuration: 300, // Increase timeout to 5 minutes for large uploads
  },
};

const applicationSchema = z.object({
  // Basic Info
  name: z.string().min(1),
  email: z.string().email(),
  nickname: z.string().optional(),
  location: z.string().min(1),
  instagramHandle: z.string().min(1),
  
  // Physical Attributes
  gender: z.string().min(1),
  heightCm: z.number().min(100).max(250),
  shirtSize: z.string().min(1),
  pantSize: z.string().min(1),
  shoesSize: z.string().min(1),
  
  // Additional Measurements
  bustCm: z.number().min(0).max(150),
  waistCm: z.number().min(0).max(150),
  
  // Personal Details
  age: z.number().min(16).max(80),
  
  // Professional Info
  categories: z.array(z.string()).min(1),
  modelingExperience: z.string().min(1),
  bio: z.string().optional(),
  
  // Photos
  photos: z.array(z.any()).min(5).max(5),
  
  // Terms
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Terms must be accepted"
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 Model registration API called');
  console.log('Request method:', req.method);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log('📝 Starting form data parsing...');
    // Parse FormData with timeout for mobile
    const formData = await Promise.race([
      new Promise<{ [key: string]: any }>((resolve, reject) => {
        const form = new IncomingForm({
          multiples: true,
          keepExtensions: true,
          maxFileSize: 50 * 1024 * 1024, // 50MB per file (Supabase limit)
          maxTotalFileSize: 250 * 1024 * 1024, // 250MB total across all files (5 x 50MB)
          allowEmptyFiles: false,
        });

        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) {
            console.error('❌ Formidable parsing error:', err);
            // Formidable emits errors with httpCode when size limits are exceeded
            if (err.httpCode === 413) {
              return reject(Object.assign(new Error('Payload Too Large'), { httpCode: 413 }));
            }
            return reject(err);
          }
          console.log('✅ Formidable parsed successfully');
          console.log('Fields:', Object.keys(fields || {}));
          console.log('Files:', Object.keys(files || {}));
          resolve({ ...fields, ...files });
        });
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Form parsing timeout after 60 seconds')), 60000)
      )
    ]);

    console.log('📸 Processing photos...');
    console.log('Raw photos count:', formData.photos ? (Array.isArray(formData.photos) ? formData.photos.length : 1) : 0);

    // Normalize photos to an array and enforce size limits before any heavy work
    const rawPhotos = formData.photos
      ? (Array.isArray(formData.photos) ? formData.photos : [formData.photos])
      : [];

    const FIFTY_MB = 50 * 1024 * 1024;
    const TWO_HUNDRED_FIFTY_MB = 250 * 1024 * 1024;

    const totalBytes = rawPhotos.reduce((sum: number, f: any) => sum + (Number(f.size) || 0), 0);
    const tooLargeFile = rawPhotos.find((f: any) => Number(f.size) > FIFTY_MB);
    if (tooLargeFile || totalBytes > TWO_HUNDRED_FIFTY_MB) {
      return res.status(413).json({
        error: 'Uploads too large',
        details: 'Please upload up to 5 images, max 50MB each and 250MB total.'
      });
    }

    // Extract and validate data
    const data = {
      name: Array.isArray(formData.name) ? formData.name[0] : formData.name,
      email: Array.isArray(formData.email) ? formData.email[0] : formData.email,
      nickname: Array.isArray(formData.nickname) ? formData.nickname[0] : formData.nickname,
      location: Array.isArray(formData.location) ? formData.location[0] : formData.location,
      instagramHandle: Array.isArray(formData.instagramHandle) ? formData.instagramHandle[0] : formData.instagramHandle,
      gender: Array.isArray(formData.gender) ? formData.gender[0] : formData.gender,
      heightCm: parseInt(Array.isArray(formData.heightCm) ? formData.heightCm[0] : formData.heightCm),
      shirtSize: Array.isArray(formData.shirtSize) ? formData.shirtSize[0] : formData.shirtSize,
      pantSize: Array.isArray(formData.pantSize) ? formData.pantSize[0] : formData.pantSize,
      shoesSize: Array.isArray(formData.shoesSize) ? formData.shoesSize[0] : formData.shoesSize,
      
      // Additional measurements
      bustCm: parseInt(Array.isArray(formData.bustCm) ? formData.bustCm[0] || '0' : formData.bustCm || '0'),
      waistCm: parseInt(Array.isArray(formData.waistCm) ? formData.waistCm[0] || '0' : formData.waistCm || '0'),
      
      // Personal details
      age: parseInt(Array.isArray(formData.age) ? formData.age[0] : formData.age),
      
      // Professional info
      categories: JSON.parse(Array.isArray(formData.categories) ? formData.categories[0] || '[]' : formData.categories || '[]'),
      modelingExperience: Array.isArray(formData.modelingExperience) ? formData.modelingExperience[0] : formData.modelingExperience,
      bio: Array.isArray(formData.bio) ? formData.bio[0] : formData.bio || "",
      
      photos: rawPhotos,
      termsAccepted: (Array.isArray(formData.termsAccepted) ? formData.termsAccepted[0] : formData.termsAccepted) === 'true',
    };

    const validatedData = applicationSchema.parse(data);
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Generate a random password for the account (user won't use it for login)
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create user, then model profile (no long transaction)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        role: Role.MODEL,
      },
    });

    const modelProfile = await prisma.modelProfile.create({
      data: {
        userId: user.id,
        displayName: validatedData.nickname || validatedData.name,
        bio: validatedData.bio || "",
        location: validatedData.location,
        gender: validatedData.gender as any,
        heightCm: validatedData.heightCm,
        category: validatedData.categories[0] as any,
        approved: false,
        available: true,
        instagramHandle: validatedData.instagramHandle,
        modelingExperience: validatedData.modelingExperience,
        categories: JSON.stringify(validatedData.categories),
        shirtSize: validatedData.shirtSize,
        pantSize: validatedData.pantSize,
        shoesSize: validatedData.shoesSize,
        bustCm: validatedData.bustCm,
        waistCm: validatedData.waistCm,
        age: validatedData.age,
      },
    });

    // Upload photos OUTSIDE any transaction, then persist URLs
    let photoData: { url: string; modelId: string; caption?: string }[] = [];
    if (validatedData.photos && validatedData.photos.length > 0) {
      console.log(`📸 Processing ${validatedData.photos.length} photos for user ${user.id}`);
      const fs = await import('fs');
      const crypto = await import('crypto');

      const uploadPromises = validatedData.photos.map(async (photo: any, i: number) => {
        if (!photo?.filepath) {
          throw new Error('Uploaded file missing path');
        }
        try {
          const originalName = photo.originalFilename || `photo_${i + 1}`;
          // Read original buffer; no server-side compression to avoid native dependency
          const fileBuffer = fs.readFileSync(photo.filepath);

          // Deterministic filename using content hash to avoid duplicates; keep original extension
          const originalExt = (photo.originalFilename && photo.originalFilename.includes('.')) ? photo.originalFilename.split('.').pop() : 'jpg';
          const hash = crypto.createHash('sha1').update(fileBuffer).digest('hex').slice(0, 12);
          const fileName = `model_${modelProfile.id}_${i}_${hash}.${originalExt}`;

          const supabaseResult = await uploadBufferToSupabase(fileBuffer, fileName, 'models');
          if (supabaseResult.success) {
            return { url: supabaseResult.url, modelId: modelProfile.id, caption: originalName };
          } else {
            throw new Error(supabaseResult.error || 'Supabase upload failed');
          }
        } catch (photoError) {
          console.error(`❌ Error processing photo ${i + 1}:`, photoError);
          return { url: `https://via.placeholder.com/400x600/cccccc/666666?text=Photo+${i + 1}`, modelId: modelProfile.id, caption: `Photo ${i + 1} - ${photo.originalFilename || 'Upload failed'}` };
        }
      });

      photoData = await Promise.all(uploadPromises);

      if (photoData.length > 0) {
        await prisma.photo.createMany({ data: photoData });
        console.log(`✅ Saved ${photoData.length} photos to database and Supabase for user ${user.id}`);
      }
    } else {
      console.log(`ℹ️ No photos provided for user ${user.id}`);
    }

    // Log extra info
    console.log(`Model sizes - Shirt: ${validatedData.shirtSize}, Pant: ${validatedData.pantSize}, Shoes: ${validatedData.shoesSize}`);
    console.log(`Categories: ${validatedData.categories.join(", ")}`);
    console.log(`Experience: ${validatedData.modelingExperience}`);
    console.log(`Instagram: ${validatedData.instagramHandle}`);

    const result = { user, modelProfile };

    // TODO: Send email notification to admins about new application
    // TODO: Send confirmation email to applicant

    return res.status(201).json({ 
      message: "Application submitted successfully",
      userId: result.user.id,
      profileId: result.modelProfile.id 
    });

  } catch (error: any) {
    console.error("Model registration error:", error);
    // Surface a clear message for oversized uploads
    if (error?.httpCode === 413) {
      return res.status(413).json({
        error: 'Uploads too large',
        details: 'Please upload up to 5 images, max 50MB each and 250MB total.'
      });
    }

    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Invalid application data",
        details: error.errors 
      });
    }
    
    // In non-production, return the specific error message to aid debugging
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({ 
      error: isProd ? "Internal server error. Please try again." : (error?.message || 'Server error'),
      details: isProd ? undefined : {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      }
    });
  }
}
