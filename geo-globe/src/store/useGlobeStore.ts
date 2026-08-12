// src/store/useGlobeStore.ts
import { create } from 'zustand';

// Ajout du calque ALLIANCES
type LayerType = 'BASE' | 'RESOURCES' | 'TRADE_ROUTES' | 'DIPLOMACY' | 'ALLIANCES' | 'RESOURCES';

// Interface pour nos critères de filtre
interface GlobalFilters {
  search: string;
  minGdp: number | '';
  minPop: number | '';
  allianceId: string;   // <-- NOUVEAU : Filtre par alliance spécifique
  allianceType: string;
}

interface GlobeState {
  selectedCountryCode: string | null;
  countryData: any | null;
  activeLayer: LayerType;
  
  // NOUVEAU : Données globales et filtres
  globalAlliances: any[];
  globalCountriesData: any[];
  filters: GlobalFilters;
  activeResourceData: any[];
  minResourceVolume: number;


  setMinResourceVolume: (volume: number) => void;
  
  setSelectedCountry: (code: string | null) => void;
  setCountryData: (data: any | null) => void;
  setActiveLayer: (layer: LayerType) => void;
  setGlobalAlliances: (data: any[]) => void;
  setActiveResourceData: (data: any[]) => void;
  
  // NOUVEAU : Actions pour mettre à jour les données globales et les filtres
  setGlobalCountriesData: (data: any[]) => void;
  setFilters: (filters: Partial<GlobalFilters>) => void;

  isResourcePanelOpen: boolean;
  toggleResourcePanel: () => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  selectedCountryCode: null,
  countryData: null,
  activeLayer: 'TRADE_ROUTES',
  
  // Initialisation à vide
  globalCountriesData: [],
  globalAlliances: [],
  filters: { search: '', minGdp: '', minPop: '', allianceId: '', allianceType: '' },
  isResourcePanelOpen: false,
  toggleResourcePanel: () => set((state) => ({ isResourcePanelOpen: !state.isResourcePanelOpen })),
  activeResourceData: [],
  minResourceVolume: 0,

  setSelectedCountry: (code) => set({ selectedCountryCode: code, countryData: null }),
  setCountryData: (data) => set({ countryData: data }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setGlobalAlliances: (data) => set({ globalAlliances: data }),
  setActiveResourceData: (data) => set({ activeResourceData: data }),
  setMinResourceVolume: (volume) => set({ minResourceVolume: volume }),
  
  setGlobalCountriesData: (data) => set({ globalCountriesData: data }),
  // Permet de mettre à jour un ou plusieurs filtres d'un coup
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 

  
  })),
}));