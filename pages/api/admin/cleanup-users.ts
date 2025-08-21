import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Delete all users except admin@bokt.dev
    const deleteResult = await prisma.user.deleteMany({
      where: {
        email: {
          not: "admin@bokt.dev"
        }
      }
    });

    // Ensure admin user exists with correct password
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@bokt.dev" }
    });

    if (!adminUser) {
      // Create admin user
      const passwordHash = await bcrypt.hash("admin1234", 10);
      await prisma.user.create({
        data: {
          email: "admin@bokt.dev",
          name: "Admin User",
          passwordHash,
          role: "ADMIN"
        }
      });
      console.log("✅ Admin user created");
    } else if (!adminUser.passwordHash) {
      // Update admin user with password
      const passwordHash = await bcrypt.hash("admin1234", 10);
      await prisma.user.update({
        where: { email: "admin@bokt.dev" },
        data: { passwordHash }
      });
      console.log("✅ Admin user password updated");
    }

    return res.status(200).json({
      message: "Database cleaned up successfully",
      deletedUsers: deleteResult.count,
      adminUser: {
        email: "admin@bokt.dev",
        password: "admin1234"
      }
    });

  } catch (error: any) {
    console.error("Error cleaning up users:", error);
    return res.status(500).json({
      error: "Failed to clean up users",
      message: error.message
    });
  }
}
