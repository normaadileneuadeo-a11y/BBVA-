import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  Share2, 
  ShieldCheck, 
  Building2, 
  CheckCircle2,
  FileText,
  QrCode as QrCodeIcon,
  ExternalLink,
  Award
} from 'lucide-react';
import QRCode from 'qrcode';
import { TransferItem } from '../types/transfer';
import { formatCurrency, formatDate } from '../utils/transferParser';
import { BBVALogo } from './BBVALogo';
import { generateBBVAPdf, numeroALetras } from '../utils/pdfGenerator';
import { sounds } from '../utils/soundEffects';

interface BBVAVoucherModalProps {
  transfer: TransferItem | null;
  onClose: () => void;
}

export const BBVAVoucherModal: React.FC<BBVAVoucherModalProps> = ({
  transfer,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (transfer) {
      const qrUrl = `https://www.banxico.org.mx/cep/consulta.do?fecha=${transfer.fecha}&criterio=${transfer.claveRastreo}&emisor=012&monto=${transfer.monto}`;
      QRCode.toDataURL(qrUrl, {
        margin: 1,
        width: 180,
        color: {
          dark: '#004481',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generating QR code preview:', err));
    }
  }, [transfer]);

  if (!transfer) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(transfer.claveRastreo);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      sounds.playNotificationSound();
      await generateBBVAPdf(transfer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BBVA Official Voucher Header */}
        <div className="bg-[#004481] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <BBVALogo size="md" color="#ffffff" />
            <div className="border-l border-white/20 pl-3">
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest block">
                Comprobante Oficial SPEI
              </span>
              <span className="text-xs font-semibold">Banca Móvil BBVA México</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800">
          {/* Amount Box */}
          <div className="text-center py-4 px-3 bg-blue-50/70 rounded-2xl border border-blue-200/80">
            <span className="text-[11px] text-[#004481] font-semibold uppercase tracking-wider block">
              Importe transferido
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#043263] font-mono mt-0.5 tracking-tight">
              {formatCurrency(transfer.monto, transfer.moneda)}
            </div>
            <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">
              ({numeroALetras(transfer.monto)})
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Operación liquidada y certificada en Banxico</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Fecha y hora de operación:</span>
              <span className="font-semibold text-slate-900">{formatDate(transfer.fecha)} {transfer.hora || '12:00:00'} hrs</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Folio de liquidación:</span>
              <span className="font-mono font-bold text-[#004481]">#{transfer.folio || '000000'}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Cuenta de retiro (Emisor):</span>
              <span className="font-mono text-slate-900 font-semibold">{transfer.cuentaOrigen} ({transfer.emisor})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Beneficiario (Receptor):</span>
              <span className="font-bold text-slate-900 text-right">{transfer.receptor}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Institución receptora:</span>
              <span className="font-semibold text-slate-900">{transfer.bancoReceptor}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Cuenta / CLABE destino:</span>
              <span className="font-mono text-slate-900 font-semibold">{transfer.cuentaDestino}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Concepto de pago:</span>
              <span className="font-bold text-slate-900 text-right">{transfer.concepto}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Referencia numérica:</span>
              <span className="font-mono text-slate-900">{transfer.referencia || '0103180'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Comisión e IVA:</span>
              <span className="font-semibold text-emerald-700 font-mono">$0.00 MXN (Exenta)</span>
            </div>
          </div>

          {/* Clave de Rastreo Banxico with Copy button */}
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Clave de Rastreo SPEI (Banxico)
              </span>
              <span className="text-xs font-mono font-bold text-sky-900 select-all break-all block mt-0.5">
                {transfer.claveRastreo}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyKey}
              className="p-2 text-slate-600 hover:text-[#004481] hover:bg-white rounded-lg transition-colors shrink-0 border border-transparent hover:border-slate-200 cursor-pointer"
              title="Copiar Clave de Rastreo"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Official QR Code & Sello Digital Section */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-2xs">
            {/* Real QR Code preview */}
            <div className="shrink-0 text-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Banxico CEP"
                  className="w-20 h-20 rounded-lg border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <QrCodeIcon className="w-8 h-8" />
                </div>
              )}
              <span className="text-[9px] font-mono text-slate-400 block mt-1">
                Banxico CEP
              </span>
            </div>

            {/* Seal & Certification Text */}
            <div className="min-w-0 flex-1 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#004481]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sello Digital BBVA Certificado</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Firma electrónica avanzada emitida por BBVA México, S.A. con validación de Token Móvil y acreditamiento en tiempo real por Banco de México.
              </p>
              <a
                href={`https://www.banxico.org.mx/cep/consulta.do?fecha=${transfer.fecha}&criterio=${transfer.claveRastreo}&emisor=012&monto=${transfer.monto}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#004481] hover:underline pt-0.5"
              >
                <span>Verificar comprobante en Banxico</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Institutional Signatures Row */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-[#004481] block">BBVA México, S.A.</span>
              <span className="text-[9px] text-slate-400 font-mono block">Banca Electrónica Digital</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-[#004481 block">Banco de México (SPEI)</span>
              <span className="text-[9px] text-slate-400 font-mono block">Liquidado en Tiempo Real</span>
            </div>
          </div>
        </div>

        {/* Footer Actions with Primary 'Download PDF' Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Primary Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full sm:flex-1 py-3 px-4 bg-[#004481] hover:bg-[#043263] active:bg-[#001844] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-4 h-4 text-sky-300 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
            <span>{isGeneratingPdf ? 'Generando PDF Oficial...' : 'Descargar Comprobante PDF'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none py-3 px-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
              title="Imprimir"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
