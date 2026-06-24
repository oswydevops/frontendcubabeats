import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  Receipt, DollarSign, Sliders, Users, Calendar, ArrowUpRight, 
  Sparkles, CheckCircle, Search, Filter, ShoppingBag, PlusCircle, AlertCircle,
  Eye, X, ShieldCheck, FileText, Ban, HelpCircle, Check, Clock, CreditCard
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Transaction {
  id: string;
  beatTitle: string;
  type: 'beat' | 'sound_library';
  buyerName: string;
  producerId: string;
  producerName: string;
  amount: number;
  currency: 'CUP' | 'MLC' | 'USDT';
  method: 'Transfermovil' | 'EnZona' | 'QvaPay' | 'Tarjeta Clásica';
  status: 'approved' | 'pending' | 'rejected';
  date: string;
  timestamp: number;
}

export const AdminTransactions: React.FC = () => {
  const { verifiedProducersTask, orders, beats, addToast, addAdminNotification } = useApp();

  const [selectedProducerId, setSelectedProducerId] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'recientes' | 'diarias' | 'semanales' | 'mensuales' | 'semestrales'>('recientes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for active transaction details modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Extract all producers dynamically
  const producers = useMemo(() => {
    return verifiedProducersTask.filter(u => u.role === 'producer');
  }, [verifiedProducersTask]);

  // Initial pool of dynamic realistic transactions matching producers inside our system (p1: Elite Beats, p2: Flow Habano, p3: Havana Vibes, etc.)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const now = Date.now();
    return [
      {
        id: 'TX-8392',
        beatTitle: 'Midnight Sax (Exclusiva)',
        type: 'beat',
        buyerName: 'Laura G.',
        producerId: 'p2',
        producerName: 'Flow Habano',
        amount: 3200,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 40 minutos',
        timestamp: now - 40 * 60 * 1000
      },
      {
        id: 'TX-8389',
        beatTitle: 'Flow Repartero Vol. 2 (Librería de Sonido)',
        type: 'sound_library',
        buyerName: 'Yoandri García',
        producerId: 'p2',
        producerName: 'Flow Habano',
        amount: 1500,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 3 horas',
        timestamp: now - 3 * 60 * 60 * 1000
      },
      {
        id: 'TX-8385',
        beatTitle: 'Caribe Club Afrobeat Session (Licencia Premium)',
        type: 'beat',
        buyerName: 'Eduardo Blanco',
        producerId: 'p3',
        producerName: 'Havana Vibes',
        amount: 45,
        currency: 'MLC',
        method: 'EnZona',
        status: 'approved',
        date: 'Hace 5 horas',
        timestamp: now - 5 * 60 * 60 * 1000
      },
      {
        id: 'TX-8380',
        beatTitle: 'Neon Horizon (Licencia Básica)',
        type: 'beat',
        buyerName: 'Marco Polo',
        producerId: 'p2',
        producerName: 'Flow Habano',
        amount: 600,
        currency: 'CUP',
        method: 'EnZona',
        status: 'approved',
        date: 'Ayer, 08:34 PM',
        timestamp: now - 18 * 60 * 60 * 1000
      },
      {
        id: 'TX-8371',
        beatTitle: 'Plaza de la Revolución Drill instrumentals',
        type: 'beat',
        buyerName: 'Chacal de Cuba',
        producerId: 'p1',
        producerName: 'Elite Beats',
        amount: 15,
        currency: 'USDT',
        method: 'QvaPay',
        status: 'approved',
        date: 'Hace 2 días',
        timestamp: now - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8366',
        beatTitle: 'La Clave Secreta Reggaetón Starter Pack',
        type: 'sound_library',
        buyerName: 'Maikel Almira',
        producerId: 'p1',
        producerName: 'Elite Beats',
        amount: 1200,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 5 días',
        timestamp: now - 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8360',
        beatTitle: 'Reggaetón Repartero Extremo Beat',
        type: 'beat',
        buyerName: 'Yasel El Primario',
        producerId: 'p2',
        producerName: 'Flow Habano',
        amount: 1200,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'rejected',
        date: 'Hace 6 días',
        timestamp: now - 6 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8350',
        beatTitle: 'Havana Bass Essential Toolkit Vol 1',
        type: 'sound_library',
        buyerName: 'Randy Malecón',
        producerId: 'p3',
        producerName: 'Havana Vibes',
        amount: 2500,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 12 días',
        timestamp: now - 12 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8342',
        beatTitle: 'Varadero Blue Loop Kit',
        type: 'sound_library',
        buyerName: 'Christian Delgado',
        producerId: 'p2',
        producerName: 'Flow Habano',
        amount: 800,
        currency: 'CUP',
        method: 'EnZona',
        status: 'approved',
        date: 'Hace 19 días',
        timestamp: now - 19 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8311',
        beatTitle: 'Street Lights (Lo-fi Instrumentals)',
        type: 'beat',
        buyerName: 'Yusniel Rap',
        producerId: 'p2',
        producerName: 'Flow Habano',
        amount: 750,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 28 días',
        timestamp: now - 28 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8302',
        beatTitle: 'Synthwave Eclipse Toolkit',
        type: 'sound_library',
        buyerName: 'Carlos M.',
        producerId: 'p3',
        producerName: 'Havana Vibes',
        amount: 35,
        currency: 'USDT',
        method: 'Tarjeta Clásica',
        status: 'approved',
        date: 'Hace 35 días',
        timestamp: now - 35 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8299',
        beatTitle: 'Sublow Reparto Basses Vol 3',
        type: 'sound_library',
        buyerName: 'Daniel de Centro Habana',
        producerId: 'p3',
        producerName: 'Havana Vibes',
        amount: 1800,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 45 días',
        timestamp: now - 45 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8250',
        beatTitle: 'Cubacoustic Guitar Riffs vol 2',
        type: 'sound_library',
        buyerName: 'Jose Alejandro',
        producerId: 'p1',
        producerName: 'Elite Beats',
        amount: 2100,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 3 meses',
        timestamp: now - 90 * 24 * 60 * 60 * 1000
      },
      {
        id: 'TX-8100',
        beatTitle: 'Sunset Boulevard Commercial Beat',
        type: 'beat',
        buyerName: 'Dayami Cuba',
        producerId: 'p3',
        producerName: 'Havana Vibes',
        amount: 3500,
        currency: 'CUP',
        method: 'Transfermovil',
        status: 'approved',
        date: 'Hace 5 meses',
        timestamp: now - 150 * 24 * 60 * 60 * 1000
      }
    ];
  });

  // Combine custom state with dynamic real orders to support full integration
  const allTransactions = useMemo(() => {
    // Only fetch orders that are approved
    const approvedLiveOrders = orders.filter(o => o.status === 'approved');
    
    // Map them to the same Transaction structure
    const liveTxs: Transaction[] = approvedLiveOrders.map(o => {
      const prod = verifiedProducersTask.find(p => p.id === o.producerId);
      return {
        id: o.id,
        beatTitle: o.beatTitle,
        type: 'beat',
        buyerName: o.buyerName || 'Comprador',
        producerId: o.producerId,
        producerName: prod?.name || o.producerName || 'Productor',
        amount: o.amount,
        currency: o.currency as any,
        method: (o.method === 'Transfermovil' ? 'Transfermovil' : (o.method === 'EnZona' ? 'EnZona' : 'QvaPay')) as any,
        status: 'approved',
        date: o.date || 'Reciente',
        timestamp: Date.now()
      };
    });

    // Merge them and filter out duplicate IDs to avoid double listing
    const uniqueLiveTxs = liveTxs.filter(ltx => !transactions.some(t => t.id === ltx.id));
    return [...uniqueLiveTxs, ...transactions];
  }, [transactions, orders, verifiedProducersTask]);

  // Timeframe calculation filters
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    return allTransactions.filter(tx => {
      // 1. Selector de productor
      if (selectedProducerId !== 'all' && tx.producerId !== selectedProducerId) {
        return false;
      }

      // 2. Selector de búsqueda textual (comprador, producto, productor, id)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          tx.id.toLowerCase().includes(query) ||
          tx.beatTitle.toLowerCase().includes(query) ||
          tx.buyerName.toLowerCase().includes(query) ||
          tx.producerName.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 3. Selector de ventana de tiempo
      const diffMs = now - tx.timestamp;
      if (selectedTimeframe === 'diarias') {
        // En las últimas 24 horas
        return diffMs <= 24 * 60 * 60 * 1000;
      } else if (selectedTimeframe === 'semanales') {
        // En los últimos 7 días
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      } else if (selectedTimeframe === 'mensuales') {
        // En los últimos 30 días
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      } else if (selectedTimeframe === 'semestrales') {
        // En los últimos 180 días (6 meses)
        return diffMs <= 180 * 24 * 60 * 60 * 1000;
      }

      // 'recientes' / todas las transacciones sin límite
      return true;
    });
  }, [transactions, selectedProducerId, selectedTimeframe, searchQuery]);

  // Aggregate Metrics based on the filtered records (only counting approved ones for revenue metrics, or all for quantity)
  const metrics = useMemo(() => {
    let salesCUP = 0;
    let salesClasica = 0;
    let salesMLC = 0;
    let salesQvaPay = 0;
    let beatCount = 0;
    let libCount = 0;

    filteredTransactions.forEach(tx => {
      if (tx.status === 'approved') {
        if (tx.method === 'Tarjeta Clásica') {
          salesClasica += tx.amount;
        } else if (tx.method === 'QvaPay') {
          salesQvaPay += tx.amount;
        } else if (tx.currency === 'MLC') {
          salesMLC += tx.amount;
        } else if (tx.currency === 'CUP') {
          salesCUP += tx.amount;
        }
      }

      if (tx.type === 'beat') {
        beatCount++;
      } else if (tx.type === 'sound_library') {
        libCount++;
      }
    });

    return {
      salesCUP,
      salesClasica,
      salesMLC,
      salesQvaPay,
      beatCount,
      libCount,
      totalCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Simulation handler with randomly generated statuses (Approved, Pending, Rejected)
  const handleSimulateSale = () => {
    const randomProducer = producers.length > 0 
      ? producers[Math.floor(Math.random() * producers.length)] 
      : { id: 'p2', artistName: 'Flow Habano' };

    const sampleBeatsAndLibs = [
      { title: 'Reggaetón Repartero Extremo Beat', type: 'beat' as const, price: 1200 },
      { title: 'Sublows & Reparto Drums Toolkit Vol. 4', type: 'sound_library' as const, price: 1800 },
      { title: 'Havana Golden Strings Loops', type: 'sound_library' as const, price: 950 },
      { title: 'Amnesia Trap Melodies (Licencia Exclusiva)', type: 'beat' as const, price: 3500 },
      { title: 'Dembow Clásico Cubatón Instrumentos', type: 'beat' as const, price: 600 },
      { title: 'Centro Habana Retro Brass Loops', type: 'sound_library' as const, price: 1500 }
    ];

    const chosenProduct = sampleBeatsAndLibs[Math.floor(Math.random() * sampleBeatsAndLibs.length)];
    const buyers = ['Yoanly Rap', 'Alain El Kamikaze', 'Melisa Reggae Cuba', 'Estudio La Aldea', 'Dany Beats Cuba', 'Yolanda Rapera'];
    const chosenBuyer = buyers[Math.floor(Math.random() * buyers.length)];
    
    const gateways: Array<'Transfermovil' | 'EnZona' | 'QvaPay' | 'Tarjeta Clásica'> = ['Transfermovil', 'EnZona', 'QvaPay', 'Tarjeta Clásica'];
    const chosenGateway = gateways[Math.floor(Math.random() * gateways.length)];
    
    // Assign typical currency matching the gateway
    let currency: 'CUP' | 'MLC' | 'USDT' = 'CUP';
    if (chosenGateway === 'QvaPay') {
      currency = 'USDT';
    } else if (chosenGateway === 'Tarjeta Clásica') {
      currency = 'USDT';
    } else if (chosenGateway === 'EnZona' && Math.random() > 0.5) {
      currency = 'MLC';
    }

    const amount = (currency === 'USDT' || currency === 'MLC') 
      ? Math.round(chosenProduct.price / 120) 
      : chosenProduct.price;

    // Randomize status for richer testing variety
    const statusRand = Math.random();
    const status: 'approved' | 'pending' | 'rejected' = 
      statusRand < 0.70 ? 'approved' : statusRand < 0.88 ? 'pending' : 'rejected';

    const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: Transaction = {
      id: txId,
      beatTitle: chosenProduct.title,
      type: chosenProduct.type,
      buyerName: chosenBuyer,
      producerId: randomProducer.id,
      producerName: randomProducer.artistName || randomProducer.name || 'Productor',
      amount,
      currency,
      method: chosenGateway,
      status,
      date: 'Hace unos instantes',
      timestamp: Date.now()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Send notifications & Toast alerts
    const statusLabels = {
      approved: 'Aprobada',
      pending: 'Pendiente de Confirmación',
      rejected: 'Declinada/Rechazada'
    };

    addAdminNotification(
      'beat_sold',
      `Transacción Registrada (${statusLabels[status]})`,
      `El productor "${newTx.producerName}" registró una venta de "${newTx.beatTitle}" por un monto de ${newTx.amount} ${newTx.currency} vía ${newTx.method}. Estado: ${statusLabels[status].toUpperCase()}`
    );

    addToast(`¡Simulación exitosa! Transacción ${txId} en estado [${status.toUpperCase()}] registrada para ${newTx.producerName}.`, 'success');
  };

  // Obtain rich decorative cover images for products to display inside detailed modal
  const getProductImage = (tx: Transaction) => {
    if (tx.type === 'beat') {
      // Abstract music production / vinyl photos
      return tx.id.charCodeAt(tx.id.length - 1) % 2 === 0 
        ? "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop";
    } else {
      // Synthesizer / Studio hardware photos
      return tx.id.charCodeAt(tx.id.length - 1) % 2 === 0 
        ? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=600&auto=format&fit=crop";
    }
  };

  // Obtain formatted static placeholder license for terms and agreement box
  const getLicenseDetails = (tx: Transaction) => {
    if (tx.type === 'beat') {
      const isExclusive = tx.beatTitle.toLowerCase().includes('exclusiva');
      if (isExclusive) {
        return {
          title: "LICENCIA EXCLUSIVA - PROPIEDAD TOTAL",
          terms: "Traspaso definitivo de propiedad comercial sobre los archivos maestros (WAV + Stems/Pistas). Otorga derechos exclusivos mundiales ilimitados de distribución, reproducción, radiodifusión cinematográfica, y monetización en plataformas de streaming (Spotify, YouTube, Apple Music) sin regalías secundarias debidas al productor."
        };
      }
      return {
        title: "LICENCIA COMERCIAL LIMITADA (ROYALTY-FREE)",
        terms: "Concede el derecho no-exclusivo para grabar vocales, distribuir una única producción musical independiente, y monetizar comercialmente hasta un volumen máximo de 50,000 reproducciones totales. Toda explotación secundaria ulterior requiere de adición o mejora de la licencia inicial con el productor."
      };
    } else {
      return {
        title: "LICENCIA DE USO LIBRE DE REGALÍAS (ROYALTY-FREE)",
        terms: "Concesión ilimitada para integrar muestras pregrabadas (samples, loops y kits de percusión de reparto y reggaetón) en composiciones musicales derivadas. Permite la distribución, reclamación de derechos de autor y publicación en cualquier plataforma discográfica comercial sin obligación de abonar regalías al creador de la librería."
      };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH TITLE AND ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-surface/30 p-6 rounded-2xl border border-brand-border/15">
        <div className="text-left">
          <div className="flex items-center gap-2 text-[#7F77DD] mb-1.5">
            <span className="p-1 px-2.5 rounded bg-[#534AB7]/10 text-xs font-mono font-bold tracking-widest uppercase">
              Auditoría y Fiscalización Comercial
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Receipt className="text-[#7F77DD]" size={24} />
            Transacciones de la Plataforma
          </h1>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xl leading-relaxed">
            Consola central de supervisión y control para el flujo transaccional. Revise, filtre, verifique los estados de cobro y visualice los acuerdos de licencia asignados por los productores.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSimulateSale}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-sans tracking-wide self-start sm:self-center transition-all bg-gradient-to-r from-[#534AB7] to-[#7F77DD] hover:from-[#6258C7] hover:to-[#8E86E7] text-white py-2.5 px-4 rounded-xl shadow-md shadow-[#534AB7]/25 border border-white/5 active:scale-95 flex-shrink-0"
        >
          <Sparkles size={14} className="animate-pulse" />
          Simular Transacción Aleatoria
        </Button>
      </div>

      {/* METRICS DASHBOARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: CUP Income */}
        <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl transition-all group-hover:bg-emerald-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono block">VOLUMEN EN CUP</span>
              <h3 className="text-lg md:text-xl font-black text-emerald-400 font-mono tracking-tight">
                ${metrics.salesCUP.toLocaleString()} CUP
              </h3>
            </div>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign size={16} />
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 font-medium">BPA/BANDEC (Aprobadas)</p>
        </div>

        {/* Metric 2: Tarjeta Clásica Income */}
        <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl transition-all group-hover:bg-indigo-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono block">VOLUMEN EN CLÁSICA</span>
              <h3 className="text-lg md:text-xl font-black text-indigo-400 font-mono tracking-tight">
                ${metrics.salesClasica.toLocaleString()} USD
              </h3>
            </div>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CreditCard size={16} />
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 font-medium">Tarjeta Prepago (Aprobadas)</p>
        </div>

        {/* Metric 3: MLC Income */}
        <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full filter blur-xl transition-all group-hover:bg-teal-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono block">VOLUMEN EN MLC</span>
              <h3 className="text-lg md:text-xl font-black text-teal-400 font-mono tracking-tight">
                ${metrics.salesMLC.toLocaleString()} MLC
              </h3>
            </div>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShoppingBag size={16} />
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 font-medium">Bancos Cubanos (Aprobadas)</p>
        </div>

        {/* Metric 4: QvaPay Income */}
        <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl transition-all group-hover:bg-blue-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono block">VOLUMEN EN QVAPAY</span>
              <h3 className="text-lg md:text-xl font-black text-blue-400 font-mono tracking-tight">
                ${metrics.salesQvaPay.toLocaleString()} USDT
              </h3>
            </div>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 font-medium">Pasarela Cripto (Aprobadas)</p>
        </div>

      </div>

      {/* FILTER CONTROLS BAR SECTION */}
      <div className="bg-brand-surface/25 p-4 rounded-2xl border border-brand-border/15 space-y-4">
        
        {/* ROW 1: Producer search and dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            
            {/* SEARCH BOX CONTROLLER */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por comprador, ID de transacción, producto, productor..."
                className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border bg-brand-surface border-brand-border/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#7F77DD] font-sans"
              />
            </div>

            {/* PRODUCER SELECTOR DROPDOWN */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Users size={14} />
              </span>
              <select
                value={selectedProducerId}
                onChange={(e) => setSelectedProducerId(e.target.value)}
                className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border bg-brand-surface border-brand-border/20 text-white focus:outline-none focus:border-[#7F77DD] cursor-pointer appearance-none"
              >
                <option value="all">Filtro: Todos los productores</option>
                {producers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.artistName || p.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="text-gray-400 text-xs font-semibold pr-2 text-left self-start sm:self-auto font-mono">
            {filteredTransactions.length} registros hallados
          </div>
        </div>

        {/* ROW 2: Chrono tabs pills (Recientes, Diaria, Semanal, Mensual, Semestral) */}
        <div className="border-t border-brand-border/10 pt-3 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-mono mr-2 flex items-center gap-1">
              <Calendar size={12} className="text-gray-500" /> Rango de Consulta:
            </span>
            <div className="inline-flex p-1 bg-brand-surface rounded-xl border border-brand-border/15 flex-wrap gap-1">
              {(['recientes', 'diarias', 'semanales', 'mensuales', 'semestrales'] as const).map((timeframe) => {
                const isActive = selectedTimeframe === timeframe;
                const label = timeframe === 'recientes' ? 'Todos/Recientes' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1);
                return (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`text-[10.5px] font-bold px-3 py-1.5 rounded-lg border-0 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#534AB7] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Clear filters */}
          {(searchQuery || selectedProducerId !== 'all' || selectedTimeframe !== 'recientes') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedProducerId('all');
                setSelectedTimeframe('recientes');
                addToast('Filtros comerciales reestablecidos con éxito', 'info');
              }}
              className="text-[10.5px] font-bold text-red-400 hover:text-red-300 transition-colors bg-transparent border-0 cursor-pointer p-0 underline"
            >
              Restablecer filtros
            </button>
          )}
        </div>

      </div>

      {/* TRANSACTIONAL RECORDS DATAGRID SECTION */}
      <div className="bg-[#1C1C2E]/40 rounded-2xl border border-brand-border/15 overflow-hidden">
        
        {/* Title and table header overlay */}
        <div className="p-4 bg-white/5 border-b border-brand-border/15 flex justify-between items-center text-left">
          <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-pulse" />
            Ventas Musicales y Acreditaciones de Pago
          </h4>
          <span className="text-[9px] font-mono text-gray-500">
            D'Cuban Beats Ledger Core • CUP/USDT
          </span>
        </div>

        {/* Real Table */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <AlertCircle size={32} className="mx-auto text-gray-600 opacity-60" />
            <p className="text-xs font-semibold text-gray-300">No se encontraron transacciones registradas</p>
            <p className="text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed">
              Prueba cambiando la configuración de rango de consulta, filtrando por otro productor o haciendo clic en el botón superior para simular una nueva venta.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11.5px] min-w-[900px] border-collapse table-fixed">
              <thead>
                <tr className="bg-white/[0.02] text-gray-400 border-b border-brand-border/10 uppercase pb-2 select-none">
                  <th className="py-4 pl-4 pr-2 text-[10px] tracking-wider font-bold text-left w-[24%]">Producto</th>
                  <th className="py-4 px-2 text-[10px] tracking-wider font-bold text-left w-[15%]">Productor</th>
                  <th className="py-4 px-2 text-[10px] tracking-wider font-bold text-center w-[10%]">Precio</th>
                  <th className="py-4 px-2 text-[10px] tracking-wider font-bold text-center w-[15%]">Fecha y Hora</th>
                  <th className="py-4 px-2 text-[10px] tracking-wider font-bold text-center w-[13%]">Estado</th>
                  <th className="py-4 pl-2 pr-4 text-[10px] tracking-wider font-bold text-center w-[23%]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredTransactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.04] transition-colors border-l-2 border-transparent hover:border-[#7F77DD]">
                      
                      {/* Producto */}
                      <td className="py-4 pl-4 pr-2 font-sans font-bold text-white truncate" title={tx.beatTitle}>
                        {tx.beatTitle}
                      </td>

                      {/* Productor */}
                      <td className="py-4 px-2 font-sans truncate" title={tx.producerName}>
                        <span className="text-gray-250 font-semibold block truncate">{tx.producerName}</span>
                        <span className="text-[9px] text-gray-500 font-mono block truncate">ID: {tx.producerId}</span>
                      </td>

                      {/* Precio */}
                      <td className="py-4 px-2 text-center font-mono font-extrabold text-[#53E0A3] text-xs">
                        ${tx.amount.toLocaleString()} {tx.currency}
                      </td>

                      {/* Fecha y Hora */}
                      <td className="py-4 px-2 text-center text-gray-400 text-[10.5px] font-mono truncate" title={tx.date}>
                        {tx.date}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-2 text-center">
                        {tx.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Aprobado
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-extrabold border border-amber-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pendiente
                          </span>
                        )}
                        {tx.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-extrabold border border-red-500/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Rechazado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-2 pl-2 pr-1 text-center">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="inline-flex items-center gap-1 bg-[#1E1E38] hover:bg-[#2B2B4E]/80 text-[#9B94EC] hover:text-white px-2 py-1.5 rounded-xl border border-brand-border/20 text-[10px] font-bold tracking-wide transition-all cursor-pointer hover:shadow-sm"
                        >
                          <Eye size={12} />
                          Ver Detalles
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* TRANSACTION DETAILED INSTANT MODAL */}
      {selectedTx && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all animate-in fade-in duration-200"
          id="cb-tx-modal"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'cb-tx-modal') {
              setSelectedTx(null);
            }
          }}
        >
          <div className="bg-[#131322] border border-brand-border/40 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-200">
            
            {/* Header decor bar color according to state */}
            <div className={`h-2.5 w-full ${
              selectedTx.status === 'approved' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : selectedTx.status === 'pending'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-500 to-rose-400'
            }`} />

            {/* Modal Title Banner and Close Button */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border/15">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#7F77DD]/10 rounded-xl text-[#7F77DD]">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest font-mono">
                    Comprobante Comercial
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">ID: {selectedTx.id} • D'Cuban Ledger</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 px-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 border-0 bg-transparent cursor-pointer transition-colors"
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Row 1: Product Preview banner */}
              <div className="flex gap-4 items-center bg-[#1C1C2E]/40 p-3 rounded-2xl border border-brand-border/10">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black relative border border-brand-border/15">
                  <img 
                    src={getProductImage(selectedTx)} 
                    alt={selectedTx.beatTitle} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-block mb-1 border ${
                    selectedTx.type === 'beat' 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedTx.type === 'beat' ? 'Instrumental / Beat' : 'Librería de Sonidos'}
                  </span>
                  <h4 className="text-xs font-extrabold text-white truncate pr-2 font-sans leading-snug">
                    {selectedTx.beatTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">Asignado por: <span className="text-white font-semibold">{selectedTx.producerName}</span></p>
                </div>
              </div>

              {/* Row 2: Status Indicator Panel */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                selectedTx.status === 'approved'
                  ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400'
                  : selectedTx.status === 'pending'
                  ? 'bg-amber-500/5 border-amber-500/15 text-amber-400'
                  : 'bg-red-500/5 border-red-500/15 text-red-500'
              }`}>
                <div className={`p-2.5 rounded-full ${
                  selectedTx.status === 'approved'
                    ? 'bg-emerald-500/10'
                    : selectedTx.status === 'pending'
                    ? 'bg-amber-500/10 animate-pulse'
                    : 'bg-red-500/10'
                }`}>
                  {selectedTx.status === 'approved' && <Check size={18} />}
                  {selectedTx.status === 'pending' && <Clock size={18} />}
                  {selectedTx.status === 'rejected' && <Ban size={18} />}
                </div>
                <div>
                  <span className="text-[9px] font-bold font-mono tracking-wider block uppercase opacity-80">ESTADO COMERCIAL</span>
                  <h5 className="text-xs font-black uppercase tracking-wider font-sans mt-0.5 text-white">
                    {selectedTx.status === 'approved' && 'TRANSACCIÓN APROBADA & LIQUIDADA'}
                    {selectedTx.status === 'pending' && 'PENDIENTE DE VERIFICACIÓN DE FONDOS'}
                    {selectedTx.status === 'rejected' && 'TRANSACCIÓN DECLINADA / RECHAZADA'}
                  </h5>
                  <p className="text-[10.5px] text-gray-400 mt-1 leading-normal">
                    {selectedTx.status === 'approved' && 'La pasarela de pago acreditó y liquidó los fondos correspondientes en la billetera virtual del productor.'}
                    {selectedTx.status === 'pending' && 'El pago está en proceso de adición por la pasarela de origen. Pendiente de confirmación administrativa.'}
                    {selectedTx.status === 'rejected' && 'La transacción fue denegada por inconsistencia de datos o saldo insuficiente en el origen.'}
                  </p>
                </div>
              </div>

              {/* Row 3: Technical Receipt Details Section divided into Grid */}
              <div className="space-y-3 bg-[#1C1C2E]/20 p-4 rounded-2xl border border-brand-border/10">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono block border-b border-brand-border/10 pb-1.5 border-dashed">
                  Parámetros Técnicos y de Auditoría
                </span>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 font-mono text-[11px]">
                  
                  {/* Comprador / Cliente */}
                  <div>
                    <span className="text-gray-500 text-[10px] block font-semibold uppercase leading-none">Artista Comprador:</span>
                    <strong className="text-gray-200 block font-sans text-xs mt-1">{selectedTx.buyerName}</strong>
                  </div>

                  {/* Productor del producto */}
                  <div>
                    <span className="text-gray-500 text-[10px] block font-semibold uppercase leading-none">Productor Enlazado:</span>
                    <strong className="text-gray-200 block font-sans text-xs mt-1">{selectedTx.producerName}</strong>
                  </div>

                  {/* Pasarela Empleada */}
                  <div>
                    <span className="text-gray-500 text-[10px] block font-semibold uppercase leading-none">Pasarela Empleada:</span>
                    <strong className="text-[#9B94EC] block font-semibold text-xs mt-1">
                      {selectedTx.method === 'Transfermovil' ? 'Transfermóvil (BANMET)' : selectedTx.method}
                    </strong>
                  </div>

                  {/* Fecha y Hora de Compra */}
                  <div>
                    <span className="text-gray-500 text-[10px] block font-semibold uppercase leading-none">Fecha de Emisión:</span>
                    <strong className="text-gray-300 block text-xs mt-1">{selectedTx.date}</strong>
                  </div>

                </div>

                {/* Big Price Callout inside metrics */}
                <div className="mt-4 pt-3.5 border-t border-brand-border/10 border-dashed flex justify-between items-center">
                  <span className="text-gray-400 text-[10.5px] font-bold font-mono">TOTAL LIQUIDADO EN CUENTA:</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    ${selectedTx.amount.toLocaleString()}.00 {selectedTx.currency}
                  </span>
                </div>
              </div>

              {/* Row 3.5: Visual Comprobante / Screenshot Mockup */}
              <div className="space-y-3">
                <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono block">
                  📷 Foto del Comprobante (Cargada por el Cliente)
                </span>
                
                <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1E38] to-[#121226] p-5 rounded-2xl border border-[#7F77DD]/35 shadow-lg select-none">
                  {/* Digital Watermark overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center rotate-12 select-none">
                    <span className="text-white text-5xl font-black font-sans leading-none tracking-widest uppercase">
                      D'CUBAN BEATS
                    </span>
                  </div>

                  {/* Receipt Box Header representing bank platform style */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedTx.method === 'QvaPay' ? 'bg-blue-400' : selectedTx.method === 'EnZona' ? 'bg-[#53E0A3]' : 'bg-[#EF4444]'
                      }`} />
                      <span className="text-[10px] uppercase font-bold text-gray-300 font-mono tracking-wide">
                        {selectedTx.method === 'QvaPay' ? 'Comprobante QvaPay' : selectedTx.method === 'EnZona' ? 'Ticket EnZona Cuba' : selectedTx.method === 'Tarjeta Clásica' ? 'Tarjeta Clásica MIR / MLC' : 'Transfermóvil (BPA/BANDEC)'}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold ${
                      selectedTx.status === 'approved' ? 'text-emerald-400' : selectedTx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {selectedTx.status === 'approved' ? 'Operación Exitosa' : selectedTx.status === 'pending' ? 'Operación Pendiente' : 'Operación Denegada'}
                    </span>
                  </div>

                  {/* Inner Receipt contents */}
                  <div className="py-4 space-y-3.5 relative z-10">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Monto de Transferencia</p>
                      <h3 className="text-xl font-black text-white font-mono tracking-tight">
                        ${selectedTx.amount.toLocaleString()}.00 {selectedTx.currency}
                      </h3>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold uppercase font-mono tracking-wider mt-1.5 ${
                        selectedTx.status === 'approved' 
                          ? 'bg-[#53E0A3]/10 text-[#53E0A3] border border-[#53E0A3]/20'
                          : selectedTx.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {selectedTx.status === 'approved' && (
                          <>
                            <Check size={10} strokeWidth={3} className="text-[#53E0A3]" /> Acreditación Validada
                          </>
                        )}
                        {selectedTx.status === 'pending' && (
                          <>
                            <Clock size={10} strokeWidth={3} className="text-amber-400" /> Espera de Conciliación
                          </>
                        )}
                        {selectedTx.status === 'rejected' && (
                          <>
                            <Ban size={10} strokeWidth={3} className="text-red-400" /> Fondos Rechazados
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dotted separator line */}
                    <div className="border-t border-dashed border-white/10 my-3" />

                    {/* Transaction metadata within voucher picture */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-300">
                      <div>
                        <span className="text-gray-500 block leading-none text-[8.5px] uppercase mb-1">ID Transacción:</span>
                        <strong className="text-[#7F77DD] text-xs block font-mono font-bold">{selectedTx.id}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block leading-none text-[8.5px] uppercase mb-1">Fecha y Hora:</span>
                        <span className="text-gray-200 block text-[9.5px]">{selectedTx.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block leading-none text-[8.5px] uppercase mb-1">Emisor (Cliente):</span>
                        <span className="text-gray-250 block font-sans font-bold truncate">{selectedTx.buyerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block leading-none text-[8.5px] uppercase mb-1">Receptor (Comercio):</span>
                        <span className="text-gray-250 block font-sans font-bold truncate">{selectedTx.producerName}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[9px] font-mono text-gray-500">
                      <span>CUBAN-BEATS-PRO-LEDGER</span>
                      <span>REF-9385-CU</span>
                    </div>
                  </div>

                  {/* Corner security notches to resemble a real clipped coupon/voucher paper */}
                  <div className="absolute bottom-1/2 -left-1.5 w-3 h-3 rounded-full bg-[#131122] border-r border-[#7F77DD]/25 transform translate-y-1/2" />
                  <div className="absolute bottom-1/2 -right-1.5 w-3 h-3 rounded-full bg-[#131122] border-l border-[#7F77DD]/25 transform translate-y-1/2" />
                </div>
              </div>

              {/* Row 4: License and Agreement details */}
              <div className="p-4 bg-[#7F77DD]/5 rounded-2xl border border-[#7F77DD]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#9B94EC] border-b border-[#7F77DD]/10 pb-1.5">
                  <FileText size={15} />
                  <span className="text-[9.5px] font-black uppercase tracking-wider font-mono">
                    {getLicenseDetails(selectedTx).title}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 font-sans leading-relaxed">
                  {getLicenseDetails(selectedTx).terms}
                </p>
                <div className="text-[9px] text-gray-500 italic mt-1 font-mono">
                  Otorgada y autorizada digitalmente por {selectedTx.producerName} bajo autorización de D'Cuban Beats Ledger Core.
                </div>
              </div>

            </div>

            {/* Bottom Panel Actions */}
            <div className="p-4 bg-[#141423] border-t border-brand-border/15 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTx(null)}
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                Cerrar Comprobante
              </Button>
              {selectedTx.status === 'approved' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    addToast(`¡Factura de la transacción ${selectedTx.id} descargada exitosamente en formato PDF!`, 'success');
                  }}
                  className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowUpRight size={13} strokeWidth={3} />
                  Descargar Factura PDF
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
