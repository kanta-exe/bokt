import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Test Supabase connection and get model profiles
    const { data: modelProfiles, error: modelError } = await supabase
      .from('ModelProfile')
      .select(`
        *,
        user:User(
          id,
          name,
          email,
          createdAt
        ),
        photos:Photo(
          id,
          url,
          caption
        )
      `)
      .order('createdAt', { ascending: false });

    if (modelError) {
      console.error("Supabase model profiles error:", modelError);
      return res.status(500).json({ error: "Supabase error", details: modelError });
    }

    // Get users table
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: false });

    if (userError) {
      console.error("Supabase users error:", userError);
      return res.status(500).json({ error: "Supabase error", details: userError });
    }

    // Get photos table
    const { data: photos, error: photoError } = await supabase
      .from('Photo')
      .select('*')
      .order('createdAt', { ascending: false });

    if (photoError) {
      console.error("Supabase photos error:", photoError);
      return res.status(500).json({ error: "Supabase error", details: photoError });
    }

    return res.status(200).json({
      success: true,
      modelProfiles: {
        count: modelProfiles?.length || 0,
        data: modelProfiles
      },
      users: {
        count: users?.length || 0,
        data: users
      },
      photos: {
        count: photos?.length || 0,
        data: photos
      }
    });

  } catch (error) {
    console.error("Error testing Supabase:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
