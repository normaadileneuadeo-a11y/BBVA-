export interface TransferItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileBlobUrl?: string;
  emisor: string;
  receptor: string;
  bancoEmisor: string;
  bancoReceptor: string;
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  moneda: string;
  fecha: string; // YYYY-MM-DD
  hora?: string; // HH:MM
  concepto: string;
  claveRastreo: string;
  folio: string;
  referencia?: string;
  tipo: 'Egreso' | 'Ingreso';
  estado: 'Exitoso' | 'Liquidado' | 'Pendiente' | 'Rechazado';
  conciliado: boolean;
  categoria?: string;
  notas?: string;
  esDuplicado?: boolean;
  fuente: 'carpeta_local' | 'archivo_manual' | 'muestra_demo';
  fechaCarga: string;
  analizadoConIa?: boolean;
}

export type FilterType = 'todos' | 'egresos' | 'ingresos' | 'conciliados' | 'pendientes' | 'duplicados';

export interface FolderSummary {
  folderName: string;
  folderPath: string;
  totalArchivos: number;
  totalMonto: number;
  totalIngresos: number;
  totalEgresos: number;
  conciliados: number;
  duplicadosDetectados: number;
  bancosInvolucrados: string[];
}
