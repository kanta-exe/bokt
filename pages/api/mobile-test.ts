import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📱 Mobile test endpoint called');
  console.log('Method:', req.method);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Content-Type:', req.headers['content-type']);
  
  if (req.method === "GET") {
    return res.status(200).json({ 
      message: "Mobile test endpoint working",
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.headers['user-agent'] || '')
    });
  }
  
  if (req.method === "POST") {
    console.log('📱 POST request received');
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    return res.status(200).json({ 
      message: "Mobile POST test successful",
      timestamp: new Date().toISOString(),
      receivedData: Object.keys(req.body || {}),
      userAgent: req.headers['user-agent']
    });
  }
  
  return res.status(405).json({ message: "Method Not Allowed" });
}
