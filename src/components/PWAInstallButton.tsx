import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled || installedSuccess) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) setInstalledSuccess(true);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Direct instruction fallback
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 transition-all active:scale-95 ${
          compact
            ? 'px-2.5 py-1 text-[11px] font-semibold text-[#004481] bg-white/90 hover:bg-white rounded-full shadow-sm'
            : 'px-3 py-1.5 text-xs font-semibold text-white bg-[#004481] hover:bg-[#043263] border border-blue-400/30 rounded-lg shadow-sm'
        }`}
        title="Instalar como aplicación en tu pantalla de inicio"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span>Instalar App</span>
      </button>

      {/* iOS & Manual Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/apple-touch-icon.png" 
                alt="BBVA México Icono" 
                className="w-14 h-14 rounded-2xl shadow-md border border-slate-100 object-cover" 
              />
              <div>
                <h3 className="font-bold text-base text-[#043263]">Instalar BBVA México</h3>
                <p className="text-xs text-slate-500">Banca Móvil Oficial • PWA</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Para instalar la aplicación en tu pantalla de inicio y usarla a pantalla completa como una app nativa:
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-700 mb-5 border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004481] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Pulsa el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-sky-600 mx-0.5" /> en la barra de tu navegador.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004481] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Desplázate hacia abajo y selecciona <strong>«Agregar a Inicio»</strong> o <strong>«Instalar aplicación»</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#004481] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Abre el icono de <strong>BBVA</strong> directamente desde tu pantalla de inicio sin barras de navegador.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-[#004481] hover:bg-[#043263] text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
