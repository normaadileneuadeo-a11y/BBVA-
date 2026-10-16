import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Building2, 
  CheckCircle2, 
  Share2, 
  Download, 
  ShieldCheck, 
  Clock, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Users, 
  HelpCircle, 
  X,
  FileText
} from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { BankUser } from '../types/user';
import { formatCurrency, KNOWN_BANKS } from '../utils/transferParser';
import { 
  getStoredUsers, 
  executeTransfer, 
  getSavedBeneficiaries, 
  saveBeneficiary, 
  deleteBeneficiary,
  createNewAccount,
  SavedBeneficiary 
} from '../utils/userStorage';
import { sounds } from '../utils/soundEffects';
import { generateBBVAPdf } from '../utils/pdfGenerator';
import { Trash2, Star, UserCheck } from 'lucide-react';

interface BBVATransferFlowProps {
  onBack: () => void;
  currentUser: BankUser;
  onTransferComplete: (transfer: TransferItem) => void;
}

export const BBVATransferFlow: React.FC<BBVATransferFlowProps> = ({
  onBack,
  currentUser,
  onTransferComplete,
}) => {
  // Steps: 1 = Select Beneficiary, 2 = Enter Amount & Concept, 3 = Review (Image 2 Left), 4 = Token BBVA, 5 = Success Receipt (Image 2 Right)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Beneficiary state
  const [isNewContact, setIsNewContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    id?: string;
    name: string;
    bank: string;
    account: string;
  } | null>(null);

  // Persistent saved beneficiaries list
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<SavedBeneficiary[]>(() => getSavedBeneficiaries());
  const [internalUsers, setInternalUsers] = useState<BankUser[]>(() => 
    getStoredUsers().filter((u) => u.id !== currentUser.id)
  );

  // New contact form
  const [newName, setNewName] = useState('');
  const [newBank, setNewBank] = useState('BBVA México');
  const [newAccount, setNewAccount] = useState('');
  const [saveAsClientToo, setSaveAsClientToo] = useState(false);
  const [clientBalance, setClientBalance] = useState('35000');

  // Transfer details
  const [amount, setAmount] = useState('200000');
  const [concept, setConcept] = useState('Alquiler Marzo');
  const [reference, setReference] = useState('010318 0');

  // Search filter
  const [searchContact, setSearchContact] = useState('');

  // Token timer state
  const [tokenTime, setTokenTime] = useState(28);
  const [dynamicToken, setDynamicToken] = useState('839 201');

  // Completed transfer
  const [completedTransfer, setCompletedTransfer] = useState<TransferItem | null>(null);

  // Refresh beneficiaries and users
  useEffect(() => {
    const handleUpdate = () => {
      setSavedBeneficiaries(getSavedBeneficiaries());
      setInternalUsers(getStoredUsers().filter((u) => u.id !== currentUser.id));
    };
    window.addEventListener('bbva_beneficiaries_changed', handleUpdate);
    window.addEventListener('bbva_users_changed', handleUpdate);
    return () => {
      window.removeEventListener('bbva_beneficiaries_changed', handleUpdate);
      window.removeEventListener('bbva_users_changed', handleUpdate);
    };
  }, [currentUser.id]);

  // Split contacts into internal users (this environment) and saved beneficiaries
  const q = searchContact.toLowerCase().trim();
  const filteredInternalUsers = internalUsers.filter((u) => {
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.clabe.includes(q) || u.cardLast4.includes(q);
  });

  const filteredBeneficiaries = savedBeneficiaries.filter((b) => {
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || b.bank.toLowerCase().includes(q) || b.account.includes(q);
  });

  // Timer countdown for Token Móvil BBVA
  useEffect(() => {
    let interval: any;
    if (step === 4) {
      interval = setInterval(() => {
        setTokenTime((prev) => {
          if (prev <= 1) {
            setDynamicToken(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // iPhone back navigation handler
  const handleNavigateBack = () => {
    if (step === 5) {
      onBack();
      return;
    }
    if (isNewContact) {
      setIsNewContact(false);
      return;
    }
    if (step === 4) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
    if (step === 1) {
      onBack();
      return;
    }
  };

  // Touch swipe support for native iOS swipe-to-go-back gesture
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null && touchStartY !== null && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      // If user swiped from left edge (>45px rightward, low vertical deviation)
      if (touchStartX <= 55 && deltaX > 45 && Math.abs(deltaY) < 55) {
        handleNavigateBack();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Browser history popstate support (Safari / iOS back gesture)
  useEffect(() => {
    const stateId = `bbva-step-${step}-${isNewContact ? 'new' : 'list'}`;
    window.history.pushState({ screen: 'transfer', step, isNewContact, id: stateId }, '');

    const handlePopState = () => {
      handleNavigateBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [step, isNewContact]);

  const handleSelectContact = (contact: { id?: string; name: string; bank: string; account: string }) => {
    setSelectedContact(contact);
    setStep(2);
  };

  const handleCreateContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAccount.trim()) {
      alert('Por favor ingresa nombre y número de cuenta o CLABE');
      return;
    }
    const cleanName = newName.trim();
    const cleanAccount = newAccount.trim();

    // 1. Guardar PERMANENTEMENTE en el almacenamiento de beneficiarios del teléfono y servidor
    const saved = saveBeneficiary({
      name: cleanName,
      bank: newBank,
      account: cleanAccount,
      alias: cleanName,
      isFavorite: true,
    });
    setSavedBeneficiaries(getSavedBeneficiaries());

    // 2. Si el usuario activó la casilla, también crearlo como cliente bancario BBVA
    if (saveAsClientToo) {
      const cleanEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@bbva.com`;
      const numBal = parseFloat(clientBalance) || 25000;
      createNewAccount(cleanName, cleanEmail, '123456', numBal, '667 123 4567', false);
      setInternalUsers(getStoredUsers().filter((u) => u.id !== currentUser.id));
    }

    sounds.playNotificationSound();

    setSelectedContact({
      name: saved.name,
      bank: saved.bank,
      account: saved.account,
    });
    setStep(2);
  };

  const handleDeleteBeneficiary = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteBeneficiary(id);
    setSavedBeneficiaries(getSavedBeneficiaries());
    sounds.playKeypadClick();
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Por favor ingresa un importe válido mayor a $0.00');
      return;
    }
    if (num > currentUser.balance) {
      alert(`El importe ($${num.toFixed(2)}) supera tu saldo disponible ($${currentUser.balance.toFixed(2)})`);
      return;
    }
    if (!concept.trim()) {
      alert('Por favor ingresa un concepto para tu transferencia');
      return;
    }
    setStep(3); // Go to review (matching Image 2 left phone)
  };

  const handleAuthorizeWithToken = () => {
    setStep(4); // Open Token Móvil animation
    setTimeout(() => {
      finishTransfer();
    }, 1800);
  };

  const finishTransfer = () => {
    const numAmount = parseFloat(amount);
    const result = executeTransfer(
      currentUser.id,
      selectedContact?.account || selectedContact?.name || '',
      numAmount,
      concept.trim(),
      reference.trim() || '010318 0',
      selectedContact?.bank || 'BBVA México',
      selectedContact?.id
    );

    if (result.success && result.transferItem) {
      setCompletedTransfer(result.transferItem);
      onTransferComplete(result.transferItem);
      setStep(5); // Go to success receipt (matching Image 2 right phone)
    } else {
      alert(result.message || 'Error al procesar la transferencia');
      setStep(2);
    }
  };

  // Helper to split amount for BBVA Mexican superscript display ($200,000^00)
  const formatAmountSplit = (val: number) => {
    const formatted = val.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const parts = formatted.split('.');
    return {
      integer: parts[0],
      cents: parts[1] || '00',
    };
  };

  // Helper to format date identical to BBVA receipt: "18 octubre 2026, 17:49:03 h"
  const formatBBVADate = (dateStr: string, timeStr?: string) => {
    try {
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const d = new Date();
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}:${secs} h`;
    } catch (_) {
      return `${dateStr}, ${timeStr || '12:00:00'} h`;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'BB').toUpperCase();
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bg-[#f4f6f9] min-h-screen text-slate-800 flex flex-col justify-between selection:bg-[#004481] selection:text-white"
    >
      {/* ================= STEP 5: OFFICIAL BBVA SUCCESS RECEIPT (100% IDENTICAL TO IMAGE 2 RIGHT PHONE) ================= */}
      {step === 5 && completedTransfer ? (
        <div className="min-h-screen bg-white flex flex-col justify-between">
          {/* Top Green Banner (#2d9c5b) with iOS safe area inset */}
          <div className="bg-[#2d9c5b] text-white pt-[max(env(safe-area-inset-top),22px)] pb-10 px-5 text-center relative rounded-b-[28px] shadow-sm">
            {/* Top Bar with 'Transferir' and large touch target '✕' */}
            <div className="flex items-center justify-between mb-4">
              <span className="w-8" />
              <h2 className="text-sm font-semibold tracking-wide">Transferir</h2>
              <button
                type="button"
                onClick={onBack}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-white/90 hover:text-white cursor-pointer active:scale-95 touch-manipulation"
                title="Cerrar"
                aria-label="Cerrar comprobante"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Main Title: Transferencia exitosa */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Transferencia exitosa
            </h1>

            {/* Date & Time */}
            <p className="text-xs text-white/90 font-normal mb-5">
              {formatBBVADate(completedTransfer.fecha, completedTransfer.hora)}
            </p>

            {/* Amount with BBVA Superscript Cents: $200,000^00 */}
            <div className="flex items-start justify-center text-white font-medium my-2">
              <span className="text-3xl sm:text-4xl font-normal tracking-tight">$</span>
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight">
                {formatAmountSplit(completedTransfer.monto).integer}
              </span>
              <span className="text-base sm:text-lg font-semibold -top-1 relative ml-0.5 border-b border-white/60 leading-none">
                {formatAmountSplit(completedTransfer.monto).cents}
              </span>
            </div>

            <p className="text-[11px] text-white/85 italic mt-1 font-light">
              Esta transferencia no genera comisión.
            </p>

            {/* Overlapping Card & Recipient Pill Container */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-slate-100 px-4 py-2 flex items-center gap-3">
              {/* Mini Blue BBVA Debit Card Graphic */}
              <div className="w-11 h-7 rounded-sm bg-[#004481] p-1 flex flex-col justify-between shadow-xs relative overflow-hidden">
                <span className="text-[6px] font-bold text-white tracking-widest font-sans">BBVA</span>
                <div className="w-2.5 h-1.5 rounded-xs bg-amber-400 mb-0.5" />
              </div>

              {/* Orange Circle with Beneficiary Initials */}
              <div className="w-9 h-9 rounded-full bg-[#f26522] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {getInitials(completedTransfer.receptor)}
              </div>
            </div>
          </div>

          {/* White Body Details Section (Matching Screenshot 2 Right Phone) */}
          <div className="px-6 pt-11 pb-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Account from and Recipient Grid */}
              <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-100 text-left">
                {/* Left: Cuenta Libretón • 12345 */}
                <div>
                  <span className="text-[11px] font-bold text-slate-800 tracking-wider block">
                    Cuenta Libretón
                  </span>
                  <span className="text-xs font-medium text-slate-600 block mt-0.5">
                    • {currentUser.cardLast4 || '12345'}
                  </span>
                </div>

                {/* Right: RECIPIENT NAME, CLABE SANTANDER, • 89012 */}
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight truncate block">
                      {completedTransfer.receptor}
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-[#004481] shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    CLABE {completedTransfer.bancoReceptor || 'SANTANDER'}
                  </span>
                  <span className="text-xs font-medium text-slate-600 block">
                    • {completedTransfer.cuentaDestino.slice(-5) || '89012'}
                  </span>
                </div>
              </div>

              {/* Concept Section */}
              <div className="py-4 text-center">
                <span className="text-xs text-slate-400 block mb-1">Concepto</span>
                <p className="text-xs font-bold text-slate-800">
                  {completedTransfer.concepto || 'Alquiler Marzo'}
                </p>
              </div>

              {/* Reference & Folio */}
              <div className="text-center text-[11px] text-slate-400 space-y-1 pb-4">
                <p>
                  Referencia: <span className="font-mono text-slate-600">{completedTransfer.referencia || '010318 0'}</span>{' '}
                  Folio: <span className="font-mono text-slate-600">{completedTransfer.folio || '2342343'}</span>
                </p>
                <p className="font-bold text-slate-600">BBVA</p>
                <p className="break-all font-mono text-[10px] text-slate-500">
                  Clave rastreo: {completedTransfer.claveRastreo || '123456789012345678901234'}
                </p>
              </div>

              {/* Status Verification Link (Banxico CEP) */}
              <div className="text-center pb-4">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-medium">
                  <span>Verifica el estatus de tu operación</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#004481]" />
                </div>
                <a
                  href="https://www.banxico.org.mx/cep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#004481] hover:underline block mt-0.5"
                >
                  www.banxico.org.mx/cep
                </a>
              </div>
            </div>

            {/* 2 Bottom Actions from Image 2 (Información aclaración SPEI & Compartir) + Salir Button */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={async () => {
                    sounds.playNotificationSound();
                    await generateBBVAPdf(completedTransfer);
                  }}
                  className="flex flex-col items-center text-center text-xs text-[#004481] font-semibold hover:text-[#043263] cursor-pointer"
                  title="Descargar Comprobante Oficial BBVA en PDF"
                >
                  <Download className="w-5 h-5 mb-1 text-[#004481]" />
                  <span className="text-[11px] leading-tight font-bold">Descargar PDF Oficial</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Comprobante BBVA',
                        text: `Transferencia exitosa BBVA por $${completedTransfer.monto.toFixed(2)} a ${completedTransfer.receptor}. Folio: ${completedTransfer.folio}. Clave rastreo: ${completedTransfer.claveRastreo}`,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(`Transferencia exitosa BBVA por $${completedTransfer.monto.toFixed(2)} a ${completedTransfer.receptor}. Folio: ${completedTransfer.folio}. Clave rastreo: ${completedTransfer.claveRastreo}`);
                      alert('Comprobante copiado al portapapeles');
                    }
                  }}
                  className="flex flex-col items-center text-center text-xs text-[#004481] font-semibold hover:text-[#043263] cursor-pointer"
                >
                  <Share2 className="w-5 h-5 mb-1 text-[#004481]" />
                  <span className="text-[11px] leading-tight">Compartir</span>
                </button>
              </div>

              {/* Solid BBVA Blue Salir Button */}
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3.5 bg-[#004481] hover:bg-[#043263] active:bg-[#001844] text-white font-bold text-base rounded-none shadow-md transition-colors cursor-pointer"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= REGULAR TRANSFER FLOW ================= */
        <div>
          {/* BBVA Flow Top Bar with iOS Safe Area Inset and large touch target */}
          <header className="bg-[#004481] text-white px-4 pt-[max(env(safe-area-inset-top),18px)] pb-3.5 flex items-center justify-between shadow-md sticky top-0 z-30">
            <button
              type="button"
              onClick={handleNavigateBack}
              className="min-w-[48px] min-h-[48px] -ml-2 flex items-center gap-1.5 px-2 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors cursor-pointer select-none touch-manipulation"
              aria-label="Volver"
              title="Volver"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.3]" />
              <span className="text-xs font-semibold sm:hidden">Atrás</span>
            </button>
            <h2 className="font-semibold text-base">Transferir</h2>
            <div className="w-14 flex justify-end">
              {step > 1 && (
                <span className="text-[11px] font-mono font-medium text-sky-200 bg-white/10 px-2 py-0.5 rounded-full">
                  {step === 2 ? '1/2' : step === 3 ? '2/2' : ''}
                </span>
              )}
            </div>
          </header>

          <div className="p-4 max-w-md mx-auto w-full">
            {/* STEP 1: Select Beneficiary */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar contacto, cuenta o CLABE..."
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>

                {/* Add New Contact Toggle */}
                {!isNewContact ? (
                  <button
                    type="button"
                    onClick={() => setIsNewContact(true)}
                    className="w-full p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200 text-[#004481] rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#004481] text-white flex items-center justify-center">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">Nuevo contacto</span>
                        <span className="text-[10px] text-slate-500">A cuenta BBVA, tarjeta o CLABE interbancaria</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#004481]" />
                  </button>
                ) : (
                  <form onSubmit={handleCreateContactSubmit} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-[#004481] flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-[#004481]" />
                        <span>Agregar nuevo beneficiario / cliente</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsNewContact(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nombre completo del titular *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Carlos Pérez"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Banco receptor</label>
                      <select
                        value={newBank}
                        onChange={(e) => setNewBank(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                      >
                        {KNOWN_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Cuenta, Tarjeta o CLABE (18 dígitos) *</label>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        placeholder="123 456 12345678901 2"
                        value={newAccount}
                        onChange={(e) => setNewAccount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#004481]"
                      />
                    </div>

                    {/* Options to persist contact and optionally register as full client */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] text-slate-700">
                          Se guardará <strong>permanentemente</strong> en tus contactos de este teléfono.
                        </span>
                      </div>

                      <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={saveAsClientToo}
                          onChange={(e) => setSaveAsClientToo(e.target.checked)}
                          className="mt-0.5 rounded text-[#004481] focus:ring-[#004481]"
                        />
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800 block">
                            Crear también como cliente con cuenta activa BBVA
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Aparecerá en el Gestor Central de Clientes con saldo asignado
                          </span>
                        </div>
                      </label>

                      {saveAsClientToo && (
                        <div className="pl-6 pt-1">
                          <label className="block text-[11px] text-slate-600 mb-1">Saldo inicial para este cliente ($ MXN):</label>
                          <input
                            type="number"
                            value={clientBalance}
                            onChange={(e) => setClientBalance(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#004481] hover:bg-[#043263] active:bg-[#001844] text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Guardar y continuar transferencia
                    </button>
                  </form>
                )}

                {/* 1. Cuentas Registradas en este Entorno BBVA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-[#004481] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#004481]" />
                      <span>Cuentas BBVA de este Entorno ({filteredInternalUsers.length})</span>
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Transferencia Inmediata
                    </span>
                  </div>

                  <div className="space-y-2 mb-5">
                    {filteredInternalUsers.length === 0 ? (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                        No hay otras cuentas registradas coincidentes con la búsqueda.
                      </div>
                    ) : (
                      filteredInternalUsers.map((internalUser) => (
                        <div
                          key={internalUser.id}
                          onClick={() =>
                            handleSelectContact({
                              id: internalUser.id,
                              name: internalUser.name,
                              bank: 'BBVA México',
                              account: internalUser.clabe || `•••• ${internalUser.cardLast4}`,
                            })
                          }
                          className="p-3 bg-white hover:bg-blue-50/70 active:bg-blue-100/50 border border-blue-200/80 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-xs group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#004481] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {getInitials(internalUser.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {internalUser.name}
                                </span>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  Cliente BBVA • En este Entorno
                                </span>
                              </div>
                              <span className="text-[11px] text-[#004481] font-medium block truncate">
                                BBVA México • Saldo disponible: ${formatCurrency(internalUser.balance)}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 block truncate">
                                CLABE: {internalUser.clabe}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#004481] transition-colors shrink-0 ml-2" />
                        </div>
                      ))
                    )}
                  </div>

                  {/* 2. Otros Beneficiarios Guardados */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Otros Beneficiarios Guardados ({filteredBeneficiaries.length})
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {filteredBeneficiaries.length === 0 ? (
                      <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                        No hay otros beneficiarios guardados. Usa el botón <strong>+ Nuevo contacto</strong> arriba para guardar uno.
                      </div>
                    ) : (
                      filteredBeneficiaries.map((beneficiary) => (
                        <div
                          key={beneficiary.id}
                          onClick={() =>
                            handleSelectContact({
                              id: beneficiary.id,
                              name: beneficiary.name,
                              bank: beneficiary.bank,
                              account: beneficiary.account,
                            })
                          }
                          className="p-3 bg-white hover:bg-slate-50 active:bg-blue-50/50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors shadow-xs group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                              {getInitials(beneficiary.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {beneficiary.name}
                                </span>
                                <span className="text-[9px] bg-sky-100 text-[#004481] font-semibold px-1.5 py-0.2 rounded">
                                  Guardado
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {beneficiary.bank}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                {beneficiary.account}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBeneficiary(e, beneficiary.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar de contactos"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Explicit Bottom Navigation for iPhone */}
                <div className="pt-4 pb-8 text-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs"
                  >
                    ← Cancelar y volver al inicio
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Enter Amount & Concept */}
            {step === 2 && selectedContact && (
              <form onSubmit={handleAmountSubmit} className="space-y-4">
                {/* Beneficiary Header Card */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center font-bold text-xs">
                      {getInitials(selectedContact.name)}
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Destinatario:</span>
                      <span className="font-bold text-xs text-[#043263] block">{selectedContact.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{selectedContact.bank} • {selectedContact.account}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#004481] font-semibold hover:underline"
                  >
                    Cambiar
                  </button>
                </div>

                {/* Amount Input */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
                  <label className="block text-xs text-slate-500 font-medium mb-1">Importe a transferir</label>
                  <div className="flex items-center justify-center text-3xl font-extrabold text-[#004481]">
                    <span className="mr-1">$</span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent w-48 text-center text-3xl font-mono font-bold focus:outline-none"
                      autoFocus
                    />
                    <span className="text-sm text-slate-400 font-normal ml-1">MXN</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-2">
                    Saldo disponible: <strong className="text-emerald-700">${currentUser.balance.toFixed(2)} MXN</strong>
                  </span>
                </div>

                {/* Concept */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Concepto o Motivo de pago *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={40}
                    placeholder="Alquiler Marzo"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Referencia numérica (Opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="010318 0"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#004481] hover:bg-[#043263] text-white font-semibold text-sm rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Continuar
                </button>
              </form>
            )}

            {/* STEP 3: Review & Summary (100% IDENTICAL TO IMAGE 2 LEFT PHONE SCREEN) */}
            {step === 3 && selectedContact && (
              <div className="space-y-3">
                {/* 1. CUENTA DE ORIGEN */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    CUENTA DE ORIGEN
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">Cuenta</span>
                      <span className="text-xs text-slate-500 font-mono">• {currentUser.cardLast4 || '12345'}</span>
                    </div>
                    <span className="text-base font-bold text-slate-800 font-mono">
                      $ {currentUser.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* 2. DESTINO */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    DESTINO
                  </span>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block truncate">{selectedContact.name}</span>
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">
                      CLABE {selectedContact.bank} {selectedContact.account}
                    </span>
                  </div>
                </div>

                {/* 3. MONTO */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MONTO
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#004481] font-semibold hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="text-2xl font-extrabold text-[#043263] font-mono">
                    ${formatAmountSplit(parseFloat(amount) || 0).integer}{' '}
                    <span className="text-base font-semibold">{formatAmountSplit(parseFloat(amount) || 0).cents}</span>
                  </div>
                </div>

                {/* 4. CONCEPTO */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CONCEPTO
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#004481] font-semibold hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">
                    Referencia: <span className="font-mono text-slate-700">{reference || '010318 0'}</span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">
                    {concept || 'Alquiler Marzo'}
                  </p>
                </div>

                {/* 5. Summary Box with Total and Continuar Button (Matching Image 2 Left Phone) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center space-y-2 mt-4 shadow-sm">
                  <span className="text-xs text-slate-500 block">Total de la operación</span>
                  <div className="text-2xl font-bold text-[#004481] font-mono">
                    ${formatCurrency(parseFloat(amount) || 0)}
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Esta transferencia no genera comisión.
                  </p>

                  <button
                    type="button"
                    onClick={handleAuthorizeWithToken}
                    className="w-full py-3.5 bg-[#004481] hover:bg-[#043263] active:bg-[#001844] text-white font-bold text-sm rounded-none transition-colors shadow-md cursor-pointer mt-2"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Token Móvil Verification */}
            {step === 4 && (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 border-4 border-[#004481] flex items-center justify-center text-[#004481] animate-pulse">
                  <ShieldCheck className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-[#043263]">
                    Validando Token Móvil BBVA
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Generando firma digital segura para liquidar la orden SPEI...
                  </p>
                </div>

                <div className="inline-block bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-semibold">
                    Clave de Seguridad Dinámica
                  </span>
                  <div className="text-2xl font-mono font-bold text-[#004481] tracking-widest mt-0.5">
                    {dynamicToken}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-[#004481]" />
                    <span>Expira en {tokenTime} segundos</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
