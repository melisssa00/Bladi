"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    console.log("Vérification de la session...");
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log("Utilisateur trouvé:", userData);

        // Vérifier si le token est valide avant de rediriger
        fetch("/api/auth/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Vérification du token:", data);
            if (data.valid) {
              // Utilisateur connecté, ne pas rediriger automatiquement
              console.log(
                "Utilisateur connecté, aucune redirection automatique"
              );
            } else {
              console.log("Token invalide, rester sur la page de connexion");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }
          })
          .catch((error) => {
            console.error("Erreur lors de la vérification du token:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          });
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      console.log("Aucune session trouvée");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Réinitialiser le message d'erreur

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Réponse complète du serveur:", data);
      console.log("Rôle reçu:", data.user?.role);

      if (!response.ok) {
        if (data.message === "Email ou mot de passe incorrect") {
          setErrorMessage(
            "Le mot de passe ou l'email est incorrect. Veuillez réessayer."
          );
        } else {
          setErrorMessage(
            data.message || "Une erreur est survenue lors de la connexion."
          );
        }
        throw new Error(data.message || "Erreur de connexion");
      }

      // Vérification explicite du rôle
      if (!data.user || !data.user.role) {
        throw new Error("Rôle utilisateur non défini dans la réponse");
      }

      // Stocker les informations d'authentification
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("Données stockées dans localStorage:", {
        token: data.token,
        user: data.user,
      });

      // Afficher le message de succès avec le toast
      const roleMessage =
        data.user.role === "admin" ? "Administrateur" : "Utilisateur";
      toast({
        variant: "success",
        title: "Connexion réussie !",
        description: `Bienvenue en tant que ${roleMessage}`,
      });

      // Redirection basée sur le rôle avec vérification explicite
      if (data.user.role === "admin") {
        console.log("Redirection vers /admin - Rôle: Admin confirmé");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
      } else {
        console.log("Redirection vers /explorer - Rôle: Utilisateur confirmé");
        setTimeout(() => {
          window.location.href = "/explorer";
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
      toast({
        variant: "error",
        title: "Erreur de connexion",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DAD7CD]/20 p-4">
      <div className="w-full max-w-md">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        <div className="text-center mb-6">
          <Link
            href="/register"
            className="text-sm font-medium text-[#588157] hover:text-[#3A5A40]"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#588157] to-[#3A5A40] flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-[#344E41]">
              Connexion
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Connectez-vous à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#344E41]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#588157]/20 focus:border-[#588157] focus:ring-[#588157]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#344E41]">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#588157]/20 focus:border-[#588157] focus:ring-[#588157]/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#588157] hover:text-[#3A5A40]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#588157] to-[#3A5A40] hover:from-[#3A5A40] hover:to-[#344E41]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Mot de passe oublié ?{" "}
              <Link
                href="/forgot-password"
                className="text-[#588157] hover:text-[#3A5A40] font-medium"
              >
                Réinitialiser
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
