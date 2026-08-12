'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TelemetryHUD() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState('');
  const [ping, setPing] = useState(24);

  useEffect(() => {
    // Suivi de la souris
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Horloge système et simulation de fluctuation du réseau
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + 'Z');
      
      // Fait varier le ping aléatoirement pour donner vie au composant
      if (Math.random() > 0.7) {
        setPing(prev => {
          const newPing = prev + (Math.random() > 0.5 ? 1 : -1);
          return newPing < 12 ? 12 : newPing > 45 ? 45 : newPing;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed bottom-6 left-6 z-50 pointer-events-none flex flex-col gap-2"
    >
      {/* Ligne d'amorce décorative */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-px bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></div>
        <span className="text-[8px] text-cyan-500 font-mono tracking-[0.4em] uppercase">
          Orbital Telemetry
        </span>
      </div>

      {/* Panneau de données */}
      <div className="bg-slate-950/80 border border-cyan-900/50 p-3 clip-beveled-sm backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col gap-1.5 text-[9px] text-cyan-300 font-mono tracking-widest uppercase w-60">
        
        {/* Statut de connexion */}
        <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2 mb-1">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse"></span>
            UPLINK SECURE
          </span>
          <span className="text-cyan-600">PING: {ping}MS</span>
        </div>

        {/* Coordonnées X / Y (Formatées sur 4 chiffres) */}
        <div className="flex justify-between items-center">
          <span className="text-cyan-600">AXIS.X</span>
          <span>{mouse.x.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-cyan-600">AXIS.Y</span>
          <span>{mouse.y.toString().padStart(4, '0')}</span>
        </div>
        
        {/* Timestamp */}
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-cyan-900/30">
          <span className="text-cyan-600">SYS.TIME</span>
          <span>{time || 'SYNCING...'}</span>
        </div>

      </div>
    </motion.div>
  );
}