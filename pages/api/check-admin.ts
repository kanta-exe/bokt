import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true
      }
    });

    // Get all users (without password hashes for security)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    return res.status(200).json({
      adminUsers: adminUsers.map(user => ({
        ...user,
        passwordHash: user.passwordHash ? "EXISTS" : "MISSING"
      })),
      allUsers,
      adminCount: adminUsers.length,
      totalUsers: allUsers.length
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to check admin users",
      message: error.message
    });
  }
}
