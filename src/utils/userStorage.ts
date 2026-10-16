import { BankUser, BankNotification } from '../types/user';
import { TransferItem } from '../types/transfer';
import { generateTrackingKey } from './transferParser';
import { sounds } from './soundEffects';

const USERS_STORAGE_KEY = 'bbva_registered_users_v4';
const USERS_BACKUP_KEY = 'bbva_users_backup_v4';
const USERS_SESSION_KEY = 'bbva_users_session_v4';
const CURRENT_USER_KEY = 'bbva_active_session_id_v4';
const DEVICE_OWNER_KEY = 'bbva_device_owner_id_v4';
const BENEFICIARIES_KEY = 'bbva_saved_beneficiaries_v4';
const BENEFICIARIES_BACKUP_KEY = 'bbva_beneficiaries_backup_v4';

export interface SavedBeneficiary {
  id: string;
  name: string;
  bank: string;
  account: string;
  alias?: string;
  createdAt: string;
  isFavorite?: boolean;
}

// Initial authentic Mexican accounts (available in system for transfers and testing)
export const INITIAL_USERS: BankUser[] = [
  {
    id: 'usr-001',
    name: 'Norma Adilene',
    email: 'norma@bbva.com',
    password: '123',
    phone: '667 123 4567',
    accountNumber: '0149218291',
    cardNumber: '4152 3134 8921 4921',
    cardLast4: '4921',
    clabe: '012 180 004921 82910 4',
    balance: 54800.0,
    biometricEnabled: true,
    createdAt: '2026-01-10',
    notifications: [
      {
        id: 'notif-1',
        title: 'Depósito SPEI Recibido',
        message: 'Has recibido una transferencia por $45,600.00 de CONSTRUCTORA VALLES DEL NORTE.',
        date: '2026-10-13',
        time: '14:20',
        type: 'incoming_transfer',
        read: true,
        amount: 45600.0,
      },
    ],
  },
  {
    id: 'usr-002',
    name: 'Carlos Mendoza',
    email: 'carlos@bbva.com',
    password: '123',
    phone: '667 987 6543',
    accountNumber: '0184920192',
    cardNumber: '4152 8492 0192 8492',
    cardLast4: '8492',
    clabe: '012 180 008492 01928 1',
    balance: 28450.0,
    biometricEnabled: true,
    createdAt: '2026-02-15',
    notifications: [
      {
        id: 'notif-2',
        title: 'Pago con Tarjeta Aprobado',
        message: 'Compra autorizada en Mercado Pago por $1,250.00',
        date: '2026-10-12',
        time: '18:15',
        type: 'outgoing_transfer',
        read: false,
        amount: 1250.0,
      },
    ],
  },
  {
    id: 'usr-003',
    name: 'Distribuidora del Pacífico S.A.',
    email: 'ventas@pacifico.com',
    password: '123',
    phone: '667 345 6789',
    accountNumber: '0139182910',
    cardNumber: '4152 3918 2910 3918',
    cardLast4: '3918',
    clabe: '012 180 003918 29103 9',
    balance: 142600.0,
    biometricEnabled: true,
    createdAt: '2025-11-20',
    notifications: [],
  },
  {
    id: 'usr-004',
    name: 'Elena Morales',
    email: 'elena@bbva.com',
    password: '123',
    phone: '667 555 4321',
    accountNumber: '0172910482',
    cardNumber: '4152 7291 0482 7291',
    cardLast4: '7291',
    clabe: '012 180 007291 04829 3',
    balance: 18900.0,
    biometricEnabled: true,
    createdAt: '2026-03-01',
    notifications: [],
  },
];

export const INITIAL_BENEFICIARIES: SavedBeneficiary[] = [
  { id: 'ben-001', name: 'Guillermo de Simón Aguilar', bank: 'SANTANDER', account: '123 456 12345678901 2', alias: 'Santander Personal', createdAt: '2026-01-15', isFavorite: true },
  { id: 'ben-002', name: 'MIGUEL TREJO', bank: 'STP', account: '646 180 1204 8920 6205', alias: 'STP Nómina', createdAt: '2026-02-10', isFavorite: true },
  { id: 'ben-003', name: 'ERNESTO RODRÍGUEZ', bank: 'BBVA Bancomer', account: '012 180 004921 8291 2013', alias: 'BBVA Hermano', createdAt: '2026-03-05', isFavorite: false },
  { id: 'ben-004', name: 'CONSTRUCTORA VALLES DEL NORTE', bank: 'Banorte', account: '072 730 008492 0194 8291', alias: 'Proveedor Materiales', createdAt: '2026-03-20', isFavorite: true },
];

