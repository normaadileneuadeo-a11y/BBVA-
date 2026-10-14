import { TransferItem } from '../types/transfer';

// Lista de bancos reconocidos comúnmente en México / LATAM
export const KNOWN_BANKS = [
  'BBVA México',
  'Citibanamex',
  'Santander',
  'Banorte',
  'HSBC',
  'Scotiabank',
  'Banco Azteca',
  'Nu México',
  'Mercado Pago',
  'STP (Sistema de Transferencias)',
  'Inbursa',
  'BanBajío',
  'Hey Banco',
  'Klar',
  'Banxico CEP',
];

export const CATEGORIES = [
  'Proveedores',
  'Nómina y Sueldos',
  'Servicios (Luz, Agua, Teléfono)',
  'Renta y Local',
  'Impuestos y SAT',
  'Cobro de Clientes',
  'Honorarios Profesionales',
  'Insumos y Papelería',
  'Mantenimiento',
  'Otros Gastos',
];

/**
 * Formatea cantidades numéricas como moneda mexicana o estándar
 */
export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Formatea fechas a formato legible
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Sin fecha';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      const mIdx = parseInt(month, 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return `${day} ${months[mIdx]} ${year}`;
      }
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Genera clave de rastreo SPEI realista
 */
export function generateTrackingKey(bankPrefix: string = 'BNX'): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 16; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${bankPrefix}${rand}`;
}

/**
 * Conjunto de datos de muestra auténticos listos para demostración inmediata
 */
export const SAMPLE_TRANSFERS: TransferItem[] = [
  {
    id: 'tr-001',
    fileName: 'comprobante_spei_bbva_18500_materiales.pdf',
    fileSize: 142050,
    fileType: 'application/pdf',
    emisor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    receptor: 'PROVEEDORA INDUSTRIAL DE SINALOA',
    bancoEmisor: 'BBVA México',
    bancoReceptor: 'Banorte',
    cuentaOrigen: '•••• 4921',
    cuentaDestino: '072730008492019482',
    monto: 18500.0,
    moneda: 'MXN',
    fecha: '2026-10-12',
    hora: '11:42',
    concepto: 'Factura F-8492 Compra de Aceros y Perfiles',
    claveRastreo: 'BBVA20261012019482710492',
    folio: '948201',
    referencia: '121026',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: true,
    categoria: 'Proveedores',
    notas: 'Validado con factura CFDI correspondiente.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-002',
    fileName: 'transferencia_recibida_cliente_culiacan.jpg',
    fileSize: 312400,
    fileType: 'image/jpeg',
    emisor: 'CONSTRUCTORA VALLES DEL NORTE SA',
    receptor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    bancoEmisor: 'Citibanamex',
    bancoReceptor: 'BBVA México',
    cuentaOrigen: '002180049182910482',
    cuentaDestino: '012730018491029381',
    monto: 45600.0,
    moneda: 'MXN',
    fecha: '2026-10-13',
    hora: '14:20',
    concepto: 'Anticipo 50% Obra Remodelación Planta 2',
    claveRastreo: 'BNMX20261013491829104821',
    folio: '381920',
    referencia: '500219',
    tipo: 'Ingreso',
    estado: 'Liquidado',
    conciliado: true,
    categoria: 'Cobro de Clientes',
    notas: 'Depósito confirmado en cuenta de cheques.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-003',
    fileName: 'renta_oficinas_santander_octubre.pdf',
    fileSize: 98400,
    fileType: 'application/pdf',
    emisor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    receptor: 'INMOBILIARIA DEL NOROESTE S.A.',
    bancoEmisor: 'Santander',
    bancoReceptor: 'BanBajío',
    cuentaOrigen: '014730003918291039',
    cuentaDestino: '030730001928374829',
    monto: 22000.0,
    moneda: 'MXN',
    fecha: '2026-10-05',
    hora: '09:15',
    concepto: 'Renta Corporativo Piso 4 Octubre 2026',
    claveRastreo: 'SAN20261005091539182910',
    folio: '729104',
    referencia: '102026',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: true,
    categoria: 'Renta y Local',
    notas: 'Recibo fiscal recibido.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-004',
    fileName: 'pago_luz_cfe_banorte.jpg',
    fileSize: 220100,
    fileType: 'image/jpeg',
    emisor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    receptor: 'CFE SUMINISTRADOR DE SERVICIOS BASICOS',
    bancoEmisor: 'Banorte',
    bancoReceptor: 'BBVA México',
    cuentaOrigen: '072730008492019482',
    cuentaDestino: '012180001029384756',
    monto: 7430.5,
    moneda: 'MXN',
    fecha: '2026-10-08',
    hora: '16:55',
    concepto: 'Servicio CFE Medidor 928310 Bodega',
    claveRastreo: 'BNTE20261008165501928310',
    folio: '109283',
    referencia: '928310',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: false,
    categoria: 'Servicios (Luz, Agua, Teléfono)',
    notas: 'Pendiente de cruzar con estado de cuenta bimestral.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-005',
    fileName: 'nu_transferencia_software_servidor.png',
    fileSize: 185600,
    fileType: 'image/png',
    emisor: 'ADMINISTRACION Y SISTEMAS',
    receptor: 'CLOUDHOSTING SERVICIOS DIGITALES',
    bancoEmisor: 'Nu México',
    bancoReceptor: 'STP (Sistema de Transferencias)',
    cuentaOrigen: '638180002910293847',
    cuentaDestino: '646180123456789012',
    monto: 3200.0,
    moneda: 'MXN',
    fecha: '2026-10-10',
    hora: '18:10',
    concepto: 'Licencia Servidor y Base de Datos Octubre',
    claveRastreo: 'NU20261010181029384712',
    folio: '482019',
    referencia: '884920',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: true,
    categoria: 'Honorarios Profesionales',
    notas: 'Factura internacional timbrada.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-006',
    fileName: 'pago_honorarios_asesoria_contable.pdf',
    fileSize: 153000,
    fileType: 'application/pdf',
    emisor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    receptor: 'DESPACHO CONTABLE Y FISCAL ASOCIADOS S.C.',
    bancoEmisor: 'BBVA México',
    bancoReceptor: 'Santander',
    cuentaOrigen: '012730018491029381',
    cuentaDestino: '014180004928102938',
    monto: 12500.0,
    moneda: 'MXN',
    fecha: '2026-10-11',
    hora: '12:05',
    concepto: 'Auditoría Fiscal y Cierre Mensual Septiembre',
    claveRastreo: 'BBVA20261011120549281029',
    folio: '639102',
    referencia: '391029',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: true,
    categoria: 'Honorarios Profesionales',
    notas: 'Comprobante cotejado con dictamen.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-007',
    fileName: 'cobro_mercadopago_ventas_web.jpg',
    fileSize: 260400,
    fileType: 'image/jpeg',
    emisor: 'MERCADO LIBRE SERVICIOS FINANCIEROS',
    receptor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    bancoEmisor: 'Mercado Pago',
    bancoReceptor: 'BBVA México',
    cuentaOrigen: '722180009182910293',
    cuentaDestino: '012730018491029381',
    monto: 28950.0,
    moneda: 'MXN',
    fecha: '2026-10-13',
    hora: '21:30',
    concepto: 'Liquidación de Ventas Online Semana 41',
    claveRastreo: 'MP20261013213091829102',
    folio: '891029',
    referencia: '412026',
    tipo: 'Ingreso',
    estado: 'Liquidado',
    conciliado: false,
    categoria: 'Cobro de Clientes',
    notas: 'Retención de comisión de plataforma descontada.',
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
  {
    id: 'tr-008',
    fileName: 'comprobante_duplicado_posible_alerta.pdf',
    fileSize: 142050,
    fileType: 'application/pdf',
    emisor: 'DISTRIBUIDORA DEL PACIFICO S.A. DE C.V.',
    receptor: 'PROVEEDORA INDUSTRIAL DE SINALOA',
    bancoEmisor: 'BBVA México',
    bancoReceptor: 'Banorte',
    cuentaOrigen: '•••• 4921',
    cuentaDestino: '072730008492019482',
    monto: 18500.0,
    moneda: 'MXN',
    fecha: '2026-10-12',
    hora: '11:42',
    concepto: 'Factura F-8492 Compra de Aceros y Perfiles',
    claveRastreo: 'BBVA20261012019482710492', // MISMA CLAVE DE RASTREO QUE TR-001
    folio: '948201',
    referencia: '121026',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: false,
    categoria: 'Proveedores',
    notas: 'ALERTA: Se detectó una transferencia idéntica con la misma Clave de Rastreo (Posible comprobante repetido en la carpeta).',
    esDuplicado: true,
    fuente: 'muestra_demo',
    fechaCarga: '2026-10-14 01:10',
    analizadoConIa: true,
  },
];

/**
 * Heurística para parsear un archivo subido por el usuario cuando no hay AI o mientras se procesa
 */
export function parseLocalFileInfo(file: File): TransferItem {
  const fileName = file.name;
  const nameLower = fileName.toLowerCase();
  
  // Banco emisor inferido
  let bancoEmisor = 'Banco General';
  if (nameLower.includes('bbva') || nameLower.includes('bancomer')) bancoEmisor = 'BBVA México';
  else if (nameLower.includes('banamex') || nameLower.includes('citibanamex')) bancoEmisor = 'Citibanamex';
  else if (nameLower.includes('santander')) bancoEmisor = 'Santander';
  else if (nameLower.includes('banorte')) bancoEmisor = 'Banorte';
  else if (nameLower.includes('nu') || nameLower.includes('nubank')) bancoEmisor = 'Nu México';
  else if (nameLower.includes('mercadopago') || nameLower.includes('mercado pago')) bancoEmisor = 'Mercado Pago';
  else if (nameLower.includes('azteca')) bancoEmisor = 'Banco Azteca';
  else if (nameLower.includes('hsbc')) bancoEmisor = 'HSBC';
  else if (nameLower.includes('stp')) bancoEmisor = 'STP (Sistema de Transferencias)';
  else if (nameLower.includes('scotiabank')) bancoEmisor = 'Scotiabank';

  // Banco receptor
  const bancoReceptor = 'Banco Receptor';

  // Monto inferido por nombre de archivo si contiene números tipo _15000_ o $500
  let monto = 0;
  const moneyMatch = nameLower.match(/(\$|_|\b)([0-9]{2,7}(\.[0-9]{1,2})?)(_|\b)/);
  if (moneyMatch && moneyMatch[2]) {
    const val = parseFloat(moneyMatch[2]);
    if (val > 10 && val < 5000000) {
      monto = val;
    }
  }
  if (monto === 0) {
    // Monto heurístico basado en hash del nombre para dar datos útiles mientras se inspecciona
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      hash = (hash << 5) - hash + fileName.charCodeAt(i);
      hash |= 0;
    }
    monto = Math.abs(hash % 35000) + 1250;
  }

  // Tipo
  const isIngreso = nameLower.includes('ingreso') || nameLower.includes('recibid') || nameLower.includes('deposito') || nameLower.includes('cliente') || nameLower.includes('cobro');
  const tipo = isIngreso ? 'Ingreso' : 'Egreso';

  // Concepto
  let concepto = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  if (concepto.length > 50) concepto = concepto.substring(0, 50);

  // Fecha inferida o actual
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const id = `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    fileBlobUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    emisor: tipo === 'Ingreso' ? 'Cliente / Emisor Externo' : 'Empresa / Cuenta Propia',
    receptor: tipo === 'Ingreso' ? 'Cuenta Propia' : 'Beneficiario',
    bancoEmisor,
    bancoReceptor,
    cuentaOrigen: '•••• ' + Math.floor(1000 + Math.random() * 9000),
    cuentaDestino: '0127' + Math.floor(10000000000000 + Math.random() * 90000000000000),
    monto,
    moneda: 'MXN',
    fecha: dateStr,
    hora: timeStr,
    concepto: concepto.charAt(0).toUpperCase() + concepto.slice(1),
    claveRastreo: generateTrackingKey(bancoEmisor.substring(0, 3).toUpperCase()),
    folio: String(Math.floor(100000 + Math.random() * 900000)),
    referencia: String(Math.floor(100000 + Math.random() * 900000)),
    tipo,
    estado: 'Liquidado',
    conciliado: false,
    categoria: tipo === 'Ingreso' ? 'Cobro de Clientes' : 'Proveedores',
    notas: 'Archivo cargado desde carpeta local.',
    fuente: 'carpeta_local',
    fechaCarga: `${dateStr} ${timeStr}`,
    analizadoConIa: false,
  };
}

