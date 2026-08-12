// src/actions/country.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import countries from 'world-countries';

export async function getCountry(id: string) {
  try {
    return await prisma.country.findUnique({
      where: { id },
      include: {
        exports: { include: { target: true } },
        imports: { include: { source: true } },
        diplomaticMissions: { include: { target: true } },
        hostedMissions: { include: { source: true } },
        alliances: { include: { members: true } },
        resources: { include: { resource: true } },
        // NOUVEAU : On récupère la data locale
        articles: true,
        pointsOfInterest: true,
      },
    });
  } catch (error) {
    console.error("Erreur récupération :", error);
    return null;
  }
}
// Ajout des paramètres population et gdp
export async function saveCountryNotes(id: string, description: string, population?: number | null, gdp?: number | null) {
    try {
        const countryData = countries.find((c) => c.cca3 === id);
        if (!countryData) throw new Error(`Pays introuvable : ${id}`);

        const realName = countryData.name.common;
        const [lat, lng] = countryData.latlng;

        await prisma.country.upsert({
            where: { id },
            update: { description, name: realName, lat, lng, population, gdp },
            create: { id, name: realName, description, lat, lng, population, gdp },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Erreur sauvegarde :", error);
        return { success: false };
    }
}

export async function addTradeRoute(sourceId: string, targetId: string) {
  try {
    if (sourceId === targetId) return { success: false, message: 'Auto-export' };

    // 1. Initialisation automatique du pays cible s'il n'existe pas
    const targetData = countries.find((c) => c.cca3 === targetId);
    if (targetData) {
      await prisma.country.upsert({
        where: { id: targetId },
        update: {}, // S'il existe, on ne touche à rien
        create: {
          id: targetId,
          name: targetData.name.common,
          lat: targetData.latlng[0],
          lng: targetData.latlng[1],
        }
      });
    }

    // 2. Création de la route commerciale
    await prisma.tradeRoute.create({
      data: { sourceId, targetId },
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur création route :", error);
    return { success: false };
  }
}
// NOUVELLE FONCTION : Ajouter une relation diplomatique
export async function addDiplomaticRelation(sourceId: string, targetId: string, type: string, count: number) {
  try {
    if (sourceId === targetId) return { success: false };
    
    // 1. Initialisation automatique du pays cible s'il n'existe pas
    const targetData = countries.find((c) => c.cca3 === targetId);
    if (targetData) {
      await prisma.country.upsert({
        where: { id: targetId },
        update: {}, 
        create: {
          id: targetId,
          name: targetData.name.common,
          lat: targetData.latlng[0],
          lng: targetData.latlng[1],
        }
      });
    }

    // 2. Création de la relation diplomatique
    await prisma.diplomaticRelation.create({
      data: { sourceId, targetId, type, count },
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur diplomatie :", error);
    return { success: false };
  }
}

export async function getAllCountriesBasicData() {
  try {
    return await prisma.country.findMany({
      select: {
        id: true,
        name: true,
        population: true,
        gdp: true,
        alliances: true, // <-- NOUVEAU : On charge les alliances pour les filtres
      },
    });
  } catch (error) {
    console.error("Erreur récupération globale :", error);
    return [];
  }
}

// NOUVELLE FONCTION : Créer une alliance globale
// MODIFICATION : Ajout des trois booléens
export async function createAlliance(
  name: string, 
  color: string, 
  isEconomic: boolean, 
  isPolitical: boolean, 
  isMilitary: boolean, 
  description?: string
) {
  try {
    const newAlliance = await prisma.alliance.create({
      data: { name, color, isEconomic, isPolitical, isMilitary, description },
    });
    revalidatePath('/');
    return { success: true, alliance: newAlliance };
  } catch (error) {
    console.error("Erreur création alliance :", error);
    return { success: false };
  }
}

// NOUVELLE FONCTION : Ajouter un pays à une alliance existante
export async function addCountryToAlliance(countryId: string, allianceId: string) {
  try {
    await prisma.country.update({
      where: { id: countryId },
      data: {
        alliances: {
          connect: { id: allianceId } // L'opérateur "connect" lie deux enregistrements existants
        }
      }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur liaison alliance :", error);
    return { success: false };
  }
}

// NOUVELLE FONCTION : Récupérer toutes les alliances disponibles (pour les lister dans un menu déroulant)
export async function getAllAlliances() {
  try {
    return await prisma.alliance.findMany({
      include: {
        // On récupère les coordonnées des membres pour pouvoir tracer les arcs globaux
        members: { select: { id: true, lat: true, lng: true } }
      }
    });
  } catch (error) {
    console.error("Erreur récupération alliances :", error);
    return [];
  }
}

// NOUVELLE FONCTION : Retirer un pays d'une alliance
export async function removeCountryFromAlliance(countryId: string, allianceId: string) {
  try {
    await prisma.country.update({
      where: { id: countryId },
      data: {
        alliances: {
          disconnect: { id: allianceId } // Brise le lien sans supprimer l'alliance elle-même
        }
      }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur retrait alliance :", error);
    return { success: false };
  }
}

// Mettre à jour les types d'une alliance
export async function updateAlliance(id: string, isEconomic: boolean, isPolitical: boolean, isMilitary: boolean) {
  try {
    await prisma.alliance.update({
      where: { id },
      data: { isEconomic, isPolitical, isMilitary }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour alliance :", error);
    return { success: false };
  }
}

// Supprimer définitivement une alliance
export async function deleteAlliance(id: string) {
  try {
    await prisma.alliance.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression alliance :", error);
    return { success: false };
  }
}

// Récupérer toutes les ressources existantes dans la base globale
export async function getAllResources() {
  try {
    return await prisma.resource.findMany();
  } catch (error) {
    console.error("Erreur récupération ressources :", error);
    return [];
  }
}

// Créer un nouveau type de ressource (ex: "Terres Rares", "Pétrole")
export async function createResource(name: string, category: string, unit: string, color: string) {
  try {
    const newRes = await prisma.resource.create({
      data: { name, category, unit, color },
    });
    revalidatePath('/');
    return { success: true, resource: newRes };
  } catch (error) {
    console.error("Erreur création ressource :", error);
    return { success: false };
  }
}

// Assigner une ressource à un pays avec un volume de production (Upsert pour mettre à jour si elle existe déjà)
export async function addResourceToCountry(countryId: string, resourceId: string, volume: number) {
  try {
    await prisma.countryResource.upsert({
      where: { countryId_resourceId: { countryId, resourceId } },
      update: { volume },
      create: { countryId, resourceId, volume },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur liaison ressource :", error);
    return { success: false };
  }
}

// Retirer une ressource d'un pays
export async function removeResourceFromCountry(countryId: string, resourceId: string) {
  try {
    await prisma.countryResource.delete({
      where: { countryId_resourceId: { countryId, resourceId } },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression ressource pays :", error);
    return { success: false };
  }
}

// NOUVELLE FONCTION : Récupérer tous les pays liés à une ressource spécifique
export async function getCountriesByResource(resourceId: string) {
  try {
    return await prisma.countryResource.findMany({
      where: { resourceId },
      include: {
        // On récupère uniquement ce dont le globe a besoin
        country: { select: { id: true, name: true, lat: true, lng: true } },
        resource: true
      }
    });
  } catch (error) {
    console.error("Erreur récupération données ressources :", error);
    return [];
  }
}

// --- GESTION DES ARTICLES ---
export async function addArticle(countryId: string, title: string, url: string, category: string, summary: string = '') {
  try {
    await prisma.article.create({
      data: { countryId, title, url, category, summary }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur création article :", error);
    return { success: false };
  }
}

export async function deleteArticle(articleId: string) {
  try {
    await prisma.article.delete({ where: { id: articleId } });
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression article :", error);
    return { success: false };
  }
}

// --- GESTION DES POINTS D'INTÉRÊT (POI) ---
export async function addPointOfInterest(
  countryId: string, name: string, type: string, lat: number, lng: number, value?: number, details?: string
) {
  try {
    await prisma.pointOfInterest.create({
      data: { countryId, name, type, lat, lng, value, details }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur création POI :", error);
    return { success: false };
  }
}

export async function deletePointOfInterest(poiId: string) {
  try {
    await prisma.pointOfInterest.delete({ where: { id: poiId } });
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression POI :", error);
    return { success: false };
  }
}