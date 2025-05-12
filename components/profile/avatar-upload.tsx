"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
}

export default function AvatarUpload({
  currentAvatar,
  onAvatarChange,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      console.log("Headers sent:", {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de l'image");
      }

      const data = await response.json();
      onAvatarChange(data.avatarUrl);
      toast.success("Photo de profil mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la photo de profil");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative w-32 h-32">
        <Image
          src={currentAvatar || "/placeholder.svg"}
          alt="Photo de profil"
          fill
          className="rounded-full object-cover"
        />
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-[#588157] p-2 rounded-full text-white hover:bg-[#3A5A40] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