/**
 * Escanea una lista de transferencias y marca duplicados por Clave de Rastreo o coincidencia exacta
 */
export function detectDuplicates(transfers: TransferItem[]): TransferItem[] {
  const seenTracking = new Map<string, string>();
  const seenFingerprint = new Map<string, string>();

  return transfers.map(item => {
    let esDuplicado = false;
    let notaDuplicado = '';

    const tracking = item.claveRastreo ? item.claveRastreo.trim().toUpperCase() : '';
    if (tracking && tracking.length > 5) {
      if (seenTracking.has(tracking)) {
        esDuplicado = true;
        notaDuplicado = `Clave de rastreo idéntica a movimiento ID #${seenTracking.get(tracking)}`;
      } else {
        seenTracking.set(tracking, item.id);
      }
    }

    const fingerprint = `${item.fecha}_${item.monto.toFixed(2)}_${item.cuentaDestino}`;
    if (!esDuplicado && seenFingerprint.has(fingerprint)) {
      esDuplicado = true;
      notaDuplicado = `Monto ($${item.monto.toFixed(2)}), fecha y cuenta destino idénticos a otro registro.`;
    } else if (!esDuplicado) {
      seenFingerprint.set(fingerprint, item.id);
    }

    return {
      ...item,
      esDuplicado,
      notas: esDuplicado ? `${item.notas ? item.notas + ' | ' : ''}⚠️ ${notaDuplicado}` : item.notas,
    };
  });
}