let inMemoryUsersCache: BankUser[] | null = null;
let isServerSyncing = false;

/**
 * Sincronizar clientes con el servidor en segundo plano
 * PRESERVA 100% todos los clientes creados en el iPhone o cualquier navegador
 */
export async function syncUsersWithServer(): Promise<BankUser[]> {
  if (typeof window === 'undefined' || isServerSyncing) return getStoredUsers();
  isServerSyncing = true;
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const serverUsers: BankUser[] = await res.json();
      if (Array.isArray(serverUsers)) {
        const local = getStoredUsers();
        const mergedMap = new Map<string, BankUser>();

        // 1. Priorizar clientes locales (nunca perder clientes creados en el teléfono)
        local.forEach((u) => mergedMap.set(u.id, u));

        // 2. Agregar clientes del servidor que no estén en local
        serverUsers.forEach((u) => {
          if (!mergedMap.has(u.id)) {
            mergedMap.set(u.id, u);
          } else {
            // Si existe en ambos, conservar el que tenga mayor saldo o más notificaciones
            const existing = mergedMap.get(u.id)!;
            if ((u.notifications?.length || 0) > (existing.notifications?.length || 0)) {
              mergedMap.set(u.id, { ...existing, ...u });
            }
          }
        });

        // 3. Subir al servidor cualquier cliente local que falte en el servidor
        local.forEach((u) => {
          const onServer = serverUsers.some((su) => su.id === u.id);
          if (!onServer) {
            fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(u),
            }).catch(() => {});
          }
        });

        const finalUsers = Array.from(mergedMap.values());
        inMemoryUsersCache = finalUsers;
        const json = JSON.stringify(finalUsers);

        try {
          localStorage.setItem(USERS_STORAGE_KEY, json);
          localStorage.setItem(USERS_BACKUP_KEY, json);
          sessionStorage.setItem(USERS_SESSION_KEY, json);
        } catch (_) {}

        window.dispatchEvent(new CustomEvent('bbva_users_changed', { detail: finalUsers }));
        return finalUsers;
      }
    }
  } catch (e) {
    console.error('Server sync notice:', e);
  } finally {
    isServerSyncing = false;
  }
  return getStoredUsers();
}

/**
 * Obtener todos los usuarios registrados (Resistente a reinicios, Safari privado e iPhone)
 */
export function getStoredUsers(): BankUser[] {
  if (inMemoryUsersCache && inMemoryUsersCache.length > 0) {
    return inMemoryUsersCache;
  }

  try {
    // 1. Probar almacenamiento v4
    const raw = 
      localStorage.getItem(USERS_STORAGE_KEY) || 
      localStorage.getItem(USERS_BACKUP_KEY) ||
      sessionStorage.getItem(USERS_SESSION_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryUsersCache = parsed;
        return parsed;
      }
    }

    // 2. Probar versión v3 anterior para migrar clientes sin perder nada
    const oldV3 = localStorage.getItem('bbva_registered_users_v3');
    if (oldV3) {
      const parsedOld = JSON.parse(oldV3);
      if (Array.isArray(parsedOld) && parsedOld.length > 0) {
        saveStoredUsers(parsedOld);
        return parsedOld;
      }
    }
  } catch (e) {
    console.error('Error reading users from storage:', e);
  }

  // 3. Iniciar con valores por defecto locales SIN sobreescribir el servidor
  inMemoryUsersCache = INITIAL_USERS;
  try {
    const json = JSON.stringify(INITIAL_USERS);
    localStorage.setItem(USERS_STORAGE_KEY, json);
    localStorage.setItem(USERS_BACKUP_KEY, json);
    sessionStorage.setItem(USERS_SESSION_KEY, json);
  } catch (_) {}

  // Sincronizar en segundo plano para recuperar los clientes del servidor
  if (typeof window !== 'undefined') {
    setTimeout(() => syncUsersWithServer(), 50);
  }

  return INITIAL_USERS;
}

/**
 * Guardar lista de usuarios en almacenamiento local, copias de seguridad y servidor
 */
