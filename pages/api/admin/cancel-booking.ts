import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { bookingId, reason } = schema.parse(req.body);

    // First get the current booking to access its note
    const currentBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { note: true }
    });

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: "CANCELLED",
        note: reason ? `${currentBooking?.note || ''}\n\nCancelled: ${reason}`.trim() : currentBooking?.note
      },
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
      message: `Booking cancelled for ${booking.model.displayName}` 
    });
  } catch (e: any) {
    console.error("Error cancelling booking:", e);
    return res.status(400).json({ error: e.message || "Failed to cancel booking" });
  }
}
