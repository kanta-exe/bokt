import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  // Basic Info
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1, "Phone number is required"),
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

  // Photos - public URLs already uploaded to Supabase from client
  photoUrls: z.array(z.string().url()).min(1).max(5),

  // Terms
  termsAccepted: z.boolean().refine(v => v === true, {
    message: "Terms must be accepted"
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Body parser is enabled for this route (default). Ensure JSON.
    if (!req.headers["content-type"]?.toString().includes("application/json")) {
      return res.status(400).json({ error: "Expected application/json" });
    }

    const parsed = schema.parse(req.body);

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Create user + model profile
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        phone: parsed.phone,
        passwordHash,
        role: Role.MODEL,
      },
    });

    const modelProfile = await prisma.modelProfile.create({
      data: {
        userId: user.id,
        displayName: parsed.nickname || parsed.name,
        bio: parsed.bio || "",
        location: parsed.location,
        gender: parsed.gender as any,
        heightCm: parsed.heightCm,
        category: parsed.categories[0] as any,
        approved: false,
        available: true,
        instagramHandle: parsed.instagramHandle,
        modelingExperience: parsed.modelingExperience,
        categories: JSON.stringify(parsed.categories),
        shirtSize: parsed.shirtSize,
        pantSize: parsed.pantSize,
        shoesSize: parsed.shoesSize,
        bustCm: parsed.bustCm,
        waistCm: parsed.waistCm,
        age: parsed.age,
      },
    });

    // Save photo URLs
    if (parsed.photoUrls?.length) {
      await prisma.photo.createMany({
        data: parsed.photoUrls.map((url) => ({ url, modelId: modelProfile.id })),
      });
    }

    return res.status(201).json({
      message: "Application submitted successfully",
      userId: user.id,
      profileId: modelProfile.id,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    return res.status(500).json({ error: error?.message || "Server error" });
  }
}


