import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  return res.status(200).json({
    message: "Simple API endpoint working",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
