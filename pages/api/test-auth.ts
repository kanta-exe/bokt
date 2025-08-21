import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Test if authOptions can be imported
    return res.status(200).json({
      message: "Auth options loaded successfully",
      hasAdapter: !!authOptions.adapter,
      hasProviders: !!authOptions.providers,
      hasCallbacks: !!authOptions.callbacks,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to load auth options",
      message: error.message,
      stack: error.stack
    });
  }
}
