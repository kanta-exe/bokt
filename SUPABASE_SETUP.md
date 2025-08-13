# 🚀 Supabase Setup Guide

This project uses Supabase for database and file storage. Follow this guide to set up your environment.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be ready (this may take a few minutes)

## 2. Get Your Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Set Up Storage

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `photos`
3. Set the bucket to **Public** (so images can be accessed without authentication)
4. Set up the following storage policy for the `photos` bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
```

## 4. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### Getting the DATABASE_URL:

1. Go to **Settings** > **Database** in your Supabase dashboard
2. Find the **Connection string** section
3. Copy the **URI** format connection string
4. Replace `[YOUR-PASSWORD]` with your database password

## 5. Run Migrations

```bash
npx prisma migrate dev --name init
```

## 6. Start Development

```bash
npm run dev
```

## Storage Structure

- Photos are stored in the `photos` bucket
- File structure: `photos/models/[timestamp]_[random].jpg`
- Public URLs are automatically generated for image access
- Images are organized by type: `models/`, `brands/`, etc.

## Troubleshooting

### Database Connection Issues
- Make sure your DATABASE_URL is correct
- Check that your database password is properly escaped
- Verify your IP is not blocked by Supabase

### Storage Issues
- Ensure the `photos` bucket exists and is public
- Check that storage policies allow the operations you need
- Verify your Supabase URL and anon key are correct

### Image Upload Issues
- Check browser console for CORS errors
- Verify storage bucket permissions
- Ensure file size is within limits (default 50MB)

## Migration from Firebase

This project has been migrated from Firebase to Supabase. All Firebase references have been removed and replaced with Supabase equivalents:

- ✅ Firebase Storage → Supabase Storage
- ✅ Firebase Auth → NextAuth.js with Prisma
- ✅ Firebase Database → Supabase PostgreSQL
- ✅ All Firebase packages removed
- ✅ All Firebase configuration files deleted
