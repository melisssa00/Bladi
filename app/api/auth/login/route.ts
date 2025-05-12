import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔵 ===== DÉBUT DE LA TENTATIVE DE CONNEXION =====");
    const { email, password } = await req.json();
    console.log("📧 Email reçu:", email);

    // Validation des données
    if (!email || !password) {
      console.log("❌ Données manquantes");
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.log("❌ Format d'email invalide");
      return NextResponse.json(
        { message: "Format d'email invalide" },
        { status: 400 }
      );
    }

    console.log("🔌 Connexion à la base de données...");
    const client = await clientPromise;
    const db = client.db("bladi-tourisme");
    const users = db.collection("users");
    console.log("✅ Base de données connectée");

    // Recherche de l'utilisateur
    console.log("🔍 Recherche de l'utilisateur dans la base de données...");
    const user = await users.findOne({ email });
    console.log("📦 Données utilisateur trouvées:", {
      id: user?._id,
      email: user?.email,
      role: user?.role,
      emailVerified: user?.emailVerified,
    });

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérification du rôle
    console.log("🔍 Vérification du rôle dans les données utilisateur");
    console.log("Rôle trouvé:", user.role);
    console.log("Type du rôle:", typeof user.role);
    console.log("Rôle exact:", JSON.stringify(user.role));

    // Vérification du mot de passe
    console.log("🔐 Vérification du mot de passe...");
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("❌ Mot de passe incorrect");
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    console.log("✅ Mot de passe correct");

    // Vérification de l'email
    if (!user.emailVerified) {
      console.log("❌ Email non vérifié");
      return NextResponse.json(
        { message: "Veuillez vérifier votre email avant de vous connecter" },
        { status: 401 }
      );
    }

    console.log("✅ Email vérifié");

    // Normalize the email before adding it to the token payload
    const normalizedEmail = user.email.trim().toLowerCase();

    // Création du token avec le rôle
    console.log("🔑 Création du token...");
    const tokenPayload = {
      userId: user._id.toString(),
      email: normalizedEmail, // Use normalized email
      role: user.role || "user", // Use the role directly from the database
    };
    console.log("📦 Payload du token:", tokenPayload);

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not defined in the environment variables."
      );
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Token créé avec le rôle:", user.role);

    // Préparation de la réponse avec le rôle
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user", // Utiliser directement le rôle de la base de données
      emailVerified: user.emailVerified,
    };

    console.log("📤 Envoi de la réponse avec les données suivantes:");
    console.log("- Rôle:", userResponse.role);
    console.log("- Données complètes:", JSON.stringify(userResponse, null, 2));

    console.log("✅ ===== FIN DE LA TENTATIVE DE CONNEXION =====");

    return NextResponse.json({
      message: "Connexion réussie",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion:", error);
    return NextResponse.json(
      { message: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
