// VERSION: 2025-08-21-15-30 - Force Vercel deployment
import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }
        
        try {
          console.log('🔍 Looking for user:', credentials.email);
          const user = await prisma.user.findUnique({ 
            where: { email: credentials.email } 
          });
          
          if (!user) {
            console.log('❌ User not found');
            return null;
          }
          
          if (!user.passwordHash) {
            console.log('❌ User has no password hash');
            return null;
          }
          
          console.log('🔑 Comparing passwords...');
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          console.log('🔑 Password valid:', isValid);
          
          if (!isValid) {
            console.log('❌ Invalid password');
            return null;
          }
          
          console.log('✅ Authentication successful for:', user.email, 'Role:', user.role);
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role 
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔄 JWT callback - token:', token.sub, 'user:', user?.email);
      
      if (user) {
        // Initial sign in - set user data
        console.log('🔄 Setting user data in JWT:', user.email, 'Role:', (user as any).role);
        token.role = (user as any).role;
        token.id = user.id;
        return token;
      }
      
      // Token refresh - verify user still exists and has correct role
      if (token.sub) {
        try {
          console.log('🔄 Refreshing JWT - checking user in DB...');
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { id: true, email: true, role: true, passwordHash: true }
          });
          
          if (!dbUser) {
            console.log('❌ User not found in DB during JWT refresh');
            return { ...token, error: "User not found" };
          }
          
          if (!dbUser.passwordHash) {
            console.log('❌ User has no password hash during JWT refresh');
            return { ...token, error: "Invalid user" };
          }
          
          console.log('🔄 JWT refreshed from DB - role:', dbUser.role);
          token.role = dbUser.role;
          token.id = dbUser.id;
          return token;
        } catch (error) {
          console.error('❌ Error fetching user from DB:', error);
          return { ...token, error: "Database error" };
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('🔄 Session callback - token sub:', token.sub, 'role:', token.role);
      
      if (token.error) {
        console.log('❌ Token has error:', token.error);
        return session;
      }
      
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        console.log('✅ Session updated - user ID:', token.sub, 'role:', token.role);
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
