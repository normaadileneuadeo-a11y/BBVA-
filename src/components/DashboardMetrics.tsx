import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  Wallet,
  Receipt
} from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { formatCurrency } from '../utils/transferParser';

interface DashboardMetricsProps {
  transfers: TransferItem[];
  onSelectFilter: (filter: 'todos' | 'egresos' | 'ingresos' | 'conciliados' | 'pendientes' | 'duplicados') => void;
  activeFilter: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  transfers,
  onSelectFilter,
  activeFilter,
}) => {
  const totalCount = transfers.length;
  
  let totalIngresos = 0;
  let totalEgresos = 0;
  let countConciliados = 0;
  let countDuplicados = 0;

  transfers.forEach(t => {
    if (t.tipo === 'Ingreso') {
      totalIngresos += t.monto;
    } else {
      totalEgresos += t.monto;
    }
    if (t.conciliado) countConciliados++;
    if (t.esDuplicado) countDuplicados++;
  });

  const saldoNeto = totalIngresos - totalEgresos;
  const countPendientes = totalCount - countConciliados;
  const porcentajeConciliado = totalCount > 0 ? Math.round((countConciliados / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {/* Total Comprobantes */}
      <button
        type="button"
        onClick={() => onSelectFilter('todos')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'todos'
            ? 'bg-slate-900 border-sky-500 shadow-sm ring-1 ring-sky-500/20'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Total Registros</span>
          <Receipt className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-bold text-white font-mono tabular-nums">
          {totalCount}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
          <span>{porcentajeConciliado}% conciliados</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{transfers.filter(t => t.analizadoConIa).length} con IA</span>
        </div>
      </button>

      {/* Ingresos Totales */}
      <button
        type="button"
        onClick={() => onSelectFilter('ingresos')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'ingresos'
            ? 'bg-slate-900 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Ingresos Detectados</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
          {formatCurrency(totalIngresos)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {transfers.filter(t => t.tipo === 'Ingreso').length} transferencias recibidas
        </div>
      </button>

      {/* Egresos Totales */}
      <button
        type="button"
        onClick={() => onSelectFilter('egresos')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'egresos'
            ? 'bg-slate-900 border-rose-500 shadow-sm ring-1 ring-rose-500/20'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Egresos y Pagos</span>
          <TrendingDown className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold text-rose-300 font-mono tabular-nums">
          {formatCurrency(totalEgresos)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {transfers.filter(t => t.tipo === 'Egreso').length} pagos realizados
        </div>
      </button>

      {/* Saldo Neto */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Flujo Neto</span>
          <Wallet className="w-4 h-4 text-slate-400" />
        </div>
        <div
          className={`text-2xl font-bold font-mono tabular-nums ${
            saldoNeto >= 0 ? 'text-white' : 'text-rose-400'
          }`}
        >
          {formatCurrency(saldoNeto)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {saldoNeto >= 0 ? 'Balance positivo en periodo' : 'Superávit en salidas'}
        </div>
      </div>

      {/* Conciliación & Auditoría */}
      <button
        type="button"
        onClick={() => onSelectFilter(countDuplicados > 0 ? 'duplicados' : 'pendientes')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'duplicados' || activeFilter === 'pendientes'
            ? 'bg-slate-900 border-amber-500 shadow-sm ring-1 ring-amber-500/20'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Auditoría & Duplicados</span>
          {countDuplicados > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-white flex items-center gap-2">
          <span>{countConciliados}</span>
          <span className="text-xs text-slate-500 font-normal">/ {totalCount} listos</span>
        </div>
        <div className="text-[11px] mt-1">
          {countDuplicados > 0 ? (
            <span className="text-amber-400 font-medium">
              ⚠️ {countDuplicados} duplicado{countDuplicados > 1 ? 's' : ''} detectado{countDuplicados > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-slate-400">{countPendientes} pendientes de cuadre</span>
          )}
        </div>
      </button>
    </div>
  );
};
