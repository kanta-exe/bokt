import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to count users
    const userCount = await prisma.user.count();
    
    return res.status(200).json({ 
      message: "Database connection successful",
      userCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set"
    });

  } catch (error: any) {
    console.error("Database connection error:", error);
    return res.status(500).json({ 
      error: "Database connection failed",
      message: error.message,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set"
    });
  } finally {
    await prisma.$disconnect();
  }
}
