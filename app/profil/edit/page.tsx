"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { fetchWithAuth } from "@/utils/api";

interface UserProfile {
  userId?: string; // Changed to optional
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    userId: "", // Initialisation
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    createdAt: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth("/api/user/profile");
        setFormData(data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Impossible de charger vos données");
        router.push("/login");
      }
    }

    fetchProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedData = { ...formData };
      delete updatedData.userId; // Ne pas envoyer userId dans la requête PUT

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      console.log("Headers sent:", {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });

      if (!response.ok) throw new Error("Échec de la mise à jour");

      toast.success("Profil mis à jour avec succès");

      // Synchronisation avec localStorage après mise à jour réussie
      localStorage.setItem("user", JSON.stringify(updatedData));

      router.push("/profil");
    } catch (error) {
      toast.error("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-[#588157] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          onClick={() => router.push("/profil")}
        >
          <ArrowLeft className="h-4 w-4" /> Retour au profil
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Modifier le profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Entrez votre prénom"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Entrez votre nom"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez votre email"
                className="mt-1"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Entrez votre numéro de téléphone"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Entrez votre localisation"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Parlez-nous de vous"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
