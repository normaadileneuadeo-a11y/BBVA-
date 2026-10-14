import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  DollarSign, 
  Edit3, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Users, 
  Key, 
  ShieldCheck, 
  ArrowRightLeft,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { BankUser } from '../types/user';
import { 
  getStoredUsers, 
  createNewAccount, 
  updateUserBalanceDirectly, 
  saveStoredUsers 
} from '../utils/userStorage';
import { formatCurrency } from '../utils/transferParser';
import { sounds } from '../utils/soundEffects';

interface BBVAAdminAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: BankUser;
  onSwitchUser: (user: BankUser) => void;
  onBalanceUpdated: () => void;
}

export const BBVAAdminAccountsModal: React.FC<BBVAAdminAccountsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onBalanceUpdated,
}) => {
  const [users, setUsers] = useState<BankUser[]>(getStoredUsers());
  const [isCreating, setIsCreating] = useState(false);

  // New user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [initialBalance, setInitialBalance] = useState('50000');
  const [phone, setPhone] = useState('667 123 4567');

  // Editing balance state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Por favor ingresa nombre y correo');
      return;
    }
    const balanceNum = parseFloat(initialBalance) || 0;
    const created = createNewAccount(name, email, password, balanceNum, phone);
    setUsers(getStoredUsers());
    setIsCreating(false);
    setName('');
    setEmail('');
    onBalanceUpdated();
    sounds.playNotificationSound();
    alert(`¡Cliente ${created.name} creado con éxito!\nCLABE: ${created.clabe}\nSaldo asignado: ${formatCurrency(created.balance)}`);
  };

  const handleSaveBalance = (userId: string) => {
    const num = parseFloat(editBalanceValue);
    if (isNaN(num) || num < 0) {
      alert('Por favor ingresa un saldo válido');
      return;
    }
    updateUserBalanceDirectly(userId, num);
    setUsers(getStoredUsers());
    setEditingUserId(null);
    onBalanceUpdated();
    sounds.playNotificationSound();
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert('Debe existir al menos un usuario en el sistema.');
      return;
    }
    if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
      const filtered = users.filter((u) => u.id !== userId);
      saveStoredUsers(filtered);
      setUsers(filtered);
      onBalanceUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Header */}
        <div className="bg-[#001844] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-sky-300 rounded-lg border border-sky-400/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>Gestor Central de Clientes y Saldos BBVA</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-normal">
                  Privado
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Crea clientes, ajusta saldos disponibles y simula transferencias entre cuentas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            <strong>{users.length}</strong> clientes registrados
          </span>
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004481] hover:bg-[#043263] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Ver lista de clientes' : '+ Nuevo Cliente / Saldo'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Create Form */}
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-[#043263] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#004481]" />
                <span>Registrar Cliente y Asignar Saldo</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Carlos Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@bbva.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004481]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contraseña / PIN de acceso</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#004481]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Saldo Inicial a Asignar ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50000"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#004481]"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-slate-600">
                Se generará automáticamente su cuenta de cheques BBVA (10 dígitos), Tarjeta de débito física/digital (16 dígitos) y CLABE Interbancaria (18 dígitos) para transferencias SPEI.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004481] hover:bg-[#043263] text-white font-semibold rounded-lg shadow-sm"
                >
                  Crear Cliente y Cargar Saldo
                </button>
              </div>
            </form>
          ) : (
            /* User list */
            <div className="space-y-3">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const isEditingThis = editingUserId === u.id;

                return (
                  <div
                    key={u.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/50 border-[#004481]/40 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrent ? 'bg-[#004481] text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#043263]">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[#004481] text-white px-2 py-0.2 rounded-full font-semibold">
                                Sesión Activa
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">{u.email} · Clave: <code className="font-mono text-slate-600">{u.password}</code></span>
                        </div>
                      </div>

                      {/* Balance section */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Saldo Disponible</span>
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5 mt-1 justify-end">
                            <input
                              type="number"
                              step="0.01"
                              value={editBalanceValue}
                              onChange={(e) => setEditBalanceValue(e.target.value)}
                              className="w-28 bg-white border border-[#004481] rounded px-2 py-1 font-mono text-xs font-bold text-emerald-700 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveBalance(u.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Guardar"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-end mt-0.5">
                            <span className="font-bold text-base font-mono text-emerald-700">
                              {formatCurrency(u.balance)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUserId(u.id);
                                setEditBalanceValue(String(u.balance));
                              }}
                              className="text-slate-400 hover:text-[#004481] p-1"
                              title="Modificar saldo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account numbers */}
                    <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600 border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] block">CLABE (18 dígitos)</span>
                        <span className="select-all font-semibold text-slate-800">{u.clabe}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Tarjeta Débito (16 dígitos)</span>
                        <span className="select-all font-semibold text-slate-800">{u.cardNumber}</span>
                      </div>
                    </div>

                    {/* User actions */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        {u.notifications.length} notificaciones recibidas
                      </span>

                      <div className="flex items-center gap-2">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSwitchUser(u);
                              onClose();
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-[#004481] text-[#004481] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Entrar como {u.name.split(' ')[0]}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Los saldos y transferencias se actualizan en tiempo real entre todos los usuarios.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#004481] text-white font-semibold rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
