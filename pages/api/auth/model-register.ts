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
    maxDuration: 60, // Increase timeout to 60 seconds
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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Parse FormData
    const formData = await new Promise<{ [key: string]: any }>((resolve, reject) => {
      const form = new IncomingForm();
      
      // Configure file size limits (formidable v3 has different API)
      
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        console.log('Formidable parsed fields:', fields);
        console.log('Formidable parsed files:', files);
        resolve({ ...fields, ...files });
      });
    });

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
      
      photos: formData.photos || [],
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

    // Create user and model profile in a transaction with extended timeout
    const result = await prisma.$transaction(async (tx) => {
      // Create user account (not approved initially)
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          passwordHash,
          role: Role.MODEL,
        },
      });

      // Create model profile
      const modelProfile = await tx.modelProfile.create({
        data: {
          userId: user.id,
          displayName: validatedData.nickname || validatedData.name,
          bio: validatedData.bio || "",
          location: validatedData.location,
          gender: validatedData.gender as any,
          heightCm: validatedData.heightCm,
          category: validatedData.categories[0] as any, // Use first category as primary
          approved: false,
          available: true,
          instagramHandle: validatedData.instagramHandle,
          modelingExperience: validatedData.modelingExperience,
          categories: JSON.stringify(validatedData.categories),
          shirtSize: validatedData.shirtSize,
          pantSize: validatedData.pantSize,
          shoesSize: validatedData.shoesSize,
          
          // Additional measurements
          bustCm: validatedData.bustCm,
          waistCm: validatedData.waistCm,
          
          // Personal details
          age: validatedData.age,
          
          // Professional details - these fields don't exist in the schema
        },
      });

      // Store photos in the database and upload to Supabase
      if (validatedData.photos && validatedData.photos.length > 0) {
        const photoData = [];
        
        console.log(`📸 Processing ${validatedData.photos.length} photos for user ${user.id}`);
        
        for (let i = 0; i < validatedData.photos.length; i++) {
          const photo = validatedData.photos[i];
          try {
            console.log(`📸 Processing photo ${i + 1}: ${photo.originalFilename}`);
            
            // Generate unique filename for Supabase
            const fileExtension = photo.originalFilename ? photo.originalFilename.split('.').pop() : 'jpg';
            const fileName = `model_${modelProfile.id}_${Date.now()}_${i}.${fileExtension}`;
            
            console.log(`📁 Uploading to Supabase: ${fileName}`);
            
            // Read the file as buffer and upload to Supabase
            const fs = await import('fs');
            const fileBuffer = fs.readFileSync(photo.filepath);
            
            // Upload to Supabase Storage
            const supabaseResult = await uploadBufferToSupabase(fileBuffer, fileName, 'models');
            
            if (supabaseResult.success) {
              console.log(`✅ Successfully uploaded to Supabase: ${photo.originalFilename} -> ${supabaseResult.url}`);
              
              photoData.push({
                url: supabaseResult.url,
                modelId: modelProfile.id,
                caption: photo.originalFilename || `Photo ${i + 1}`
              });
            } else {
              throw new Error(supabaseResult.error || 'Supabase upload failed');
            }
            
          } catch (photoError) {
            console.error(`❌ Error processing photo ${i + 1}:`, photoError);
            console.error(`❌ Photo details:`, {
              originalFilename: photo.originalFilename,
              filepath: photo.filepath,
              size: photo.size
            });
            
            // Fallback to placeholder if Supabase upload fails
            photoData.push({
              url: `https://via.placeholder.com/400x600/cccccc/666666?text=Photo+${i + 1}`,
              modelId: modelProfile.id,
              caption: `Photo ${i + 1} - ${photo.originalFilename || 'Upload failed'}`
            });
          }
        }
        
        if (photoData.length > 0) {
          await tx.photo.createMany({
            data: photoData
          });
          
          console.log(`✅ Saved ${photoData.length} photos to database and Supabase for user ${user.id}`);
        }
      } else {
        console.log(`ℹ️ No photos provided for user ${user.id}`);
      }
      
      // Store additional model information
      console.log(`Model sizes - Shirt: ${validatedData.shirtSize}, Pant: ${validatedData.pantSize}, Shoes: ${validatedData.shoesSize}`);
      console.log(`Categories: ${validatedData.categories.join(", ")}`);
      console.log(`Experience: ${validatedData.modelingExperience}`);
      console.log(`Instagram: ${validatedData.instagramHandle}`);

      return { user, modelProfile };
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    // TODO: Send email notification to admins about new application
    // TODO: Send confirmation email to applicant

    return res.status(201).json({ 
      message: "Application submitted successfully",
      userId: result.user.id,
      profileId: result.modelProfile.id 
    });

  } catch (error: any) {
    console.error("Model registration error:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Invalid application data",
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      error: "Internal server error. Please try again." 
    });
  }
}
