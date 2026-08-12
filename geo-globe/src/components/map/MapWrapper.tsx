'use client';

import dynamic from 'next/dynamic';

const NationalMap = dynamic(() => import('@/components/map/NationalMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
      Chargement de la carte...
    </div>
  )
});

interface MapWrapperProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  pois?: any[]; // NOUVEAU
}

export default function MapWrapper({ centerLat, centerLng, zoom = 5, pois = [] }: MapWrapperProps) {
  return <NationalMap centerLat={centerLat} centerLng={centerLng} zoom={zoom} pois={pois} />; // NOUVEAU : on passe la prop
}