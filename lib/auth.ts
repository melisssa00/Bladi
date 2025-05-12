import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { Session } from "next-auth";
import jwt from "jsonwebtoken";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const { db } = await connectToDatabase();
        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Met à jour la session toutes les 24 heures
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Ajout explicite de l'ID utilisateur au token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id); // Associe l'ID utilisateur à la session
      }
      return session;
    },
  },
};

export async function validateToken(req: Request) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ Authorization header is missing or malformed");
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("❌ Token is missing in the Authorization header");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId?: string;
      email?: string;
    };
    if (!decoded?.userId) {
      console.error("❌ Token is invalid or missing userId");
      return null;
    }
    return decoded;
  } catch (err) {
    console.error("❌ Error verifying token:", err);
    return null;
  }
}
