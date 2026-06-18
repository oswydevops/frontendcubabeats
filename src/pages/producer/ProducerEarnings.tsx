import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  DollarSign, TrendingUp, Landmark, FileText, Send, 
  HelpCircle, CheckCircle, Clock, ChevronRight
} from 'lucide-react';

export const ProducerEarnings: React.FC = () => {
  const { user, addToast } = useApp();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [cardNumber, setCardNumber] = useState('9224 1029 4810 2933');
  const [bankType, setBankType] = useState('BANDEC');

  // Static mock payout list
  const [payouts, setPayouts] = useState([
    { id: 'PAY-4029', date: 'Hace 3 días', amount: 15000, bank: 'BANDEC', account: '9224...2933', status: 'completado' },
    { id: 'PAY-3982', date: 'Hace 2 semanas', amount: 8000, bank: 'BPA', account: '9228...1204', status: 'completado' },
  ]);

  const totalSalesCount = user?.salesCount || 19;
  const currentEarningsCUP = user?.totalEarningsCUP || 14250;

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Ingresa un monto de cobro válido', 'error');
      return;
    }
    if (parsedAmount > currentEarningsCUP) {
      addToast('Saldo insuficiente para retirar esta cantidad', 'error');
      return;
    }

    const newPayout = {
      id: `PAY-${Math.floor(4000 + Math.random() * 1000)}`,
      date: 'Solicitado hace un momento',
      amount: parsedAmount,
      bank: bankType,
      account: cardNumber.replace(/\s?/g, '').substring(0, 4) + '...' + cardNumber.slice(-4),
      status: 'pendiente'
    };

    setPayouts([newPayout, ...payouts]);
    setIsWithdrawModalOpen(false);
    addToast(`Solicitud de cobro por $${parsedAmount} CUP enviada a revisión`, 'success');
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg">
      
      {/* Header title */}
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <DollarSign className="text-[#7F77DD]" /> Control de Ingresos & Retiros
        </h2>
        <p className="text-xs text-gray-400">Mide tu balance disponible en pesos cubanos (CUP) y cobra de tu monedero a tu tarjeta bancaria.</p>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Withdrawable balance box style DAW */}
        <div className="bg-gradient-to-tr from-[#13131F] to-[#26215C] p-6 rounded-2xl text-white border border-[#7F77DD]/35 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest block">Saldo Disponible</span>
            <h3 className="text-3xl font-bold font-mono text-white">${currentEarningsCUP.toLocaleString()} <span className="text-[#7F77DD] text-base">CUP</span></h3>
            <span className="text-xs text-white/60 block">Comisión cobrada de CubaBeats: <strong className="text-emerald-400">0% Elite</strong></span>
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setIsWithdrawModalOpen(true)} className="flex-grow text-xs py-2.5">
              <Send size={12} className="mr-1.5" />
              Solicitar Cobro de Saldo
            </Button>
          </div>
        </div>

        {/* Beats sold summary */}
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-sm space-y-4 text-left">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Resumen de Ventas</span>
          
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-brand-border/20">
            <div>
              <span className="text-[10px] text-gray-400 block leading-tight">Total Vendidos:</span>
              <span className="font-mono text-lg font-bold text-white">{totalSalesCount} licencias</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block leading-tight">Tasa de Payout:</span>
              <span className="text-xs text-emerald-400 font-bold block mt-1">● Activo Regular</span>
            </div>
          </div>

          <span className="text-[11px] text-gray-400 block">Payout bancario procesado por administradores de CubaBeats en un plazo de 2 a 12 horas.</span>
        </div>

        {/* Payment options targets BPA etc */}
        <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Tarjeta de Destino Predeterminada</span>
          
          <div className="bg-brand-card border border-brand-border/30 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{bankType} CUP:</span>
              <span className="font-mono font-bold text-gray-400 select-all">{cardNumber}</span>
            </div>
            <p className="text-[10.5px] text-gray-405 leading-normal">
              Puedes cambiar tus cuentas de cobro y agregar billeteras magnéticas en la pestaña **Métodos de Pago**.
            </p>
          </div>
        </div>

      </div>

      {/* List payouts history */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border/40 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Historial de Retiros de Saldo</h3>
        
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border/30 text-gray-400 font-semibold uppercase">
                <th className="py-2">Operación ID</th>
                <th className="py-2">Fecha</th>
                <th className="py-2">Importe</th>
                <th className="py-2">Banco de Destino</th>
                <th className="py-2">Cuenta Enmascarada</th>
                <th className="py-2 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/20 text-gray-300">
              {payouts.map((pay) => (
                <tr key={pay.id} className="hover:bg-brand-card/25 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">{pay.id}</td>
                  <td className="py-3">{pay.date}</td>
                  <td className="py-3 font-mono font-bold text-emerald-450">${pay.amount.toLocaleString()} CUP</td>
                  <td className="py-3">{pay.bank}</td>
                  <td className="py-3 font-mono text-gray-400">{pay.account}</td>
                  <td className="py-3 text-right">
                    {pay.status === 'completado' ? (
                      <Badge variant="green" className="text-[9px] bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 py-0.5 px-2 font-bold">Liquidado</Badge>
                    ) : (
                      <Badge variant="amber" className="text-[9px] bg-amber-950/20 text-[#EF9F27] border border-amber-900/35 py-0.5 px-2 animate-pulse font-bold">Pendiente</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: WITHDRAW CLAIMS INPUT */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Solicitud de Liquidación de Saldo"
        themeMode="dark"
      >
        <form onSubmit={handleWithdrawRequest} className="space-y-4 text-left pt-2">
          <div className="bg-brand-card border border-brand-border/40 p-3 rounded-lg text-xs leading-normal text-gray-350 mb-2">
            Importe disponible a liquidar: **${currentEarningsCUP} CUP**
          </div>

          <Input
            label="Monto a retirar (CUP)"
            placeholder="5000"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            themeMode="dark"
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Banco Emisor Tarjeta</label>
            <select
              value={bankType}
              onChange={(e) => setBankType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white text-sm focus:border-[#534AB7] outline-none"
            >
              <option value="BANDEC" className="bg-brand-surface">BANDEC (Banco de Crédito y Comercio)</option>
              <option value="BPA" className="bg-brand-surface">BPA (Banco Popular de Ahorro)</option>
              <option value="BANMET" className="bg-brand-surface">BANMET (Banco Metropolitano)</option>
            </select>
          </div>

          <Input
            label="Número de Tarjeta CUP (16 dígitos)"
            placeholder="9224 1029 4810 2933"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            themeMode="dark"
          />

          <div className="flex gap-2 justify-end pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsWithdrawModalOpen(false)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enviar Solicitud de Cobro
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
