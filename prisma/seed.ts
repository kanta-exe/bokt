// Use CJS import of generated client for ts-node.
// Generated client exports `PrismaClient` as a named export.
const client = require("../generated/prisma");
const PrismaClient = client.PrismaClient || client.default || client;
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "bokt@dev.com" },
    update: {},
    create: { 
      email: "bokt@dev.com", 
      name: "Admin User", 
      role: "ADMIN",
      passwordHash: await require("bcrypt").hash("admin1234", 10)
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "brand@example.com" },
    update: {},
    create: { email: "brand@example.com", name: "Brand User", role: "BRAND" },
  });

  const model = await prisma.modelProfile.create({
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
    include: { photos: true },
  });

  console.log("Seeded admin:", admin.email, "Role:", admin.role);
  console.log("Seeded model:", model.displayName, model.id);
  console.log("Login brand user email:", user.email);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


