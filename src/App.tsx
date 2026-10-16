/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Users, 
  FolderOpen, 
  ShieldCheck, 
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { TransferItem } from './types/transfer';
import { BankUser } from './types/user';
import { 
  SAMPLE_TRANSFERS, 
  parseLocalFileInfo, 
  detectDuplicates 
} from './utils/transferParser';
import { 
  getActiveUser, 
  setActiveUser, 
  clearActiveUser,
  getStoredUsers,
  syncUsersWithServer 
} from './utils/userStorage';
import { sounds } from './utils/soundEffects';
import { BBVASplashScreen } from './components/BBVASplashScreen';
import { BBVALoginScreen } from './components/BBVALoginScreen';
import { BBVAHomeScreen } from './components/BBVAHomeScreen';
import { BBVATransferFlow } from './components/BBVATransferFlow';
import { BBVAVoucherModal } from './components/BBVAVoucherModal';
import { BBVAFolderModal } from './components/BBVAFolderModal';
import { BBVAAdminAccountsModal } from './components/BBVAAdminAccountsModal';
import { BBVAServicesModal } from './components/BBVAServicesModal';

const FOLDER_PATH = 'C:\\Users\\X1Carbon\\Desktop\\transferencias';
const GLOBAL_TRANSFERS_KEY = 'bbva_global_transfers_v4';

