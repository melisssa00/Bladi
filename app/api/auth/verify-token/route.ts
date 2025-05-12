import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    console.log("🔵 ===== DÉBUT DE LA VÉRIFICATION DU TOKEN =====");
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ En-tête d'autorisation manquant ou invalide");
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Token reçu");

    if (!token) {
      console.log("❌ Token manquant");
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    try {
      // Ensure JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
        throw new Error(
          "JWT_SECRET is not defined in the environment variables."
        );
      }

      // Vérifier le token
      console.log("🔍 Vérification du token...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        role: string;
      };

      console.log("📦 Token décodé:", {
        userId: decoded.userId,
        role: decoded.role,
      });

      // Récupérer l'utilisateur depuis la base de données
      console.log("🔌 Connexion à la base de données...");
      const client = await clientPromise;
      const db = client.db("bladi-tourisme");
      const users = db.collection("users");
      console.log("✅ Base de données connectée");

      // Convertir l'ID en ObjectId
      const userId = new ObjectId(decoded.userId);
      console.log("🔍 Recherche de l'utilisateur avec l'ID:", userId);

      const user = await users.findOne({ _id: userId });
      console.log("📦 Utilisateur trouvé:", {
        id: user?._id,
        email: user?.email,
        role: user?.role,
      });

      if (!user) {
        console.log("❌ Utilisateur non trouvé dans la base de données");
        return NextResponse.json({ valid: false }, { status: 401 });
      }

      // Utiliser directement le rôle de la base de données
      const userRole = user.role || "user";
      console.log("✅ Rôle de l'utilisateur:", userRole);

      // Si la vérification réussit, renvoyer le token et le rôle
      console.log("✅ Token valide, rôle de l'utilisateur:", userRole);
      console.log("📤 Envoi de la réponse avec le rôle:", userRole);
      console.log("✅ ===== FIN DE LA VÉRIFICATION DU TOKEN =====");

      return NextResponse.json(
        {
          valid: true,
          role: userRole,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du token:", error);
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error("❌ Erreur de vérification du token:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
