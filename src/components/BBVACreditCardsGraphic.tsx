import React from 'react';

export const BBVACreditCardsGraphic: React.FC = () => {
  return (
    <div className="relative w-full h-48 flex items-center justify-center my-3 select-none">
      {/* Background Back Card (lighter metallic cyan/blue) */}
      <div 
        className="absolute w-48 h-32 rounded-xl p-3 shadow-lg flex flex-col justify-between text-white transition-transform hover:rotate-[-6deg]"
        style={{
          background: 'linear-gradient(135deg, #005c9e 0%, #004481 60%, #002244 100%)',
          transform: 'rotate(12deg) translate(22px, -8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 12px 24px -6px rgba(0, 30, 80, 0.4)'
        }}
      >
        <div className="flex justify-between items-start">
          <span className="font-bold tracking-wider text-xs font-sans">BBVA</span>
          <span className="text-[10px] font-mono tracking-widest text-blue-200">start</span>
        </div>
        
        {/* Chip & contactless */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-4.5 rounded bg-amber-300/80 border border-amber-400 flex items-center justify-center">
            <div className="w-4 h-3 border border-amber-500/60 rounded-xs" />
          </div>
          <svg className="w-3.5 h-3.5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.5 16.5a5 5 0 0 1 0-7" />
            <path d="M12 19a8.5 8.5 0 0 0 0-14" />
          </svg>
        </div>

        <div className="flex justify-between items-end">
          <span className="text-[9px] font-mono text-blue-200">•••• 8492</span>
          <span className="text-xs font-bold tracking-tight italic font-serif">VISA</span>
        </div>
      </div>

      {/* Foreground Front Card (Deep vibrant BBVA Royal Blue with stylized V shape) */}
      <div 
        className="relative z-10 w-48 h-32 rounded-xl p-3 shadow-2xl flex flex-col justify-between text-white transition-transform hover:rotate-[-16deg]"
        style={{
          background: 'linear-gradient(135deg, #004481 0%, #043263 50%, #001844 100%)',
          transform: 'rotate(-12deg) translate(-14px, 4px)',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 16px 30px -8px rgba(0, 20, 60, 0.6)'
        }}
      >
        <div className="flex justify-between items-start">
          <span className="font-bold tracking-wider text-xs font-sans">BBVA</span>
          <span className="text-[10px] font-mono tracking-widest text-sky-300">start</span>
        </div>

        {/* Graphic stylized V highlight on card */}
        <div className="absolute right-4 top-4 bottom-4 w-20 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none" strokeWidth="6">
            <polyline points="10,10 50,90 90,10" />
          </svg>
        </div>

        {/* Chip & contactless */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-4.5 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300 flex items-center justify-center shadow-xs">
            <div className="w-4 h-3 border border-amber-600/40 rounded-xs" />
          </div>
          <svg className="w-3.5 h-3.5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.5 16.5a5 5 0 0 1 0-7" />
            <path d="M12 19a8.5 8.5 0 0 0 0-14" />
          </svg>
        </div>

        <div className="flex justify-between items-end">
          <span className="text-[9px] font-mono text-slate-300">•••• 4921</span>
          <span className="text-xs font-bold tracking-tight italic font-serif">VISA</span>
        </div>
      </div>
    </div>
  );
};
