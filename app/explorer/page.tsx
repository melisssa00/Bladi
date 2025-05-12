"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const regions = [
  {
    id: "sud",
    name: "Sud de l'Algérie",
    image: "/images/tassili.jpeg",
    count: 6,
    description: "Découvrez le désert du Sahara et ses oasis",
  },
  {
    id: "nord",
    name: "Nord de l'Algérie",
    image: "/images/casbah.jpeg",
    count: 6,
    description: "Explorez les villes côtières et les montagnes",
  },
  {
    id: "est",
    name: "Est de l'Algérie",
    image: "/images/plage-sidi-merouane.jpeg",
    count: 3,
    description: "Visitez les plages et les sites historiques",
  },
  {
    id: "ouest",
    name: "Ouest de l'Algérie",
    image: "/images/skikda.jpeg",
    count: 3,
    description: "Découvrez les plaines et les villes historiques",
  },
];

const popularDestinations = [
  {
    id: 1,
    name: "Tamanrasset",
    location: "Hoggar",
    image: "/images/tassili.jpeg",
    description:
      "Abritant le massif du Hoggar, Tamanrasset est une destination incontournable pour les amateurs de désert.",
  },
  {
    id: 2,
    name: "Ghardaïa",
    location: "M'zab",
    image: "/images/jardin-essai.jpeg",
    description:
      "Célèbre pour sa vallée du M'Zab classée au patrimoine mondial de l'UNESCO.",
  },
];

const experiences = [
  {
    id: 1,
    title: "Randonnée dans le Hoggar",
    location: "Tamanrasset",
    image: "/images/tassili.jpeg",
    rating: 4.9,
    reviews: 28,
  },
  {
    id: 2,
    title: "Visite de la Casbah",
    location: "Alger",
    image: "/images/casbah.jpeg",
    rating: 4.7,
    reviews: 42,
  },
  {
    id: 3,
    title: "Plongée à Skikda",
    location: "Skikda",
    image: "/images/skikda.jpeg",
    rating: 4.8,
    reviews: 15,
  },
];

export default function ExplorerPage() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-[#DAD7CD]/20 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <Header title="Explorateur" />

        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#344E41]">Catégories</h2>
              <p className="text-gray-600">
                Explorez l'Algérie par régions géographiques
              </p>
            </div>
            <Link
              href="/categories"
              className="text-[#588157] hover:text-[#3A5A40] flex items-center"
            >
              Voir toutes les catégories
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region) => (
              <Link key={region.id} href={`/categories/${region.id}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={region.image || "/placeholder.svg"}
                      alt={region.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-xl font-bold">{region.name}</h3>
                      <p className="text-sm">{region.count} wilayas</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#344E41]">
                Destinations populaires
              </h2>
              <p className="text-gray-600">
                Les destinations les plus visitées en Algérie
              </p>
            </div>
            <Link
              href="/destinations"
              className="text-[#588157] hover:text-[#3A5A40] flex items-center"
            >
              Voir toutes les destinations
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularDestinations.map((destination) => (
              <div
                key={destination.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row h-full">
                  <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                    <Image
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-[#588157] mr-1" />
                      <span className="text-sm text-gray-600">
                        {destination.location}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#344E41] mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {destination.description}
                    </p>
                    <Link
                      href={`/destination/${destination.id}`}
                      className="text-[#588157] hover:text-[#3A5A40] font-medium flex items-center"
                    >
                      Explorer
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#344E41]">
                Expériences uniques
              </h2>
              <p className="text-gray-600">
                Des activités exceptionnelles à découvrir
              </p>
            </div>
            <Link
              href="/experiences"
              className="text-[#588157] hover:text-[#3A5A40] flex items-center"
            >
              Voir toutes les expériences
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-[#588157] mr-1" />
                    <span className="text-sm text-gray-600">
                      {experience.location}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#344E41] mb-2">
                    {experience.title}
                  </h3>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm font-medium">
                        {experience.rating}
                      </span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      {experience.reviews} avis
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="fixed bottom-4 right-4">
        <Link href="/profil">
          <button className="bg-[#588157] text-white p-3 rounded-full shadow-lg hover:bg-[#3A5A40] transition">
            <img
              src="/placeholder-user.jpg"
              alt="Profil"
              className="h-8 w-8 rounded-full"
            />
          </button>
        </Link>
      </div>
    </div>
  );
}
