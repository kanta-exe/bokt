import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const envCheck = {
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
      nextAuthUrl: process.env.NEXTAUTH_URL ? "Set" : "Not set",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      deploymentTime: new Date().toISOString()
    };

    return res.status(200).json({
      message: "Debug endpoint working",
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: "Debug endpoint failed",
      message: error.message
    });
  }
}
