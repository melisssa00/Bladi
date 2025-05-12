"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Compass, Heart, User, LogOut } from "lucide-react";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Explorer", href: "/explorer", icon: Compass },
  { name: "Carte", href: "/map", icon: Map },
  { name: "Favoris", href: "/favorites", icon: Heart },
  { name: "Profil", href: "/profil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-[#344E41]">
            Bladi Tourisme
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-[#588157] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
