/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables should be set in Vercel dashboard, not hardcoded
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Increase file upload limits
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
  },
  // Removed deprecated experimental.appDir option
};

export default nextConfig;
