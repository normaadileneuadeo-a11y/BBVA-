import React, { useRef } from 'react';
import { 
  X, 
  FolderOpen, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { exportToExcelCSV } from '../utils/transferParser';

interface BBVAFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: FileList | File[]) => void;
  transfers: TransferItem[];
  folderPath: string;
}

export const BBVAFolderModal: React.FC<BBVAFolderModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
  transfers,
  folderPath,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004481] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-sky-300" />
            <div>
              <h3 className="font-bold text-sm">Carpeta de Transferencias</h3>
              <p className="text-[11px] text-blue-200 font-mono">{folderPath}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory folder selection
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesSelected(e.target.files);
              onClose();
            }
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesSelected(e.target.files);
              onClose();
            }
          }}
        />

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed">
            Sincroniza y lee los comprobantes bancarios guardados en tu computadora (<code className="bg-slate-100 px-1 py-0.5 rounded text-[#004481] font-mono">{folderPath}</code>) para visualizarlos dentro de tu app BBVA y cotejar tus saldos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-[#004481]/40 hover:border-[#004481] bg-blue-50/50 hover:bg-blue-50 flex flex-col items-center text-center transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#004481] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-sm">
                <FolderOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-[#043263]">Seleccionar Carpeta 'transferencias'</span>
              <span className="text-[10px] text-slate-500 mt-1">Lee todos los archivos de tu Escritorio</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#004481] bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center text-center transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800">Cargar Archivos Sueltos</span>
              <span className="text-[10px] text-slate-500 mt-1">PDFs o imágenes individuales</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">
              {transfers.length} comprobantes registrados en la app
            </span>
            <button
              type="button"
              onClick={() => exportToExcelCSV(transfers, 'Comprobantes_BBVA')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
