'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGlobeStore } from '@/store/useGlobeStore';
import { getAllCountriesBasicData, getAllAlliances } from '@/actions/country';

export default function TopSearchBar() {
  const filters = useGlobeStore((state) => state.filters);
  const setFilters = useGlobeStore((state) => state.setFilters);
  const setGlobalCountriesData = useGlobeStore((state) => state.setGlobalCountriesData);

  const globalAlliances = useGlobeStore((state) => state.globalAlliances);
  const setGlobalAlliances = useGlobeStore((state) => state.setGlobalAlliances);

  const isResourcePanelOpen = useGlobeStore((state) => state.isResourcePanelOpen);
  const toggleResourcePanel = useGlobeStore((state) => state.toggleResourcePanel);

  useEffect(() => {
    const loadData = async () => {
      const data = await getAllCountriesBasicData();
      setGlobalCountriesData(data);
      const alls = await getAllAlliances();
      setGlobalAlliances(alls);
    };
    loadData();
  }, [setGlobalCountriesData, setGlobalAlliances]);

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} // Courbe d'animation ultra-douce
      className="absolute top-6 left-1/2 z-10 bg-slate-950/60 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex gap-6 items-center clip-beveled"
    >

      {/* Recherche Centrale */}
      <div className="flex items-center bg-black/40 px-3 py-1.5 border border-cyan-900/50 focus-within:border-cyan-400 focus-within:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm group">
        <svg className="w-4 h-4 text-cyan-600 group-focus-within:text-cyan-400 mr-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text" 
          placeholder="RECHERCHER..." 
          value={filters.search} 
          onChange={(e) => setFilters({ search: e.target.value })} 
          className="bg-transparent text-cyan-50 placeholder-cyan-800/70 outline-none w-32 text-xs font-mono tracking-widest" 
        />
      </div>

      {/* Données Démographiques & Économiques */}
      <div className="flex flex-col">
        <label className="text-[9px] text-cyan-600 uppercase font-bold tracking-[0.2em] mb-1">Pop. (M)</label>
        <input 
          type="number" 
          placeholder="MIN" 
          value={filters.minPop} 
          onChange={(e) => setFilters({ minPop: e.target.value ? Number(e.target.value) : '' })} 
          className="bg-black/40 text-cyan-300 outline-none w-16 text-xs font-mono px-2 py-1 border border-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm" 
        />
      </div>

      <div className="flex flex-col">
        <label className="text-[9px] text-cyan-600 uppercase font-bold tracking-[0.2em] mb-1">PIB ($)</label>
        <input 
          type="number" 
          placeholder="MIN" 
          value={filters.minGdp} 
          onChange={(e) => setFilters({ minGdp: e.target.value ? Number(e.target.value) : '' })} 
          className="bg-black/40 text-cyan-300 outline-none w-16 text-xs font-mono px-2 py-1 border border-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm" 
        />
      </div>

      {/* Séparateur optique */}
      <div className="h-8 w-px bg-cyan-900/50 shadow-[0_0_5px_rgba(6,182,212,0.5)]"></div>

      {/* Filtres Alliances */}
      <div className="flex flex-col">
        <label className="text-[9px] text-cyan-600 uppercase font-bold tracking-[0.2em] mb-1">Type d'Alliance</label>
        <select 
          value={filters.allianceType} 
          onChange={(e) => setFilters({ allianceType: e.target.value })} 
          className="bg-black/40 text-cyan-300 outline-none w-28 text-xs font-mono px-2 py-1 border border-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm cursor-pointer appearance-none"
        >
          <option value="">TOUTES</option>
          <option value="ECONOMIC">ÉCONOMIQUE</option>
          <option value="POLITICAL">POLITIQUE</option>
          <option value="MILITARY">MILITAIRE</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-[9px] text-cyan-600 uppercase font-bold tracking-[0.2em] mb-1">Alliance</label>
        <select 
          value={filters.allianceId} 
          onChange={(e) => setFilters({ allianceId: e.target.value })} 
          className="bg-black/40 text-cyan-300 outline-none w-28 text-xs font-mono px-2 py-1 border border-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm cursor-pointer appearance-none"
        >
          <option value="">TOUTES</option>
          {globalAlliances.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Bouton d'Analyse des Ressources */}
      <button
        onClick={toggleResourcePanel}
        className={`ml-2 px-4 py-2 text-xs font-mono font-bold tracking-widest transition-all duration-300 flex items-center gap-2 clip-beveled-sm ${
          isResourcePanelOpen 
            ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
            : 'bg-black/40 border border-cyan-900/50 text-cyan-700 hover:text-cyan-400 hover:border-cyan-700'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
        </svg>
        DATA
      </button>

    </motion.div>
  );
}