export default function App() {
  // Splash screen state: starts true so the authentic BBVA launch animation plays!
  const [showSplash, setShowSplash] = useState(true);

  // App screens: 'login' | 'home' | 'transfer'
  const [currentScreen, setCurrentScreen] = useState<'login' | 'home' | 'transfer'>('login');
  
  // Active user session
  const [currentUser, setCurrentUser] = useState<BankUser>(() => getActiveUser());

  // Persistent transfers list
  const [transfers, setTransfers] = useState<TransferItem[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_TRANSFERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading transfers:', e);
    }
    return detectDuplicates(SAMPLE_TRANSFERS);
  });

  // Modals
  const [selectedVoucher, setSelectedVoucher] = useState<TransferItem | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [serviceModalType, setServiceModalType] = useState<'atms' | 'phone' | 'pay_services' | 'card_apply' | 'card_manage' | null>(null);

  // Live top notification banner (iOS / Android bank push alert)
  const [pushBanner, setPushBanner] = useState<{ title: string; message: string } | null>(null);

  // Sync transfers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_TRANSFERS_KEY, JSON.stringify(transfers));
    } catch (e) {
      console.error('Error saving transfers:', e);
    }
  }, [transfers]);

  // Keep user refreshed
  const refreshUser = () => {
    const users = getStoredUsers();
    const fresh = users.find((u) => u.id === currentUser.id) || users[0];
    if (fresh) {
      setCurrentUser(fresh);
      setActiveUser(fresh);
    }
  };

  const triggerPushBanner = (title: string, message: string) => {
    sounds.playIPhoneTriTone();
    setPushBanner({ title, message });
    setTimeout(() => {
      setPushBanner(null);
    }, 4500);
  };

  const handleLoginSuccess = (user: BankUser) => {
    setCurrentUser(user);
    setActiveUser(user);
    setCurrentScreen('home');
    triggerPushBanner(
      'BBVA México',
      `Bienvenido(a) ${user.name}. Tu saldo disponible es de $${user.balance.toFixed(2)} MXN.`
    );
  };

  // Listen to user changes across windows or admin modals and sync with server
  useEffect(() => {
    syncUsersWithServer().then(() => {
      refreshUser();
    }).catch(() => {});

    const handleUpdate = () => {
      refreshUser();
    };
    window.addEventListener('bbva_users_changed', handleUpdate);
    return () => window.removeEventListener('bbva_users_changed', handleUpdate);
  }, [currentUser.id]);

  const handleLogout = () => {
    clearActiveUser();
    setCurrentScreen('login');
    triggerPushBanner('BBVA Seguridad', 'Has cerrado sesión con seguridad.');
  };

  const handleTransferComplete = (newTransfer: TransferItem) => {
    setTransfers(prev => [newTransfer, ...prev]);
    refreshUser();
    triggerPushBanner(
      'Transferencia Exitosa',
      `Enviaste $${newTransfer.monto.toFixed(2)} a ${newTransfer.receptor}. Folio #${newTransfer.folio}.`
    );
  };

  const handleSwitchUser = (newUser: BankUser) => {
    setCurrentUser(newUser);
    setActiveUser(newUser);
    setCurrentScreen('home');
    triggerPushBanner(
      'Cambio de Cuenta',
      `Sesión activa iniciada como ${newUser.name}. Saldo: $${newUser.balance.toFixed(2)} MXN.`
    );
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const list = Array.from(files);
    const newItems = list.map(f => parseLocalFileInfo(f));
    setTransfers(prev => detectDuplicates([...newItems, ...prev]));
    triggerPushBanner(
      'Carpeta Sincronizada',
      `Se cargaron ${list.length} comprobante(s) desde ${FOLDER_PATH}`
    );
  };

  const handleDeductBalanceForService = (amount: number, concept: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Create payment transfer item
    const paymentItem: TransferItem = {
      id: `tr-${Date.now()}`,
      fileName: `recibo_servicio_${Date.now()}.pdf`,
      fileSize: 94000,
      fileType: 'application/pdf',
      emisor: currentUser.name,
      receptor: concept,
      bancoEmisor: 'BBVA México',
      bancoReceptor: 'BBVA Servicios',
      cuentaOrigen: `•••• ${currentUser.cardLast4}`,
      cuentaDestino: '012180009283102938',
      monto: amount,
      moneda: 'MXN',
      fecha: dateStr,
      hora: timeStr,
      concepto: concept,
      claveRastreo: `SERV${Date.now()}`,
      folio: String(Math.floor(100000 + Math.random() * 900000)),
      tipo: 'Egreso',
      estado: 'Liquidado',
      conciliado: true,
      categoria: 'Servicios (Luz, Agua, Teléfono)',
      fuente: 'archivo_manual',
      fechaCarga: `${dateStr} ${timeStr}`,
      analizadoConIa: true,
    };

    setTransfers(prev => [paymentItem, ...prev]);
    currentUser.balance = Math.max(0, currentUser.balance - amount);
    refreshUser();
    triggerPushBanner('Pago Aplicado', `Pagaste $${amount.toFixed(2)} por ${concept}.`);
  };

  // Secret keyboard shortcut to toggle admin accounts & balances modal (Alt+A or Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminPortalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#004481] text-slate-900 antialiased relative">
      {/* 1. BBVA Launch Splash Screen Animation */}
      {showSplash && (
        <BBVASplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Main Full-Width Mobile-First Application View (NO fake phone status bars or fake phone buttons) */}
      <div className="w-full min-h-screen max-w-md mx-auto shadow-2xl bg-white overflow-x-hidden">
        {/* Dynamic Screen Routing */}
        {currentScreen === 'login' && (
          <BBVALoginScreen
            onLoginSuccess={handleLoginSuccess}
            onOpenFolderManager={() => setIsFolderModalOpen(true)}
            onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
            onOpenServices={(t) => setServiceModalType(t)}
          />
        )}

        {currentScreen === 'home' && (
          <BBVAHomeScreen
            user={currentUser}
            onLogout={handleLogout}
            onStartTransfer={() => setCurrentScreen('transfer')}
            onSelectVoucher={(t) => setSelectedVoucher(t)}
            onOpenFolderManager={() => setIsFolderModalOpen(true)}
            onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
            onOpenServices={(t) => setServiceModalType(t)}
            transfers={transfers}
          />
        )}

        {currentScreen === 'transfer' && (
          <BBVATransferFlow
            onBack={() => {
              refreshUser();
              setCurrentScreen('home');
            }}
            currentUser={currentUser}
            onTransferComplete={handleTransferComplete}
          />
        )}
      </div>

      {/* Live iOS/Android Top Notification Banner with Bank Sound and Vibration */}
      {pushBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-3 animate-in slide-in-from-top-6 duration-300">
          <div className="bg-[#001844] text-white p-3.5 rounded-2xl shadow-2xl border border-sky-400/50 flex items-start gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-[#004481] text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-sky-300">{pushBanner.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ahora</span>
              </div>
              <p className="text-xs text-white/95 leading-snug mt-0.5">{pushBanner.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Official BBVA Voucher Modal */}
      <BBVAVoucherModal
        transfer={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
      />

      {/* Desktop Folder Sync Modal (C:\Users\X1Carbon\Desktop\transferencias) */}
      <BBVAFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        transfers={transfers}
        folderPath={FOLDER_PATH}
      />

      {/* Admin Accounts & Balances Portal */}
      <BBVAAdminAccountsModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onBalanceUpdated={refreshUser}
      />

      {/* All Service Modals (ATMs, Phone Line, Paying Services, Credit Card Application, Card Control) */}
      <BBVAServicesModal
        type={serviceModalType}
        onClose={() => setServiceModalType(null)}
        availableBalance={currentUser.balance}
        onDeductBalance={handleDeductBalanceForService}
      />
    </div>
  );
}
