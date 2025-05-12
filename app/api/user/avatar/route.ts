import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { validateToken } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { ObjectId } from "mongodb";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATARS_UPLOAD_DIR = join(process.cwd(), "public/uploads/avatars");

export async function POST(req: NextRequest) {
  try {
    console.log("Début du traitement de la requête POST pour l'avatar");

    // Authentication
    const decoded = await validateToken(req);
    if (!decoded) {
      console.error("❌ Token is missing or invalid");
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log("🔑 Utilisateur authentifié avec l'ID:", userId);

    // File validation
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      console.error("❌ Aucun fichier reçu");
      return NextResponse.json(
        { message: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error("❌ Type de fichier non autorisé:", file.type);
      return NextResponse.json(
        { message: "Type de fichier non autorisé" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ Taille du fichier trop grande:", file.size);
      return NextResponse.json(
        { message: "Fichier trop volumineux" },
        { status: 400 }
      );
    }

    // Save file
    const filePath = join(AVATARS_UPLOAD_DIR, `${userId}-${file.name}`);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    console.log("✅ Fichier enregistré avec succès à:", filePath);

    // Update user avatar URL in the database
    const { client } = await connectToDatabase();
    const db = client.db("bladi-tourisme");

    const avatarUrl = `/uploads/avatars/${userId}-${file.name}`;
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { avatar: avatarUrl } }
      );

    if (result.matchedCount === 0) {
      console.error("❌ Aucun utilisateur trouvé pour mettre à jour l'avatar");
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("✅ Avatar mis à jour avec succès pour l'utilisateur:", userId);
    return NextResponse.json(
      { message: "Avatar mis à jour avec succès", avatarUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