export function saveStoredUsers(users: BankUser[]) {
  inMemoryUsersCache = users;
  try {
    const json = JSON.stringify(users);
    localStorage.setItem(USERS_STORAGE_KEY, json);
    localStorage.setItem(USERS_BACKUP_KEY, json);
    sessionStorage.setItem(USERS_SESSION_KEY, json);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbva_users_changed', { detail: users }));

      // Persistir al servidor de forma confiable
      fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
}

/**
 * Obtener el titular vinculado específicamente a este celular
 */
export function getDeviceOwner(): BankUser | null {
  try {
    const ownerId = localStorage.getItem(DEVICE_OWNER_KEY) || sessionStorage.getItem(DEVICE_OWNER_KEY);
    if (!ownerId) return null;
    const users = getStoredUsers();
    const owner = users.find((u) => u.id === ownerId);
    return owner || null;
  } catch (e) {
    console.error('Error reading device owner:', e);
    return null;
  }
}

/**
 * Establecer y recordar permanentemente el propietario de este teléfono
 */
export function setDeviceOwner(userOrId: BankUser | string) {
  try {
    const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
    localStorage.setItem(DEVICE_OWNER_KEY, id);
    sessionStorage.setItem(DEVICE_OWNER_KEY, id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbva_device_owner_changed', { detail: id }));
    }
  } catch (e) {
    console.error('Error setting device owner:', e);
  }
}

/**
 * Desvincular propietario de este teléfono
 */
export function clearDeviceOwner() {
  try {
    localStorage.removeItem(DEVICE_OWNER_KEY);
    sessionStorage.removeItem(DEVICE_OWNER_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbva_device_owner_changed', { detail: null }));
    }
  } catch (e) {
    console.error('Error clearing device owner:', e);
  }
}

/**
 * Obtener usuario actualmente conectado en la sesión activa
 */
export function getActiveUser(): BankUser {
  const users = getStoredUsers();
  
  // 1. Probar sesión activa
  const activeId = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
  if (activeId) {
    const found = users.find((u) => u.id === activeId);
    if (found) return found;
  }

  // 2. Probar propietario de este dispositivo
  const deviceOwner = getDeviceOwner();
  if (deviceOwner) return deviceOwner;

  // 3. Primer usuario registrado
  return users[0] || INITIAL_USERS[0];
}

/**
 * Establecer usuario conectado en sesión
 */
export function setActiveUser(user: BankUser) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    sessionStorage.setItem(CURRENT_USER_KEY, user.id);
  } catch (e) {
    console.error('Error setting active user:', e);
  }
}

/**
 * Limpiar sesión activa
 */
export function clearActiveUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    console.error('Error clearing active user:', e);
  }
}

/**
 * Crear nueva cuenta de cliente con números oficiales BBVA y saldo asignado
 * Se guarda INMEDIATAMENTE en el almacenamiento del dispositivo Y en el servidor
 */
export function createNewAccount(
  name: string,
  email: string,
  password: string,
  initialBalance: number = 25000,
  phone: string = '667 000 0000',
  setAsPhoneOwner: boolean = false
): BankUser {
  const users = getStoredUsers();
  
  // Generar números de tarjeta, cuenta y CLABE BBVA auténticos
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const cardLast4 = String(randNum);
  const cardNumber = `4152 3134 ${Math.floor(1000 + Math.random() * 9000)} ${cardLast4}`;
  const accountNumber = `01${Math.floor(10000000 + Math.random() * 90000000)}`;
  const clabe = `012 180 00${cardLast4} ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(1 + Math.random() * 9)}`;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const newUser: BankUser = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim() || '123456',
    phone: phone.trim(),
    accountNumber,
    cardNumber,
    cardLast4,
    clabe,
    balance: Math.max(0, initialBalance),
    biometricEnabled: true,
    createdAt: dateStr,
    notifications: [
      {
        id: `notif-${Date.now()}`,
        title: '¡Bienvenido(a) a BBVA México!',
        message: `Tu cuenta ha sido activada con éxito con saldo inicial y CLABE ${clabe}`,
        date: dateStr,
        time: '09:00',
        type: 'system',
        read: false,
      },
    ],
  };

  const updated = [newUser, ...users];
  saveStoredUsers(updated);
  
  // Guardar en el servidor backend
  if (typeof window !== 'undefined') {
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch((e) => console.error('Failed to post to server:', e));
  }

  // Establecer como titular sólo si se solicitó explícitamente o si no hay titular
  if (setAsPhoneOwner || !getDeviceOwner()) {
    setDeviceOwner(newUser);
    setActiveUser(newUser);
  }

  return newUser;
}

/**
 * Actualizar saldo directamente (Panel de administración)
 */
export function updateUserBalanceDirectly(userId: string, newBalance: number): BankUser | null {
  const users = getStoredUsers();
  let updatedUser: BankUser | null = null;

  const next = users.map((u) => {
    if (u.id === userId) {
      updatedUser = { ...u, balance: Math.max(0, newBalance) };
      return updatedUser;
    }
    return u;
  });

  saveStoredUsers(next);

  if (typeof window !== 'undefined') {
    fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, balance: newBalance }),
    }).catch(() => {});
  }

  return updatedUser;
}

