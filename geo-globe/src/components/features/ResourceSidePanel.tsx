'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobeStore } from '@/store/useGlobeStore';
import { getAllResources, getCountriesByResource } from '@/actions/country';

export default function ResourceSidePanel() {
  const isOpen = useGlobeStore((state) => state.isResourcePanelOpen);
  const togglePanel = useGlobeStore((state) => state.toggleResourcePanel);
  const activeResourceData = useGlobeStore((state) => state.activeResourceData);
  const setActiveResourceData = useGlobeStore((state) => state.setActiveResourceData);
  
  const minResourceVolume = useGlobeStore((state) => state.minResourceVolume);
  const setMinResourceVolume = useGlobeStore((state) => state.setMinResourceVolume);

  const [resources, setResources] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedResId, setSelectedResId] = useState<string>('');

  useEffect(() => {
    const fetchRes = async () => {
      const data = await getAllResources();
      setResources(data);
      if (data.length > 0) setSelectedResId(data[0].id);
    };
    fetchRes();
  }, []);

  const filteredResources = useMemo(() => {
    if (selectedCategory === 'ALL') return resources;
    return resources.filter(r => r.category === selectedCategory);
  }, [resources, selectedCategory]);

  useEffect(() => {
    if (filteredResources.length > 0 && !filteredResources.some(r => r.id === selectedResId)) {
      setSelectedResId(filteredResources[0].id);
    }
  }, [filteredResources, selectedResId]);

  useEffect(() => {
    const fetchProducers = async () => {
      if (selectedResId) {
        const data = await getCountriesByResource(selectedResId);
        setActiveResourceData(data);
        setMinResourceVolume(0);
      } else {
        setActiveResourceData([]);
      }
    };
    fetchProducers();
  }, [selectedResId, setActiveResourceData, setMinResourceVolume]);

  const maxVolume = useMemo(() => {
    if (!activeResourceData || activeResourceData.length === 0) return 100;
    return Math.max(...activeResourceData.map(d => d.volume));
  }, [activeResourceData]);

  const top5Producers = useMemo(() => {
    if (!activeResourceData) return [];
    return [...activeResourceData]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [activeResourceData]);

  const selectedResource = resources.find(r => r.id === selectedResId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside 
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 h-screen w-80 bg-slate-950/60 border-r border-cyan-500/30 p-6 text-slate-300 shadow-[10px_0_30px_rgba(6,182,212,0.1)] backdrop-blur-xl overflow-y-auto z-20 custom-scrollbar"
        >
          {/* Bouton de fermeture technique */}
          <button onClick={togglePanel} className="absolute top-4 right-4 text-cyan-700 hover:text-cyan-400 transition-colors group">
            <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className="mt-8 flex flex-col gap-6">
            <div>
              <span className="text-[10px] text-cyan-600 font-bold tracking-[0.2em]">ANALYSE GLOBALE</span>
              <h2 className="text-2xl font-mono font-bold mt-1 text-cyan-50">RESSOURCES</h2>
            </div>

            {/* Sélecteur de Catégorie Stratégique (Style Radar) */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] text-cyan-700 uppercase font-bold tracking-[0.2em]">Catégorie stratégique :</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ALL', label: 'TOUTES' },
                  { id: 'ENERGY', label: 'ÉNERGIES' },
                  { id: 'TECH', label: 'TERRES RARES' },
                  { id: 'FOOD', label: 'VIVRIÈRES' }
                ].map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)} 
                    className={`py-1.5 text-[9px] font-mono font-bold tracking-widest clip-beveled-sm transition-all border ${
                      selectedCategory === cat.id 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                        : 'bg-black/40 border-cyan-900/50 text-cyan-700 hover:text-cyan-400 hover:border-cyan-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection de la ressource spécifique */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] text-cyan-700 uppercase font-bold tracking-[0.2em]">Ressource précise :</label>
              <div className="relative">
                <select 
                  value={selectedResId} 
                  onChange={(e) => setSelectedResId(e.target.value)} 
                  className="w-full bg-black/40 border border-cyan-900/50 clip-beveled-sm p-2 text-cyan-300 text-xs font-mono outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] appearance-none cursor-pointer transition-all"
                >
                  {filteredResources.map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-cyan-300">{r.name.toUpperCase()}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-cyan-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {selectedResource && (
              <>
                {/* Carte d'information de la ressource */}
                <div className="bg-cyan-950/20 p-3 clip-beveled-sm border border-cyan-500/20 flex justify-between items-center relative">
                  <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500/50"></div>
                  <div className="flex items-center gap-3 pl-2">
                    <span className="w-2 h-2 rounded-none border border-cyan-300 shadow-[0_0_5px_currentColor]" style={{ color: selectedResource.color, backgroundColor: selectedResource.color }}></span>
                    <span className="font-mono font-bold text-sm text-cyan-100">{selectedResource.name.toUpperCase()}</span>
                  </div>
                  <span className="text-[10px] text-cyan-600 font-mono tracking-wider bg-black/50 px-2 py-1 clip-beveled-sm border border-cyan-900/30">{selectedResource.unit}</span>
                </div>

                {/* Curseur de volume façon terminal */}
                {activeResourceData.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] text-cyan-700 uppercase font-bold tracking-[0.2em]">Seuil minimal :</label>
                      <span className="text-xs font-mono font-bold text-cyan-400">{minResourceVolume}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={maxVolume} 
                      step={maxVolume > 100 ? Math.floor(maxVolume / 100) : 1}
                      value={minResourceVolume} 
                      onChange={(e) => setMinResourceVolume(Number(e.target.value))}
                      className="w-full h-1 bg-cyan-950 rounded-none appearance-none cursor-pointer border border-cyan-900/50 accent-cyan-400"
                    />
                  </div>
                )}

                {/* Top 5 Mondial façon HUD */}
                {top5Producers.length > 0 && (
                  <div className="mt-4 bg-black/40 p-4 border border-cyan-900/50 clip-beveled-sm relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400"></div>
                    
                    <h3 className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em] mb-4">Majeurs Mondiaux</h3>
                    <ul className="space-y-3">
                      {top5Producers.map((data, index) => (
                        <li key={data.id} className="flex justify-between items-center text-xs border-b border-cyan-900/30 pb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-cyan-700">0{index + 1}</span>
                            <span className="font-mono text-cyan-100">{data.country.name.toUpperCase()}</span>
                          </div>
                          <span className="font-mono text-cyan-400 font-bold">{data.volume}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeResourceData.length === 0 && (
                  <div className="border border-red-900/30 bg-red-950/20 p-3 clip-beveled-sm mt-4 text-center">
                    <p className="text-[10px] text-red-500 font-mono tracking-widest uppercase">Aucun signal détecté</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}