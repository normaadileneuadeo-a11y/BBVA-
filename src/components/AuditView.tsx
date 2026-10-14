import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  FileCheck, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Printer
} from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { formatCurrency, formatDate } from '../utils/transferParser';

interface AuditViewProps {
  transfers: TransferItem[];
  onSelectTransfer: (item: TransferItem) => void;
  onToggleConciliado: (id: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  transfers,
  onSelectTransfer,
  onToggleConciliado,
}) => {
  const duplicates = transfers.filter(t => t.esDuplicado);
  const pending = transfers.filter(t => !t.conciliado);
  const reconciled = transfers.filter(t => t.conciliado);

  // Group by Bank
  const bankDistribution = transfers.reduce((acc, curr) => {
    acc[curr.bancoEmisor] = (acc[curr.bancoEmisor] || 0) + curr.monto;
    return acc;
  }, {} as Record<string, number>);

  const sortedBanks = Object.entries(bankDistribution).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Top Audit Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg border shrink-0 ${
              duplicates.length > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {duplicates.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Informe de Auditoría y Control de Riesgos Bancarios
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                El sistema audita automáticamente Claves de Rastreo SPEI, sellos de liquidación Banxico, importes repetidos y comprobantes duplicados para proteger tu contabilidad de pagos dobles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Imprimir Dictamen</span>
          </button>
        </div>
      </div>

      {/* Duplicates Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Comprobantes con Alerta de Duplicidad ({duplicates.length})</span>
            </h4>
            <span className="text-xs text-slate-400">
              Registros con idéntica Clave de Rastreo o mismos importes y cuentas en la carpeta
            </span>
          </div>
          {duplicates.length === 0 && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sin alertas de duplicidad</span>
            </span>
          )}
        </div>

        {duplicates.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No se han detectado comprobantes duplicados en los archivos analizados. Todos los códigos de rastreo son únicos.
          </div>
        ) : (
          <div className="space-y-3">
            {duplicates.map(d => (
              <div 
                key={d.id}
                onClick={() => onSelectTransfer(d)}
                className="p-3.5 bg-amber-950/20 border border-amber-600/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-950/30 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs truncate">{d.concepto}</span>
                    <span className="text-[11px] font-mono text-amber-300">SPEI: {d.claveRastreo}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>{d.bancoEmisor} ➔ {d.bancoReceptor}</span>
                    <span aria-hidden="true">·</span>
                    <span>Beneficiario: {d.receptor}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-amber-300">{d.fileName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-white font-mono tabular-nums">
                    {formatCurrency(d.monto, d.moneda)}
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium">Revisar Comprobante</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Volume Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Volumen por Institución Bancaria</span>
          </h4>
          <div className="space-y-3">
            {sortedBanks.map(([banco, total]) => {
              const maxTotal = sortedBanks[0]?.[1] || 1;
              const pct = Math.round((total / maxTotal) * 100);
              return (
                <div key={banco} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 font-medium">{banco}</span>
                    <span className="font-mono tabular-nums text-white font-bold">{formatCurrency(total)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conciliation Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Resumen de Cuadre Contable</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Compara las transferencias conciliadas (cotejadas contra pólizas, estados de cuenta o facturas timbradas) frente a las pendientes.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Comprobantes Auditados:</span>
                <span className="font-mono text-white font-bold tabular-nums">{transfers.length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-medium">Conciliados y Cotejados:</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">{reconciled.length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-medium">Pendientes de Aprobación:</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">{pending.length}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Control Interno Automatizado</span>
            <span className="font-mono">SPEI / CEP BANXICO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
