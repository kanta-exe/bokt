import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  modelId: z.string().min(1),
  startAt: z.string().datetime(),
  duration: z.enum(["HALF_DAY", "FULL_DAY"]),
  note: z.string().optional(),
  requesterName: z.string().min(2),
  requesterPhone: z.string().min(5),
  requesterBrand: z.string().optional(),
  brandWebsite: z.string().optional().transform((val) => {
    if (!val || val.trim() === "") return undefined;
    // If it doesn't start with http:// or https://, add https://
    if (!val.match(/^https?:\/\//)) {
      return `https://${val}`;
    }
    return val;
  }).refine((val) => {
    if (!val) return true; // Allow undefined
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid URL format"),
  brandInstagram: z.string().optional(),
  requesterEmail: z.string().email().optional(),
  contactWhatsApp: z.boolean().optional().default(false),
  offeredBudgetEgp: z.number().int().positive(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  // Authentication is optional for bookings - allow public bookings
  
  try {
    console.log("📝 Received booking data:", JSON.stringify(req.body, null, 2));
    
    const { modelId, startAt, duration, note, requesterName, requesterPhone, requesterBrand, requesterEmail, contactWhatsApp, brandWebsite, brandInstagram, offeredBudgetEgp } = schema.parse(req.body);
    
    // Validate minimum budget
    const minBudget = duration === "HALF_DAY" ? 2500 : 3500;
    if (offeredBudgetEgp < minBudget) {
      return res.status(400).json({ 
        error: `Minimum budget for ${duration === "HALF_DAY" ? "half-day" : "full-day"} is ${minBudget.toLocaleString()} EGP` 
      });
    }

    const booking = await prisma.booking.create({
      data: {
        modelId,
        startAt: new Date(startAt),
        duration: duration as any,
        note,
        requesterName,
        requesterPhone,
        requesterBrand,
        requesterEmail,
        contactWhatsApp: !!contactWhatsApp,
        brandWebsite: brandWebsite || undefined,
        brandInstagram: brandInstagram || undefined,
        offeredBudgetEgp,
        createdById: session?.user ? (session.user as any)?.id : undefined,
      },
    });
    
    console.log("✅ Booking created successfully:", booking.id);
    return res.status(201).json({ id: booking.id });
  } catch (e: any) {
    console.error("Booking creation error:", e);
    if (e.name === "ZodError") {
      console.error("Zod validation errors:", e.errors);
      return res.status(400).json({ error: "Invalid booking data. Please check all required fields." });
    }
    return res.status(400).json({ error: e.message || "Failed to create booking" });
  }
}


