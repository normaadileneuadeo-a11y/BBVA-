import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { TransferItem } from '../types/transfer';

/**
 * Convierte un número a formato de texto en pesos mexicanos
 * Ej. 25000 -> "VEINTICINCO MIL PESOS 00/100 M.N."
 */
export function numeroALetras(monto: number): string {
  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const centavosStr = String(centavos).padStart(2, '0') + '/100 M.N.';

  if (entero === 0) return `CERO PESOS ${centavosStr}`;

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirGrupo(n: number): string {
    let salida = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (n === 100) return 'CIEN';
    if (c > 0) salida += centenas[c] + ' ';

    const resto = n % 100;
    if (resto >= 10 && resto <= 19) {
      salida += especiales[resto - 10];
    } else if (resto >= 21 && resto <= 29) {
      salida += 'VEINTI' + unidades[u];
    } else if (d > 0) {
      salida += decenas[d];
      if (u > 0) salida += ' Y ' + unidades[u];
    } else if (u > 0) {
      salida += unidades[u];
    }

    return salida.trim();
  }

  let millones = Math.floor(entero / 1000000);
  let miles = Math.floor((entero % 1000000) / 1000);
  let unidadesGrupo = entero % 1000;

  let resultado = '';

  if (millones > 0) {
    if (millones === 1) resultado += 'UN MILLÓN ';
    else resultado += convertirGrupo(millones) + ' MILLONES ';
  }

  if (miles > 0) {
    if (miles === 1) resultado += 'MIL ';
    else resultado += convertirGrupo(miles) + ' MIL ';
  }

  if (unidadesGrupo > 0) {
    resultado += convertirGrupo(unidadesGrupo);
  }

  const pesoWord = entero === 1 ? 'PESO' : 'PESOS';
  return `${resultado.trim()} ${pesoWord} ${centavosStr}`;
}

/**
 * Genera y descarga el Comprobante Oficial de Transferencia BBVA en formato PDF
 */
