'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// NOUVEAU : Fonction générant des cibles radar SVG animées
const getIconForType = (type: string) => {
  let color = '#06b6d4'; // Cyan par défaut (Centre/Capitale)
  let innerSvg = '<circle cx="12" cy="12" r="3" fill="currentColor"/>';

  // Couleurs assorties aux boutons du dashboard
  if (type === 'POWER_PLANT') {
    color = '#fbbf24'; // Amber
    innerSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />`;
  } else if (type === 'PORT') {
    color = '#14b8a6'; // Teal
    innerSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 2a2 2 0 012 2v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7H5a1 1 0 01-1-1V7a1 1 0 011-1h4V4a2 2 0 012-2z" />`;
  } else if (type === 'RAILWAY') {
    color = '#3b82f6'; // Blue
    innerSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4h16v16H4z M8 4v16 M16 4v16 M4 8h16 M4 16h16" />`;
  } else if (type === 'CITY') {
    color = '#a855f7'; // Purple
    innerSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />`;
  }

  // Structure Holo-UI : Onde de pouls + Anneau rotatif + Icône centrale
  const html = `
    <div class="relative flex items-center justify-center w-8 h-8 group">
      <!-- Onde de choc radar (pulse) -->
      <div class="absolute inset-0 rounded-full border-2 opacity-50 animate-ping" style="border-color: ${color}; animation-duration: 2.5s;"></div>
      
      <!-- Cible de verrouillage (anneau pointillé tournant) -->
      <div class="absolute inset-0 rounded-full border border-dashed opacity-80" style="border-color: ${color}; animation: spin 6s linear infinite;"></div>
      
      <!-- Icône de classification -->
      <svg class="w-4 h-4 relative z-10" fill="none" stroke="${color}" viewBox="0 0 24 24">
        ${innerSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'bg-transparent border-0', // Supprime le fond blanc carré par défaut de Leaflet
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

interface NationalMapProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  pois?: any[]; 
}

export default function NationalMap({ centerLat, centerLng, zoom = 5, pois = [] }: NationalMapProps) {
  return (
    <div className="w-full h-full relative z-0 bg-[#030712]">
      {/* 
        Le filtre CSS sur le MapContainer permet de donner une teinte plus "froide/cyan" 
        au fond de carte CartoDB pour qu'il s'intègre mieux à la charte globale.
      */}
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', filter: 'contrast(1.1) brightness(0.9) sepia(0.2) hue-rotate(180deg)' }}
        zoomControl={false} // On retire les boutons +/- natifs de Leaflet (trop classiques)
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Marqueur central (Référence spatiale) */}
        <Marker position={[centerLat, centerLng]} icon={getIconForType('CENTER')}>
          <Popup className="cyber-popup">
            <div className="text-cyan-400 font-mono font-bold text-[10px] tracking-widest uppercase">Point Zéro (Réf)</div>
          </Popup>
        </Marker>

        {/* Rendu des points stratégiques (POI) */}
        {pois.map((poi) => (
          <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getIconForType(poi.type)}>
            <Popup className="cyber-popup">
              <div className="bg-slate-950/90 border border-cyan-500/50 p-2 clip-beveled-sm backdrop-blur-md">
                <div className="text-cyan-100 font-mono font-bold text-xs uppercase mb-1">{poi.name}</div>
                <div className="text-[9px] text-cyan-600 font-mono tracking-widest uppercase mb-1">CLASSE : {poi.type}</div>
                {poi.value && <div className="text-[10px] text-emerald-400 font-mono font-bold">VOL : {poi.value}</div>}
                {poi.details && <div className="text-[9px] text-cyan-700 font-mono mt-1 pt-1 border-t border-cyan-900/50">{poi.details}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}