import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { bookingId } = schema.parse(req.body);

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
      include: {
        model: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    return res.status(200).json({ 
      success: true, 
      booking,
      message: `Booking confirmed for ${booking.model.displayName}` 
    });
  } catch (e: any) {
    console.error("Error confirming booking:", e);
    return res.status(400).json({ error: e.message || "Failed to confirm booking" });
  }
}
