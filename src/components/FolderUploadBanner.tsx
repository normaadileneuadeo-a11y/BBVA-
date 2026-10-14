import React, { useRef, useState } from 'react';
import { 
  FolderSearch, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  FolderOpen
} from 'lucide-react';

interface FolderUploadBannerProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSampleData: () => void;
  folderPath: string;
  totalTransfers: number;
  isProcessing: boolean;
  processingProgress: number;
  currentProcessingFile: string;
}

export const FolderUploadBanner: React.FC<FolderUploadBannerProps> = ({
  onFilesSelected,
  onLoadSampleData,
  folderPath,
  totalTransfers,
  isProcessing,
  processingProgress,
  currentProcessingFile,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      {/* Top Banner Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg shrink-0 mt-0.5 border border-sky-500/20">
            <FolderSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Ruta de Carpeta Indicada:</span>
              <code className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-sky-300 border border-slate-800 select-all">
                {folderPath || 'C:\\Users\\X1Carbon\\Desktop\\transferencias'}
              </code>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Por seguridad del navegador web, las páginas web no pueden acceder de forma directa y silenciosa a tu disco duro <code className="text-slate-300">C:\</code>. 
              Selecciona tu carpeta o arrástrala a esta ventana para leer todos los comprobantes (PDF, JPG, PNG, CSV) y auditarlos con IA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onLoadSampleData}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            title="Carga ejemplos reales de transferencias bancarias de BBVA, Banorte, Santander, Nu y Banamex para ver el sistema en acción"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cargar Comprobantes de Demostración</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Action Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isDragging
            ? 'border-sky-500 bg-sky-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        {/* Hidden HTML Inputs */}
        {/* Note: webkitdirectory and directory allow selecting an entire folder */}
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is a standard HTML5 attribute for folder selection
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesSelected(e.target.files);
            }
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesSelected(e.target.files);
            }
          }}
        />

        {isProcessing ? (
          <div className="py-3">
            <div className="flex items-center justify-center gap-2 text-sky-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Procesando y extrayendo datos de comprobantes... {processingProgress}%</span>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate max-w-md mx-auto mb-3">
              {currentProcessingFile || 'Leyendo estructura de archivos...'}
            </p>
            <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-full mb-3 text-sky-400">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-semibold text-white mb-1">
              Arrastra aquí tu carpeta <span className="text-sky-300 font-mono">transferencias</span> o haz clic para seleccionarla
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-lg">
              Admite PDFs de Banxico/SPEI, capturas de pantalla de aplicaciones bancarias (BBVA, Banorte, Santander, Nu, Citibanamex, Mercado Pago), estados de cuenta e imágenes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleFolderClick}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Abrir Carpeta 'transferencias' del Escritorio</span>
              </button>

              <button
                type="button"
                onClick={handleFilesClick}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Seleccionar Archivos Sueltos</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scanned status indicator */}
      {totalTransfers > 0 && !isProcessing && (
        <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-slate-200">{totalTransfers}</strong> comprobante{totalTransfers === 1 ? '' : 's'} listo{totalTransfers === 1 ? '' : 's'} para revisión y conciliación
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Escaneo de duplicados y claves SPEI activo
          </span>
        </div>
      )}
    </div>
  );
};
