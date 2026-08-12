import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="relative bg-[#030712] text-slate-300 min-h-screen overflow-hidden selection:bg-cyan-500/30 scanlines">
        
        {/* NOUVEAU : La Topographie Animée */}
        <div className="absolute inset-0 bg-topography z-0"></div>
        
        {/* Halos Lumineux (atténués pour laisser ressortir les courbes) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-900/5 blur-[100px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
        
      </body>
    </html>
  );
}
