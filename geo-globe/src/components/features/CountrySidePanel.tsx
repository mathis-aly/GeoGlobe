'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobeStore } from '@/store/useGlobeStore';
import {
  getCountry, saveCountryNotes, addTradeRoute, addDiplomaticRelation,
  createAlliance, addCountryToAlliance, getAllAlliances, removeCountryFromAlliance, updateAlliance, deleteAlliance,
  getAllResources, createResource, addResourceToCountry, removeResourceFromCountry
} from '@/actions/country';

export default function CountrySidePanel() {
  const selectedCountryCode = useGlobeStore((state) => state.selectedCountryCode);
  const setSelectedCountry = useGlobeStore((state) => state.setSelectedCountry);
  const countryData = useGlobeStore((state) => state.countryData);
  const setCountryData = useGlobeStore((state) => state.setCountryData);
  const activeLayer = useGlobeStore((state) => state.activeLayer);
  const setActiveLayer = useGlobeStore((state) => state.setActiveLayer);

  // ÉTATS DE BASE
  const [notes, setNotes] = useState('');
  const [population, setPopulation] = useState<number | ''>('');
  const [gdp, setGdp] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ÉTATS COMMERCE & DIPLOMATIE
  const [partnerCode, setPartnerCode] = useState('');
  const [dipCode, setDipCode] = useState('');
  const [dipType, setDipType] = useState('Ambassade');
  const [dipCount, setDipCount] = useState<number>(1);

  // ÉTATS ALLIANCES
  const [availableAlliances, setAvailableAlliances] = useState<any[]>([]);
  const [selectedAllianceId, setSelectedAllianceId] = useState('');
  const [newAllianceName, setNewAllianceName] = useState('');
  const [newAllianceColor, setNewAllianceColor] = useState('#fbbf24');
  const [isEco, setIsEco] = useState(false);
  const [isPol, setIsPol] = useState(false);
  const [isMil, setIsMil] = useState(false);

  // ÉTATS RESSOURCES
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [selectedResId, setSelectedResId] = useState('');
  const [resVolume, setResVolume] = useState<number | ''>('');
  const [newResName, setNewResName] = useState('');
  const [newResCat, setNewResCat] = useState('TECH');
  const [newResUnit, setNewResUnit] = useState('Tonnes');
  const [newResColor, setNewResColor] = useState('#10b981');

  const fetchCountryData = useCallback(async (code: string) => {
    setIsLoading(true);
    const data = await getCountry(code);
    setCountryData(data);
    setNotes(data?.description || '');
    setPopulation(data?.population || '');
    setGdp(data?.gdp || '');
    setIsLoading(false);
  }, [setCountryData]);

  const fetchGlobalData = async () => {
    const alls = await getAllAlliances();
    setAvailableAlliances(alls);
    if (alls.length > 0) setSelectedAllianceId(alls[0].id);

    const res = await getAllResources();
    setAvailableResources(res);
    if (res.length > 0) setSelectedResId(res[0].id);
  };

  useEffect(() => {
    if (selectedCountryCode) fetchCountryData(selectedCountryCode);
    fetchGlobalData();
  }, [selectedCountryCode, fetchCountryData]);

  // ACTIONS DE BASE
  const handleSaveNotes = async () => {
    if (!selectedCountryCode) return;
    setIsSaving(true);
    await saveCountryNotes(selectedCountryCode, notes, population === '' ? null : Number(population), gdp === '' ? null : Number(gdp));
    await fetchCountryData(selectedCountryCode);
    setIsSaving(false);
  };

  // ACTIONS COMMERCE & DIPLOMATIE
  const handleAddTrade = async () => {
    if (selectedCountryCode && partnerCode.length === 3) {
      await addTradeRoute(selectedCountryCode, partnerCode.toUpperCase());
      setPartnerCode('');
      await fetchCountryData(selectedCountryCode);
    }
  };

  const handleAddDiplomacy = async () => {
    if (selectedCountryCode && dipCode.length === 3) {
      await addDiplomaticRelation(selectedCountryCode, dipCode.toUpperCase(), dipType, Number(dipCount));
      setDipCode('');
      setDipCount(1);
      await fetchCountryData(selectedCountryCode);
    }
  };

  // ACTIONS ALLIANCES
  const handleCreateAlliance = async () => {
    if (selectedCountryCode && newAllianceName) {
      const res = await createAlliance(newAllianceName, newAllianceColor, isEco, isPol, isMil);
      if (res.success && res.alliance) {
        await addCountryToAlliance(selectedCountryCode, res.alliance.id);
        setNewAllianceName('');
        setIsEco(false); setIsPol(false); setIsMil(false);
        await fetchGlobalData();
        await fetchCountryData(selectedCountryCode);
      }
    }
  };

  const handleJoinAlliance = async () => {
    if (selectedCountryCode && selectedAllianceId) {
      await addCountryToAlliance(selectedCountryCode, selectedAllianceId);
      await fetchCountryData(selectedCountryCode);
    }
  };

  const handleRemoveAlliance = async (allianceId: string) => {
    if (selectedCountryCode && confirm("Voulez-vous vraiment retirer ce pays de l'alliance ?")) {
      await removeCountryFromAlliance(selectedCountryCode, allianceId);
      await fetchCountryData(selectedCountryCode);
    }
  };

  const handleToggleAllianceType = async (alliance: any, type: 'ECO' | 'POL' | 'MIL') => {
    if (!selectedCountryCode) return;
    await updateAlliance(
      alliance.id,
      type === 'ECO' ? !alliance.isEconomic : alliance.isEconomic,
      type === 'POL' ? !alliance.isPolitical : alliance.isPolitical,
      type === 'MIL' ? !alliance.isMilitary : alliance.isMilitary
    );
    await fetchGlobalData();
    await fetchCountryData(selectedCountryCode);
  };

  const handleDeleteAllianceGlobal = async () => {
    if (selectedCountryCode && selectedAllianceId && confirm("⚠️ Cela supprimera définitivement cette alliance pour TOUS les pays. Continuer ?")) {
      await deleteAlliance(selectedAllianceId);
      await fetchGlobalData();
      await fetchCountryData(selectedCountryCode);
      setSelectedAllianceId('');
    }
  };

  // ACTIONS RESSOURCES
  const handleCreateResource = async () => {
    if (newResName) {
      await createResource(newResName, newResCat, newResUnit, newResColor);
      setNewResName('');
      await fetchGlobalData();
    }
  };

  const handleAddResource = async () => {
    if (selectedCountryCode && selectedResId && resVolume !== '') {
      await addResourceToCountry(selectedCountryCode, selectedResId, Number(resVolume));
      setResVolume('');
      await fetchCountryData(selectedCountryCode);
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    if (selectedCountryCode) {
      await removeResourceFromCountry(selectedCountryCode, resourceId);
      await fetchCountryData(selectedCountryCode);
    }
  };

  // Définition visuelle des onglets radar
  const layerTabs = [
    { id: 'TRADE_ROUTES', label: 'COMMERCE', colorClass: 'border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-blue-500/10' },
    { id: 'DIPLOMACY', label: 'DIPLOMATIE', colorClass: 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-purple-500/10' },
    { id: 'ALLIANCES', label: 'ALLIANCES', colorClass: 'border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-amber-500/10' },
    { id: 'RESOURCES', label: 'RESSOURCES', colorClass: 'border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-500/10' },
  ];

  return (
    <AnimatePresence>
      {selectedCountryCode && (
        <motion.div 
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 right-0 h-screen w-[420px] bg-slate-950/60 border-l border-cyan-500/30 p-6 text-slate-300 shadow-[-10px_0_30px_rgba(6,182,212,0.1)] backdrop-blur-xl overflow-y-auto z-20 custom-scrollbar"
        >
          <button onClick={() => setSelectedCountry(null)} className="absolute top-4 right-4 text-cyan-700 hover:text-cyan-400 transition-colors group">
            <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className="mt-8 flex flex-col gap-6 pb-12">
            
            {/* EN-TÊTE DU PAYS */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-cyan-600 font-bold tracking-[0.2em]">CODE ISO : {selectedCountryCode}</span>
                <h2 className="text-3xl font-mono font-bold mt-1 text-cyan-50">{countryData?.name || 'Inconnu'}</h2>
              </div>
              <Link
                href={`/country/${selectedCountryCode}`}
                className="bg-cyan-500/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400 font-mono text-[10px] uppercase font-bold py-2 px-3 clip-beveled-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Analyser
              </Link>
            </div>

            {/* NAVIGATION DES CALQUES (RADAR TABS) */}
            <div className="flex gap-2">
              {layerTabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveLayer(tab.id as any)} 
                  className={`flex-1 py-1.5 text-[9px] font-mono font-bold tracking-widest clip-beveled-sm transition-all border ${
                    activeLayer === tab.id 
                      ? tab.colorClass 
                      : 'bg-black/40 border-cyan-900/50 text-cyan-700 hover:text-cyan-400 hover:border-cyan-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-cyan-600 font-mono text-xs animate-pulse tracking-widest uppercase">Acquisition des données...</div>
            ) : (
              <>
                {/* DONNÉES FONDAMENTALES */}
                <div className="flex flex-col gap-4 bg-black/40 p-4 border border-cyan-900/50 clip-beveled-sm">
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[9px] text-cyan-700 uppercase font-bold tracking-[0.2em]">Pop. (M)</label>
                      <input type="number" value={population} onChange={(e) => setPopulation(e.target.value !== '' ? Number(e.target.value) : '')} className="w-full bg-slate-900 border border-cyan-900/50 rounded-none p-2 text-cyan-300 font-mono text-xs outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[9px] text-cyan-700 uppercase font-bold tracking-[0.2em]">PIB (Mrd $)</label>
                      <input type="number" value={gdp} onChange={(e) => setGdp(e.target.value !== '' ? Number(e.target.value) : '')} className="w-full bg-slate-900 border border-cyan-900/50 rounded-none p-2 text-cyan-300 font-mono text-xs outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all clip-beveled-sm" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-cyan-700 uppercase font-bold tracking-[0.2em]">Rapport / Synthèse</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="AWAITING INPUT..." className="w-full h-32 bg-slate-900 border border-cyan-900/50 rounded-none p-3 text-cyan-100 text-xs font-mono outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all resize-none custom-scrollbar clip-beveled-sm" />
                  </div>
                  <button onClick={handleSaveNotes} disabled={isSaving} className="w-full bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 text-cyan-300 font-mono text-xs font-bold py-2 transition-colors clip-beveled-sm">
                    {isSaving ? 'TRANSMISSION...' : 'SAUVEGARDER LE PROFIL'}
                  </button>
                </div>

                {countryData?.lat && (
                  <div className="bg-black/40 p-4 border border-cyan-900/50 clip-beveled-sm">
                    
                    {/* CALQUE RESSOURCES */}
                    <div className={`flex flex-col gap-4 ${activeLayer !== 'RESOURCES' && 'hidden'}`}>
                      {availableResources.length > 0 && (
                        <div className="flex gap-2">
                          <select value={selectedResId} onChange={(e) => setSelectedResId(e.target.value)} className="flex-1 bg-slate-900 border border-emerald-900/50 text-emerald-300 font-mono text-xs p-2 outline-none focus:border-emerald-400 clip-beveled-sm">
                            {availableResources.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()} ({r.unit})</option>)}
                          </select>
                          <input type="number" placeholder="VOL." value={resVolume} onChange={(e) => setResVolume(e.target.value !== '' ? Number(e.target.value) : '')} className="w-16 bg-slate-900 border border-emerald-900/50 text-emerald-300 font-mono text-xs p-2 outline-none focus:border-emerald-400 clip-beveled-sm" />
                          <button onClick={handleAddResource} className="bg-emerald-950 border border-emerald-500 text-emerald-400 hover:bg-emerald-900 hover:text-emerald-300 px-3 font-bold clip-beveled-sm transition-colors">+</button>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-2 bg-emerald-950/20 p-3 border border-emerald-900/50 clip-beveled-sm">
                        <span className="text-[9px] text-emerald-600 font-bold tracking-[0.1em] uppercase">Définir un nouveau standard global :</span>
                        <div className="flex gap-2">
                          <input type="text" placeholder="NOM DE CODE" value={newResName} onChange={(e) => setNewResName(e.target.value)} className="flex-1 bg-slate-900 border border-emerald-900/50 p-2 text-emerald-300 font-mono text-[10px] outline-none clip-beveled-sm" />
                          <select value={newResCat} onChange={(e) => setNewResCat(e.target.value)} className="w-24 bg-slate-900 border border-emerald-900/50 p-1 text-emerald-300 font-mono text-[10px] outline-none clip-beveled-sm">
                            <option value="TECH">TECH</option>
                            <option value="ENERGY">ÉNERGIE</option>
                            <option value="FOOD">AGRI</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="UNITÉ" value={newResUnit} onChange={(e) => setNewResUnit(e.target.value)} className="flex-1 bg-slate-900 border border-emerald-900/50 p-2 text-emerald-300 font-mono text-[10px] outline-none clip-beveled-sm" />
                          <input type="color" value={newResColor} onChange={(e) => setNewResColor(e.target.value)} className="w-10 h-[34px] bg-slate-900 border border-emerald-900/50 cursor-pointer clip-beveled-sm" />
                          <button onClick={handleCreateResource} className="bg-emerald-900/50 border border-emerald-700 text-emerald-400 hover:bg-emerald-800 px-3 text-[10px] font-mono font-bold clip-beveled-sm">CRÉER</button>
                        </div>
                      </div>

                      {countryData.resources && countryData.resources.length > 0 && (
                        <ul className="space-y-2 mt-2">
                          {countryData.resources.map((cr: any) => (
                            <li key={cr.id} className="bg-slate-900/50 p-2 text-xs flex items-center justify-between gap-2 border-l-2 clip-beveled-sm" style={{ borderColor: cr.resource.color }}>
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-cyan-100">{cr.resource.name.toUpperCase()}</span>
                                <span className="text-[10px] font-mono text-emerald-400">{cr.volume} {cr.resource.unit}</span>
                              </div>
                              <button onClick={() => handleRemoveResource(cr.resource.id)} className="text-cyan-800 hover:text-red-500 font-bold px-2 transition-colors">✕</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* CALQUE ALLIANCES */}
                    <div className={`flex flex-col gap-4 ${activeLayer !== 'ALLIANCES' && 'hidden'}`}>
                      {availableAlliances.length > 0 && (
                        <div className="flex gap-2">
                          <select value={selectedAllianceId} onChange={(e) => setSelectedAllianceId(e.target.value)} className="flex-1 bg-slate-900 border border-amber-900/50 text-amber-300 font-mono text-xs p-2 outline-none focus:border-amber-400 clip-beveled-sm">
                            {availableAlliances.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                          </select>
                          <button onClick={handleJoinAlliance} className="bg-amber-950 border border-amber-600 text-amber-400 hover:bg-amber-900 px-3 font-mono text-xs font-bold clip-beveled-sm">LIER</button>
                          <button onClick={handleDeleteAllianceGlobal} className="bg-red-950/50 border border-red-800 text-red-500 hover:bg-red-900 hover:text-red-300 px-3 clip-beveled-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 mt-2 bg-amber-950/20 p-3 border border-amber-900/50 clip-beveled-sm">
                        <div className="flex gap-2">
                          <input type="text" placeholder="NOUVEAU TRAITÉ..." value={newAllianceName} onChange={(e) => setNewAllianceName(e.target.value)} className="flex-1 bg-slate-900 border border-amber-900/50 p-2 text-amber-300 font-mono text-[10px] outline-none clip-beveled-sm" />
                          <input type="color" value={newAllianceColor} onChange={(e) => setNewAllianceColor(e.target.value)} className="w-10 h-[34px] bg-slate-900 border border-amber-900/50 cursor-pointer clip-beveled-sm" />
                          <button onClick={handleCreateAlliance} className="bg-amber-900/50 border border-amber-700 text-amber-400 hover:bg-amber-800 px-3 font-mono font-bold clip-beveled-sm">+</button>
                        </div>
                        <div className="flex gap-3 justify-between px-1">
                          <label className="text-[9px] text-amber-600 font-mono font-bold flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={isEco} onChange={(e) => setIsEco(e.target.checked)} className="accent-amber-500" /> ÉCO</label>
                          <label className="text-[9px] text-amber-600 font-mono font-bold flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={isPol} onChange={(e) => setIsPol(e.target.checked)} className="accent-amber-500" /> POL</label>
                          <label className="text-[9px] text-amber-600 font-mono font-bold flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={isMil} onChange={(e) => setIsMil(e.target.checked)} className="accent-amber-500" /> MIL</label>
                        </div>
                      </div>

                      {countryData.alliances && countryData.alliances.length > 0 && (
                        <ul className="space-y-2 mt-2">
                          {countryData.alliances.map((alliance: any) => (
                            <li key={alliance.id} className="bg-slate-900/50 p-2 text-xs flex flex-col gap-2 border-l-2 clip-beveled-sm" style={{ borderColor: alliance.color }}>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-cyan-100">{alliance.name.toUpperCase()}</span>
                                <button onClick={() => handleRemoveAlliance(alliance.id)} className="text-cyan-800 hover:text-red-500 font-bold px-1 transition-colors">✕</button>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleToggleAllianceType(alliance, 'ECO')} className={`text-[9px] font-mono px-2 py-0.5 clip-beveled-sm transition-colors border ${alliance.isEconomic ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>ÉCO</button>
                                <button onClick={() => handleToggleAllianceType(alliance, 'POL')} className={`text-[9px] font-mono px-2 py-0.5 clip-beveled-sm transition-colors border ${alliance.isPolitical ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>POL</button>
                                <button onClick={() => handleToggleAllianceType(alliance, 'MIL')} className={`text-[9px] font-mono px-2 py-0.5 clip-beveled-sm transition-colors border ${alliance.isMilitary ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>MIL</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* CALQUE COMMERCE */}
                    <div className={`flex flex-col gap-3 ${activeLayer !== 'TRADE_ROUTES' && 'hidden'}`}>
                      <label className="text-[9px] text-blue-500 uppercase font-bold tracking-[0.2em]">Cible d'exportation (ISO) :</label>
                      <div className="flex gap-2">
                        <input type="text" maxLength={3} placeholder="EX: CHN" value={partnerCode} onChange={(e) => setPartnerCode(e.target.value)} className="w-24 bg-slate-900 border border-blue-900/50 p-2 text-blue-300 font-mono text-xs uppercase outline-none focus:border-blue-400 clip-beveled-sm" />
                        <button onClick={handleAddTrade} className="flex-1 bg-blue-900/40 border border-blue-600 hover:bg-blue-800 text-blue-300 font-mono font-bold text-xs clip-beveled-sm transition-colors">ÉTABLIR ROUTE</button>
                      </div>
                    </div>

                    {/* CALQUE DIPLOMATIE */}
                    <div className={`flex flex-col gap-3 ${activeLayer !== 'DIPLOMACY' && 'hidden'}`}>
                      <label className="text-[9px] text-purple-500 uppercase font-bold tracking-[0.2em]">Mission diplomatique :</label>
                      <div className="flex flex-wrap gap-2">
                        <input type="text" maxLength={3} placeholder="ISO" value={dipCode} onChange={(e) => setDipCode(e.target.value)} className="w-16 bg-slate-900 border border-purple-900/50 p-2 text-purple-300 font-mono text-xs uppercase outline-none focus:border-purple-400 clip-beveled-sm" />
                        <select value={dipType} onChange={(e) => setDipType(e.target.value)} className="flex-1 bg-slate-900 border border-purple-900/50 p-2 text-purple-300 font-mono text-[10px] uppercase outline-none focus:border-purple-400 clip-beveled-sm">
                          <option value="Ambassade">AMBASSADE</option>
                          <option value="Consulat">CONSULAT</option>
                        </select>
                        <input type="number" min="1" value={dipCount} onChange={(e) => setDipCount(Number(e.target.value))} className="w-16 bg-slate-900 border border-purple-900/50 p-2 text-purple-300 font-mono text-xs outline-none focus:border-purple-400 clip-beveled-sm" />
                        <button onClick={handleAddDiplomacy} className="w-full mt-1 bg-purple-900/40 border border-purple-600 hover:bg-purple-800 text-purple-300 font-mono font-bold text-xs py-2 clip-beveled-sm transition-colors">DÉPLOYER MISSION</button>
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}