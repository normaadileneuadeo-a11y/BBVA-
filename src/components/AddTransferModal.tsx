import React, { useState } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { KNOWN_BANKS, CATEGORIES, generateTrackingKey } from '../utils/transferParser';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: TransferItem) => void;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [monto, setMonto] = useState<string>('');
  const [tipo, setTipo] = useState<'Egreso' | 'Ingreso'>('Egreso');
  const [emisor, setEmisor] = useState('Mi Empresa / Cuenta Propia');
  const [receptor, setReceptor] = useState('');
  const [bancoEmisor, setBancoEmisor] = useState('BBVA México');
  const [bancoReceptor, setBancoReceptor] = useState('Banorte');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('Proveedores');
  const [claveRastreo, setClaveRastreo] = useState('');
  const [conciliado, setConciliado] = useState(false);
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMonto = parseFloat(monto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newItem: TransferItem = {
      id: `tr-${Date.now()}`,
      fileName: `transferencia_manual_${Date.now()}.pdf`,
      fileSize: 45000,
      fileType: 'application/pdf',
      emisor: emisor.trim() || 'Cuenta Propia',
      receptor: receptor.trim() || 'Beneficiario',
      bancoEmisor,
      bancoReceptor,
      cuentaOrigen: '•••• 1234',
      cuentaDestino: cuentaDestino.trim() || '012730018491029381',
      monto: parsedMonto,
      moneda: 'MXN',
      fecha: dateStr,
      hora: timeStr,
      concepto: concepto.trim() || 'Transferencia Interbancaria',
      claveRastreo: claveRastreo.trim() || generateTrackingKey(bancoEmisor.substring(0, 3).toUpperCase()),
      folio: String(Math.floor(100000 + Math.random() * 900000)),
      referencia: String(Math.floor(100000 + Math.random() * 900000)),
      tipo,
      estado: 'Liquidado',
      conciliado,
      categoria,
      notas: notas.trim() || 'Registro manual capturado en el sistema.',
      fuente: 'archivo_manual',
      fechaCarga: `${dateStr} ${timeStr}`,
      analizadoConIa: false,
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Registrar Transferencia</h3>
              <p className="text-xs text-slate-400">Captura manual de un comprobante o transferencia</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Monto */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Monto ($ MXN) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ej. 14500.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tipo de Movimiento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipo('Egreso')}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                    tipo === 'Egreso'
                      ? 'bg-rose-950/80 border border-rose-600 text-rose-300 font-semibold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  Egreso (Pago)
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('Ingreso')}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                    tipo === 'Ingreso'
                      ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  Ingreso (Cobro)
                </button>
              </div>
            </div>

            {/* Beneficiario / Receptor */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Beneficiario (Receptor) *</label>
              <input
                type="text"
                required
                placeholder="Nombre o Razón Social"
                value={receptor}
                onChange={(e) => setReceptor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Ordenante / Emisor */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Ordenante (Emisor)</label>
              <input
                type="text"
                value={emisor}
                onChange={(e) => setEmisor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Banco Emisor */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Banco Emisor</label>
              <select
                value={bancoEmisor}
                onChange={(e) => setBancoEmisor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              >
                {KNOWN_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Banco Receptor */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Banco Receptor</label>
              <select
                value={bancoReceptor}
                onChange={(e) => setBancoReceptor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              >
                {KNOWN_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Cuenta / CLABE */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Cuenta o CLABE Destino (18 dígitos)</label>
              <input
                type="text"
                placeholder="Ej. 012730001928374829"
                value={cuentaDestino}
                onChange={(e) => setCuentaDestino(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Concepto */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Concepto o Motivo de Pago *</label>
              <input
                type="text"
                required
                placeholder="Ej. Pago factura F-492 Insumos de oficina"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Clave de Rastreo SPEI */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Clave de Rastreo SPEI (Opcional - se generará automáticamente si se omite)
              </label>
              <input
                type="text"
                placeholder="Ej. BBVA20261014019482910482"
                value={claveRastreo}
                onChange={(e) => setClaveRastreo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Conciliado checkbox */}
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="conciliadoCheck"
                checked={conciliado}
                onChange={(e) => setConciliado(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="conciliadoCheck" className="text-slate-300 cursor-pointer">
                Marcar como conciliado de inmediato
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-sky-400 hover:bg-sky-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Transferencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
