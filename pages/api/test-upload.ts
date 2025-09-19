import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🧪 Test upload endpoint called');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Simple test response
    return res.status(200).json({ 
      message: "Test upload endpoint working",
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
