import { getCountry } from '@/actions/country';
import CountryDashboardClient from '@/components/features/CountryDashboardClient';

export default async function CountryDashboard({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = await params;
  const countryCode = resolvedParams.code.toUpperCase();
  
  // Récupération des données depuis Prisma (incluant les articles et points d'intérêt)
  const countryData = await getCountry(countryCode);

  // Si le pays n'existe pas encore dans la base, on passe un objet sécurisé par défaut
  const dataToPass = countryData || { 
    id: countryCode,
    name: countryCode, 
    lat: 0, 
    lng: 0, 
    articles: [],
    pointsOfInterest: []
  };

  // On injecte les données du serveur directement dans le composant client interactif
  return <CountryDashboardClient initialData={dataToPass} />;
}