import React, { useState } from 'react';
import { 
  Menu,
  Bell, 
  Search, 
  LogOut, 
  Eye, 
  EyeOff, 
  ArrowLeftRight, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  FolderOpen, 
  Copy, 
  Check, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Users,
  Building2,
  FileSpreadsheet,
  Plus,
  Heart,
  Headphones,
  Home,
  QrCode,
  Calendar,
  Lock,
  Smartphone,
  X,
  Share2
} from 'lucide-react';
import { TransferItem } from '../types/transfer';
import { BankUser } from '../types/user';
import { formatCurrency, formatDate } from '../utils/transferParser';
import { BBVALogo } from './BBVALogo';
import { PWAInstallButton } from './PWAInstallButton';
import { BBVANotificationsModal } from './BBVANotificationsModal';
import { getStoredUsers } from '../utils/userStorage';

interface BBVAHomeScreenProps {
  user: BankUser;
  onLogout: () => void;
  onStartTransfer: () => void;
  onSelectVoucher: (transfer: TransferItem) => void;
  onOpenFolderManager: () => void;
  onOpenAdminPortal: () => void;
  onOpenServices?: (type: 'atms' | 'phone' | 'pay_services' | 'card_apply' | 'card_manage') => void;
  transfers: TransferItem[];
}

