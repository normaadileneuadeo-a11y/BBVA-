export interface BankNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: 'incoming_transfer' | 'outgoing_transfer' | 'security' | 'promo' | 'system';
  read: boolean;
  amount?: number;
  transferId?: string;
}

export interface BankUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  accountNumber: string; // 10 dígitos (ej: 0149218291)
  cardNumber: string; // 16 dígitos (ej: 4152 3134 8921 4921)
  cardLast4: string; // 4921
  clabe: string; // 18 dígitos (ej: 012 180 004921 82910 4)
  balance: number;
  biometricEnabled: boolean;
  createdAt: string;
  notifications: BankNotification[];
}
