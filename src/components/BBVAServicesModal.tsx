import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  CreditCard, 
  Zap, 
  Droplet, 
  Wifi, 
  Check, 
  MapPin, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { BBVALogo } from './BBVALogo';
import { formatCurrency } from '../utils/transferParser';
import { sounds } from '../utils/soundEffects';

type ServiceModalType = 'atms' | 'phone' | 'pay_services' | 'card_apply' | 'card_manage';

interface BBVAServicesModalProps {
  type: ServiceModalType | null;
  onClose: () => void;
  availableBalance: number;
  onDeductBalance?: (amount: number, concept: string) => void;
  onCardApproved?: (newCardNumber: string) => void;
}

export const BBVAServicesModal: React.FC<BBVAServicesModalProps> = ({
  type,
  onClose,
  availableBalance,
  onDeductBalance,
  onCardApproved,
}) => {
  // ATM search state
  const [atmSearch, setAtmSearch] = useState('');

  // Pay services state
  const [selectedService, setSelectedService] = useState<'CFE' | 'Telmex' | 'Agua' | 'Gas'>('CFE');
  const [serviceRef, setServiceRef] = useState('');
  const [serviceAmount, setServiceAmount] = useState('680');
  const [serviceSuccess, setServiceSuccess] = useState(false);

  // Credit card apply state
  const [income, setIncome] = useState('18000');
  const [cardStep, setCardStep] = useState<'form' | 'approved'>('form');

  // Card manage state
  const [cardLocked, setCardLocked] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [cvvTime, setCvvTime] = useState(298);

  if (!type) return null;

  const atmsList = [
    { name: 'Sucursal BBVA Culiacán Centro', address: 'Av. Álvaro Obregón #450, Centro', distance: '450 m', open: 'Abierto hasta 16:00', deposit: true },
    { name: 'Cajero Automático BBVA Plaza Forum', address: 'Blvd. José Diego Valadés Ríos #1695', distance: '1.2 km', open: '24 horas', deposit: true },
    { name: 'Sucursal BBVA Tres Ríos', address: 'Blvd. Sánchez Alonso #890, Desarrollo Urbano Tres Ríos', distance: '2.5 km', open: 'Abierto hasta 16:00', deposit: true },
    { name: 'Cajero BBVA Plaza Ceiba', address: 'Blvd. Pedro Infante #3000', distance: '3.8 km', open: '24 horas', deposit: true },
    { name: 'Sucursal BBVA Insurgentes Sur', address: 'Av. Insurgentes Sur #1811, CDMX', distance: 'Red Nacional', open: 'Abierto hasta 16:00', deposit: true },
  ];

  const filteredAtms = atmsList.filter(a => 
    a.name.toLowerCase().includes(atmSearch.toLowerCase()) || 
    a.address.toLowerCase().includes(atmSearch.toLowerCase())
  );

  const handlePayServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(serviceAmount);
    if (isNaN(num) || num <= 0) return;
    if (num > availableBalance) {
      alert('Saldo insuficiente para pagar este servicio.');
      return;
    }
    onDeductBalance?.(num, `Pago de servicio ${selectedService} Ref: ${serviceRef || '948201'}`);
    sounds.playTransferSuccessSound();
    setServiceSuccess(true);
  };

  const handleApplyCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTransferSuccessSound();
    setCardStep('approved');
    onCardApproved?.('4152 7700 9482 1294');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004481] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'atms' && <Building2 className="w-5 h-5 text-sky-300" />}
            {type === 'phone' && <Phone className="w-5 h-5 text-sky-300" />}
            {type === 'pay_services' && <Zap className="w-5 h-5 text-amber-300" />}
            {type === 'card_apply' && <CreditCard className="w-5 h-5 text-sky-300" />}
            {type === 'card_manage' && <CreditCard className="w-5 h-5 text-sky-300" />}

            <h3 className="font-bold text-sm">
              {type === 'atms' && 'Sucursales y Cajeros BBVA'}
              {type === 'phone' && 'Línea BBVA 24 Horas'}
              {type === 'pay_services' && 'Pago de Servicios'}
              {type === 'card_apply' && 'Tarjeta de Crédito Start BBVA'}
              {type === 'card_manage' && 'Control de Tarjeta Digital'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-700 space-y-4">
          {/* ATMS FINDER */}
          {type === 'atms' && (
            <div className="space-y-3">
              <p className="text-slate-600">
                Localiza cajeros automáticos con retiro sin tarjeta y depósitos Practicaja BBVA:
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar colonia, plaza o ciudad..."
                  value={atmSearch}
                  onChange={(e) => setAtmSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#004481]"
                />
              </div>

              <div className="space-y-2 pt-1 max-h-72 overflow-y-auto">
                {filteredAtms.map((atm, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2 hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#004481] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">{atm.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{atm.address}</div>
                        <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{atm.open} · Practicaja activa</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#004481] bg-blue-100 px-2 py-0.5 rounded shrink-0">
                      {atm.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHONE & SUPPORT */}
          {type === 'phone' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-[#004481] flex items-center justify-center border-2 border-blue-200">
                <Phone className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-[#043263]">Línea BBVA México</h4>
                <p className="text-slate-500 text-xs mt-0.5">Atención telefónica los 365 días del año, las 24 horas</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Toda la República</span>
                    <span className="font-bold text-sm text-[#004481] font-mono">55 5226 2663</span>
                  </div>
                  <a
                    href="tel:5552262663"
                    className="px-3 py-1.5 bg-[#004481] text-white rounded-lg text-xs font-semibold hover:bg-[#043263]"
                  >
                    Llamar
                  </a>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Reportar Tarjeta Extraviada</span>
                    <span className="font-bold text-xs text-rose-700">Bloqueo de Emergencia Inmediato</span>
                  </div>
                  <button
                    onClick={() => {
                      alert('¡Tarjeta protegida! Se ha aplicado un bloqueo preventivo con folio #EMERG-9482.');
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                  >
                    Bloquear
                  </button>
                </div>

                <div className="text-[11px] text-slate-500">
                  Asistencia en aclaraciones de transferencias SPEI, consulta de saldos y reposición de token móvil.
                </div>
              </div>
            </div>
          )}

          {/* PAY SERVICES */}
          {type === 'pay_services' && (
            <div>
              {serviceSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#043263]">¡Pago Aplicado con Éxito!</h4>
                  <p className="text-xs text-slate-600">
                    Se liquidaron <strong>${serviceAmount} MXN</strong> para el servicio <strong>{selectedService}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Folio de pago: #CFE-20261014-948201</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 bg-[#004481] text-white rounded-lg font-semibold text-xs"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePayServiceSubmit} className="space-y-4">
                  <p className="text-slate-600">Selecciona la empresa o servicio que deseas pagar desde tu cuenta:</p>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'CFE', label: 'CFE Luz', icon: Zap },
                      { id: 'Telmex', label: 'Telmex', icon: Wifi },
                      { id: 'Agua', label: 'Agua Potable', icon: Droplet },
                      { id: 'Gas', label: 'Gas Natural', icon: Building2 },
                    ].map((s) => {
                      const Icon = s.icon;
                      const active = selectedService === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedService(s.id as any)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                            active
                              ? 'bg-blue-50 border-[#004481] text-[#004481] font-bold shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-[10px] leading-tight">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Número de servicio o código de barras</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 928310293812"
                      value={serviceRef}
                      onChange={(e) => setServiceRef(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#004481]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Importe a pagar ($ MXN)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={serviceAmount}
                      onChange={(e) => setServiceAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#043263] focus:outline-none focus:border-[#004481]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Saldo disponible: {formatCurrency(availableBalance)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#004481] hover:bg-[#043263] text-white font-semibold rounded-lg shadow-sm"
                  >
                    Pagar servicio ahora
                  </button>
                </form>
              )}
            </div>
          )}

          {/* APPLY FOR CREDIT CARD */}
          {type === 'card_apply' && (
            <div>
              {cardStep === 'approved' ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#043263]">¡Felicidades! Tarjeta Aprobada</h4>
                  <p className="text-xs text-slate-600">
                    Tu nueva <strong>Tarjeta de Crédito Start BBVA</strong> ha sido aprobada con una línea de <strong>$28,000 MXN</strong> sin anualidad de por vida.
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl font-mono text-xs text-[#004481] font-bold">
                    Tarjeta Digital: 4152 7700 9482 1294
                  </div>
                  <p className="text-[11px] text-slate-400">Ya está vinculada a tu app BBVA y lista para compras online.</p>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-[#004481] text-white font-semibold rounded-lg text-xs"
                  >
                    Ver en Mis Tarjetas
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCardSubmit} className="space-y-4">
                  <p className="text-slate-600 leading-relaxed">
                    Solicita tu tarjeta de crédito con aprobación en menos de 1 minuto y sin comprobante de ingresos:
                  </p>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <div className="font-bold text-[#004481] text-xs">Beneficios Start BBVA:</div>
                    <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                      <li>0% Anualidad de por vida</li>
                      <li>Puntos BBVA dobles en compras digitales</li>
                      <li>Meses sin intereses en comercios participantes</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ingreso mensual estimado ($ MXN)</label>
                    <input
                      type="number"
                      required
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-[#004481]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#004481] hover:bg-[#043263] text-white font-semibold rounded-lg shadow-sm text-xs"
                  >
                    Consultar pre-aprobación inmediata
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MANAGE VIRTUAL CARD */}
          {type === 'card_manage' && (
            <div className="space-y-4">
              <div 
                className="w-full h-44 rounded-2xl p-4 text-white flex flex-col justify-between shadow-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #004481 0%, #043263 60%, #001844 100%)',
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold tracking-wider text-sm">BBVA Débito Digital</span>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">Activa</span>
                </div>

                <div className="font-mono text-base tracking-widest text-center py-2">
                  4152 3134 8921 4921
                </div>

                <div className="flex justify-between items-end text-xs">
                  <div>
                    <span className="text-[9px] text-blue-200 block">Vigencia</span>
                    <span className="font-mono">10/29</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-blue-200 block">CVV Dinámico</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-sky-300">
                      <span>{showCVV ? '849' : '•••'}</span>
                      <button
                        type="button"
                        onClick={() => setShowCVV(!showCVV)}
                        className="text-white/70 hover:text-white"
                      >
                        {showCVV ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <span className="font-serif italic font-bold text-base">VISA</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {cardLocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                    <div>
                      <div className="font-bold text-slate-800">Apagado / Encendido de Tarjeta</div>
                      <div className="text-[10px] text-slate-500">
                        {cardLocked ? 'Tarjeta bloqueada temporalmente' : 'Tarjeta activa para compras'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCardLocked(!cardLocked);
                      sounds.playNotificationSound();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      cardLocked
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {cardLocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#004481] text-white font-semibold rounded-lg text-xs"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
