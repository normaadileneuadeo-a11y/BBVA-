import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  Download,
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  QrCode, 
  FileText, 
  Image as ImageIcon, 
  Edit2, 
  Save, 
  Trash2 
} from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { formatCurrency, formatDate, KNOWN_BANKS, CATEGORIES } from '../utils/transferParser';
import { generateBBVAPdf } from '../utils/pdfGenerator';

interface VoucherDetailModalProps {
  transfer: TransferItem | null;
  onClose: () => void;
  onUpdate: (updated: TransferItem) => void;
  onDelete: (id: string) => void;
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  transfer,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'voucher' | 'image'>('voucher');

  // Form states for editing
  const [formData, setFormData] = useState<TransferItem | null>(transfer);

  if (!transfer) return null;

  const currentItem = isEditing && formData ? formData : transfer;

  const handleCopy = (text: string, type: 'key' | 'clabe') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedClabe(true);
      setTimeout(() => setCopiedClabe(false), 2000);
    }
  };

  const handleSave = () => {
    if (formData) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Comprobante de Transferencia Bancaria
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-slate-300">{currentItem.fileName}</span>
                <span aria-hidden="true">·</span>
                <span>ID: {currentItem.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentItem.fileBlobUrl && (
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('voucher')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    viewMode === 'voucher' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ficha SPEI
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                    viewMode === 'image' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Imagen Original</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Imprimir comprobante"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentItem.esDuplicado && (
            <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-200">Alerta de Posible Registro Duplicado</h4>
                <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
                  {currentItem.notas || 'Se ha detectado otra transferencia con idéntica Clave de Rastreo SPEI o monto y fecha en la carpeta. Verifica que no se haya procesado dos veces el mismo archivo.'}
                </p>
              </div>
            </div>
          )}

          {viewMode === 'image' && currentItem.fileBlobUrl ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
              <img 
                src={currentItem.fileBlobUrl} 
                alt="Comprobante original subido"
                className="max-h-[500px] object-contain rounded-lg border border-slate-800"
              />
              <span className="text-xs text-slate-500 mt-2">
                Archivo original proporcionado desde la carpeta local
              </span>
            </div>
          ) : (
            /* Digital SPEI Voucher Card */
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden print:bg-white print:text-black print:border-black">
              {/* Watermark / Seal */}
              <div className="absolute right-4 top-4 opacity-5 pointer-events-none select-none">
                <Building2 className="w-48 h-48" />
              </div>

              {/* Voucher Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-lg font-mono">
                    {currentItem.bancoEmisor.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                      Comprobante Electrónico de Pago (SPEI / CEP)
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {currentItem.bancoEmisor}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Importe Transferido</div>
                  <div className={`text-3xl font-extrabold font-mono tabular-nums ${
                    currentItem.tipo === 'Ingreso' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {formatCurrency(currentItem.monto, currentItem.moneda)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentItem.tipo === 'Ingreso' ? 'Depósito recibido' : 'Transferencia enviada'}
                  </div>
                </div>
              </div>

              {/* Status & Timing Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Estado SPEI</span>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{currentItem.estado}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Fecha Operación</span>
                  <div className="font-mono text-slate-200">
                    {formatDate(currentItem.fecha)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Hora Liquidación</span>
                  <div className="font-mono text-slate-200">
                    {currentItem.hora || '12:00'} hrs
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Folio Interno</span>
                  <div className="font-mono text-slate-200">
                    #{currentItem.folio || '000000'}
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-800/80">
                {/* Emisor / Ordenante */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Ordenante (Emisor)</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {currentItem.emisor || 'Cuenta de origen'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Banco: <strong className="text-slate-300">{currentItem.bancoEmisor}</strong>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Cuenta: {currentItem.cuentaOrigen || '••••'}
                    </div>
                  </div>
                </div>

                {/* Receptor / Beneficiario */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Beneficiario (Receptor)</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {currentItem.receptor || 'Cuenta de destino'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Banco Receptor: <strong className="text-slate-300">{currentItem.bancoReceptor}</strong>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-slate-300">
                        CLABE / Cuenta: {currentItem.cuentaDestino}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentItem.cuentaDestino, 'clabe')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copiar CLABE"
                      >
                        {copiedClabe ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Concept & Tracking Key */}
              <div className="pt-6 space-y-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Concepto o Motivo de Pago</span>
                  <p className="text-sm text-slate-200 font-medium bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {currentItem.concepto || 'Sin concepto especificado'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-3.5 rounded-lg border border-slate-800/80">
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500 block">Clave de Rastreo SPEI (Banxico)</span>
                    <span className="font-mono text-xs text-sky-400 select-all break-all font-semibold">
                      {currentItem.claveRastreo || 'No disponible'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentItem.claveRastreo, 'key')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors shrink-0"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Clave</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cifrado y Sello Digital Verificado</span>
                  </div>
                  <span>Referencia Numérica: {currentItem.referencia || '000000'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form Drawer */}
          {isEditing && (
            <div className="bg-slate-950 p-5 rounded-xl border border-sky-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  <span>Editar Datos del Registro</span>
                </h4>
                <span className="text-xs text-slate-400">Corrige montos o nombres detectados</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.monto || 0}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, monto: parseFloat(e.target.value) || 0 }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Movimiento</label>
                  <select
                    value={formData?.tipo || 'Egreso'}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, tipo: e.target.value as any }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Egreso">Egreso (Gasto / Pago)</option>
                    <option value="Ingreso">Ingreso (Cobro / Depósito)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Emisor (Ordenante)</label>
                  <input
                    type="text"
                    value={formData?.emisor || ''}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, emisor: e.target.value }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Beneficiario (Receptor)</label>
                  <input
                    type="text"
                    value={formData?.receptor || ''}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, receptor: e.target.value }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Banco Emisor</label>
                  <select
                    value={formData?.bancoEmisor || ''}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, bancoEmisor: e.target.value }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {KNOWN_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Categoría</label>
                  <select
                    value={formData?.categoria || ''}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, categoria: e.target.value }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Concepto de Pago</label>
                  <input
                    type="text"
                    value={formData?.concepto || ''}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, concepto: e.target.value }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Notas Contables</label>
                  <input
                    type="text"
                    value={formData?.notas || ''}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, notas: e.target.value }) : null)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const updated = { ...currentItem, conciliado: !currentItem.conciliado };
                onUpdate(updated);
                setFormData(updated);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentItem.conciliado
                  ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{currentItem.conciliado ? 'Marcado como Conciliado' : 'Marcar como Conciliado'}</span>
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setFormData(currentItem);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Campos</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Seguro que deseas eliminar este comprobante del listado?')) {
                  onDelete(currentItem.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
