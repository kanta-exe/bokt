import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: "Email, password, and name are required" 
      });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (existingAdmin) {
      return res.status(409).json({ 
        error: "Admin user already exists",
        existingAdmin: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: "Email already registered" 
      });
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "ADMIN"
      }
    });

    console.log(`✅ Admin user created: ${admin.email} (${admin.name})`);

    return res.status(201).json({ 
      message: "Admin user created successfully",
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({ 
      error: "Internal server error. Please try again." 
    });
  }
}
