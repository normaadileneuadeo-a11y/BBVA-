import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Building2, 
  FileSpreadsheet,
  CheckSquare,
  Square,
  Plus
} from 'lucide-react';
import { TransferItem, FilterType } from '../types/transfer';
import { formatCurrency, formatDate, KNOWN_BANKS, exportToExcelCSV } from '../utils/transferParser';

interface TransferTableProps {
  transfers: TransferItem[];
  onSelectTransfer: (item: TransferItem) => void;
  onToggleConciliado: (id: string) => void;
  onDeleteTransfer: (id: string) => void;
  onOpenAddModal: () => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const TransferTable: React.FC<TransferTableProps> = ({
  transfers,
  onSelectTransfer,
  onToggleConciliado,
  onDeleteTransfer,
  onOpenAddModal,
  activeFilter,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('todos');
  const [sortField, setSortField] = useState<'fecha' | 'monto' | 'emisor' | 'receptor'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Search logic
  const filteredTransfers = useMemo(() => {
    return transfers.filter(item => {
      // Filter tab
      if (activeFilter === 'egresos' && item.tipo !== 'Egreso') return false;
      if (activeFilter === 'ingresos' && item.tipo !== 'Ingreso') return false;
      if (activeFilter === 'conciliados' && !item.conciliado) return false;
      if (activeFilter === 'pendientes' && item.conciliado) return false;
      if (activeFilter === 'duplicados' && !item.esDuplicado) return false;

      // Bank filter
      if (selectedBank !== 'todos') {
        const bankMatch = item.bancoEmisor.toLowerCase().includes(selectedBank.toLowerCase()) || 
                          item.bancoReceptor.toLowerCase().includes(selectedBank.toLowerCase());
        if (!bankMatch) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = 
          item.concepto.toLowerCase().includes(query) ||
          item.emisor.toLowerCase().includes(query) ||
          item.receptor.toLowerCase().includes(query) ||
          item.bancoEmisor.toLowerCase().includes(query) ||
          item.bancoReceptor.toLowerCase().includes(query) ||
          item.claveRastreo.toLowerCase().includes(query) ||
          item.fileName.toLowerCase().includes(query) ||
          String(item.monto).includes(query);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'fecha') {
        comparison = (a.fecha || '').localeCompare(b.fecha || '');
      } else if (sortField === 'monto') {
        comparison = a.monto - b.monto;
      } else if (sortField === 'emisor') {
        comparison = a.emisor.localeCompare(b.emisor);
      } else if (sortField === 'receptor') {
        comparison = a.receptor.localeCompare(b.receptor);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [transfers, activeFilter, selectedBank, searchTerm, sortField, sortOrder]);

  const handleSort = (field: 'fecha' | 'monto' | 'emisor' | 'receptor') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransfers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransfers.map(t => t.id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0 
      ? transfers.filter(t => selectedIds.has(t.id))
      : filteredTransfers;
    exportToExcelCSV(toExport, 'Transferencias_Conciliadas');
  };

  const handleBatchMarkReconciled = () => {
    selectedIds.forEach(id => {
      const item = transfers.find(t => t.id === id);
      if (item && !item.conciliado) {
        onToggleConciliado(id);
      }
    });
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Toolbar & Segmented Controls */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => onFilterChange('todos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'todos'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({transfers.length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('ingresos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'ingresos'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ingresos ({transfers.filter(t => t.tipo === 'Ingreso').length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('egresos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'egresos'
                  ? 'bg-slate-800 text-rose-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Egresos ({transfers.filter(t => t.tipo === 'Egreso').length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('conciliados')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'conciliados'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conciliados ({transfers.filter(t => t.conciliado).length})
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('pendientes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeFilter === 'pendientes'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendientes ({transfers.filter(t => !t.conciliado).length})
            </button>
            {transfers.some(t => t.esDuplicado) && (
              <button
                type="button"
                onClick={() => onFilterChange('duplicados')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeFilter === 'duplicados'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800 shadow-sm'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                ⚠️ Duplicados ({transfers.filter(t => t.esDuplicado).length})
              </button>
            )}
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBatchMarkReconciled}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Conciliar {selectedIds.size} seleccionados</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
              title="Descargar reporte en formato Excel CSV con UTF-8"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Transferencia</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Bank Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por concepto, beneficiario, ordenante, clave SPEI o monto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
            >
              <option value="todos">Todos los Bancos</option>
              {KNOWN_BANKS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-white"
                  title="Seleccionar todos"
                >
                  {selectedIds.size > 0 && selectedIds.size === filteredTransfers.length ? (
                    <CheckSquare className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('fecha')}>
                <div className="flex items-center gap-1">
                  <span>Fecha / Hora</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>

              <th className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('emisor')}>
                <div className="flex items-center gap-1">
                  <span>Ordenante & Banco</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>

              <th className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('receptor')}>
                <div className="flex items-center gap-1">
                  <span>Beneficiario & Destino</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>

              <th className="py-2.5 px-3">
                <span>Concepto / Referencia</span>
              </th>

              <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('monto')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Monto</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>

              <th className="py-2.5 px-3 text-center">
                <span>Conciliación</span>
              </th>

              <th className="py-2.5 px-3 text-right">
                <span>Acción</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-slate-400">No se encontraron transferencias con estos criterios</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Intenta cambiar los filtros, buscar con otro término o cargar archivos desde la carpeta del Escritorio.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransfers.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectTransfer(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-950/20 hover:bg-sky-950/30'
                        : item.esDuplicado
                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center" onClick={(e) => handleToggleSelectRow(item.id, e)}>
                      <button type="button" className="text-slate-400 hover:text-white">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </td>

                    {/* Fecha & Hora */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-200">
                        {formatDate(item.fecha)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.hora || '12:00'} hrs
                      </div>
                    </td>

                    {/* Emisor / Ordenante */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-medium text-slate-200 truncate">
                        {item.emisor}
                      </div>
                      {/* Zero-pill metadata */}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{item.bancoEmisor}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.cuentaOrigen}</span>
                      </div>
                    </td>

                    {/* Beneficiario / Receptor */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-medium text-slate-200 truncate">
                        {item.receptor}
                      </div>
                      {/* Zero-pill metadata */}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{item.bancoReceptor}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono truncate">{item.cuentaDestino}</span>
                      </div>
                    </td>

                    {/* Concepto & SPEI */}
                    <td className="py-3 px-3 max-w-[240px]">
                      <div className="text-slate-300 font-medium truncate" title={item.concepto}>
                        {item.concepto}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        SPEI: {item.claveRastreo || 'Sin clave'}
                      </div>
                      {item.esDuplicado && (
                        <div className="text-[10px] text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Posible registro duplicado</span>
                        </div>
                      )}
                    </td>

                    {/* Monto (Tabular Numerals) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          item.tipo === 'Ingreso' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {item.tipo === 'Ingreso' ? '+' : '-'} {formatCurrency(item.monto, item.moneda)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.tipo}
                      </div>
                    </td>

                    {/* Conciliación Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleConciliado(item.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          item.conciliado
                            ? 'text-emerald-400 hover:bg-emerald-950/40'
                            : 'text-amber-400 hover:bg-amber-950/40'
                        }`}
                        title={item.conciliado ? 'Haga clic para desmarcar' : 'Haga clic para conciliar'}
                      >
                        {item.conciliado ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Conciliado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransfer(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Ver comprobante y detalle completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong>{filteredTransfers.length}</strong> de {transfers.length} movimientos</span>
          {selectedIds.size > 0 && (
            <span className="text-sky-400 font-medium">({selectedIds.size} seleccionados)</span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-slate-300">
          <span>Subtotal visible: <strong>{formatCurrency(filteredTransfers.reduce((acc, t) => acc + (t.tipo === 'Ingreso' ? t.monto : -t.monto), 0))}</strong></span>
        </div>
      </div>
    </div>
  );
};
