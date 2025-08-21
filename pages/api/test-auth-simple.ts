import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Test if we can import NextAuth
    const { authOptions } = await import("./auth/[...nextauth]");
    
    return res.status(200).json({
      message: "NextAuth import successful",
      hasAuthOptions: !!authOptions,
      hasProviders: !!authOptions.providers,
      providerCount: authOptions.providers?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "NextAuth import failed",
      message: error.message,
      stack: error.stack
    });
  }
}
