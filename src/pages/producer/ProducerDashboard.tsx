import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { 
  DollarSign, Music, Play, AlertOctagon, ArrowUpRight, 
  Sparkles, CheckCircle2, TrendingUp, Inbox, Users, 
  Trophy, Calendar, RefreshCw, Landmark, Wallet, Search, SlidersHorizontal,
  Eye, Send, MessageSquare
} from 'lucide-react';

export const ProducerDashboard: React.FC = () => {
  const { 
    user, beats, orders, navigateTo, addToast,
    producerNotifications = [], markProducerNotificationRead, markAllProducerNotificationsRead, clearProducerNotifications,
    verifiedProducersTask = [],
    simulatedEmails = [], markSimulatedEmailRead, clearSimulatedEmails,
    directMessages = [], sendDirectMessage, markMessagesAsRead,
    exchangeRates
  } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [earningsCurrency, setEarningsCurrency] = useState<'CUP' | 'MLC' | 'SQP' | 'CLASICA'>('CUP');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'escritorio' | 'seguidores' | 'chat' | 'correos'>('escritorio');
  const [followerSearch, setFollowerSearch] = useState('');
  const [followerPlanFilter, setFollowerPlanFilter] = useState('all');

  const totalUnreadChatMessages = useMemo(() => {
    return directMessages.filter(
      m => m.receiverId === user?.id && !m.read
    ).length;
  }, [directMessages, user?.id]);

  // Transactions filters matching AdminTransactions panel style
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'beat' | 'sound_library'>('all');
  const [txTimeframeFilter, setTxTimeframeFilter] = useState<'recientes' | 'diarias' | 'semanales' | 'mensuales' | 'semestrales'>('recientes');

  // Producer Direct Messaging (Chat)
  const [selectedChatArtistId, setSelectedChatArtistId] = useState<string>('a1');
  const [producerChatInput, setProducerChatInput] = useState('');
  const producerChatContainerRef = useRef<HTMLDivElement>(null);

  const artistListForChat = useMemo(() => {
    return [
      {
        id: 'a1',
        name: 'Yoandri García',
        artistName: 'Yomil Oficial',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        bio: 'Cantautor de música urbana del reparto de La Habana. Buscando los mejores beats.',
        provincia: 'La Habana'
      },
      {
        id: 'a2',
        name: 'Dany Oramas',
        artistName: 'Chacal de Cuba',
        avatarUrl: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=200&auto=format&fit=crop',
        bio: 'El demonio de la fama, cantante internacional de reggaetón y reparto cubano.',
        provincia: 'La Habana'
      },
      {
        id: 'a3',
        name: 'Danay Suárez',
        artistName: 'Danay Suárez',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
        bio: 'Cantante lírica, hip-hop, jazz, y alternativa.',
        provincia: 'Artemisa'
      }
    ];
  }, []);

  const activeChatArtist = useMemo(() => {
    return artistListForChat.find(a => a.id === selectedChatArtistId) || artistListForChat[0];
  }, [artistListForChat, selectedChatArtistId]);

  // Mark incoming messages from selected artist as read
  useEffect(() => {
    if (activeTab === 'chat' && activeChatArtist && user) {
      markMessagesAsRead(activeChatArtist.id, user.id);
    }
  }, [activeTab, activeChatArtist, user?.id, directMessages.length, markMessagesAsRead]);

  // Scroll to bottom
  useEffect(() => {
    if (producerChatContainerRef.current) {
      producerChatContainerRef.current.scrollTop = producerChatContainerRef.current.scrollHeight;
    }
  }, [directMessages, selectedChatArtistId]);

  const handleSendProducerChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!producerChatInput.trim() || !activeChatArtist || !user) return;

    sendDirectMessage(
      user.id,
      user.artistName || user.fullName || user.name || 'Productor',
      'producer',
      activeChatArtist.id,
      activeChatArtist.artistName || activeChatArtist.name || 'Artista',
      'client',
      producerChatInput.trim()
    );
    setProducerChatInput('');
  };

  // Follower count helper based on stable ID hashing
  const myFollowerCount = useMemo(() => {
    const pId = user?.id || 'p2';
    let hash = 0;
    for (let i = 0; i < pId.length; i++) {
      hash += pId.charCodeAt(i);
    }
    const baseFollowers = 150 + (hash % 420);
    
    try {
      const saved = localStorage.getItem('followed_producers_map_v1');
      const followedList: string[] = saved ? JSON.parse(saved) : [];
      if (followedList.includes(pId)) {
        return baseFollowers + 1;
      }
    } catch {}
    
    return baseFollowers;
  }, [user]);

  // Retrieve stable artist list from context
  const followerArtists = useMemo(() => {
    return verifiedProducersTask.filter(u => u.role === 'client');
  }, [verifiedProducersTask]);

  const filteredFollowerArtists = useMemo(() => {
    return followerArtists.filter(artist => {
      const nameMatch = (artist.name || '').toLowerCase().includes(followerSearch.toLowerCase()) ||
                        (artist.artistName || '').toLowerCase().includes(followerSearch.toLowerCase()) ||
                        (artist.instagram || '').toLowerCase().includes(followerSearch.toLowerCase()) ||
                        (artist.email || '').toLowerCase().includes(followerSearch.toLowerCase());
      
      const planMatch = followerPlanFilter === 'all' || artist.plan === followerPlanFilter;
      
      return nameMatch && planMatch;
    });
  }, [followerArtists, followerSearch, followerPlanFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const isVerified = user?.verified;

  // Filter beats belonging to this producer
  const myBeats = useMemo(() => {
    return beats.filter(b => b.producerId === 'p2' || b.producerId === 'carlos_producer');
  }, [beats]);

  // Filter sales/orders belonging to this producer
  const myOrders = useMemo(() => {
    return orders.filter(o => o.producerId === 'p2' || o.producerId === 'carlos_producer');
  }, [orders]);

  // Combine live approved orders with beautiful seeds to represent solid history of beats and libraries
  const allTransactions = useMemo(() => {
    const lives = myOrders.filter(o => o.status === 'approved');
    const now = Date.now();
 
    // High-fidelity historical seeds for both beats and libraries
    const historic = [
      {
        id: 'CB-HIST-41',
        beatTitle: 'Malecón Sunset',
        buyerName: 'Yomil Oficial',
        buyerEmail: 'yomil.reparto@yahoo.com',
        buyerPhone: '+53 5 289 4012',
        amount: 4500,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '12 Jun 2026',
        hour: '16:45',
        timestamp: now - 8 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Exclusiva',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8389',
        beatTitle: 'Flow Repartero Vol. 2',
        buyerName: 'Yoandri García',
        buyerEmail: 'yoandrig7@gmail.com',
        buyerPhone: '+53 5 331 9904',
        amount: 1500,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '20 Jun 2026',
        hour: '12:15',
        timestamp: now - 3 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-40',
        beatTitle: 'Dembow King',
        buyerName: 'Chacal de Cuba',
        buyerEmail: 'chacalito.beats@nauta.cu',
        buyerPhone: '+53 5 440 1289',
        amount: 6500,
        currency: 'CUP' as const,
        method: 'QvaPay',
        date: '08 Jun 2026',
        hour: '21:05',
        timestamp: now - 12 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Exclusiva',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-39',
        beatTitle: 'Callejera Flow',
        buyerName: 'El Micha Oficial',
        buyerEmail: 'el_micha_flow@reparto.com',
        buyerPhone: '+53 5 125 3840',
        amount: 750,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '05 Jun 2026',
        hour: '10:30',
        timestamp: now - 15 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Básica',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8342',
        beatTitle: 'Varadero Blue Loop Kit',
        buyerName: 'Christian Delgado',
        buyerEmail: 'chris.delgado99@nauta.cu',
        buyerPhone: '+53 5 889 0281',
        amount: 800,
        currency: 'CUP' as const,
        method: 'EnZona',
        date: '01 Jun 2026',
        hour: '14:20',
        timestamp: now - 19 * 24 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-38',
        beatTitle: 'Urban Soul',
        buyerName: 'Danay Suárez',
        buyerEmail: 'danay_suarez_oficial@gmail.com',
        buyerPhone: '+53 5 512 8094',
        amount: 3800,
        currency: 'CUP' as const,
        method: 'EnZona',
        date: '28 May 2026',
        hour: '19:12',
        timestamp: now - 23 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Básica',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8316',
        beatTitle: 'Sublows & Reparto Drums Toolkit Vol. 4',
        buyerName: 'Estudio La Aldea',
        buyerEmail: 'la.aldea.studios@gmail.com',
        buyerPhone: '+53 5 918 3045',
        amount: 1800,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '29 May 2026',
        hour: '15:40',
        timestamp: now - 22 * 24 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'CB-HIST-37',
        beatTitle: 'Callejera Flow',
        buyerName: 'Alex Duvall',
        buyerEmail: 'duvall_alex@gmail.com',
        buyerPhone: '+53 5 339 1221',
        amount: 5000,
        currency: 'CUP' as const,
        method: 'Transfermóvil',
        date: '24 May 2026',
        hour: '11:00',
        timestamp: now - 27 * 24 * 60 * 60 * 1000,
        licenceType: 'Licencia Exclusiva',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'TX-8119',
        beatTitle: 'Havana Golden Strings Loops',
        buyerName: 'Maikel Almira',
        buyerEmail: 'maikel_almira94@nauta.cu',
        buyerPhone: '+53 5 831 9284',
        amount: 950,
        currency: 'CUP' as const,
        method: 'EnZona',
        date: '11 May 2026',
        hour: '18:15',
        timestamp: now - 40 * 24 * 60 * 60 * 1000,
        licenceType: 'Librería de Sonido',
        type: 'sound_library' as const,
        productImage: 'https://images.unsplash.com/photo-1465847899084-5161dfdc397c?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop'
      }
    ];
 
    // Merge live approved orders on top of history log
    const merged = [
      ...lives.map(o => ({
        id: o.id,
        beatTitle: o.beatTitle,
        buyerName: o.buyerName || 'Cantante D\'Cuban Beats',
        buyerEmail: 'cantante.activo@dcubanbeats.com',
        buyerPhone: '+53 5 448 9121',
        amount: o.amount,
        currency: o.currency,
        method: o.method,
        date: o.date || 'Reciente',
        hour: '14:20',
        timestamp: now,
        licenceType: o.amount >= 3000 ? 'Licencia Exclusiva' : 'Licencia Básica',
        type: 'beat' as const,
        productImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
        receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
      })),
      ...historic
    ];
 
    return merged.sort((a, b) => b.timestamp - a.timestamp);
  }, [myOrders]);

  // Apply filters exactly like AdminTransactions panel works
  const soldBeatsHistory = useMemo(() => {
    const now = Date.now();
    return allTransactions.filter(tx => {
      // 1. Text search index
      if (txSearchQuery) {
        const query = txSearchQuery.toLowerCase();
        const matchesQuery = 
          tx.id.toLowerCase().includes(query) ||
          tx.beatTitle.toLowerCase().includes(query) ||
          tx.buyerName.toLowerCase().includes(query) ||
          (tx.type === 'beat' ? 'beat' : 'libreria librería sound sound_library soundkit samplepack kit').includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Type selector
      if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) {
        return false;
      }

      // 3. Timeframe window
      const diffMs = now - tx.timestamp;
      if (txTimeframeFilter === 'diarias') {
        return diffMs <= 24 * 60 * 60 * 1000;
      } else if (txTimeframeFilter === 'semanales') {
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      } else if (txTimeframeFilter === 'mensuales') {
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      } else if (txTimeframeFilter === 'semestrales') {
        return diffMs <= 180 * 24 * 60 * 60 * 1000;
      }

      return true;
    });
  }, [allTransactions, txSearchQuery, txTypeFilter, txTimeframeFilter]);

  // Sum total of all sold beats earnings (historic seeds + live approved orders) converted to CUP
  const totalEarningsHistoricalAndLive = useMemo(() => {
    return allTransactions.reduce((acc, sale) => {
      const amount = sale.amount;
      const currency = String(sale.currency || 'CUP').toUpperCase();
      
      let amountInCUP = amount;
      if (currency === 'CUP') {
        amountInCUP = amount <= 150 ? amount * (exchangeRates?.USD || 360.0) : amount;
      } else if (currency === 'MLC') {
        amountInCUP = amount <= 150 ? amount * (exchangeRates?.USD || 360.0) : amount * (exchangeRates?.MLC || 280.0);
      } else if (currency === 'CLASICA' || currency === 'CLÁSICA') {
        amountInCUP = amount <= 150 ? amount * (exchangeRates?.USD || 360.0) : amount * (exchangeRates?.CLASICA || 310.0);
      } else {
        // USDT / USD / SQP
        amountInCUP = amount * (exchangeRates?.USD || 360.0);
      }
      return acc + amountInCUP;
    }, 0);
  }, [allTransactions, exchangeRates]);

  const formattedEarnings = useMemo(() => {
    const rateUSD = exchangeRates?.USD || 360.0;
    const rateMLC = exchangeRates?.MLC || 280.0;
    const rateClasica = exchangeRates?.CLASICA || 310.0;

    let value = totalEarningsHistoricalAndLive;
    let label = 'CUP';

    if (earningsCurrency === 'MLC') {
      value = totalEarningsHistoricalAndLive / rateMLC;
      label = 'MLC';
    } else if (earningsCurrency === 'SQP') {
      value = totalEarningsHistoricalAndLive / rateUSD;
      label = 'SQP(USD)';
    } else if (earningsCurrency === 'CLASICA') {
      value = totalEarningsHistoricalAndLive / rateClasica;
      label = 'Clásica';
    }

    if (earningsCurrency === 'CUP') {
      return `$${Math.round(value).toLocaleString('es-ES')} ${label}`;
    } else {
      return `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${label}`;
    }
  }, [totalEarningsHistoricalAndLive, earningsCurrency, exchangeRates]);

  // Broken-down earnings for each specific currency used as payment method
  const brokenDownEarnings = useMemo(() => {
    let cupSum = 0;
    let mlcSum = 0;
    let sqpSum = 0;
    let clasicaSum = 0;

    // 1. Add historical transactions (always approved and in CUP)
    allTransactions.forEach((tx) => {
      const isLiveOrder = myOrders.some(o => o.id === tx.id);
      if (!isLiveOrder) {
        cupSum += tx.amount;
      }
    });

    // 2. Add live orders that are 'verified' or 'approved'
    myOrders.forEach((o) => {
      if (o.status === 'verified' || o.status === 'approved') {
        const currency = String(o.currency || 'CUP').toUpperCase();
        const rawAmount = o.amount;
        let nativeValue = rawAmount;

        if (currency === 'CUP') {
          if (rawAmount <= 150) {
            nativeValue = rawAmount * (exchangeRates?.USD || 360.0);
          }
          cupSum += nativeValue;
        } else if (currency === 'MLC') {
          if (rawAmount <= 150) {
            nativeValue = (rawAmount * (exchangeRates?.USD || 360.0)) / (exchangeRates?.MLC || 280.0);
          }
          mlcSum += nativeValue;
        } else if (currency === 'CLASICA' || currency === 'CLÁSICA') {
          if (rawAmount <= 150) {
            nativeValue = (rawAmount * (exchangeRates?.USD || 360.0)) / (exchangeRates?.CLASICA || 310.0);
          }
          clasicaSum += nativeValue;
        } else if (currency === 'USDT' || currency === 'USD' || currency === 'SQP') {
          sqpSum += rawAmount;
        }
      }
    });

    return {
      CUP: cupSum,
      MLC: mlcSum,
      SQP: sqpSum,
      CLASICA: clasicaSum
    };
  }, [allTransactions, myOrders, exchangeRates]);

  const liveApprovedCount = useMemo(() => {
    return myOrders.filter(o => o.status === 'approved').length;
  }, [myOrders]);

  const totalSalesCount = useMemo(() => {
    return allTransactions.length;
  }, [allTransactions]);

  // Compute average beat listing price
  const averagePrice = useMemo(() => {
    if (myBeats.length === 0) return 0;
    return Math.round(myBeats.reduce((acc, b) => acc + b.priceBasic, 0) / myBeats.length);
  }, [myBeats]);

  const handleRefreshAnalytics = () => {
    addToast('Datos de ventas y notificaciones sincronizados con éxito', 'success');
  };

  if (isLoading) {
    return <DashboardSkeleton variant="producer" />;
  }

  return (
    <div className="space-y-8 text-left bg-brand-bg text-white p-5 md:p-8 rounded-3xl border border-brand-border/40 shadow-2xl min-h-[90vh] transition-all">
      
      {/* 1. Header Toolbar (Cosmic Style Dark Banner) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7F77DD]">Consola de Productor Activa</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Dashboard del Productor 👋
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Monitorea el consumo de tus beats, ventas cobradas en Transfermóvil/QvaPay y visitas de artistas cubanos.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleRefreshAnalytics}
            className="p-2.5 bg-brand-surface hover:bg-brand-card text-gray-300 border border-brand-border rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Refrescar Analíticas"
          >
            <RefreshCw size={13} className="animate-spin-slow hover:text-[#7F77DD]" />
            Sincronizar
          </button>

          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigateTo('/producer/beats')}
            className="text-xs font-bold gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Sparkles size={13} />
            Subir Beat Now
          </Button>
        </div>
      </div>
      
      {/* Tab Switcher */}
      <div className="flex border-b border-brand-border/35 pb-px gap-6 -mt-2">
        <button
          type="button"
          onClick={() => setActiveTab('escritorio')}
          className={`pb-3 text-sm font-bold relative transition-colors cursor-pointer outline-none ${
            activeTab === 'escritorio' ? 'text-[#7F77DD]' : 'text-gray-400 hover:text-white'
          }`}
        >
          Escritorio (Resumen)
          {activeTab === 'escritorio' && (
            <motion.div 
              layoutId="dashboardTabActiveUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7F77DD]" 
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seguidores')}
          className={`pb-3 text-sm font-bold relative transition-colors cursor-pointer outline-none flex items-center gap-2 ${
            activeTab === 'seguidores' ? 'text-[#7F77DD]' : 'text-gray-405 hover:text-white'
          }`}
        >
          Seguidores del Studio
          <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
            activeTab === 'seguidores' ? 'bg-[#7F77DD] text-[#13131F]' : 'bg-[#534AB7]/30 text-[#7F77DD]'
          }`}>
            {myFollowerCount}
          </span>
          {activeTab === 'seguidores' && (
            <motion.div 
              layoutId="dashboardTabActiveUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7F77DD]" 
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`pb-3 text-sm font-bold relative transition-colors cursor-pointer outline-none flex items-center gap-2 ${
            activeTab === 'chat' ? 'text-[#7F77DD]' : 'text-gray-400 hover:text-white'
          }`}
        >
          Chat Directo
          {totalUnreadChatMessages > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-red-500 text-white leading-none">
              {totalUnreadChatMessages}
            </span>
          )}
          {activeTab === 'chat' && (
            <motion.div 
              layoutId="dashboardTabActiveUnderline" 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7F77DD]" 
            />
          )}
        </button>

      </div>

      {activeTab === 'escritorio' && (
        <div className="space-y-8 animate-in fade-in duration-250">
          {/* 2. KYC REQUIRED ALERT (if not verified) */}
          {!isVerified && (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertOctagon size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-500">Pasarela Directa Inactiva • Verificación KYC Requerida</h4>
                  <p className="text-[11px] text-amber-200/80 max-w-xl leading-relaxed">
                    Para desplegar tus enlaces de Transfermóvil, EnZona y QvaPay en el catálogo oficial y recibir transacciones CUP instantáneas, debes certificar tu firma de identidad oficial cubana.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={() => navigateTo('/producer/profile')}
                className="bg-amber-600 hover:bg-amber-700 text-white border-none py-2 px-4 shadow-sm font-bold whitespace-nowrap self-end sm:self-center text-[11px]"
              >
                Validar Identidad →
              </Button>
            </div>
          )}



          {/* 3. KEY METRICS STATS BLOCKS (Elegant glow and fully dark themed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: CUP Gross Sales */}
            <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-3 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
              <div className="flex justify-between items-start gap-2 text-gray-400">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ganancias Generadas</span>
                  
                  {/* Currency Switcher Buttons */}
                  <div className="flex flex-wrap gap-1 mt-1 p-0.5 bg-[#0F0F1A] rounded-lg border border-white/5">
                    {(['CUP', 'MLC', 'SQP', 'CLASICA'] as const).map((curr) => {
                      const isActive = earningsCurrency === curr;
                      const displayLabel = curr === 'SQP' ? 'SQP(USD)' : curr === 'CLASICA' ? 'Clásica' : curr;
                      return (
                        <button
                          key={curr}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEarningsCurrency(curr);
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer outline-none ${
                            isActive
                              ? 'bg-[#534AB7] text-white shadow-sm'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <span className="p-2 bg-indigo-500/10 text-[#7F77DD] border border-indigo-500/10 rounded-xl flex-shrink-0">
                  <DollarSign size={15} />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-mono text-white tracking-tight group-hover:text-[#7F77DD] transition-colors leading-none">
                  {formattedEarnings}
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold block mt-2">
                  <TrendingUp size={11} className="inline mr-1" /> +18.2% este mes
                </span>
              </div>
            </div>

            {/* KPI 2: Beats active */}
            <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Beats Activos</span>
                <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-xl">
                  <Music size={15} />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-mono text-white leading-none">
                  {myBeats.length || 5}
                </h3>
                <span className="text-[10px] text-gray-400 block mt-2">
                  Precio promedio: <strong className="text-indigo-300 font-mono">${averagePrice || 600} CUP</strong>
                </span>
              </div>
            </div>

            {/* KPI 3: Sound Libraries Available */}
            <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-500/35 transition-all group">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Librerías de Sonido Disponibles</span>
                <span className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/10 rounded-xl">
                  <Music size={15} className="text-amber-400" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-mono text-white leading-none">
                  {user?.soundLibrariesCount || 3}
                </h3>
                <span className="text-[10px] text-amber-550 block mt-2">
                  Kits de samples listos en catálogo
                </span>
              </div>
            </div>

            {/* KPI 4: Followers stats (INTERACTIVE TAB TRIGGER CARD) */}
            <div 
              onClick={() => {
                setActiveTab('seguidores');
                addToast('Cargando pestaña de seguidores', 'info');
              }}
              className="bg-brand-surface p-5 rounded-2xl border border-brand-border/40 hover:border-rose-500/50 shadow-sm space-y-2 flex flex-col justify-between hover:bg-brand-surface/85 active:scale-[0.98] transition-all group cursor-pointer select-none"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-rose-450 transition-colors">Seguidores del Studio</span>
                <span className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl group-hover:scale-105 transition-all">
                  <Users size={14} />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-mono text-white leading-none group-hover:text-rose-400 transition-colors">
                  {myFollowerCount}
                </h3>
                <span className="text-[10px] text-rose-400 font-bold block mt-2 flex items-center gap-1">
                  Ver listado completo ↗
                </span>
              </div>
            </div>
          </div>

          {/* NEW SECTION: BROKEN-DOWN EARNINGS BY CURRENCY METHOD */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-brand-border/40 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet size={15} className="text-[#7F77DD]" /> Ganancias Detalladas por Método de Pago
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Control de fondos confirmados para cada moneda de pago activa. Las ganancias se acumulan tras verificar fondos o liberar la descarga.
                </p>
              </div>
              <button 
                type="button"
                onClick={handleRefreshAnalytics}
                className="self-start md:self-auto px-2.5 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-300 font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={10} />
                Sincronizar Fondos
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CUP Card */}
              <div className="bg-[#0B0B13] p-4 rounded-xl border border-indigo-500/10 hover:border-indigo-500/20 transition-all flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">CUP (Transfermóvil / EnZona)</span>
                  <span className="text-xs font-bold text-[#7F77DD] bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 font-mono">CUP</span>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    ${brokenDownEarnings.CUP.toLocaleString('es-ES', { maximumFractionDigits: 0 })} CUP
                  </div>
                  <span className="text-[9px] text-gray-500 block mt-1">
                    Fondo local en pesos cubanos
                  </span>
                </div>
              </div>

              {/* MLC Card */}
              <div className="bg-[#0B0B13] p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/20 transition-all flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">MLC (Banco Metropolitano)</span>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 font-mono">MLC</span>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    ${brokenDownEarnings.MLC.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MLC
                  </div>
                  <span className="text-[9px] text-gray-500 block mt-1">
                    Moneda libremente convertible
                  </span>
                </div>
              </div>

              {/* SQP Card */}
              <div className="bg-[#0B0B13] p-4 rounded-xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">SQP (USDT / QvaPay)</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-mono font-bold">SQP</span>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    ${brokenDownEarnings.SQP.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SQP
                  </div>
                  <span className="text-[9px] text-gray-500 block mt-1">
                    Equivalente en dólares USDT
                  </span>
                </div>
              </div>

              {/* CLASICA Card */}
              <div className="bg-[#0B0B13] p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Tarjeta Clásica</span>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-mono">CLÁSICA</span>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-white">
                    ${brokenDownEarnings.CLASICA.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Clásica
                  </div>
                  <span className="text-[9px] text-gray-500 block mt-1">
                    Fondo de tarjeta magnética
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 5. DIRECT CHATS WITH ARTISTS PANEL (PRODUCER SIDE) */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7F77DD] block">Comunicación Directa</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <MessageSquare size={16} className="text-[#7F77DD]" /> Bandeja de Mensajería Directa con Artistas
                </h3>
              </div>
              <p className="text-xs text-gray-400 self-start sm:self-auto">
                Chatea con tus clientes, acuerda modificaciones y envía enlaces de audios o detalles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Column: Artists List */}
              <div className="md:col-span-4 bg-[#0F0F1A] border border-white/5 rounded-2xl p-4 space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Artistas Disponibles</span>
                
                <div className="space-y-2">
                  {artistListForChat.map((art) => {
                    const isSelected = art.id === selectedChatArtistId;
                    
                    const liveUser = verifiedProducersTask?.find(u => u.id === art.id);
                    const isOnline = liveUser ? liveUser.online : false;

                    // Count unread messages from this sender to the producer
                    const unreadCount = directMessages.filter(
                      m => m.senderId === art.id && m.receiverId === user?.id && !m.read
                    ).length;

                    // Get the last message text if any
                    const chatHistory = directMessages.filter(
                      m => (m.senderId === art.id && m.receiverId === user?.id) ||
                           (m.senderId === user?.id && m.receiverId === art.id)
                    );
                    const lastMsg = chatHistory[chatHistory.length - 1];

                    return (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => setSelectedChatArtistId(art.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-[#534AB7]/10 border-[#7F77DD] text-white shadow-sm' 
                            : 'bg-white/2 border-transparent hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img 
                            src={art.avatarUrl} 
                            alt={art.artistName} 
                            className="w-10 h-10 rounded-xl object-cover border border-white/10"
                          />
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0F0F1A]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold truncate block">{art.artistName}</span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                            {lastMsg ? lastMsg.text : art.provincia + ' • Cuba'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Chat view */}
              <div className="md:col-span-8 bg-[#0B0B10] border border-white/5 rounded-2xl flex flex-col h-[380px]">
                
                {/* Chat Header */}
                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/2 rounded-t-2xl">
                  {activeChatArtist && (() => {
                    const activeLiveUser = verifiedProducersTask?.find(u => u.id === activeChatArtist.id);
                    const isActiveOnline = activeLiveUser ? activeLiveUser.online : false;
                    return (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={activeChatArtist.avatarUrl} 
                            alt={activeChatArtist.artistName} 
                            className="w-8 h-8 rounded-lg object-cover border border-white/5"
                          />
                          {isActiveOnline && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#0B0B10]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white block">{activeChatArtist.artistName}</span>
                            {isActiveOnline && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                                <span className="w-1 h-1 rounded-full bg-emerald-450 animate-pulse" />
                                ONLINE
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-[#7F77DD] block">
                            {activeChatArtist.name} • {activeChatArtist.provincia} {isActiveOnline ? '• Activo ahora' : activeLiveUser?.lastActive ? `• Activo ${activeLiveUser.lastActive}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  <span className="text-[9px] font-mono text-slate-500 bg-[#13131F] border border-white/5 px-2 py-0.5 rounded-md text-right">Monitoreo Directo</span>
                </div>

                {/* Messages Panel */}
                <div 
                  ref={producerChatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {(() => {
                    const filtered = directMessages.filter(m => 
                      (m.senderId === user?.id && m.receiverId === activeChatArtist?.id) ||
                      (m.senderId === activeChatArtist?.id && m.receiverId === user?.id)
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-10">
                          <span className="text-2xl">💬</span>
                          <p className="text-xs text-white font-medium">No hay mensajes previos</p>
                          <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                            Escríbele a {activeChatArtist?.artistName} para iniciar la conversación. Podrás compartir detalles o coordinar links.
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-[#534AB7] text-white rounded-br-none' 
                              : 'bg-[#1D1D2C] text-slate-200 rounded-bl-none border border-white/5'
                          }`}>
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <span className="text-[8px] font-mono text-slate-500">{msg.timestamp}</span>
                            {isMe && (
                              <span className={`text-[8px] font-mono ${msg.read ? 'text-[#7F77DD]' : 'text-slate-500'}`}>
                                {msg.read ? '✓ Leído' : '✓ Enviado'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Send message form */}
                <form 
                  onSubmit={handleSendProducerChatMessage}
                  className="p-3 border-t border-white/5 flex gap-2 bg-[#0F0F16] rounded-b-2xl"
                >
                  <input 
                    type="text"
                    value={producerChatInput}
                    onChange={(e) => setProducerChatInput(e.target.value)}
                    placeholder={`Escribe un mensaje para ${activeChatArtist?.artistName || 'el artista'}...`}
                    className="flex-grow bg-[#161622] text-xs text-white rounded-xl px-3 py-2 border border-white/5 focus:border-[#7F77DD] focus:outline-none placeholder-slate-500 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!producerChatInput.trim()}
                    className={`px-4 py-2 rounded-xl flex items-center justify-center transition-colors font-bold text-xs select-none ${
                      producerChatInput.trim() 
                        ? 'bg-[#534AB7] text-[#13131f] text-white hover:bg-[#685FCD] cursor-pointer' 
                        : 'bg-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Send size={12} className="mr-1" /> Enviar
                  </button>
                </form>

              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'seguidores' && (
        /* SEGUIDORES TAB CONTENT (Studio followers and target directory with search/filters) */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Intro & search/filter bar */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/45 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-rose-455 tracking-wider font-mono">Listado de Audiencia</span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">Artistas y Creadores que te Siguen</h3>
                <p className="text-xs text-gray-400">
                  Explora y contacta directamente a los cantantes de D'Cuban Beats que siguen de cerca tus publicaciones.
                </p>
              </div>

              {/* Total indicator */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 text-rose-405 text-center font-mono flex-shrink-0">
                <span className="text-[10px] block uppercase font-bold text-gray-400">Audiencia Directa</span>
                <span className="text-lg font-black">{filteredFollowerArtists.length} / {myFollowerCount}</span>
              </div>
            </div>

            {/* Controls bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-2">
              <div className="md:col-span-8 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar seguidor por nombre, alias, correo, instagram..."
                  value={followerSearch}
                  onChange={(e) => setFollowerSearch(e.target.value)}
                  className="w-full bg-brand-bg hover:bg-brand-bg/85 focus:bg-brand-bg pl-10 pr-4 py-2.5 rounded-xl border border-brand-border/40 focus:border-[#7F77DD]/50 text-xs text-white outline-none transition-all placeholder:text-gray-500"
                />
                {followerSearch && (
                  <button 
                    onClick={() => setFollowerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="md:col-span-4 relative flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gray-400 flex-shrink-0" />
                <select
                  value={followerPlanFilter}
                  onChange={(e) => setFollowerPlanFilter(e.target.value)}
                  className="w-full bg-brand-bg py-2.5 px-3 rounded-xl border border-brand-border/40 focus:border-[#7F77DD]/50 text-xs text-white outline-none transition-all cursor-pointer"
                >
                  <option value="all">Suscripción: Todos los Planes</option>
                  <option value="Gratis">Plan Gratis</option>
                  <option value="Pro">Plan Pro</option>
                  <option value="Elite">Plan Elite</option>
                </select>
              </div>
            </div>
          </div>

          {/* Followers Grid results */}
          {filteredFollowerArtists.length === 0 ? (
            <div className="bg-brand-surface p-12 rounded-2xl border border-brand-border/45 text-center text-gray-400 space-y-3.5">
              <Users size={32} className="mx-auto text-gray-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-white">No se encontraron seguidores</p>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Prueba modificando los criterios de búsqueda, o vaciando el filtro de planes de membresía.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setFollowerSearch(''); setFollowerPlanFilter('all'); }}
                className="text-xs border border-brand-border hover:bg-brand-card text-gray-300"
              >
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredFollowerArtists.map((artist) => (
                <div 
                  key={artist.id}
                  onClick={() => setSelectedArtist(artist)}
                  className="bg-brand-surface border border-brand-border/40 hover:border-[#7F77DD]/40 rounded-2xl p-5 cursor-pointer hover:bg-brand-surface/75 transition-all duration-200 group flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-[#7F77DD]/5 card-interactive"
                >
                  {/* Photo & Main Details */}
                  <div className="flex gap-4 items-start text-left">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={artist.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                        alt={artist.artistName || artist.name} 
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-[#7F77DD]/25 group-hover:border-[#7F77DD]/60 group-hover:scale-105 transition-all duration-200" 
                      />
                      {artist.verified && (
                        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md flex items-center justify-center border border-blue-500">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h4 className="font-extrabold text-white group-hover:text-[#7F77DD] transition-colors text-sm truncate flex items-center gap-1.5">
                        {artist.artistName || artist.name}
                      </h4>
                      <p className="text-[10.5px] text-gray-400 font-medium truncate">Nombre: {artist.name} {artist.lastName || ''}</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{artist.email}</p>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed text-left">
                    {artist.bio || 'Sin biografía especificada.'}
                  </p>

                  {/* Highlights / Badges */}
                  <div className="pt-3 border-t border-brand-border/15 flex items-center justify-between gap-2.5">
                    <span className="text-[11px] text-[#7F77DD] font-mono hover:underline truncate inline-flex flex-shrink min-w-0 gap-1.5 text-left">
                      {artist.instagram || '@artista_dcuban'}
                    </span>
                  </div>

                  {/* Ver Perfil Action block */}
                  <div className="pt-2">
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArtist(artist);
                      }}
                      className="w-full text-center py-2 rounded-xl bg-[#534AB7]/15 group-hover:bg-[#534AB7]/25 border border-[#534AB7]/20 group-hover:border-[#7F77DD]/35 text-xs text-[#7F77DD] font-bold transition-all duration-200 cursor-pointer"
                    >
                      Inspeccionar Perfil →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. USER PROFILE MODAL FOR PRODUCER TO VIEW FOLLOWERS (ARTISTS) DETAILED PROFILE */}
      {selectedArtist && (
        <div className="fixed inset-0 bg-gray-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-surface rounded-3xl w-full max-w-md shadow-2xl border border-brand-border/60 overflow-hidden text-left flex flex-col justify-between max-h-[90vh] animate-in zoom-in-95 duration-205">
            
            {/* Header backdrop banner */}
            <div className="relative h-28 bg-gradient-to-r from-[#4F46E5]/40 to-[#7F77DD]/20 p-5 flex items-start justify-between flex-shrink-0 border-b border-brand-border/20">
              <span className="text-[10px] uppercase font-bold text-[#A59FEB] bg-[#534AB7]/30 px-3 py-1 rounded-full font-mono border border-[#7F77DD]/25">
                Seguidor • Artista Real
              </span>
              <button 
                onClick={() => setSelectedArtist(null)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Profile contents */}
            <div className="px-6 pb-6 pt-0 space-y-4.5 overflow-y-auto flex-grow -mt-10 relative z-10">
              {/* Photo and name overlay */}
              <div className="flex gap-4 items-end text-left mb-2">
                <img 
                  src={selectedArtist.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                  alt={selectedArtist.name} 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-brand-surface bg-brand-surface shadow-2xl flex-shrink-0" 
                />
                <div className="pb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-black text-white tracking-tight">
                      {selectedArtist.artistName || selectedArtist.name}
                    </h3>
                    {selectedArtist.verified && (
                      <span className="inline-flex items-center text-blue-500 font-bold" title="Perfil Verificado">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      </span>
                    )}
                  </div>
                  <span className="block text-[10.5px] text-gray-400 font-medium">
                    Titular real: <span className="text-gray-300 font-semibold">{selectedArtist.name} {selectedArtist.lastName || ''}</span>
                  </span>
                </div>
              </div>

              {/* Instagram & Mail Grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-brand-bg/40 p-3.5 rounded-xl border border-brand-border/20 space-y-1">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Instagram Oficial</p>
                  <a 
                    href={`https://instagram.com/${(selectedArtist.instagram || 'artista').replace('@', '').trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7F77DD] hover:text-[#9B94EC] font-mono text-xs font-bold hover:underline inline-flex items-center gap-1.5"
                  >
                    {selectedArtist.instagram || '@dcubanbeats_artist'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  </a>
                </div>

                <div className="bg-brand-bg/40 p-3.5 rounded-xl border border-brand-border/20 space-y-1">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Correo Registrado</p>
                  <span className="text-gray-300 font-mono text-xs font-medium block truncate" title={selectedArtist.email}>
                    {selectedArtist.email}
                  </span>
                </div>
              </div>

              {/* Bio detail card */}
              <div className="space-y-1 bg-brand-bg/25 p-4 rounded-xl border border-brand-border/15">
                <span className="text-gray-500 font-black block uppercase tracking-wider text-[9px]">Biografía de Presentación</span>
                <p className="text-gray-300 leading-relaxed font-sans text-xs">
                  {selectedArtist.bio || "Este artista cubano no ha configurado una biografía todavía en su perfil de D'Cuban Beats."}
                </p>
              </div>

              {/* Account details summary */}
              <div className="grid grid-cols-2 gap-3 bg-brand-bg/20 p-1.5 rounded-2xl border border-brand-border/10">
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/15 text-center">
                  <span className="text-[9px] text-gray-550 block font-bold uppercase tracking-wider">Plan Contratado</span>
                  <span className={`text-xs font-bold block mt-1 ${
                    selectedArtist.plan === 'Elite' 
                      ? 'text-amber-400' 
                      : selectedArtist.plan === 'Pro' 
                        ? 'text-blue-300'
                        : 'text-gray-400'
                  }`}>
                    {selectedArtist.plan || 'Gratis'}
                  </span>
                </div>
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/15 text-center">
                  <span className="text-[9px] text-gray-550 block font-bold uppercase tracking-wider">Estado KYC</span>
                  <span className="text-xs text-emerald-400 font-black block mt-1">Acreditado ✓</span>
                </div>
              </div>

            </div>

            {/* CTA action bottom */}
            <div className="p-4 bg-brand-bg/50 border-t border-brand-border/25 flex-shrink-0">
              <a 
                href={`mailto:${selectedArtist.email}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#534AB7] hover:bg-[#685FCD] text-white font-bold text-xs shadow-md shadow-[#534AB7]/25 hover:scale-[1.01] active:scale-[0.99] transition-all text-center select-none cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Contactar por Correo Electrónico
              </a>
            </div>

          </div>
        </div>
      )}

      {/* 6. COMPREHENSIVE TRANSACTION DETAIL MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-gray-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#131124] rounded-3xl w-full max-w-lg shadow-2xl border border-brand-border/60 overflow-hidden text-left flex flex-col justify-between max-h-[92vh] animate-in zoom-in-95 duration-205">
            
            {/* Header / Top banner */}
            <div className="relative h-20 bg-gradient-to-r from-red-500/20 to-amber-500/10 p-5 flex items-center justify-between flex-shrink-0 border-b border-brand-border/20">
              <span className="text-[10px] uppercase font-bold text-gray-300 bg-white/10 px-3 py-1 rounded-full font-mono border border-white/5">
                Comprobante de Venta {selectedTx.type === 'beat' ? '• Beat' : '• Librería'}
              </span>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Contents */}
            <div className="px-6 pb-6 pt-5 space-y-4 overflow-y-auto flex-grow relative z-10">
              
              {/* Product and Basic Details Row */}
              <div className="flex gap-4 items-center bg-brand-surface/40 p-3 rounded-2xl border border-brand-border/25">
                <img 
                  src={selectedTx.productImage} 
                  alt={selectedTx.beatTitle} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-brand-bg shadow-lg flex-shrink-0 border border-brand-border/30" 
                />
                <div className="min-w-0 flex-1">
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded leading-none inline-block mb-1.5 ${
                    selectedTx.type === 'beat' 
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-red-500/20' 
                      : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-amber-500/10'
                  }`}>
                    {selectedTx.type === 'beat' ? 'Beat Instrumental' : 'Librería de Sonido'}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                    {selectedTx.beatTitle}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    ID Transacción: <span className="font-mono text-gray-300 font-semibold">{selectedTx.id}</span>
                  </p>
                </div>
              </div>

              {/* Specific client data block */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-500 font-mono">Información del Cliente</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-brand-surface/20 p-3.5 rounded-xl border border-brand-border/15 space-y-1">
                    <p className="text-[9px] text-gray-550 font-bold uppercase tracking-wider">Adquirido por</p>
                    <span className="text-white text-xs font-bold block">{selectedTx.buyerName}</span>
                  </div>

                  <div className="bg-brand-surface/20 p-3.5 rounded-xl border border-brand-border/15 space-y-1">
                    <p className="text-[9px] text-gray-550 font-bold uppercase tracking-wider">Correo Electrónico</p>
                    <span className="text-gray-300 font-mono text-xs font-semibold block truncate" title={selectedTx.buyerEmail}>
                      {selectedTx.buyerEmail}
                    </span>
                  </div>

                  <div className="bg-brand-surface/20 p-3.5 rounded-xl border border-brand-border/15 space-y-1">
                    <p className="text-[9px] text-gray-550 font-bold uppercase tracking-wider">Número de Teléfono</p>
                    <span className="text-gray-300 font-mono text-xs font-semibold block">{selectedTx.buyerPhone}</span>
                  </div>

                  <div className="bg-brand-surface/20 p-3.5 rounded-xl border border-brand-border/15 space-y-1">
                    <p className="text-[9px] text-gray-550 font-bold uppercase tracking-wider">Fecha y Hora</p>
                    <span className="text-gray-300 text-xs font-semibold block">
                      {selectedTx.date} a las {selectedTx.hour || '14:30'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info block */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-500 font-mono">Detalles del Pago</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-brand-surface/20 p-3.5 rounded-xl border border-brand-border/15 space-y-1 col-span-1">
                    <p className="text-[9px] text-gray-555 font-bold uppercase tracking-wider">Precio pagado</p>
                    <span className="text-emerald-400 font-mono text-sm font-black block">
                      ${selectedTx.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-brand-surface/20 p-3.5 rounded-xl border border-brand-border/15 space-y-1 col-span-1">
                    <p className="text-[9px] text-gray-555 font-bold uppercase tracking-wider">Moneda</p>
                    <span className="text-white font-mono text-xs font-extrabold block">
                      {selectedTx.currency || 'CUP'}
                    </span>
                  </div>

                  <div className="bg-[#534AB7]/5 p-3.5 rounded-xl border border-[#534AB7]/15 space-y-1 col-span-1">
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">Pasarela</p>
                    <span className="text-indigo-400 text-xs font-semibold block truncate">
                      {selectedTx.method}
                    </span>
                  </div>
                </div>
              </div>

              {/* receipt verification slip uploaded by user  */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-500 font-mono">Comprobante de Pago Enviado</h4>
                  <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold select-none">
                    Estado: Aprobado ✓
                  </span>
                </div>
                
                <div className="relative group overflow-hidden rounded-2xl border border-brand-border/30 bg-[#0c0a17] aspect-[4/2.1] flex items-center justify-center p-1 shadow-inner select-none">
                  <img 
                    src={selectedTx.receiptImage} 
                    alt="Evidencia/Comprobante de Transacción del Cliente"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl opacity-90 transition-transform duration-300 hover:scale-[1.01]" 
                  />
                  {/* Decorative Overlay mimic watermark receipt seal */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none flex flex-col justify-end p-3.5 text-left">
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                      Transacción Validada • {selectedTx.method}
                    </span>
                    <span className="text-[8px] font-mono tracking-wider text-gray-400 mt-0.5">
                      OPERACIÓN REF: {selectedTx.id} • HORA: {selectedTx.hour || '14:20'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* CTA action bottom */}
            <div className="p-4 bg-brand-bg/50 border-t border-brand-border/25 flex-shrink-0 flex gap-3">
              <button 
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-surface border border-brand-border text-gray-300 hover:text-white hover:bg-brand-surface/80 font-bold text-xs select-none transition-all text-center cursor-pointer"
              >
                Cerrar Consulta
              </button>
              <button 
                onClick={() => {
                  addToast(`Sección de comprobante de ${selectedTx.buyerName} descargada localmente`, 'success');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#534AB7] hover:bg-[#685FCD] text-white font-bold text-xs shadow-md select-none transition-all text-center cursor-pointer"
              >
                Imprimir Factura 📄
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