export const BBVAHomeScreen: React.FC<BBVAHomeScreenProps> = ({
  user,
  onLogout,
  onStartTransfer,
  onSelectVoucher,
  onOpenFolderManager,
  onOpenAdminPortal,
  onOpenServices,
  transfers,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [activeTab, setActiveTab] = useState<'inicio' | 'salud' | 'oportunidades' | 'notificaciones' | 'ayuda'>('inicio');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawCode, setWithdrawCode] = useState<{ code: string; pin: string } | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenTime, setTokenTime] = useState(25);
  const [dynamicToken, setDynamicToken] = useState('749 203');
  const [movementFilter, setMovementFilter] = useState<'todos' | 'egresos' | 'ingresos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Secret 3-tap counter on user avatar
  const [secretTapCount, setSecretTapCount] = useState(0);
  const handleSecretTap = () => {
    setSecretTapCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        onOpenAdminPortal();
        return 0;
      }
      return next;
    });
    setTimeout(() => setSecretTapCount(0), 1200);
  };

  const unreadCount = user.notifications.filter((n) => !n.read).length;

  const handleCopyClabe = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.clabe.replace(/\s+/g, ''));
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2000);
  };

  const generateWithdrawCode = () => {
    const code = `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    setWithdrawCode({ code, pin });
    setShowWithdrawModal(true);
  };

  const openTokenModal = () => {
    setDynamicToken(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);
    setShowTokenModal(true);
  };

  const filteredTransfers = transfers.filter((t) => {
    if (movementFilter === 'egresos' && t.tipo !== 'Egreso') return false;
    if (movementFilter === 'ingresos' && t.tipo !== 'Ingreso') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.concepto.toLowerCase().includes(q) ||
        t.receptor.toLowerCase().includes(q) ||
        t.emisor.toLowerCase().includes(q) ||
        String(t.monto).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col justify-between selection:bg-[#004481] selection:text-white pb-20">
      {/* ================= TOP BLUE HEADER (BBVA 2026 NAVY DESIGN) ================= */}
      <div className="bg-gradient-to-b from-[#004481] to-[#043263] text-white pt-4 pb-7 px-4 shadow-md relative">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between mb-5">
          {/* Left: Hamburger Menu */}
          <button
            type="button"
            onClick={() => setShowSideDrawer(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center: User Avatar & Name */}
          <div 
            onClick={handleSecretTap}
            className="flex items-center gap-2 cursor-pointer select-none py-1 px-3 rounded-full hover:bg-white/10 transition-colors"
            title="Toca 3 veces para acceso administrativo"
          >
            <div className="w-8 h-8 rounded-full bg-blue-400/30 border border-sky-300 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-blue-200 block leading-none">Hola</span>
              <span className="font-bold text-sm text-white leading-tight">{user.name.split(' ')[0]}</span>
            </div>
          </div>

          {/* Right: Help & Notification Bell */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenServices?.('phone')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
              title="Ayuda BBVA"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowNotificationsModal(true)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 text-[#001844] font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4 Iconic Circular Action Buttons on Navy Background (Identical to 2026 App Screenshot) */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {/* Action 1: Transferir */}
          <button
            type="button"
            onClick={onStartTransfer}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all mb-1.5 border border-white/20 shadow-xs">
              <ArrowLeftRight className="w-6 h-6 text-sky-200" />
            </div>
            <span className="text-[11px] font-medium text-white leading-tight">
              Transferir
            </span>
          </button>

          {/* Action 2: Oportunidades */}
          <button
            type="button"
            onClick={() => onOpenServices?.('card_apply')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all mb-1.5 border border-white/20 shadow-xs">
              <Plus className="w-6 h-6 text-sky-200" />
            </div>
            <span className="text-[11px] font-medium text-white leading-tight">
              Oportunidades
            </span>
          </button>

          {/* Action 3: Retiro sin tarjeta */}
          <button
            type="button"
            onClick={generateWithdrawCode}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all mb-1.5 border border-white/20 shadow-xs">
              <DollarSign className="w-6 h-6 text-sky-200" />
            </div>
            <span className="text-[11px] font-medium text-white leading-tight">
              Retiro sin tarjeta
            </span>
          </button>

          {/* Action 4: Más */}
          <button
            type="button"
            onClick={() => onOpenServices?.('pay_services')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all mb-1.5 border border-white/20 shadow-xs">
              <span className="text-xl font-bold tracking-widest text-sky-200 leading-none pb-1">• • •</span>
            </div>
            <span className="text-[11px] font-medium text-white leading-tight">
              Más
            </span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CARDS BODY (4K CRISP RESOLUTION) ================= */}
      <main className="px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {/* CARD 1: CUENTAS EN PESOS (Matching Screenshot 1) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cuentas en Pesos
            </span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#004481] hover:text-[#043263] flex items-center gap-1 text-xs font-semibold"
            >
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showBalance ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>

          <div 
            onClick={onStartTransfer}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              {/* Left: Corriente • 1234 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded-sm bg-[#004481] p-1 flex flex-col justify-between shadow-xs shrink-0">
                  <span className="text-[6px] font-bold text-white tracking-widest font-sans">BBVA</span>
                  <div className="w-2.5 h-1.5 rounded-xs bg-amber-400 mb-0.5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#043263] block">
                    Libretón Básico
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    • {user.cardLast4 || '4921'}
                  </span>
                </div>
              </div>

              {/* Right: $30,000.00 Saldo disponible */}
              <div className="text-right">
                <span className="text-lg font-bold text-[#043263] font-mono tracking-tight block">
                  {showBalance ? formatCurrency(user.balance) : '$ •••••••'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Saldo disponible
                </span>
              </div>
            </div>

            {/* Quick CLABE copy strip */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px] truncate">
                CLABE: {user.clabe}
              </span>
              <button
                type="button"
                onClick={handleCopyClabe}
                className="text-[#004481] font-semibold text-xs hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
              >
                {copiedClabe ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedClabe ? 'Copiada' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: TARJETAS DE CRÉDITO (Matching Screenshot 1) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tarjetas
            </span>
            <button
              type="button"
              onClick={() => onOpenServices?.('card_manage')}
              className="text-[#004481] hover:underline text-xs font-semibold"
            >
              Administrar
            </button>
          </div>

          <div 
            onClick={() => onOpenServices?.('card_manage')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              {/* Left: Crédito 1 • 1234 with Gold/Blue card graphic */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded-sm bg-gradient-to-r from-amber-600 to-amber-400 p-1 flex flex-col justify-between shadow-xs shrink-0">
                  <span className="text-[6px] font-bold text-white tracking-widest font-sans">BBVA ORO</span>
                  <div className="w-2.5 h-1.5 rounded-xs bg-slate-900 mb-0.5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#043263] block">
                    Crédito Oro
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    • {user.cardLast4 || '4921'}
                  </span>
                </div>
              </div>

              {/* Right: $10,000.00 Crédito disponible / $20,000.00 Saldo utilizado */}
              <div className="text-right">
                <span className="text-base font-bold text-emerald-700 font-mono tracking-tight block">
                  {showBalance ? '$10,000.00' : '$ •••••••'}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  Crédito disponible
                </span>
                <span className="text-[11px] font-semibold text-slate-600 font-mono block mt-0.5">
                  {showBalance ? '$20,000.00' : '$ •••••••'}
                </span>
                <span className="text-[10px] text-slate-400 block leading-none">
                  Saldo utilizado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Link: CONTRATOS PATRIMONIALES (Matching Screenshot) */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">CONTRATOS PATRIMONIALES</span>
          <button
            type="button"
            onClick={() => onOpenServices?.('card_apply')}
            className="text-[#004481] font-bold hover:underline"
          >
            Mostrar
          </button>
        </div>

        {/* RECENT MOVEMENTS SECTION */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Movimientos y Comprobantes SPEI
            </span>
            <span className="text-[11px] text-slate-400">
              {filteredTransfers.length} operaciones
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1.5 mb-2.5">
            {(['todos', 'egresos', 'ingresos'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setMovementFilter(filter)}
                className={`py-1 px-3 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  movementFilter === filter
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Transfers List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {filteredTransfers.slice(0, 10).map((transfer) => {
              const isEgreso = transfer.tipo === 'Egreso';
              return (
                <div
                  key={transfer.id}
                  onClick={() => onSelectVoucher(transfer)}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isEgreso ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {isEgreso ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 block truncate">
                        {isEgreso ? transfer.receptor : transfer.emisor}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {transfer.concepto}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {transfer.fecha} • {transfer.bancoReceptor}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className={`text-sm font-bold font-mono block ${isEgreso ? 'text-slate-900' : 'text-emerald-700'}`}>
                      {isEgreso ? '-' : '+'}{formatCurrency(transfer.monto)}
                    </span>
                    <span className="text-[10px] font-semibold text-[#004481] flex items-center justify-end gap-0.5">
                      <span>Ver recibo</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ================= FIXED 5-TAB BOTTOM NAVIGATION BAR (BBVA 2026 DESIGN) ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg max-w-md mx-auto">
        <div className="grid grid-cols-5 text-center py-2 px-1">
          {/* Tab 1: Inicio */}
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
              activeTab === 'inicio' ? 'text-[#004481]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Inicio</span>
          </button>

          {/* Tab 2: Salud Financiera */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('salud');
              alert(`Salud Financiera BBVA: Tu salud crediticia es excelente con saldo de ${formatCurrency(user.balance)}.`);
            }}
            className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
              activeTab === 'salud' ? 'text-[#004481]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Salud Fin.</span>
          </button>

          {/* Tab 3: Oportunidades */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('oportunidades');
              onOpenServices?.('card_apply');
            }}
            className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
              activeTab === 'oportunidades' ? 'text-[#004481]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-xs mb-0.5">
              +
            </div>
            <span className="text-[10px] font-semibold">Oportuni...</span>
          </button>

          {/* Tab 4: Notificaciones */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('notificaciones');
              setShowNotificationsModal(true);
            }}
            className={`flex flex-col items-center py-1 transition-colors relative cursor-pointer ${
              activeTab === 'notificaciones' ? 'text-[#004481]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bell className="w-5 h-5 mb-0.5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-6 w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className="text-[10px] font-semibold">Notificaci...</span>
          </button>

          {/* Tab 5: Ayuda */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('ayuda');
              onOpenServices?.('phone');
            }}
            className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
              activeTab === 'ayuda' ? 'text-[#004481]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Headphones className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Ayuda</span>
          </button>
        </div>
      </nav>

      {/* ================= SIDE PROFILE DRAWER (IDENTICAL TO SCREENSHOT 1 RIGHT PHONE) ================= */}
      {showSideDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowSideDrawer(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs bg-[#001844] text-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Top Row */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <BBVALogo size="md" color="#ffffff" />
                <button
                  type="button"
                  onClick={() => setShowSideDrawer(false)}
                  className="p-1.5 text-white/70 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Name & Perfil (Matching María / Perfil from Image 1) */}
              <div className="mb-6 flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-500/25 border-2 border-sky-400 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{user.name}</h3>
                  <span className="text-xs text-rose-400 font-semibold cursor-pointer hover:underline">
                    Perfil
                  </span>
                </div>
              </div>

              {/* Menu List Items from Screenshot */}
              <div className="space-y-3.5 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    alert('Configuración de cuenta y notificaciones activa.');
                  }}
                  className="w-full text-left flex items-center gap-3 py-2 text-white/90 hover:text-white cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Configuración</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    alert('Seguridad y privacidad: Cifrado bancario FIDO2 activo.');
                  }}
                  className="w-full text-left flex items-center gap-3 py-2 text-white/90 hover:text-white cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span>Seguridad y privacidad</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    alert('Tus otros bancos: Puedes vincular cuentas de Banorte, Santander o Citibanamex.');
                  }}
                  className="w-full text-left flex items-center gap-3 py-2 text-white/90 hover:text-white cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>Tus otros bancos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    openTokenModal();
                  }}
                  className="w-full text-left flex items-center gap-3 py-2 text-white/90 hover:text-white cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Token móvil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    alert('Operaciones QR + CoDi: Escanea códigos para pagos instantáneos sin contacto.');
                  }}
                  className="w-full text-left flex items-center gap-3 py-2 text-white/90 hover:text-white cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>Operaciones QR + CoDi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    alert('Operaciones programadas: No tienes transferencias automáticas pendientes.');
                  }}
                  className="w-full text-left flex items-center gap-3 py-2 text-white/90 hover:text-white cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>Operaciones programadas</span>
                </button>

                {/* Sincronizar transferencias */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    onOpenFolderManager();
                  }}
                  className="w-full text-left flex items-center justify-between py-2 text-amber-300 hover:text-white cursor-pointer border-t border-white/10 pt-3"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span>Carpeta 'transferencias'</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-400/20 px-1.5 py-0.5 rounded">C:\</span>
                </button>

                {/* Cambiar de cliente */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    onLogout();
                  }}
                  className="w-full text-left flex items-center justify-between py-2 text-sky-300 hover:text-white cursor-pointer border-t border-white/10 pt-3"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Cambiar de usuario</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Salir Button (Matching Screenshot 1) */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-amber-400 text-[#001844] flex items-center justify-center font-bold text-[10px]">
                  ⏻
                </div>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOKEN MÓVIL MODAL ================= */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center relative border border-slate-100">
            <button
              onClick={() => setShowTokenModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-[#004481] flex items-center justify-center mx-auto mb-3 text-[#004481]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#043263]">Token Móvil BBVA</h3>
            <p className="text-xs text-slate-500 mt-0.5">Clave dinámica de un solo uso para operaciones</p>

            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-3xl font-mono font-extrabold text-[#004481] tracking-widest block">
                {dynamicToken}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Expira en {tokenTime} segundos
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowTokenModal(false)}
              className="w-full py-3 bg-[#004481] text-white font-semibold text-xs rounded-xl shadow-md"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* ================= ATM CASH WITHDRAWAL CODE MODAL ================= */}
      {showWithdrawModal && withdrawCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center relative border border-slate-100">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#043263]">Retiro sin Tarjeta BBVA</h3>
            <p className="text-xs text-slate-500">Usa esta clave en cualquier cajero BBVA para retirar efectivo</p>

            <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Clave de retiro (12 dígitos)</span>
                <span className="text-lg font-mono font-bold text-[#004481]">{withdrawCode.code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Código de seguridad (4 dígitos)</span>
                <span className="text-lg font-mono font-bold text-emerald-700">{withdrawCode.pin}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="w-full py-3 bg-[#004481] text-white font-semibold text-xs rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Notifications Drawer/Modal */}
      <BBVANotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={user.notifications}
      />
    </div>
  );
};
