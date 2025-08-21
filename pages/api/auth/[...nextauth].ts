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
        try {
          const parse = credentialsSchema.safeParse(raw);
          if (!parse.success) return null;
          
          const { email, password } = parse.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;
          
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;
          
          return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      } else if (token?.sub) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          token.role = dbUser?.role ?? "MODEL";
        } catch (error) {
          token.role = "MODEL";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);


