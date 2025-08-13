## BOKT.

Next.js + Tailwind CSS + NextAuth.js + Prisma on Supabase (PostgreSQL).

### Setup
1. Create a `.env.local` file with the following environment variables:
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

2. Create a Supabase project:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from Settings > API
   - Create a storage bucket named `photos` for image uploads

3. Run migrations and generate client:
```bash
npx prisma migrate dev --name init
```

4. Start dev server:
```bash
npm run dev
```

### Storage Setup
- Photos are stored in Supabase Storage bucket named `photos`
- Images are organized in folders: `models/`, `brands/`, etc.
- Public URLs are generated automatically for image access

### Roles
- MODEL, BRAND, ADMIN via `User.role`. Protected routes: `/model`, `/brand`, `/admin`.

### Folders
- `pages`, `components`, `lib`, `styles`, `public/uploads`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
