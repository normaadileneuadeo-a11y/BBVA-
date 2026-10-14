import React from 'react';
import { 
  X, 
  Bell, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';
import { BankNotification } from '../types/user';
import { formatCurrency } from '../utils/transferParser';

interface BBVANotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BankNotification[];
  onClearAll?: () => void;
}

export const BBVANotificationsModal: React.FC<BBVANotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll = () => {},
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#004481] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-300" />
            <h3 className="font-bold text-sm">Notificaciones BBVA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{notifications.length} avisos en tu buzón</span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="font-medium text-slate-600">No tienes notificaciones pendientes</p>
              <p className="text-[11px] mt-0.5">Recibirás alertas en tiempo real al enviar o recibir dinero.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 shadow-xs flex items-start gap-3 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'incoming_transfer'
                    ? 'bg-emerald-50 text-emerald-600'
                    : n.type === 'outgoing_transfer'
                    ? 'bg-blue-50 text-[#004481]'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {n.type === 'incoming_transfer' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : n.type === 'outgoing_transfer' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-[#043263]">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-slate-600 leading-snug">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.date}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#004481] hover:bg-[#043263] text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Cerrar buzón
          </button>
        </div>
      </div>
    </div>
  );
};
