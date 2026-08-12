import GeoGlobe from '@/components/globe/GeoGlobe';
import CountrySidePanel from '@/components/features/CountrySidePanel'; // <-- Nouvel import
import TopSearchBar from '@/components/features/TopSearchBar'; // <-- NOUVEL IMPORT
import ResourceSidePanel from '@/components/features/ResourceSidePanel'; // <-- NOUVEL IMPORT
import TelemetryHUD from '@/components/ui/TelemetryHUD';

export default function Home() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <TopSearchBar /> {/* <-- NOUVEAU COMPOSANT */}
      <ResourceSidePanel />
      <GeoGlobe />

      <div className="absolute top-4 left-4 text-white z-10 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-widest uppercase">Géo-Globe</h1>
        <p className="text-sm text-gray-400">Mode: Exploration</p>
      </div>

      {/* Le panneau latéral qui s'affichera par-dessus le globe */}
      <CountrySidePanel />
      {/* NOUVEAU : Le HUD de télémétrie */}
      <TelemetryHUD />
    </main>
  );
}