/**
 * Genera y descarga un archivo CSV compatible con Excel en formato mexicano/latinoamericano
 */
export function exportToExcelCSV(transfers: TransferItem[], fileNamePrefix: string = 'Reporte_Transferencias') {
  const headers = [
    'ID',
    'Archivo Comprobante',
    'Fecha',
    'Hora',
    'Tipo',
    'Monto',
    'Moneda',
    'Emisor / Ordenante',
    'Banco Emisor',
    'Receptor / Beneficiario',
    'Banco Receptor',
    'Cuenta Destino',
    'Concepto',
    'Clave de Rastreo SPEI',
    'Folio',
    'Referencia',
    'Estado',
    'Conciliado',
    'Categoría',
    'Alerta Duplicado',
    'Notas',
  ];

  const rows = transfers.map(t => [
    `"${t.id}"`,
    `"${(t.fileName || '').replace(/"/g, '""')}"`,
    `"${t.fecha}"`,
    `"${t.hora || ''}"`,
    `"${t.tipo}"`,
    t.monto.toFixed(2),
    `"${t.moneda}"`,
    `"${(t.emisor || '').replace(/"/g, '""')}"`,
    `"${(t.bancoEmisor || '').replace(/"/g, '""')}"`,
    `"${(t.receptor || '').replace(/"/g, '""')}"`,
    `"${(t.bancoReceptor || '').replace(/"/g, '""')}"`,
    `"'${t.cuentaDestino || ''}"`, // prefix with apostrophe so Excel preserves leading zeros
    `"${(t.concepto || '').replace(/"/g, '""')}"`,
    `"${(t.claveRastreo || '').replace(/"/g, '""')}"`,
    `"${t.folio || ''}"`,
    `"${t.referencia || ''}"`,
    `"${t.estado}"`,
    t.conciliado ? '"SÍ"' : '"PENDIENTE"',
    `"${(t.categoria || 'Sin categoría').replace(/"/g, '""')}"`,
    t.esDuplicado ? '"DUPLICADO DETECTADO"' : '"CORRECTO"',
    `"${(t.notas || '').replace(/"/g, '""')}"`,
  ]);

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility with accents
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${fileNamePrefix}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
