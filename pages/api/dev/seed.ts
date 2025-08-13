import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const brandUser = await prisma.user.upsert({
      where: { email: "brand@example.com" },
      update: {},
      create: { email: "brand@example.com", name: "Brand User", role: "BRAND" },
    });

    const exists = await prisma.modelProfile.findFirst({ where: { displayName: "Amira" } });
    let modelId = exists?.id;
    if (!exists) {
      const created = await prisma.modelProfile.create({
        data: {
          user: { create: { email: "model@example.com", name: "Amira", role: "MODEL" } },
          displayName: "Amira",
          location: "Cairo",
          category: "FASHION",
          gender: "FEMALE",
          approved: true,
          available: true,
          heightCm: 175,
          bustCm: 84,
          waistCm: 60,
          hipsCm: 90,
          shoeEu: 39,
          eyes: "Brown",
          hair: "Black",
          shirtSize: "S",
          pantSize: "S",
          photos: {
            create: [
              { url: "https://images.unsplash.com/photo-1503342394121-480259ab51b5?w=1200" },
              { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200" },
              { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200" },
            ],
          },
        },
      });
      modelId = created.id;
    }

    return res.status(200).json({ ok: true, brandUser, modelId });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}


