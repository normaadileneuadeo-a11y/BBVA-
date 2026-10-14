import { BankUser, BankNotification } from '../types/user';
import { TransferItem } from '../types/transfer';
import { generateTrackingKey } from './transferParser';
import { sounds } from './soundEffects';

const USERS_STORAGE_KEY = 'bbva_registered_users_v2';
const CURRENT_USER_KEY = 'bbva_active_session_id_v2';
const ALL_TRANSFERS_KEY = 'bbva_global_transfers_v2';

// Seed authentic Mexican accounts
const INITIAL_USERS: BankUser[] = [
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

/**
 * Obtener todos los usuarios registrados
 */
export function getStoredUsers(): BankUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading users from storage:', e);
  }
  saveStoredUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

/**
 * Guardar lista de usuarios
 */
export function saveStoredUsers(users: BankUser[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
}

/**
 * Obtener usuario actualmente conectado
 */
export function getActiveUser(): BankUser {
  const users = getStoredUsers();
  const activeId = localStorage.getItem(CURRENT_USER_KEY);
  if (activeId) {
    const found = users.find((u) => u.id === activeId);
    if (found) return found;
  }
  return users[0] || INITIAL_USERS[0];
}

/**
 * Establecer usuario conectado
 */
export function setActiveUser(user: BankUser) {
  localStorage.setItem(CURRENT_USER_KEY, user.id);
}

/**
 * Crear nueva cuenta de cliente con números oficiales BBVA y saldo asignado
 */
export function createNewAccount(
  name: string,
  email: string,
  password: string,
  initialBalance: number = 25000,
  phone: string = '667 000 0000'
): BankUser {
  const users = getStoredUsers();
  
  // Random generated numbers with authentic BBVA prefixes
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const cardLast4 = String(randNum);
  const cardNumber = `4152 3134 ${Math.floor(1000 + Math.random() * 9000)} ${cardLast4}`;
  const accountNumber = `01${Math.floor(10000000 + Math.random() * 90000000)}`;
  const clabe = `012 180 00${cardLast4} ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(1 + Math.random() * 9)}`;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const newUser: BankUser = {
    id: `usr-${Date.now()}`,
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
        message: `Tu cuenta ha sido activada con éxito con saldo inicial de $${initialBalance.toFixed(2)} MXN y CLABE ${clabe}`,
        date: dateStr,
        time: '09:00',
        type: 'system',
        read: false,
      },
    ],
  };

  const updated = [newUser, ...users];
  saveStoredUsers(updated);
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
  return updatedUser;
}

/**
 * Realiza una transferencia real entre usuarios de la app o a bancos externos
 */
export function executeTransfer(
  senderId: string,
  recipientQuery: string, // Nombre, CLABE, cuenta o correo
  amount: number,
  concept: string,
  reference: string = '123456',
  destinationBank: string = 'BBVA México'
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
      message: `Saldo insuficiente ($${sender.balance.toFixed(2)}) para transferir $${amount.toFixed(2)}`,
    };
  }

  // Buscar si el destinatario es un usuario interno de la app
  const queryClean = recipientQuery.replace(/\s+/g, '').toLowerCase();
  const recipientIndex = users.findIndex((u) => {
    if (u.id === senderId) return false;
    const clabeClean = u.clabe.replace(/\s+/g, '').toLowerCase();
    const cardClean = u.cardNumber.replace(/\s+/g, '').toLowerCase();
    const emailClean = u.email.replace(/\s+/g, '').toLowerCase();
    const nameClean = u.name.replace(/\s+/g, '').toLowerCase();

    return (
      clabeClean.includes(queryClean) ||
      cardClean.includes(queryClean) ||
      emailClean === queryClean ||
      nameClean.includes(queryClean)
    );
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

  // Reproducir sonido de transferencia exitosa
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
