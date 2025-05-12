import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { validateToken } from "@/lib/auth";

// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

// Fonction pour extraire l'utilisateur depuis le token JWT
async function getUserFromToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ Authorization header manquant ou malformé");
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("❌ Token manquant dans l'en-tête Authorization");
    return null;
  }

  console.log("[Debug] JWT_SECRET utilisé :", JWT_SECRET);
  console.log("[Debug] Token reçu :", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      userId?: string;
    };

    if (!decoded?.userId) return null;
    return decoded.userId;
  } catch (err) {
    console.error("Erreur de vérification du token :", err);
    return null;
  }
}

// Fonction simple de sanitization des chaînes
function sanitizeString(str: string) {
  return str.trim();
}

// Fonction simple de validation des données du profil
function validateProfileData(data: any) {
  const errors: string[] = [];

  if ("firstName" in data) {
    if (
      typeof data.firstName !== "string" ||
      data.firstName.trim().length === 0
    ) {
      errors.push("Prénom invalide");
    }
  }
  if ("lastName" in data) {
    if (
      typeof data.lastName !== "string" ||
      data.lastName.trim().length === 0
    ) {
      errors.push("Nom invalide");
    }
  }
  if ("phone" in data) {
    if (typeof data.phone !== "string" || data.phone.trim().length < 6) {
      errors.push("Téléphone invalide");
    }
  }
  if ("location" in data) {
    if (typeof data.location !== "string") {
      errors.push("Localisation invalide");
    }
  }
  if ("bio" in data) {
    if (typeof data.bio !== "string") {
      errors.push("Biographie invalide");
    }
  }

  return errors;
}

// ✅ GET /api/user/profile
export async function GET(req: Request) {
  try {
    const decoded = await validateToken(req);
    if (!decoded) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userId = decoded.userId;
    const { client } = await connectToDatabase();
    const db = client.db("bladi-tourisme");

    console.log("✅ Base de données connectée :", db.databaseName);
    console.log("✅ Collection utilisée : users");

    console.log("🔍 Recherche de l'utilisateur avec l'ID:", userId);

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

    if (!user) {
      console.log(
        "❌ Aucun utilisateur trouvé avec cet ID comme ObjectId, tentative avec string:",
        userId
      );

      if (!userId || !ObjectId.isValid(userId)) {
        console.log(
          "❌ userId n'est pas un ObjectId valide ou est manquant:",
          userId
        );
        return NextResponse.json(
          { message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      const fallbackUser = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { password: 0 } }
        );

      if (!fallbackUser) {
        console.log(
          "❌ Aucun utilisateur trouvé avec cet ID comme string:",
          userId
        );
        return NextResponse.json(
          { message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...fallbackUser,
        userId: fallbackUser._id.toString(),
      });
    }

    const { _id, ...responseUser } = {
      ...user,
      userId: user._id.toString(),
    };

    return NextResponse.json(responseUser);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/user/profile
export async function PUT(req: Request) {
  try {
    const decoded = await validateToken(req);
    if (!decoded) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userId = decoded.userId;
    const data = await req.json();

    const errors = validateProfileData(data);
    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Données invalides", errors },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (data.firstName) updateData.firstName = sanitizeString(data.firstName);
    if (data.lastName) updateData.lastName = sanitizeString(data.lastName);
    if (data.phone) updateData.phone = sanitizeString(data.phone);
    if (data.location) updateData.location = sanitizeString(data.location);
    if (data.bio) updateData.bio = sanitizeString(data.bio);
    updateData.updatedAt = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    const { client } = await connectToDatabase();
    const db = client.db("bladi-tourisme");

    console.log("✅ Base de données connectée :", db.databaseName);
    console.log("✅ Collection utilisée : users");

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    if (result.matchedCount === 0) {
      console.warn("❌ Aucun utilisateur trouvé pour la mise à jour du profil");
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("✅ Profil mis à jour avec succès pour l'utilisateur:", userId);
    return NextResponse.json(
      { message: "Profil mis à jour avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
