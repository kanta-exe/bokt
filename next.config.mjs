/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: "file:./prisma/dev.db",
    NEXTAUTH_SECRET: "a-very-long-and-secure-secret-key-for-development-only-change-in-production",
    // Removed hardcoded NEXTAUTH_URL to allow dynamic port detection
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Removed deprecated experimental.appDir option
};

export default nextConfig;
