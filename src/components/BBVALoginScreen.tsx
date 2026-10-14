import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  UserPlus, 
  Building2, 
  Phone, 
  X, 
  Lock, 
  ShieldCheck, 
  Mail, 
  Key, 
  Users, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronRight, 
  Sparkles,
  CreditCard,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { BBVALogo } from './BBVALogo';
import { BBVACreditCardsGraphic } from './BBVACreditCardsGraphic';
import { PWAInstallButton } from './PWAInstallButton';
import { BBVABiometricModal } from './BBVABiometricModal';
import { getStoredUsers, createNewAccount, setActiveUser } from '../utils/userStorage';
import { BankUser } from '../types/user';
import { sounds } from '../utils/soundEffects';

interface BBVALoginScreenProps {
  onLoginSuccess: (user: BankUser) => void;
  onOpenFolderManager?: () => void;
  onOpenAdminPortal?: () => void;
  onOpenServices?: (type: 'atms' | 'phone' | 'pay_services' | 'card_apply' | 'card_manage') => void;
}

export const BBVALoginScreen: React.FC<BBVALoginScreenProps> = ({ 
  onLoginSuccess,
  onOpenFolderManager,
  onOpenAdminPortal,
  onOpenServices,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showUserPickerModal, setShowUserPickerModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);

  // Users State (dynamic from localStorage)
  const [usersList, setUsersList] = useState<BankUser[]>(() => getStoredUsers());
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    const list = getStoredUsers();
    return list[0]?.id || 'usr-001';
  });

  // Always refresh user list when component mounts or updates
  const refreshUsers = () => {
    const fresh = getStoredUsers();
    setUsersList(fresh);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const activeUser = usersList.find((u) => u.id === selectedUserId) || usersList[0] || {
    id: 'usr-001',
    name: 'Norma Adilene',
    email: 'norma@bbva.com',
    balance: 54800,
    cardLast4: '4921',
    clabe: '012 180 004921 82910 4',
  };

  // Login Mode: 'pin' | 'email'
  const [loginMode, setLoginMode] = useState<'pin' | 'email'>('pin');
  const [pin, setPin] = useState('');
  const [emailInput, setEmailInput] = useState(activeUser.email || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBalance, setRegBalance] = useState('35000');
  const [regPhone, setRegPhone] = useState('667 123 4567');

  // Secret 3-tap counter on BBVA logo
  const [logoTapCount, setLogoTapCount] = useState(0);
  const handleLogoTap = () => {
    setLogoTapCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        onOpenAdminPortal?.();
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoTapCount(0), 1200);
  };

  const handleKeyClick = (num: string) => {
    sounds.playKeypadClick();
    if (pin.length < 6) {
      const next = pin + num;
      setPin(next);
      setLoginError('');
      if (next.length === 6) {
        const matched = usersList.find((u) => u.password === next);
        setTimeout(() => {
          onLoginSuccess(matched || activeUser);
        }, 250);
      }
    }
  };

  const handleBackspace = () => {
    sounds.playKeypadClick();
    setPin((prev) => prev.slice(0, -1));
    setLoginError('');
  };

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = usersList.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase() && u.password === passwordInput.trim()
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      setLoginError('Correo o contraseña incorrectos. Verifica tus datos o usa la clave predeterminada 123.');
    }
  };

  // Create new customer account and immediately log in
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert('Por favor completa nombre y correo');
      return;
    }
    const balanceNum = parseFloat(regBalance) || 25000;
    const created = createNewAccount(
      regName.trim(),
      regEmail.trim(),
      regPassword.trim() || '123456',
      balanceNum,
      regPhone.trim()
    );

    // Refresh state
    const freshUsers = getStoredUsers();
    setUsersList(freshUsers);
    setSelectedUserId(created.id);
    setActiveUser(created);
    setShowRegisterModal(false);

    // Reset fields
    setRegName('');
    setRegEmail('');
    setRegPassword('');

    // Trigger silent Face ID or direct login with new user!
    sounds.playTransferSuccessSound();
    onLoginSuccess(created);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004481] via-[#043263] to-[#001844] text-slate-800 flex flex-col justify-between selection:bg-[#004481] selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-radial from-blue-400/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-12 -left-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top App Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
        {/* Left PWA install */}
        <div className="w-10 flex items-center">
          <PWAInstallButton compact />
        </div>

        {/* Center BBVA Logo (3-tap secret trigger to open hidden admin panel) */}
        <div 
          onClick={handleLogoTap}
          className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform select-none"
          title="BBVA México"
        >
          <BBVALogo size="lg" color="#ffffff" />
        </div>

        {/* Right Menu Button */}
        <button
          type="button"
          onClick={() => setShowMenuDrawer(true)}
          className="w-10 h-10 rounded-full bg-[#001844]/60 hover:bg-[#001844] text-white flex items-center justify-center transition-colors active:scale-95 border border-white/10 shadow-xs cursor-pointer"
          title="Menú BBVA"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-4 pb-6 max-w-md mx-auto w-full space-y-4">
        {/* Card 1: Main Welcome & Login Card (Identical to BBVA 2026 App) */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#043263] tracking-tight">
              Buenos días
            </h1>

            {/* Quick Account Switcher Button */}
            <button
              type="button"
              onClick={() => {
                refreshUsers();
                setShowUserPickerModal(true);
              }}
              className="text-xs text-[#004481] font-semibold hover:bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Cambiar cliente o agregar más"
            >
              <Users className="w-3.5 h-3.5 text-[#004481]" />
              <span>Cambiar ({usersList.length})</span>
            </button>
          </div>

          {/* Active User Greeting Card with quick switch */}
          <div 
            onClick={() => {
              refreshUsers();
              setShowUserPickerModal(true);
            }}
            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 rounded-xl mb-5 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#004481] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {activeUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-slate-500 block leading-tight">Cuenta BBVA activa</span>
              <p className="font-bold text-sm text-[#043263] truncate leading-snug">{activeUser.name}</p>
              <p className="text-[11px] font-mono text-emerald-700 font-semibold">
                Saldo: ${activeUser.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#004481] transition-colors" />
          </div>

          {/* Primary Iniciar sesión Button -> Launches Silent iPhone Face ID directly */}
          <button
            type="button"
            onClick={() => setShowBiometricModal(true)}
            className="w-full py-3.5 px-4 bg-[#004481] hover:bg-[#043263] active:bg-[#001844] text-white rounded-lg font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>Iniciar sesión</span>
          </button>

          {/* New user / Access key recovery */}
          <div className="mt-4 pt-1 text-left flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block">
                ¿Ingresas por primera vez?
              </span>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-sm font-bold text-[#004481] hover:underline mt-0.5 cursor-pointer"
              >
                Crear nuevo acceso / cuenta
              </button>
            </div>

            {/* Subtle option to type PIN or password */}
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="text-xs text-slate-500 hover:text-[#004481] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Usar clave</span>
            </button>
          </div>

          {/* 3 Circular Shortcut Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100">
            {/* Shortcut 1: Hazte cliente */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100/90 group-hover:bg-blue-50 group-active:scale-95 text-[#004481] flex items-center justify-center transition-all mb-2 shadow-xs border border-slate-200/60">
                <UserPlus className="w-5 h-5 text-[#004481]" />
              </div>
              <span className="text-[11px] font-medium text-[#043263] leading-tight">
                Hazte cliente
              </span>
            </button>

            {/* Shortcut 2: Sucursales y cajeros */}
            <button
              type="button"
              onClick={() => onOpenServices?.('atms')}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100/90 group-hover:bg-blue-50 group-active:scale-95 text-[#004481] flex items-center justify-center transition-all mb-2 shadow-xs border border-slate-200/60">
                <Building2 className="w-5 h-5 text-[#004481]" />
              </div>
              <span className="text-[11px] font-medium text-[#043263] leading-tight">
                Sucursales y cajeros
              </span>
            </button>

            {/* Shortcut 3: Línea BBVA */}
            <button
              type="button"
              onClick={() => onOpenServices?.('phone')}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100/90 group-hover:bg-blue-50 group-active:scale-95 text-[#004481] flex items-center justify-center transition-all mb-2 shadow-xs border border-slate-200/60">
                <Phone className="w-5 h-5 text-[#004481]" />
              </div>
              <span className="text-[11px] font-medium text-[#043263] leading-tight">
                Línea BBVA
              </span>
            </button>
          </div>
        </div>

        {/* Card 2: Credit Card Promotion */}
        <div 
          onClick={() => onOpenServices?.('card_apply')}
          className="bg-white rounded-2xl p-5 shadow-xl border border-white/20 cursor-pointer hover:border-blue-300 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#043263] tracking-tight">
              Pide tu primera tarjeta de crédito
            </h2>
            <span className="text-[10px] font-bold text-[#004481] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Solicitar
            </span>
          </div>

          <BBVACreditCardsGraphic />

          <p className="font-bold text-sm text-[#043263] mt-2 leading-snug">
            Con la tarjeta start BBVA olvídate de la anualidad*
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">
            *Toca aquí para solicitar y recibir tu tarjeta digital de inmediato.
          </span>
        </div>
      </main>

      {/* User Picker Modal (Allows choosing which customer to access or adding new ones!) */}
      {showUserPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#004481]" />
                <h3 className="font-bold text-sm text-[#043263]">Seleccionar Cliente BBVA</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUserPickerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Selecciona una cuenta registrada para iniciar sesión o crea un nuevo cliente:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {usersList.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setEmailInput(u.email);
                      setShowUserPickerModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#004481] bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#043263] truncate">{u.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                            Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-700 font-mono font-semibold mt-0.5">
                        Saldo: ${u.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        CLABE: {u.clabe}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#004481] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Direct Create New Client Button */}
            <button
              type="button"
              onClick={() => {
                setShowUserPickerModal(false);
                setShowRegisterModal(true);
              }}
              className="w-full mt-3 py-3 bg-[#004481] hover:bg-[#043263] text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-sky-300" />
              <span>+ Crear y Agregar Nuevo Cliente</span>
            </button>
          </div>
        </div>
      )}

      {/* Registration Modal ("Hazte Cliente / Crear Cuenta") */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#004481] flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#043263]">Crear Nuevo Cliente BBVA</h3>
              <p className="text-xs text-slate-500">Registra un nuevo usuario con saldo inicial y CLABE única</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre Completo del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María González / Roberto Silva"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="maria@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Clave de Acceso (PIN o Contraseña)</label>
                <input
                  type="password"
                  placeholder="Ej. 123456"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Saldo Inicial ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    value={regBalance}
                    onChange={(e) => setRegBalance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-emerald-800 focus:outline-none focus:border-[#004481]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/80 rounded-xl text-[11px] text-[#004481] border border-blue-200">
                Se generará su número de cuenta, tarjeta de débito y CLABE interbancaria BBVA única de 18 dígitos.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#004481] hover:bg-[#043263] text-white rounded-xl font-bold text-xs shadow-md transition-colors mt-2 cursor-pointer"
              >
                Crear Cliente y Entrar a la App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Login Keypad / Email Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-[#004481] mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#043263]">
                Hola, {activeUser.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {loginMode === 'pin' ? 'Ingresa tu clave de acceso (6 dígitos)' : 'Ingresa con correo y contraseña'}
              </p>
            </div>

            {/* Mode switcher tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs mb-4">
              <button
                type="button"
                onClick={() => setLoginMode('pin')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  loginMode === 'pin' ? 'bg-white text-[#004481] shadow-xs' : 'text-slate-500'
                }`}
              >
                Clave / PIN
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('email')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  loginMode === 'email' ? 'bg-white text-[#004481] shadow-xs' : 'text-slate-500'
                }`}
              >
                Correo y Contraseña
              </button>
            </div>

            {loginError && (
              <div className="p-2 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center font-medium">
                {loginError}
              </div>
            )}

            {loginMode === 'pin' ? (
              <>
                {/* PIN indicator circles */}
                <div className="flex justify-center items-center gap-3 mb-5">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        pin.length > i
                          ? 'bg-[#004481] border-[#004481] scale-110'
                          : 'border-slate-300 bg-slate-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Number Keypad */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeyClick(num)}
                      className="py-3 text-xl font-semibold text-[#043263] bg-slate-50 hover:bg-slate-100 active:bg-blue-100 rounded-xl transition-colors active:scale-95 cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowBiometricModal(true);
                    }}
                    className="py-3 flex items-center justify-center text-xs font-semibold text-[#004481] bg-blue-50/80 hover:bg-blue-100 rounded-xl active:scale-95 cursor-pointer"
                    title="Face ID"
                  >
                    Face ID
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyClick('0')}
                    className="py-3 text-xl font-semibold text-[#043263] bg-slate-50 hover:bg-slate-100 active:bg-blue-100 rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="py-3 flex items-center justify-center text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 active:bg-rose-100 rounded-xl active:scale-95 cursor-pointer"
                  >
                    Borrar
                  </button>
                </div>
              </>
            ) : (
              /* Email & Password Form */
              <form onSubmit={handleEmailLoginSubmit} className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@bbva.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña o Clave</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#004481] pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#004481] hover:bg-[#043263] text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Acceder con contraseña
                </button>
              </form>
            )}

            {/* Direct Instant Access Button */}
            <button
              type="button"
              onClick={() => onLoginSuccess(activeUser)}
              className="w-full py-3 bg-[#004481] hover:bg-[#043263] text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Ingresar como {activeUser.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* Biometric Verification Modal (Silent Apple iOS Face ID HUD) */}
      <BBVABiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={() => onLoginSuccess(activeUser)}
        userName={activeUser.name}
      />

      {/* Side Menu Drawer */}
      {showMenuDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowMenuDrawer(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs bg-[#001844] text-white h-full p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <BBVALogo size="md" color="#ffffff" />
                <button
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1.5 text-white/70 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User profile card in drawer */}
              <div className="mb-6 pb-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/30 border border-sky-400 text-white flex items-center justify-center font-bold text-base">
                  {activeUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{activeUser.name}</h3>
                  <span className="text-xs text-sky-300">Perfil</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <button
                  onClick={() => {
                    setShowMenuDrawer(false);
                    setShowBiometricModal(true);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 font-semibold text-white cursor-pointer"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setShowMenuDrawer(false);
                    setShowRegisterModal(true);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
                >
                  Abrir cuenta nueva
                </button>
                <button
                  onClick={() => {
                    setShowMenuDrawer(false);
                    refreshUsers();
                    setShowUserPickerModal(true);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg bg-white/10 text-sky-300 font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span>Cambiar de cliente ({usersList.length})</span>
                  <Users className="w-4 h-4 text-sky-300" />
                </button>
                <button
                  onClick={() => {
                    setShowMenuDrawer(false);
                    onOpenFolderManager?.();
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 text-white/90 flex items-center justify-between cursor-pointer"
                >
                  <span>Sincronizar transferencias</span>
                  <span className="text-[10px] font-mono bg-sky-900 text-sky-200 px-1.5 py-0.5 rounded">C:\</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenuDrawer(false);
                    alert('Línea BBVA: 55 5226 2663 disponible 24/7.');
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
                >
                  Línea BBVA y Ayuda
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-white/50">
              <p className="font-semibold text-white/80">BBVA México Banca Móvil</p>
              <p className="text-[11px] mt-0.5">PWA Certificada SPEI Banxico 2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
