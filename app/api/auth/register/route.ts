import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";

interface RegisterRequestBody {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

// Configuration du transporteur d'email avec Mailtrap
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "ea8d4a05cc46cf",
    pass: "9ef3e96772733f",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } =
      (await req.json()) as RegisterRequestBody;

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("bladi-tourisme");
    const users = db.collection("users");

    // Vérification de l'existence de l'utilisateur
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // Génération du code de vérification et hachage du mot de passe
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "user",
    };

    const result = await users.insertOne(newUser);

    if (!result.acknowledged) {
      throw new Error("Échec de l'insertion de l'utilisateur");
    }

    // Envoi de l'email de vérification
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Bladi Tourisme <bladiexplore@gmail.com>",
      to: email,
      subject: "Vérification de votre compte Bladi Tourisme",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #2563eb; text-align: center;">Vérification de votre compte</h2>
          <p>Bonjour ${firstName || ""},</p>
          <p>Merci de vous être inscrit sur Bladi Tourisme. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px;">${verificationCode}</h1>
          </div>
          <p>Ce code expirera dans 24 heures.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3001"}/verify" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Vérifier mon compte
            </a>
          </div>
          <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message: "Inscription réussie. Veuillez vérifier votre email.",
        userId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
