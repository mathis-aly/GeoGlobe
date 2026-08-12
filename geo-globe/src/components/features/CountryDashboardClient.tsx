'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MapWrapper from '@/components/map/MapWrapper';
import { addArticle, deleteArticle, addPointOfInterest, saveCountryNotes } from '@/actions/country';

const ARTICLE_CATEGORIES = [
  { value: 'HISTORY', label: 'HISTOIRE', color: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' },
  { value: 'POLITICS', label: 'POLITIQUE', color: 'text-purple-400 border-purple-500/50 bg-purple-500/10' },
  { value: 'ECONOMY', label: 'ÉCONOMIE', color: 'text-blue-400 border-blue-500/50 bg-blue-500/10' },
  { value: 'TECH', label: 'TECHNOLOGIE', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' },
];

export default function CountryDashboardClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  
  // États Articles
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('HISTORY');
  const [summary, setSummary] = useState('');

  // États Carte & POI
  const [activeLayers, setActiveLayers] = useState<string[]>(['POWER_PLANT', 'RAILWAY', 'PORT', 'CITY']);
  const [showPoiForm, setShowPoiForm] = useState(false);
  const [poiName, setPoiName] = useState('');
  const [poiType, setPoiType] = useState('PORT');
  const [poiLat, setPoiLat] = useState('');
  const [poiLng, setPoiLng] = useState('');
  const [poiValue, setPoiValue] = useState('');

  // États Notes
  const [notes, setNotes] = useState(initialData?.description || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const centerLat = initialData?.lat || 0;
  const centerLng = initialData?.lng || 0;

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  const filteredPois = initialData?.pointsOfInterest?.filter((poi: any) => activeLayers.includes(poi.type)) || [];

  const handleAddArticle = async () => {
    if (!title || !url) return;
    setIsSubmittingArticle(true);
    const res = await addArticle(initialData.id, title, url, category, summary);
    if (res.success) {
      setTitle(''); setUrl(''); setSummary('');
      router.refresh();
    }
    setIsSubmittingArticle(false);
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('EFFACER LA DONNÉE ?')) {
      await deleteArticle(id);
      router.refresh();
    }
  };

  const handleAddPoi = async () => {
    if (!poiName || !poiLat || !poiLng) return;
    const res = await addPointOfInterest(
      initialData.id, poiName, poiType, parseFloat(poiLat), parseFloat(poiLng), poiValue ? parseFloat(poiValue) : undefined
    );
    if (res.success) {
      setPoiName(''); setPoiLat(''); setPoiLng(''); setPoiValue('');
      setShowPoiForm(false);
      router.refresh();
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await saveCountryNotes(initialData.id, notes, initialData.population, initialData.gdp);
    router.refresh();
    setIsSavingNotes(false);
  };

  // Variantes d'animation pour les colonnes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <main className="w-full h-screen text-slate-300 flex flex-col overflow-hidden bg-transparent">
      
      {/* HEADER TACTIQUE */}
      <header className="h-14 bg-slate-950/80 border-b border-cyan-900/50 flex items-center px-6 justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-cyan-700 hover:text-cyan-400 transition-colors font-mono font-bold text-xs flex items-center gap-2 tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            RETOUR ORBITE
          </Link>
          <div className="h-4 w-px bg-cyan-900/50"></div>
          <h1 className="text-sm font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase">
            SITREP : {initialData?.name}
          </h1>
        </div>
      </header>

      {/* GRILLE DASHBOARD (Animée) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex p-4 gap-4 overflow-hidden z-10"
      >
        
        {/* COLONNE GAUCHE : RENSEIGNEMENT */}
        <motion.aside variants={itemVariants} className="w-1/4 bg-slate-950/60 backdrop-blur-md border border-cyan-500/30 p-4 flex flex-col overflow-hidden clip-beveled shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <h2 className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em] mb-4 flex-shrink-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> ARCHIVES & SOURCES
          </h2>
          
          {/* Formulaire Terminal */}
          <div className="flex flex-col gap-3 mb-4 bg-black/40 p-4 border border-cyan-900/50 flex-shrink-0 clip-beveled-sm">
            <input type="text" placeholder="TITRE DU RAPPORT..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent border-b border-cyan-900/50 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-100 outline-none transition-colors placeholder-cyan-900" />
            <div className="flex gap-2">
              <input type="url" placeholder="URL SÉCURISÉE..." value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 bg-transparent border-b border-cyan-900/50 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-100 outline-none transition-colors placeholder-cyan-900" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-900 border-b border-cyan-900/50 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-400 outline-none w-24">
                {ARTICLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <textarea placeholder="MÉMO DU RENSEIGNEMENT..." value={summary} onChange={(e) => setSummary(e.target.value)} className="bg-slate-900/50 border border-cyan-900/50 focus:border-cyan-400 p-2 text-[10px] font-mono text-cyan-100 h-16 resize-none outline-none custom-scrollbar clip-beveled-sm mt-1 placeholder-cyan-900" />
            <button onClick={handleAddArticle} disabled={isSubmittingArticle || !title || !url} className="mt-2 bg-cyan-950/50 border border-cyan-700 hover:border-cyan-400 text-cyan-400 text-[10px] font-mono font-bold py-2 transition-colors clip-beveled-sm disabled:opacity-50">
              {isSubmittingArticle ? 'TRANSMISSION...' : 'INJECTER DONNÉE'}
            </button>
          </div>

          {/* Flux d'articles */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {initialData?.articles?.length === 0 ? (
              <p className="text-[10px] font-mono text-cyan-800/70 text-center mt-4 uppercase">Base de données vide.</p>
            ) : (
              initialData?.articles?.map((article: any) => {
                const catInfo = ARTICLE_CATEGORIES.find(c => c.value === article.category) || ARTICLE_CATEGORIES[0];
                return (
                  <div key={article.id} className="bg-black/40 p-3 border border-cyan-900/30 flex flex-col gap-2 relative group clip-beveled-sm hover:border-cyan-500/50 transition-colors">
                    <button onClick={() => handleDeleteArticle(article.id)} className="absolute top-2 right-2 text-cyan-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">✕</button>
                    <div className="flex flex-col gap-1 pr-4">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border w-max ${catInfo.color}`}>{catInfo.label}</span>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-cyan-100 hover:text-cyan-400 hover:underline leading-tight mt-1">
                        {article.title.toUpperCase()}
                      </a>
                    </div>
                    {article.summary && <p className="text-[10px] font-mono text-cyan-600 border-l border-cyan-900 pl-2 mt-1">{article.summary}</p>}
                  </div>
                );
              })
            )}
          </div>
        </motion.aside>

        {/* ZONE CENTRALE : CARTE TACTIQUE */}
        <motion.section variants={itemVariants} className="w-2/4 relative flex flex-col gap-2">
          
          <div className="flex justify-between items-center bg-slate-950/60 backdrop-blur-md p-2 border border-cyan-500/30 clip-beveled shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="flex gap-2">
              <button onClick={() => toggleLayer('POWER_PLANT')} className={`px-3 py-1.5 text-[9px] font-mono font-bold tracking-widest clip-beveled-sm transition-all border ${activeLayers.includes('POWER_PLANT') ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-black/40 border-cyan-900/50 text-cyan-700 hover:text-cyan-400'}`}>⚡ ÉNERGIE</button>
              <button onClick={() => toggleLayer('RAILWAY')} className={`px-3 py-1.5 text-[9px] font-mono font-bold tracking-widest clip-beveled-sm transition-all border ${activeLayers.includes('RAILWAY') ? 'bg-blue-500/20 border-blue-400 text-blue-300' : 'bg-black/40 border-cyan-900/50 text-cyan-700 hover:text-cyan-400'}`}>🚂 LOGISTIQUE</button>
              <button onClick={() => toggleLayer('PORT')} className={`px-3 py-1.5 text-[9px] font-mono font-bold tracking-widest clip-beveled-sm transition-all border ${activeLayers.includes('PORT') ? 'bg-teal-500/20 border-teal-400 text-teal-300' : 'bg-black/40 border-cyan-900/50 text-cyan-700 hover:text-cyan-400'}`}>⚓ MARITIME</button>
              <button onClick={() => toggleLayer('CITY')} className={`px-3 py-1.5 text-[9px] font-mono font-bold tracking-widest clip-beveled-sm transition-all border ${activeLayers.includes('CITY') ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-black/40 border-cyan-900/50 text-cyan-700 hover:text-cyan-400'}`}>🏙️ MÉTROPOLES</button>
            </div>
            <button onClick={() => setShowPoiForm(!showPoiForm)} className="bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 text-cyan-300 px-3 py-1.5 text-[9px] font-mono font-bold clip-beveled-sm transition-colors">
              {showPoiForm ? 'ANNULER' : '+ CIBLER COORDONNÉES'}
            </button>
          </div>

          {showPoiForm && (
            <div className="bg-black/80 backdrop-blur-md p-3 border border-cyan-500/50 flex gap-3 items-end shadow-[0_0_20px_rgba(6,182,212,0.2)] clip-beveled absolute top-14 left-0 right-0 z-20">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[8px] text-cyan-600 font-mono tracking-widest">DÉSIGNATION</label>
                <input type="text" placeholder="EX: BARRAGE DES 3 GORGES" value={poiName} onChange={(e) => setPoiName(e.target.value)} className="bg-transparent border-b border-cyan-700 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-100 outline-none placeholder-cyan-900" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-cyan-600 font-mono tracking-widest">CLASSIFICATION</label>
                <select value={poiType} onChange={(e) => setPoiType(e.target.value)} className="bg-slate-900 border-b border-cyan-700 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-300 outline-none w-28">
                  <option value="POWER_PLANT">ÉNERGIE</option>
                  <option value="PORT">PORTUAIRE</option>
                  <option value="RAILWAY">FERROVIAIRE</option>
                  <option value="CITY">URBAIN</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[8px] text-cyan-600 font-mono tracking-widest">LAT (N/S)</label>
                <input type="number" placeholder="30.82" value={poiLat} onChange={(e) => setPoiLat(e.target.value)} className="bg-transparent border-b border-cyan-700 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-100 outline-none placeholder-cyan-900" />
              </div>
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[8px] text-cyan-600 font-mono tracking-widest">LNG (E/W)</label>
                <input type="number" placeholder="111.00" value={poiLng} onChange={(e) => setPoiLng(e.target.value)} className="bg-transparent border-b border-cyan-700 focus:border-cyan-400 p-1 text-[10px] font-mono text-cyan-100 outline-none placeholder-cyan-900" />
              </div>
              <button onClick={handleAddPoi} className="bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-1.5 text-[10px] font-mono font-bold h-[26px] mb-0.5 clip-beveled-sm">VERROUILLER</button>
            </div>
          )}

          <div className="flex-1 relative z-0 border border-cyan-500/30 clip-beveled shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <MapWrapper centerLat={centerLat} centerLng={centerLng} zoom={5} pois={filteredPois} />
          </div>
        </motion.section>

        {/* COLONNE DROITE : TÉLÉMÉTRIE & SYNTHÈSE */}
        <motion.aside variants={itemVariants} className="w-1/4 flex flex-col gap-4">
          
          <div className="h-1/3 bg-slate-950/60 backdrop-blur-md border border-cyan-500/30 p-4 flex flex-col clip-beveled shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <h2 className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em] mb-4 flex-shrink-0 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> STATISTIQUES GLOBALES
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              <div className="flex justify-between border-b border-cyan-900/50 pb-2">
                <span className="text-[10px] font-mono text-cyan-700">DÉMOGRAPHIE</span>
                <span className="text-xs font-mono font-bold text-cyan-100">{initialData?.population ? `${initialData.population} M` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-cyan-900/50 pb-2">
                <span className="text-[10px] font-mono text-cyan-700">PIB NATIONAL</span>
                <span className="text-xs font-mono font-bold text-cyan-100">{initialData?.gdp ? `${initialData.gdp} MRD $` : 'N/A'}</span>
              </div>
              
              <div className="pt-2">
                <span className="text-[10px] font-mono text-cyan-700 block mb-2 border-l-2 border-cyan-700 pl-2">PRODUCTION STRATÉGIQUE</span>
                {initialData?.resources?.length > 0 ? (
                  <ul className="space-y-1.5">
                    {initialData.resources.map((cr: any) => (
                      <li key={cr.id} className="text-[10px] font-mono flex justify-between items-center bg-black/40 p-2 clip-beveled-sm border border-cyan-900/30">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 shadow-[0_0_5px_currentColor]" style={{ color: cr.resource.color, backgroundColor: cr.resource.color }}></span>
                          <span className="text-cyan-300 font-bold">{cr.resource.name.toUpperCase()}</span>
                        </div>
                        <span className="text-cyan-500">{cr.volume} <span className="text-[8px] text-cyan-700">{cr.resource.unit.toUpperCase()}</span></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[10px] font-mono text-cyan-900 italic">AUCUN SIGNAL</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-950/60 backdrop-blur-md border border-cyan-500/30 p-4 flex flex-col gap-3 clip-beveled shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <h2 className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em] flex-shrink-0 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> SYNTHÈSE ANALYTIQUE
            </h2>
            
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 bg-black/40 border border-cyan-900/50 p-3 text-cyan-100 text-xs font-mono resize-none outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all custom-scrollbar leading-relaxed clip-beveled-sm placeholder-cyan-900" 
              placeholder="RÉDIGEZ LE COMPTE-RENDU ICI... (CURSOR BLINKING)"
            />
            
            <button 
              onClick={handleSaveNotes} 
              disabled={isSavingNotes || notes === initialData?.description}
              className="bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 disabled:border-cyan-900 disabled:text-cyan-900 text-cyan-400 text-[10px] font-mono font-bold py-3 transition-colors clip-beveled-sm mt-1"
            >
              {isSavingNotes ? 'SAUVEGARDE EN COURS...' : '[EXEC] > ENREGISTRER SYNTHÈSE'}
            </button>
          </div>
          
        </motion.aside>

      </motion.div>
    </main>
  );
}