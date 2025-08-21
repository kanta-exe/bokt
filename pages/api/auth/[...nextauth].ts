import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        console.log('🔐 Auth attempt:', raw);
        const parse = credentialsSchema.safeParse(raw);
        if (!parse.success) {
          console.log('❌ Schema validation failed:', parse.error);
          return null;
        }
        const { email, password } = parse.data;
        console.log('📧 Looking for user:', email);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log('❌ User not found');
          return null;
        }
        console.log('✅ User found:', user.email, 'Role:', user.role);
        
        // Always require valid password authentication
        if (!user.passwordHash) {
          console.log('❌ User has no password hash - cannot authenticate');
          return null;
        }
        
        console.log('🔑 Checking password hash...');
        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log('🔑 Password valid:', isValid);
        if (!isValid) return null;
        console.log('✅ Authentication successful for:', user.email);
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔄 JWT callback - token:', token.sub, 'user:', user?.email);
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        console.log('✅ JWT updated with user role:', token.role);
      } else if (token?.sub) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          token.role = dbUser?.role ?? "MODEL";
          console.log('🔄 JWT refreshed from DB - role:', token.role);
        } catch (error) {
          console.error('❌ Error fetching user from DB:', error);
          token.role = "MODEL";
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔄 Session callback - token sub:', token.sub, 'role:', token.role);
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        console.log('✅ Session updated - user ID:', (session.user as any).id, 'role:', (session.user as any).role);
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Custom handler to dynamically set the URL
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Force the correct NEXTAUTH_URL based on environment
  if (process.env.NODE_ENV === 'development') {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  } else {
    process.env.NEXTAUTH_URL = 'https://bokt.vercel.app';
  }
  
  return NextAuth(req, res, authOptions);
}