/**
 * Actualizar datos completos de un usuario/cliente
 */
export function updateUserDetails(userId: string, updates: Partial<BankUser>): BankUser | null {
  const users = getStoredUsers();
  let updatedUser: BankUser | null = null;

  const next = users.map((u) => {
    if (u.id === userId) {
      updatedUser = { ...u, ...updates };
      return updatedUser;
    }
    return u;
  });

  saveStoredUsers(next);

  if (typeof window !== 'undefined') {
    fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, ...updates }),
    }).catch(() => {});
  }

  return updatedUser;
}

// ==========================================
// PERSISTENT BENEFICIARIES / SAVED CONTACTS
// ==========================================

export function getSavedBeneficiaries(): SavedBeneficiary[] {
  try {
    const raw = localStorage.getItem(BENEFICIARIES_KEY) || localStorage.getItem(BENEFICIARIES_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading beneficiaries:', e);
  }

  // Fallback initial
  try {
    const json = JSON.stringify(INITIAL_BENEFICIARIES);
    localStorage.setItem(BENEFICIARIES_KEY, json);
    localStorage.setItem(BENEFICIARIES_BACKUP_KEY, json);
  } catch (_) {}
  return INITIAL_BENEFICIARIES;
}

export function saveBeneficiary(beneficiary: Omit<SavedBeneficiary, 'id' | 'createdAt'> & { id?: string }): SavedBeneficiary {
  const list = getSavedBeneficiaries();
  const existingIdx = list.findIndex((b) => (beneficiary.id && b.id === beneficiary.id) || b.account === beneficiary.account);

  const item: SavedBeneficiary = {
    id: beneficiary.id || `ben-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: beneficiary.name.trim(),
    bank: beneficiary.bank.trim(),
    account: beneficiary.account.trim(),
    alias: beneficiary.alias?.trim() || beneficiary.name.trim(),
    createdAt: new Date().toISOString().split('T')[0],
    isFavorite: beneficiary.isFavorite ?? false,
  };

  let updatedList: SavedBeneficiary[];
  if (existingIdx !== -1) {
    updatedList = [...list];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...item };
  } else {
    updatedList = [item, ...list];
  }

  try {
    const json = JSON.stringify(updatedList);
    localStorage.setItem(BENEFICIARIES_KEY, json);
    localStorage.setItem(BENEFICIARIES_BACKUP_KEY, json);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbva_beneficiaries_changed', { detail: updatedList }));
      fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving beneficiary:', e);
  }

  return item;
}

export function deleteBeneficiary(id: string) {
  const list = getSavedBeneficiaries();
  const filtered = list.filter((b) => b.id !== id);
  try {
    const json = JSON.stringify(filtered);
    localStorage.setItem(BENEFICIARIES_KEY, json);
    localStorage.setItem(BENEFICIARIES_BACKUP_KEY, json);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbva_beneficiaries_changed', { detail: filtered }));
      fetch('/api/beneficiaries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error deleting beneficiary:', e);
  }
}

/**
 * Realiza una transferencia real entre usuarios de la app o a bancos externos
 */
export function executeTransfer(
  senderId: string,
  recipientQuery: string,
  amount: number,
  concept: string,
  reference: string = '123456',
  destinationBank: string = 'BBVA México',
  recipientUserId?: string
): {
  success: boolean;
  message: string;
  transferItem?: TransferItem;
  updatedSender?: BankUser;
  recipientUser?: BankUser;
} {
  const users = getStoredUsers();
  const senderIndex = users.findIndex((u) => u.id === senderId);

  if (senderIndex === -1) {
    return { success: false, message: 'Usuario ordenante no encontrado.' };
  }

  const sender = users[senderIndex];
  if (sender.balance < amount) {
    return {
      success: false,
      message: `Saldo insuficiente para transferir $${amount.toFixed(2)}`,
    };
  }

  // Buscar si el destinatario es un usuario interno de la app
  const queryClean = recipientQuery.replace(/\s+/g, '').toLowerCase().trim();
  const queryDigits = recipientQuery.replace(/[^0-9]/g, '');

  const recipientIndex = users.findIndex((u) => {
    if (u.id === senderId) return false;
    // 1. Coincidencia por ID explícito
    if (recipientUserId && u.id === recipientUserId) return true;
    if (u.id === recipientQuery) return true;

    // 2. Coincidencia por dígitos de CLABE o tarjeta
    const clabeDigits = u.clabe.replace(/[^0-9]/g, '');
    const cardDigits = u.cardNumber.replace(/[^0-9]/g, '');
    const cardLast4 = u.cardLast4.replace(/[^0-9]/g, '');

    if (queryDigits.length >= 4) {
      if (cardLast4 === queryDigits) return true;
      if (clabeDigits.includes(queryDigits)) return true;
      if (cardDigits.includes(queryDigits)) return true;
    }

    // 3. Coincidencia por nombre completo o parcial
    const nameClean = u.name.toLowerCase().trim();
    if (nameClean && queryClean) {
      if (nameClean === queryClean) return true;
      if (nameClean.includes(queryClean) || queryClean.includes(nameClean)) return true;
    }

    // 4. Coincidencia por correo
    if (u.email && u.email.toLowerCase().trim() === queryClean) return true;

    return false;
  });

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const folioStr = String(Math.floor(100000 + Math.random() * 900000));
  const claveRastreo = generateTrackingKey(destinationBank.substring(0, 3).toUpperCase());

  // Deduct balance from sender
  const newSenderBalance = sender.balance - amount;
  const senderNotification: BankNotification = {
    id: `notif-${Date.now()}-out`,
    title: 'Transferencia Enviada',
    message: `Enviaste $${amount.toFixed(2)} a ${recipientQuery}. Folio #${folioStr}. Clave SPEI: ${claveRastreo}`,
    date: dateStr,
    time: timeStr,
    type: 'outgoing_transfer',
    read: false,
    amount,
  };

  const updatedSender: BankUser = {
    ...sender,
    balance: newSenderBalance,
    notifications: [senderNotification, ...sender.notifications],
  };

  users[senderIndex] = updatedSender;

  let recipientUser: BankUser | undefined = undefined;

  // Si el receptor está en la app, aumentarle el saldo y notificarle
  if (recipientIndex !== -1) {
    const rawRecipient = users[recipientIndex];
    const newRecipientBalance = rawRecipient.balance + amount;
    const recipientNotification: BankNotification = {
      id: `notif-${Date.now()}-in`,
      title: '¡Transferencia SPEI Recibida!',
      message: `Recibiste $${amount.toFixed(2)} de ${sender.name}. Concepto: "${concept}". Tu saldo disponible aumentó.`,
      date: dateStr,
      time: timeStr,
      type: 'incoming_transfer',
      read: false,
      amount,
    };

    recipientUser = {
      ...rawRecipient,
      balance: newRecipientBalance,
      notifications: [recipientNotification, ...rawRecipient.notifications],
    };

    users[recipientIndex] = recipientUser;
  }

  saveStoredUsers(users);

  // Guardar automáticamente como beneficiario frecuente si no existe
  saveBeneficiary({
    name: recipientUser ? recipientUser.name : recipientQuery,
    bank: recipientUser ? 'BBVA México' : destinationBank,
    account: recipientUser ? recipientUser.clabe : recipientQuery,
    alias: recipientUser ? recipientUser.name : recipientQuery,
    isFavorite: true,
  });

  sounds.playTransferSuccessSound();

  const recipientDisplayName = recipientUser ? recipientUser.name : recipientQuery;
  const recipientAccountStr = recipientUser ? recipientUser.clabe : recipientQuery;

  const transferRecord: TransferItem = {
    id: `tr-${Date.now()}`,
    fileName: `comprobante_spei_${amount.toFixed(0)}_${recipientDisplayName.slice(0, 15).replace(/\s+/g, '_').toLowerCase()}.pdf`,
    fileSize: 135400,
    fileType: 'application/pdf',
    emisor: sender.name,
    receptor: recipientDisplayName,
    bancoEmisor: 'BBVA México',
    bancoReceptor: recipientUser ? 'BBVA México' : destinationBank,
    cuentaOrigen: `•••• ${sender.cardLast4}`,
    cuentaDestino: recipientAccountStr,
    monto: amount,
    moneda: 'MXN',
    fecha: dateStr,
    hora: timeStr,
    concepto: concept.trim() || 'Transferencia Interbancaria',
    claveRastreo,
    folio: folioStr,
    referencia: reference.trim() || '123456',
    tipo: 'Egreso',
    estado: 'Liquidado',
    conciliado: true,
    categoria: 'Proveedores',
    notas: recipientUser
      ? `Transferencia directa entre usuarios de la app BBVA (${sender.name} ➔ ${recipientUser.name}).`
      : `Transferencia interbancaria liquidada vía SPEI Banxico.`,
    fuente: 'archivo_manual',
    fechaCarga: `${dateStr} ${timeStr}`,
    analizadoConIa: true,
  };

  return {
    success: true,
    message: `Transferencia por $${amount.toFixed(2)} procesada exitosamente.`,
    transferItem: transferRecord,
    updatedSender,
    recipientUser,
  };
}