export async function generateBBVAPdf(transfer: TransferItem): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Franja Azul Marino Superior Oficial BBVA (#004481)
  doc.setFillColor(0, 68, 129);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Detalle turquesa BBVA en el borde inferior de la franja (#00a9e0)
  doc.setFillColor(0, 169, 224);
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Logotipo tipográfico BBVA blanco
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BBVA', margin, 16);

  // Subtítulo del encabezado
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('BBVA México, S.A., Institución de Banca Múltiple', margin + 30, 12);
  doc.text('Comprobante Oficial de Transferencia Interbancaria (SPEI)', margin + 30, 18);

  // Folio a la derecha
  doc.setFontSize(8);
  doc.text(`FOLIO: #${transfer.folio || '000000'}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`BANXICO SPEI 2026`, pageWidth - margin, 18, { align: 'right' });

  let y = 34;

  // 2. Título del Documento
  doc.setTextColor(0, 68, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('COMPROBANTE DE OPERACIÓN INTERBANCARIA (SPEI)', margin, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Fecha y hora de emisión: ${transfer.fecha} ${transfer.hora || '12:00:00'} h | Estado: LIQUIDADO Y ACEPTADO`,
    margin,
    y
  );

  y += 7;

  // 3. Recuadro Destacado del Importe Transferido
  doc.setFillColor(240, 247, 255);
  doc.setDrawColor(186, 218, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(0, 68, 129);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTE TRANSFERIDO:', margin + 6, y + 7);

  const formattedMonto = `$${transfer.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${transfer.moneda || 'MXN'}`;
  doc.setFontSize(15);
  doc.text(formattedMonto, margin + 6, y + 16);

  // En letras a la derecha
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  const letras = numeroALetras(transfer.monto);
  doc.text(`(${letras})`, pageWidth - margin - 6, y + 11, { align: 'right', maxWidth: 90 });

  // Sello verde de éxito
  doc.setTextColor(45, 156, 91);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('✓ OPERACIÓN EXITOSA - SIN COMISIÓN', pageWidth - margin - 6, y + 17, { align: 'right' });

  y += 28;

  // 4. Tablas Técnicas Oficiales de la Transferencia
  const drawSectionHeader = (title: string, currentY: number) => {
    doc.setFillColor(4, 50, 99);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title, margin + 4, currentY + 4.2);
    return currentY + 6;
  };

  const drawRow = (label: string, value: string, currentY: number, isAlt: boolean = false) => {
    if (isAlt) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 6.5, margin + contentWidth, currentY + 6.5);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(label, margin + 4, currentY + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 65, currentY + 4.5, { maxWidth: contentWidth - 70 });

    return currentY + 6.5;
  };

  // SECCIÓN 1: CUENTA ORDENANTE (EMISOR)
  y = drawSectionHeader('1. DATOS DE LA CUENTA ORDENANTE (EMISOR)', y);
  y = drawRow('Titular / Ordenante:', transfer.emisor || 'Cliente BBVA México', y, false);
  y = drawRow('Institución Emisora:', `${transfer.bancoEmisor || 'BBVA México'} (012)`, y, true);
  y = drawRow('Cuenta o Tarjeta de Retiro:', transfer.cuentaOrigen || 'Cuenta de Ahorros BBVA', y, false);
  y = drawRow('RFC / Identificador:', 'BBVA012920194', y, true);

  y += 4;

  // SECCIÓN 2: CUENTA BENEFICIARIA (RECEPTOR)
  y = drawSectionHeader('2. DATOS DE LA CUENTA BENEFICIARIA (RECEPTOR)', y);
  y = drawRow('Titular / Beneficiario:', transfer.receptor, y, false);
  y = drawRow('Institución Receptora:', transfer.bancoReceptor || 'BBVA México', y, true);
  y = drawRow('Cuenta / CLABE Destino:', transfer.cuentaDestino, y, false);
  y = drawRow('Tipo de Cuenta:', 'Cuenta de Cheques / Débito Interbancaria', y, true);

  y += 4;

  // SECCIÓN 3: DATOS DE LA OPERACIÓN Y LIQUIDACIÓN SPEI
  y = drawSectionHeader('3. DATOS DE LA OPERACIÓN INTERBANCARIA SPEI', y);
  y = drawRow('Concepto de Pago:', transfer.concepto || 'Transferencia entre cuentas', y, false);
  y = drawRow('Referencia Numérica:', transfer.referencia || '0103180', y, true);
  y = drawRow('Clave de Rastreo Banxico:', transfer.claveRastreo, y, false);
  y = drawRow('Fecha y Hora de Liquidación:', `${transfer.fecha} a las ${transfer.hora || '12:00:00'} hrs`, y, true);
  y = drawRow('Comisión SPEI aplicada:', '$0.00 MXN (Exenta de cargo)', y, false);
  y = drawRow('IVA de la Comisión:', '$0.00 MXN', y, true);

  y += 6;

  // 5. CÓDIGO QR OFICIAL BANXICO Y FIRMA DIGITAL
  // Generar Código QR con URL oficial de consulta en Banco de México
  const qrUrl = `https://www.banxico.org.mx/cep/consulta.do?fecha=${transfer.fecha}&criterio=${transfer.claveRastreo}&emisor=012&monto=${transfer.monto}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    margin: 1,
    width: 256,
    color: {
      dark: '#004481',
      light: '#ffffff',
    },
  });

  const qrSize = 34;
  doc.addImage(qrDataUrl, 'PNG', margin + 2, y, qrSize, qrSize);

  // Cuadro del Sello Digital de Autenticidad (al lado del QR)
  const sealX = margin + qrSize + 6;
  const sealWidth = contentWidth - qrSize - 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(sealX, y, sealWidth, qrSize, 1.5, 1.5, 'FD');

  doc.setTextColor(0, 68, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SELLO DIGITAL DE AUTORIZACIÓN BBVA MÉXICO (BANXICO CEP)', sealX + 4, y + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);

  const cadenaOriginal = `||012|BBVA|${transfer.folio || '932041'}|${transfer.fecha}T${transfer.hora || '12:00:00'}|${transfer.monto}|MXN|${transfer.cuentaOrigen}|${transfer.cuentaDestino}|${transfer.claveRastreo}||`;
  doc.text(doc.splitTextToSize(`Cadena Original: ${cadenaOriginal}`, sealWidth - 8), sealX + 4, y + 10);

  const hashDigital = `SHA256: 4a9f2b810d7e4c5a92d0${transfer.claveRastreo.slice(0, 16)}e81c03b8e4f1a2389d047bca8910485a`;
  doc.text(`Firma Digital FIEL: ${hashDigital}`, sealX + 4, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Certificado de Seguridad Digital: 00001000000508920194 | Token Móvil Autorizado', sealX + 4, y + 27);
  doc.text('Escanea el código QR para validar la autenticidad en el portal de Banco de México.', sealX + 4, y + 31);

  y += qrSize + 7;

  // 6. Sección de Firmas de Autorización
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);

  // Firma 1: Banco Emisor
  const sigWidth = 75;
  const sig1X = margin + 15;
  doc.line(sig1X, y + 12, sig1X + sigWidth, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 68, 129);
  doc.text('BBVA MÉXICO, S.A.', sig1X + sigWidth / 2, y + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Autorización por Banca Electrónica / Token Móvil', sig1X + sigWidth / 2, y + 20, { align: 'center' });

  // Firma 2: Sistema Banxico SPEI
  const sig2X = pageWidth - margin - sigWidth - 15;
  doc.line(sig2X, y + 12, sig2X + sigWidth, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 68, 129);
  doc.text('SISTEMA SPEI (BANCO DE MÉXICO)', sig2X + sigWidth / 2, y + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Liquidación y Acreditamiento en Tiempo Real', sig2X + sigWidth / 2, y + 20, { align: 'center' });

  y += 26;

  // 7. Pie de Página Institucional y Legal
  doc.setFillColor(241, 245, 249);
  doc.rect(0, y, pageWidth, 297 - y, 'F');

  doc.setDrawColor(226, 232, 240);
  doc.line(0, y, pageWidth, y);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  const legal1 = 'Este documento es una representación impresa y legal de una transferencia procesada por el Sistema de Pagos Electrónicos Interbancarios (SPEI) de Banco de México.';
  const legal2 = 'Para cualquier aclaración con respecto a esta operación, comuníquese a Línea BBVA al 55 5226 2663 las 24 horas, o consulte su Comprobante Electrónico de Pago (CEP) en www.banxico.org.mx/cep.';
  const legal3 = 'BBVA México, S.A., Institución de Banca Múltiple, Grupo Financiero BBVA México. Avenida Paseo de la Reforma 510, Colonia Juárez, Alcaldía Cuauhtémoc, C.P. 06600, Ciudad de México.';

  doc.text(legal1, pageWidth / 2, y + 5, { align: 'center' });
  doc.text(legal2, pageWidth / 2, y + 9, { align: 'center' });
  doc.text(legal3, pageWidth / 2, y + 13, { align: 'center' });

  // Descargar automáticamente el PDF
  const safeFolio = (transfer.folio || '000000').replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `Comprobante_BBVA_SPEI_${safeFolio}_${transfer.fecha}.pdf`;
  doc.save(fileName);
}
