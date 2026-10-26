'use client';

import { useState, useRef } from 'react';
import Draggable from 'react-draggable';

// Fonction API (inchangée)
async function sendCommandToAgent(prompt: string, targetIso: string = "FRA") {
  try {
    const response = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, target_iso: targetIso }),
    });

    if (!response.ok) throw new Error("Erreur serveur");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { status: "ERROR", response: "Connexion au serveur IA échouée." };
  }
}

export default function AgentTerminal({ currentIso }: { currentIso: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // NOUVEAU : Création des références pour éviter le crash "not mounted"
  const bubbleRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleExecute = async () => {
    if (!input.trim()) return;
    setHistory(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsProcessing(true);

    const result = await sendCommandToAgent(input, currentIso);
    setHistory(prev => [...prev, { role: 'agent', text: result.response }]);
    setIsProcessing(false);
  };

  // VUE 1 : Le bouton flottant déplaçable
  if (!isOpen) {
    return (
    
        <div 
          ref={bubbleRef} // Liaison de la référence ici
          onClick={() => setIsOpen(true)}
          className="absolute bottom-8 right-8 z-50 w-14 h-14 bg-black/80 border border-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-900 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all pointer-events-auto"
        >
          {/* pointer-events-none évite que le clic sur l'icône ne gêne le drag */}
          <span className="text-cyan-400 text-xl pointer-events-none">=</span>
        </div>
  
    );
  }

  // VUE 2 : Le terminal complet et déplaçable
  return (
    <Draggable nodeRef={terminalRef} handle=".drag-handle" bounds="parent">
      <div ref={terminalRef} className="absolute bottom-24 right-8 z-50 flex flex-col h-96 w-96 bg-black/80 backdrop-blur-md text-cyan-400 font-mono text-sm border border-cyan-800 rounded shadow-[0_0_15px_rgba(0,255,255,0.2)] overflow-hidden pointer-events-auto">
        
        {/* En-tête / Poignée de déplacement (drag-handle) */}
        <div className="drag-handle bg-gray-900 p-2 border-b border-cyan-800 flex justify-between items-center cursor-move hover:bg-gray-800 transition-colors">
          <span className="font-bold select-none pointer-events-none">🦾 TERMINAL IA</span>
          <div className="flex gap-3 items-center">
            <span className="text-[10px] text-green-500 pointer-events-none">{isProcessing ? "TRAITEMENT..." : "EN LIGNE"}</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-500 hover:text-red-500 cursor-pointer px-1 z-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && <div className="opacity-50">En attente de directive...</div>}
          {history.map((msg, index) => (
            <div key={index} className={msg.role === 'user' ? 'text-gray-300' : 'text-cyan-400'}>
              <span className="opacity-50">{msg.role === 'user' ? '> USER: ' : '> AGENT: '}</span>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-2 border-t border-cyan-800 flex">
          <span className="mr-2">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none text-cyan-400 placeholder-cyan-800"
            placeholder="Entrez une commande..."
          />
        </div>
      </div>
    </Draggable>
  );
}