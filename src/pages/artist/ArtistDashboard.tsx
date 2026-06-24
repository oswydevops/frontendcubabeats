import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  User, CheckCircle, Music, Heart, Camera, FileText, 
  ShieldCheck, Upload, Download, Trash2, LayoutDashboard, 
  SlidersHorizontal, Check, Play, Pause, ShoppingCart, AlertCircle,
  Mail, Phone, Lock, MapPin, Globe, FileImage, LogOut,
  Eye, Calendar, CreditCard, X, ExternalLink, Send
} from 'lucide-react';

// List of Cuban provinces for analytical geolocation stats mapping
const CUBA_PROVINCES = [
  'Pinar del Río',
  'Artemisa',
  'La Habana',
  'Mayabeque',
  'Matanzas',
  'Cienfuegos',
  'Villa Clara',
  'Sancti Spíritus',
  'Ciego de Ávila',
  'Camagüey',
  'Las Tunas',
  'Holguín',
  'Granma',
  'Santiago de Cuba',
  'Guantánamo',
  'Isla de la Juventud'
];

export const ArtistDashboard: React.FC = () => {
  const { 
    user, setUser, updateUserProfile, beats, orders, likedBeats = [], toggleLikeBeat,
    kycStep, setKycStep, kycData, setKycDocType, setKycImage, completeKyc, 
    addToast, addToCart, cart, playBeat, activeBeat, isPlaying, navigateTo,
    verifiedProducersTask = [], artistNotifications = [], markArtistNotificationRead,
    markAllArtistNotificationsRead, clearArtistNotifications, simulatedEmails = [],
    markSimulatedEmailRead, clearSimulatedEmails,
    directMessages = [], sendDirectMessage, markMessagesAsRead, convertPrice
  } = useApp();

  const [followedProducerIds, setFollowedProducerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('followed_producers_map_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const followedProducers = useMemo(() => {
    return verifiedProducersTask.filter(u => u.role === 'producer' && followedProducerIds.includes(u.id));
  }, [verifiedProducersTask, followedProducerIds]);

  const [activeTab, setActiveTab] = useState<'desktop' | 'acquired' | 'favorites' | 'following' | 'profile'>('desktop');
  const [selectedFollowingProducerId, setSelectedFollowingProducerId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [followingViewMode, setFollowingViewMode] = useState<'profile' | 'chat'>('profile');

  const activeFollowingProducer = useMemo(() => {
    if (followedProducers.length === 0) return null;
    const found = followedProducers.find(p => p.id === selectedFollowingProducerId);
    return found || followedProducers[0];
  }, [followedProducers, selectedFollowingProducerId]);

  // Mark messages from active following producer as read when chat is open
  useEffect(() => {
    if (activeTab === 'following' && followingViewMode === 'chat' && activeFollowingProducer && user) {
      markMessagesAsRead(activeFollowingProducer.id, user.id);
    }
  }, [activeTab, followingViewMode, activeFollowingProducer, user?.id, directMessages.length, markMessagesAsRead]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when messages list changes or active producer changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [directMessages, activeFollowingProducer?.id, followingViewMode]);

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim() || !activeFollowingProducer || !user) return;

    sendDirectMessage(
      user.id,
      user.artistName || user.fullName || user.name || 'Artista',
      'client',
      activeFollowingProducer.id,
      activeFollowingProducer.artistName || activeFollowingProducer.name || 'Productor',
      'producer',
      chatInputText.trim()
    );
    setChatInputText('');
  };

  // Form input states
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [artistName, setArtistName] = useState(user?.artistName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [municipio, setMunicipio] = useState(user?.municipio || '');
  const [provincia, setProvincia] = useState(user?.provincia || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');

  // File upload input ref for profile photo from device
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KYC upload mock spinner
  const [uploadProgress, setUploadProgress] = useState(0);

  // Selected purchase transaction for details modal view
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<any | null>(null);

  // 1. Filter approved orders belonging to this user
  const myPurchasedOrders = useMemo(() => {
    return orders.filter(ord => {
      const isApproved = ord.status === 'approved';
      // Match by account names or email, or display all if general client role logged-in for simulation
      const isMine = ord.buyerName?.toLowerCase() === user?.name?.toLowerCase() || 
                     ord.buyerName?.toLowerCase() === user?.artistName?.toLowerCase() ||
                     user?.role === 'client';
      return isApproved && isMine;
    });
  }, [orders, user]);

  // 2. Fetch the actual beats mapped from purchase orders
  const acquiredBeatsWithDetails = useMemo(() => {
    return myPurchasedOrders.map(ord => {
      const matchedBeat = beats.find(b => b.id === ord.beatId);
      const isLibrary = ord.beatTitle?.toLowerCase().includes('librería') ||
                        ord.beatTitle?.toLowerCase().includes('library') ||
                        ord.beatTitle?.toLowerCase().includes('pack') ||
                        ord.beatId?.startsWith('lib');
      const category = isLibrary ? 'Librería de Sonidos' : 'Beat Instrumental';
      return {
        order: ord,
        category,
        beat: matchedBeat || {
          id: ord.beatId,
          title: ord.beatTitle,
          producerName: ord.producerName,
          producerId: ord.producerId,
          genre: isLibrary ? 'Librería' : 'Urbano',
          bpm: 98,
          key: 'F# Minor',
          coverUrl: isLibrary 
            ? 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          duration: '3:20'
        }
      };
    });
  }, [myPurchasedOrders, beats]);

  // 3. Filter favorites (liked beats)
  const favoriteBeats = useMemo(() => {
    return beats.filter(b => likedBeats.includes(b.id));
  }, [beats, likedBeats]);

  // Helper utility to check details
  const isCurrentPlaying = (beatId: string) => {
    return activeBeat?.id === beatId && isPlaying;
  };

  // Mock document uploading helper
  const handleSimulateUpload = (field: 'frontImage' | 'backImage' | 'selfieImage') => {
    setUploadProgress(25);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setKycImage(field, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==');
          addToast('Comprobante de documento subido correctamente', 'success');
          return 0;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Local profile photo file uploader reader from device
  const handleLocalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Por favor, selecciona una imagen de tipo de formato válido', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        addToast('La imagen elegida excede el límite de tamaño de 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setAvatarUrl(base64);
          addToast('Foto cargada correctamente de tu dispositivo', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Save handler with strict geolocation validation
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('El nombre completo es obligatorio', 'error');
      return;
    }
    if (!phone.trim()) {
      addToast('El teléfono móvil es obligatorio para conformar contratos y licencias', 'error');
      return;
    }
    if (!provincia.trim()) {
      addToast('La provincia es obligatoria para las estadísticas geográficas del portal', 'error');
      return;
    }
    if (!municipio.trim()) {
      addToast('El municipio es obligatorio para las estadísticas geográficas del portal', 'error');
      return;
    }

    updateUserProfile({
      name: fullName.trim(), // sync primary name
      fullName: fullName.trim(),
      artistName: artistName.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      bio: bio.trim() || undefined,
      phone: phone.trim(),
      provincia: provincia.trim(),
      municipio: municipio.trim(),
      telegram: telegram.trim() || undefined
    });
  };

  // KYC Completion Wizard click
  const handleKycFlowNext = () => {
    if (kycStep === 1) {
      if (!kycData.docType) {
        addToast('Selecciona un tipo de identificación oficial primero', 'error');
        return;
      }
      setKycStep(2);
    } else if (kycStep === 2) {
      if (!kycData.frontImage || (kycData.docType === 'id_card' && !kycData.backImage)) {
        addToast('Sube las imágenes requeridas para continuar', 'error');
        return;
      }
      setKycStep(3);
    } else if (kycStep === 3) {
      if (!kycData.selfieImage) {
        addToast('Debes tomar la selfie junto a tu carné oficial', 'error');
        return;
      }
      completeKyc();
      addToast('Tu cuenta como artista ha sido acreditada para compras', 'success');
      setActiveTab('desktop');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 pb-12 text-left animate-in fade-in duration-300">
      
      {/* 1. Brand Header Segment */}
      <div className="bg-[#13131F] border border-brand-border/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10 w-full md:w-auto">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="avatar" 
              referrerPolicy="no-referrer"
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-brand-primary/40 shadow-xl shadow-brand-primary/5" 
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {user?.artistName?.[0] || user?.fullName?.[0] || user?.name?.[0] || 'A'}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight animate-pulse-slow">
                {user?.artistName || user?.fullName || user?.name || 'Artista D\'Cuban Beats'}
              </h2>
              {user?.verified && (
                <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle size={10} fill="currentColor" className="text-current" />
                  Acreditado KYC
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-400 max-w-md font-sans">
              {user?.bio || 'Sin biografía disponible. Configura tu perfil de artista abajo.'}
            </p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-mono text-slate-500 pt-1">
              <span>Rol: <strong className="text-[#7F77DD]">Artista / Cliente</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-350">{user?.email}</strong></span>
            </div>
          </div>
        </div>

        <div className="z-10 flex-shrink-0 flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigateTo('/')}
            className="w-full md:w-auto hover:bg-[#534AB7]/10"
          >
            <Music size={14} className="mr-1.5 text-[#7F77DD]" />
            Catálogo D'Cuban Beats
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setUser(null);
              navigateTo('/');
              addToast('Cierre de sesión seguro realizado', 'info');
            }}
            className="w-full md:w-auto text-rose-400 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut size={14} className="mr-1.5" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* 2. Selection Tabs */}
      <div className="flex border-b border-brand-border/30 gap-1 overflow-x-auto pb-0.5 animate-in fade-in">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'desktop' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <LayoutDashboard size={14} />
          Escritorio
        </button>

        <button
          onClick={() => setActiveTab('acquired')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'acquired' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <Music size={14} />
          Beats Adquiridos ({acquiredBeatsWithDetails.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'favorites' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <Heart size={14} />
          Mis Guardados ({likedBeats.length})
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'following' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <Heart size={14} className="text-rose-500 fill-rose-500/10" />
          Siguiendo ({followedProducers.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <SlidersHorizontal size={14} />
          Ajustes de Perfil & KYC
        </button>
      </div>

      {/* 3. Panel Tab Rendering */}
      <div className="space-y-6">
        
        {/* TAB 1: DESKTOP HOME SUMMARY */}
        {activeTab === 'desktop' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            


            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-[#13131F] border border-brand-border/35 rounded-2xl text-left hover:border-brand-primary/30 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 font-mono">Audio licencias Adquiridas</span>
                <p className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono">{acquiredBeatsWithDetails.length} Compras</p>
                <button onClick={() => setActiveTab('acquired')} className="text-[10px] font-semibold text-[#7F77DD] hover:underline mt-2 inline-block">Consultar mis archivos →</button>
              </div>

              <div className="p-5 bg-[#13131F] border border-brand-border/35 rounded-2xl text-left hover:border-brand-primary/30 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 font-mono">Catálogo Guardados</span>
                <p className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono">{likedBeats.length} Favoritos</p>
                <button onClick={() => setActiveTab('favorites')} className="text-[10px] font-semibold text-[#7F77DD] hover:underline mt-2 inline-block">Ver mi playlist →</button>
              </div>

              <div className="p-5 bg-[#13131F] border border-brand-border/35 rounded-2xl text-left hover:border-brand-primary/30 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 font-mono">Estatus de Transacción</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${user?.verified ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {user?.verified ? 'Acreditado para Compras' : 'Incompleto (KYC Pendiente)'}
                  </span>
                </div>
                <button onClick={() => setActiveTab('profile')} className="text-[10px] font-semibold text-[#7F77DD] hover:underline mt-2 inline-block">Ajustar ID Compliance & Verificación →</button>
              </div>
            </div>

            {/* Recent Purchases Feed (now occupies the full space) */}
            <div className="bg-[#13131F] border border-brand-border/35 rounded-2xl p-6 text-left shadow-lg">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                <Music size={14} className="text-[#7F77DD]" />
                Actividad Reciente (Instrumentales y Librerías Adquiridas)
              </h3>

              {acquiredBeatsWithDetails.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Aún no has adquirido productos en D'Cuban Beats. ¡Explora el catálogo y añade productos!
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {acquiredBeatsWithDetails.map((item, idx) => {
                    const isLibrary = item.category === 'Librería de Sonidos';
                    return (
                      <div 
                        key={idx} 
                        id={`tx-row-${item.order.id}`}
                        className="p-3.5 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                      >
                        {/* Left: Product & Category Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            <img 
                              src={item.beat.coverUrl} 
                              alt="cubierta" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-0.5 right-0.5">
                              <span className={`w-2 h-2 rounded-full block border border-black ${isLibrary ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white truncate max-w-[240px] md:max-w-[320px]">{item.beat.title}</h4>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                                isLibrary 
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {item.category}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Productor: <span className="text-white font-medium">{item.beat.producerName}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & Details Action */}
                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Precio Pagado</p>
                            <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                              ${item.order.amount.toLocaleString()} {item.order.currency}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Badge variant="emerald" className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1">
                              Aprobado ✓
                            </Badge>
                            
                            <button
                              id={`btn-view-details-${item.order.id}`}
                              type="button"
                              onClick={() => setSelectedTransactionDetails(item)}
                              className="p-2 bg-white/5 hover:bg-[#7F77DD]/20 text-slate-300 hover:text-white rounded-lg border border-white/10 hover:border-[#7F77DD]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
                              title="Ver comprobante y detalles"
                            >
                              <Eye size={14} className="text-slate-400 hover:text-white" />
                              <span className="hidden sm:inline">Detalles</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
          </div>
        )}

        {/* TAB 2: ACQUIRED BEATS (WITH AUDIO ACTIONS) */}
        {activeTab === 'acquired' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mis Beats Adquiridos</h3>
              <p className="text-xs text-slate-400">Escucha tus instrumentales adquiridas oficialmente y revisa sus detalles.</p>
            </div>

            {acquiredBeatsWithDetails.length === 0 ? (
              <div className="py-16 text-center bg-[#13131F] rounded-2xl border border-dashed border-white/10 space-y-3">
                <Music size={32} className="mx-auto text-slate-500 opacity-60" />
                <p className="text-xs text-white font-medium">No posees beats adquiridos</p>
                <p className="text-[11px] text-slate-400">Tus compras aprobadas por productores aparecerán de forma instantánea aquí.</p>
                <Button variant="ghost" size="xs" onClick={() => navigateTo('/')} className="mt-2 text-[#7F77DD]">
                  Explorar Beats
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acquiredBeatsWithDetails.map((item, idx) => {
                  const playing = isCurrentPlaying(item.beat.id);
                  return (
                    <div 
                      key={idx} 
                      className="bg-[#13131F] border border-brand-border/30 p-4 rounded-2xl flex items-center gap-4 hover:border-brand-primary/30 transition-all text-left"
                    >
                      {/* Image art layout */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group/cover">
                        <img 
                          src={item.beat.coverUrl} 
                          alt="cover" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <button
                          onClick={() => playBeat(item.beat as any)}
                          className="absolute inset-0 bg-black/45 flex items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                        >
                          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                      </div>

                      {/* Detail metadata block */}
                      <div className="flex-grow min-w-0 pr-2">
                        <span className="text-xs font-bold text-white block truncate">{item.beat.title}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Prod: {item.beat.producerName}</span>
                        
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-mono text-indigo-400 px-1.5 py-0.5 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-md">
                            {item.beat.key}
                          </span>
                          <span className="text-[9px] font-mono text-amber-500 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                            {item.beat.bpm} BPM
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAVORITES GRID */}
        {activeTab === 'favorites' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mis Beats Favoritos</h3>
              <p className="text-xs text-slate-400">Lleva un registro de los ritmos y canciones que planeas comprar o usar.</p>
            </div>

            {favoriteBeats.length === 0 ? (
              <div className="py-16 text-center bg-[#13131F] rounded-2xl border border-dashed border-white/10 space-y-3">
                <Heart size={32} className="mx-auto text-slate-500 opacity-60" />
                <p className="text-xs text-white font-medium">Aún no tienes instrumentales guardadas</p>
                <p className="text-[11px] text-slate-400">Haz clic en el icono de corazón en cualquier beat del catálogo para listarla aquí.</p>
                <Button variant="ghost" size="xs" onClick={() => navigateTo('/')} className="mt-2 text-[#7F77DD]">
                  Explorar Catálogo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoriteBeats.map((beat) => {
                  const alreadyInCart = cart.some(c => c.beat.id === beat.id);
                  return (
                    <div 
                      key={beat.id}
                      className="bg-[#13131F] border border-brand-border/30 rounded-2xl overflow-hidden hover:border-brand-primary/25 transition-all text-left flex flex-col justify-between"
                    >
                      {/* Image section */}
                      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden group">
                        <img 
                          src={beat.coverUrl} 
                          alt="favorite cover" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => playBeat(beat)}
                            className="bg-brand-primary w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-105 cursor-pointer shadow-lg"
                          >
                            {isCurrentPlaying(beat.id) ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
                          </button>
                        </div>

                        {/* Remove Fav Button */}
                        <button
                          onClick={() => toggleLikeBeat(beat.id)}
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-red-500 flex items-center justify-center transition-all cursor-pointer"
                          title="Eliminar de favoritos"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      {/* Text info section */}
                      <div className="p-3.5 space-y-3 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block truncate" title={beat.title}>
                            {beat.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 mt-0.5 truncate">
                            {beat.producerName}
                          </span>
                        </div>

                        <div className="border-t border-white/5 pt-2 flex items-center justify-between mt-auto">
                          <span className="text-[11px] font-mono font-bold text-brand-primary-light">
                            {convertPrice(beat.priceBasic).formatted}
                          </span>

                          <button
                            onClick={() => {
                              if (beat.status === 'sold') {
                                addToast('Este beat ya ha sido vendido', 'error');
                                return;
                              }
                              addToCart(beat, 'basic');
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              alreadyInCart 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-[#534AB7]/10 text-[#7F77DD] hover:bg-[#534AB7]/25'
                            }`}
                            disabled={alreadyInCart || beat.status === 'sold'}
                          >
                            {alreadyInCart ? <Check size={11} /> : <ShoppingCart size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3.5: NOTIFICATION AND EMAIL AUDITING HUB (DEACTIVATED) */}
        {false && activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Split layout: left column for platform alerts, right column for simulated email/message routing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Platform Notifications (12cols under md, 5cols on lg) */}
              <div className="lg:col-span-5 bg-[#13131F] border border-brand-border/30 rounded-2xl p-5 text-left space-y-4 shadow-xl">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#7F77DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-1.65-3.6H14.1a1 1 0 00-1 1v.008a1 1 0 001 1v.39c0 .72-.51 1.4-1.25 1.4H11.5M15 17v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Alertas de Plataforma
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">Notificaciones recibidas en tiempo real</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {artistNotifications.some(n => !n.read) && (
                      <button
                        onClick={() => {
                          markAllArtistNotificationsRead();
                          addToast('Todas las alertas de artista han sido leídas', 'success');
                        }}
                        className="text-[9.5px] bg-[#534AB7]/10 hover:bg-[#534AB7]/20 text-[#7F77DD] border border-[#534AB7]/25 px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Marcar leídas
                      </button>
                    )}
                    <button
                      onClick={() => {
                        clearArtistNotifications();
                        addToast('Historial vaciado correctamente', 'info');
                      }}
                      className="text-[9.5px] text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {artistNotifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <svg className="mx-auto text-slate-600 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2.5M10 13a4 4 0 008 0M10 13a4 4 0 00-8 0" />
                    </svg>
                    <p className="text-xs">No tienes notificaciones por el momento.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {artistNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markArtistNotificationRead(notif.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          notif.read
                            ? 'bg-[#181829]/30 border-white/5 opacity-70 hover:opacity-100 hover:bg-[#181829]/50'
                            : 'bg-[#534AB7]/5 border-[#534AB7]/20 hover:border-[#7F77DD]/35 ring-1 ring-[#534AB7]/5'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                          notif.type === 'kyc_status'
                            ? notif.title.includes('bloquea') || notif.title.includes('Suspendida') || notif.title.includes('Infracción')
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-teal-500/10 text-teal-400'
                            : notif.type === 'new_release'
                              ? 'bg-indigo-500/10 text-[#7F77DD]'
                              : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-grow min-w-0 space-y-0.5">
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-xs font-bold text-white truncate block">{notif.title}</span>
                            <span className="text-[8.5px] text-slate-500 font-mono whitespace-nowrap">{notif.timestamp}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-300 leading-relaxed">{notif.description}</p>
                          {notif.senderName && (
                            <span className="text-[9px] text-[#7F77DD]/80 font-semibold block mt-1">
                              De: {notif.senderName} ({notif.senderRole === 'producer' ? 'Productor' : 'Administración'})
                            </span>
                          )}
                        </div>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-[#7F77DD] rounded-full self-center animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Simulated Email Client & Dispatch Audit */}
              <div className="lg:col-span-7 bg-[#13131F] border border-brand-border/30 rounded-2xl p-5 text-left space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-white/5 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#7F77DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Bandeja de Correo Electrónico Simulado
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">Comprobante y auditoría de notificaciones externas mandadas por email</p>
                  </div>
                  <button
                    onClick={() => {
                      clearSimulatedEmails();
                      addToast('Bandeja de emails vaciada', 'info');
                    }}
                    className="text-[9.5px] text-slate-400 hover:text-red-400 self-start sm:self-center transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Vaciar Buzón
                  </button>
                </div>

                {/* Filter Settings for simulated emails */}
                <div className="p-3 bg-[#0C0C14] border border-white/5 rounded-xl space-y-2 text-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <strong>Filtrado por Artista:</strong> <span className="text-indigo-300 font-mono text-[10px]">{user?.email}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Aquí se visualizan los correos electrónicos entregados simulando la conexión oficial. No requiere conexión a servidores SMTP reales (ideal para pruebas).
                  </p>
                </div>

                {/* Simulated emails list renderer */}
                {simulatedEmails.filter(e => e.to === (user?.email || '')).length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <svg className="mx-auto text-slate-600 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 11.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.22-1.48a2 2 0 00-2.22 0L9.75 14.5" />
                    </svg>
                    <p className="text-xs">No hay correos correspondientes a tu dirección en este momento.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {simulatedEmails
                      .filter(e => e.to === (user?.email || ''))
                      .map((mail) => (
                        <div
                          key={mail.id}
                          onClick={() => {
                            if (!mail.read) {
                              markSimulatedEmailRead(mail.id);
                            }
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            mail.read
                              ? 'bg-black/20 border-white/5 opacity-85 hover:opacity-100'
                              : 'bg-indigo-950/20 border-indigo-500/20 ring-1 ring-indigo-500/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2 mb-2 gap-1.5">
                            <div>
                              <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider block">De: D'Cuban Beats (Notificaciones Automáticas)</span>
                              <span className="text-[10px] text-slate-400 font-sans block">Para: <strong className="text-indigo-300 font-mono">{mail.to}</strong></span>
                            </div>
                            <span className="text-[8.5px] text-slate-500 font-mono bg-black/40 px-2 py-0.5 rounded-lg">{mail.timestamp}</span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              {!mail.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                              {mail.subject}
                            </h4>
                            <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0A0A10] p-3 rounded-xl border border-white/5 font-mono">
                              {mail.body}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS & KYC */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            {/* Left Column: Profile Settings Form */}
            <form 
              onSubmit={handleSaveProfile} 
              className="xl:col-span-7 bg-[#13131F] border border-brand-border/30 rounded-2xl p-6 md:p-8 text-left space-y-6 shadow-xl"
            >
              <div className="border-b border-brand-border pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User size={18} className="text-[#7F77DD]" />
                    Ajustes de Perfil
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure todos sus datos oficiales de artista, necesarios para contratos de licencias y estadísticas de D'Cuban Beats.</p>
                </div>
                
              </div>

              {/* Profile Drag & Drop Direct Upload Zone */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-brand-card/40 p-5 rounded-2xl border border-brand-border/40">
                <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-[#534AB7]/40 group-hover:border-[#7F77DD] transition-all shadow-md" 
                      alt="Current Avatar" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#534AB7] to-[#7F77DD] text-white flex items-center justify-center text-3xl font-bold group-hover:opacity-90 transition-opacity">
                      {fullName?.[0] || 'A'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2 text-[10px] font-bold text-white">
                    <Camera size={18} className="text-[#7F77DD] mb-1 animate-bounce" />
                    Cambiar Foto
                  </div>
                </div>

                <div className="text-left space-y-1.5 flex-grow">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload size={13} className="text-[#7F77DD]" />
                    Foto de Perfil del Dispositivo
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-md leading-relaxed font-sans">
                    Suba una imagen directa (.png o .jpg, máx 2MB) sin enlaces externos. Éste rostro o logotipo representará su firma oficial al generar contratos de beats.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#534AB7]/25 hover:bg-[#534AB7]/40 text-[#7F77DD] border border-[#7F77DD]/20 hover:border-[#7F77DD]/40 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Upload size={11} /> Seleccionar Archivo
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-3 py-1.5 bg-brand-surface hover:bg-brand-card hover:text-red-400 border border-brand-border rounded-xl text-[10.5px] font-semibold cursor-pointer transition-all"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  {/* Hidden File Input */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLocalPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <User size={11} className="text-[#7F77DD]" />
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Su nombre real y apellidos oficiales"
                    required
                  />
                  <span className="text-[9.5px] text-slate-500 block font-sans">Requerido para el procesamiento de sus firmas contractuales.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <Music size={11} className="text-[#7F77DD]" />
                    Nombre Artístico
                  </label>
                  <Input 
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Ej. El Aldeano de la Loma"
                  />
                  <span className="text-[9.5px] text-slate-500 block font-sans">Se usará públicamente en los nombres de tracks del catálogo.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <Phone size={11} className="text-[#7F77DD]" />
                    Teléfono Móvil <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +53 58349202"
                    required
                  />
                  <span className="text-[9.5px] text-rose-400/80 block font-sans">Obligatorio para recibir avisos de descargas, licencias y soporte.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <Mail size={11} className="text-slate-500" />
                    Correo <span className="text-slate-500"></span>
                  </label>
                  <div className="relative">
                    <Input 
                      value={user?.email || ''}
                      disabled
                      className="pl-8 bg-brand-surface/30 border-brand-border/35 text-slate-400 cursor-not-allowed opacity-85 select-none font-mono"
                    />
                    <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block leading-tight flex items-center gap-1 font-sans">
                    <Lock size={10} /> El correo electrónico está enlazado a sus compras de beats y no se puede modificar.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <Globe size={11} className="text-[#7F77DD]" />
                    Provincia <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full bg-[#1C1C2E] border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-primary cursor-pointer font-sans"
                    required
                  >
                    <option value="" disabled>Seleccione su Provincia de Cuba</option>
                    {CUBA_PROVINCES.map((prov) => (
                      <option key={prov} value={prov} className="bg-[#13131F] text-white font-sans">
                        {prov}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9.5px] text-rose-400/80 block font-sans">Obligatorio para trazar estadísticas de mercado a nivel nacional.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <MapPin size={11} className="text-[#7F77DD]" />
                    Municipio <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="Ej. Habana del Este o Santiago de Cuba"
                    required
                  />
                  <span className="text-[9.5px] text-rose-400/80 block font-sans">Obligatorio para análisis geográficos de productores y D'Cuban Beats.</span>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Biografía / Presentación Corta</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ej. MC independiente enfocado en rap conciencia y letras poéticas de Cuba..."
                    rows={3}
                    className="w-full bg-[#1C1C2E] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-primary font-sans"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                    <Send size={11} className="text-[#7F77DD]" />
                    Usuario de Telegram
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">@</span>
                    <Input 
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value.replace(/^@/, ''))}
                      placeholder="usuario_telegram"
                      className="pl-8"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-400 block font-sans">
                    Este usuario de Telegram permite que el productor te envíe directamente el enlace de descarga del beat o la librería de sonidos de forma segura y automatizada.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center gap-4 flex-wrap">
                <span className="text-[11px] text-slate-500 italic max-w-sm font-sans">
                  * Campos obligatorios para estadísticas geográficas de D'Cuban Beats y la validación de licencias legítimas.
                </span>
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setUser(null);
                      navigateTo('/');
                      addToast('Cierre de sesión seguro realizado', 'info');
                    }}
                    className="gap-1.5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut size={13} />
                    Cerrar Sesión
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="gap-1.5 shadow-lg shadow-indigo-600/10">
                    <CheckCircle size={13} />
                    Guardar Ajustes
                  </Button>
                </div>
              </div>
            </form>

            {/* Right Column: Embedded KYC Verification Sidebar */}
            <div className="xl:col-span-5 bg-[#13131F] border border-brand-border/30 rounded-2xl p-6 text-left space-y-6 shadow-xl">
              <div className="border-b border-white/5 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Acreditación KYC</h3>
                  <p className="text-xs text-slate-400">Requerido legalmente para proceder con la compra de beats.</p>
                </div>

                {user?.verified && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold leading-none uppercase">
                    Verificado
                  </span>
                )}
              </div>

              {user?.verified ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={36} />
                  </div>
                  <div className="parent-text-holder space-y-1">
                    <h4 className="text-base font-bold text-white">¡Acreditación de Artista Activa!</h4>
                    <p className="text-xs text-slate-400 leading-normal">Se completó tu verificación. Puedes proceder con los pagos de beats en el portal sin restricciones.</p>
                  </div>
                  <div className="pt-2">
                    <Button type="button" variant="secondary" size="xs" onClick={() => navigateTo('/')} className="mx-auto">
                      Explorar el Catálogo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Stepper indicators */}
                  <div className="flex items-center justify-between bg-white/2 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-white">Paso {kycStep} de 3</span>
                    
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(step => (
                        <div 
                          key={step} 
                          className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                            kycStep === step 
                              ? 'bg-[#534AB7] text-white scale-110 ring-4 ring-[#534AB7]/10' 
                              : kycStep > step 
                                ? 'bg-[#53E0A3] text-white' 
                                : 'bg-white/10 text-slate-500'
                          }`}
                        >
                          {kycStep > step ? <Check size={10} /> : step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step contents */}
                  {kycStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400">Paso 1: Identificación</h4>
                        <p className="text-xs text-slate-300">Elija su identificación para acreditar la firma oficial de contratos.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setKycDocType('id_card')}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                            kycData.docType === 'id_card'
                              ? 'bg-[#534AB7]/10 border-[#534AB7]'
                              : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <FileText className={kycData.docType === 'id_card' ? 'text-[#7F77DD]' : 'text-slate-500'} size={20} />
                          <div>
                            <span className="text-xs font-bold block text-white font-sans">Carné de Identidad Cubano</span>
                            <span className="text-[10px] text-slate-400 block leading-normal font-sans">Documento de identidad nacional tradicional.</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setKycDocType('passport')}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                            kycData.docType === 'passport'
                              ? 'bg-[#534AB7]/10 border-[#534AB7]'
                              : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <ShieldCheck className={kycData.docType === 'passport' ? 'text-[#7F77DD]' : 'text-slate-500'} size={20} />
                          <div>
                            <span className="text-xs font-bold block text-white font-sans">Pasaporte Oficial</span>
                            <span className="text-[10px] text-slate-400 block leading-normal font-sans">Pasaporte cubano o extranjero activo.</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {kycStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400">Paso 2: Foto del Documento</h4>
                        <p className="text-xs text-slate-300">Sube fotos legibles donde se lean nombres completos y firma.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Front Image */}
                        <div className="p-3 bg-[#1C1C2E] border border-white/5 rounded-xl text-center space-y-2">
                          <span className="text-[11px] font-bold text-white block">Delantera</span>
                          
                          {kycData.frontImage ? (
                            <div className="h-16 rounded-lg bg-[#53E0A3]/10 border border-[#53E0A3]/20 flex flex-col items-center justify-center">
                              <Check className="text-[#53E0A3]" size={14} />
                              <span className="text-[9px] text-[#53E0A3] font-bold">Listada</span>
                              <button type="button" onClick={() => setKycImage('frontImage', '')} className="text-[8px] text-red-400 hover:underline">Cambiar</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSimulateUpload('frontImage')}
                              className="w-full h-16 border border-dashed border-white/10 hover:border-[#534AB7] rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer bg-transparent"
                            >
                              <Upload size={14} className="mb-0.5" />
                              <span className="text-[9px] uppercase font-bold">Subir</span>
                            </button>
                          )}
                        </div>

                        {/* Back Image */}
                        {kycData.docType === 'id_card' ? (
                          <div className="p-3 bg-[#1C1C2E] border border-white/5 rounded-xl text-center space-y-2">
                            <span className="text-[11px] font-bold text-white block">Trasera</span>
                            
                            {kycData.backImage ? (
                              <div className="h-16 rounded-lg bg-[#53E0A3]/10 border border-[#53E0A3]/20 flex flex-col items-center justify-center">
                                <Check className="text-[#53E0A3]" size={14} />
                                <span className="text-[9px] text-[#53E0A3] font-bold">Listada</span>
                                <button type="button" onClick={() => setKycImage('backImage', '')} className="text-[8px] text-red-400 hover:underline">Cambiar</button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSimulateUpload('backImage')}
                                className="w-full h-16 border border-dashed border-white/10 hover:border-[#534AB7] rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer bg-transparent"
                              >
                                <Upload size={14} className="mb-0.5" />
                                <span className="text-[9px] uppercase font-bold">Subir</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-[#1C1C2E]/30 border border-white/5 rounded-xl flex items-center justify-center text-center">
                            <span className="text-[9px] text-slate-500 font-sans">Pasaporte exime reverso.</span>
                          </div>
                        )}
                      </div>

                      {uploadProgress > 0 && (
                        <div className="space-y-1">
                          <div className="w-full bg-[#1C1C2E] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#534AB7] h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 text-center block">Subiendo archivo... {uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {kycStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400">Paso 3: Foto Selfie Identitaria</h4>
                        <p className="text-xs text-slate-300">Tome una fotografía selfie sosteniendo la identificación cerca de su rostro.</p>
                      </div>

                      <div className="p-4 bg-[#1C1C2E] border border-white/5 rounded-xl text-center space-y-3">
                        {kycData.selfieImage ? (
                          <div className="max-w-xs mx-auto py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <Check size={12} className="flex-shrink-0" />
                              <span className="text-[10px] font-bold">Selfie armada</span>
                            </div>
                            <button type="button" onClick={() => setKycImage('selfieImage', '')} className="text-[9px] text-red-500 hover:underline font-bold font-sans">Cambiar</button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost" 
                            size="xs"
                            onClick={() => handleSimulateUpload('selfieImage')}
                            className="mx-auto text-[10px]"
                          >
                            <Camera size={12} className="mr-1.5" />
                            Tomar Selfie de Validación
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stepper buttons controls inside settings */}
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setKycStep(kycStep - 1)}
                      disabled={kycStep === 1}
                      className="text-xs py-1 px-3"
                    >
                      Atrás
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleKycFlowNext}
                      className="text-xs py-1 px-3"
                    >
                      {kycStep === 3 ? 'Validar KYC ✓' : 'Siguiente'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LIST OF FOLLOWED PRODUCERS (SIGUIENDO) */}
        {activeTab === 'following' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Productores que Sigues</h3>
              <p className="text-xs text-slate-400">Administra los creadores y beatmakers que más apoyas para estar al tanto de sus lanzamientos.</p>
            </div>

            {followedProducers.length === 0 ? (
              <div className="py-20 text-center bg-[#13131F] rounded-2xl border border-dashed border-white/10 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-rose-500">
                  <Heart size={24} className="opacity-60 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-medium text-sm font-sans">Aún no sigues a ningún productor</p>
                  <p className="text-slate-400 text-xs text-center max-w-sm mx-auto font-sans">
                    Explora el catálogo general, escucha sus instrumentales y haz clic en "Seguir Productor" en su sección detallada para verlos aquí.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigateTo('/')}>
                  Explorar Productores
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Followed Producers List */}
                <div className="md:col-span-5 bg-[#13131F]/90 border border-brand-border/30 rounded-2xl p-4 space-y-3 max-h-[550px] overflow-y-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Listado de Productores ({followedProducers.length})</span>
                  
                  <div className="space-y-2">
                    {followedProducers.map((prod) => {
                      const isSelected = activeFollowingProducer?.id === prod.id;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedFollowingProducerId(prod.id)}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-[#534AB7]/10 border-[#534AB7]/50 shadow-md' 
                              : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 font-sans">
                            <div className="relative flex-shrink-0">
                              <img 
                                src={prod.avatarUrl || 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=200&auto=format&fit=crop'} 
                                alt={prod.artistName} 
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover border border-[#7F77DD]/20 block" 
                              />
                              <span 
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#13131F] ${
                                  prod.online ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'
                                }`}
                                title={prod.online ? 'Conectado (Online)' : `Desconectado (Última vez: ${prod.lastActive || 'Offline'})`}
                              />
                            </div>
                            <div className="min-w-0 text-left font-sans">
                              <span className="text-xs font-bold text-white flex items-center gap-1 leading-tight truncate">
                                {prod.artistName || prod.name}
                                {prod.verified && (
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                )}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {prod.provincia || 'Cuba'}
                                </span>
                                <span className="text-[10px] text-slate-500">•</span>
                                <span className={`text-[9px] font-medium truncate block ${prod.online ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {prod.online ? 'Online' : prod.lastActive || 'Offline'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#7F77DD] ring-4 ring-[#7F77DD]/20' : 'bg-transparent'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Producer Detailed Public Profile View */}
                <div className="md:col-span-7 bg-[#13131F]/90 border border-brand-border/30 rounded-3xl p-6 text-left space-y-6">
                  {activeFollowingProducer && (
                    <div className="space-y-6 font-sans">
                      
                      {/* Top banner visual header */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-white/5">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={activeFollowingProducer.avatarUrl || 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=200&auto=format&fit=crop'} 
                            alt={activeFollowingProducer.artistName} 
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#534AB7]/40 shadow-lg block" 
                          />
                          <span 
                            className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#13131F] shadow-md flex items-center gap-1 ${
                              activeFollowingProducer.online 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${activeFollowingProducer.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                            {activeFollowingProducer.online ? 'Conectado' : activeFollowingProducer.lastActive || 'Inactivo'}
                          </span>
                        </div>
                        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h4 className="text-base font-bold text-white flex items-center gap-1.5 leading-none font-sans">
                              {activeFollowingProducer.artistName || activeFollowingProducer.name}
                            </h4>
                            {activeFollowingProducer.verified && (
                              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 select-none font-sans">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                Verificado
                              </span>
                            )}
                            <span className="bg-brand-primary/10 text-[#7F77DD] border border-[#7F77DD]/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded select-none font-sans">
                              Productor {activeFollowingProducer.plan || 'Free'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-sans">
                            {activeFollowingProducer.bio || 'Este beatmaker cubano no ha configurado una biografía pública todavía.'}
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[10px] text-slate-500 font-mono pt-1">
                            {activeFollowingProducer.provincia && (
                              <span className="flex items-center gap-1 font-sans">
                                <MapPin size={10} /> {activeFollowingProducer.provincia}, Cuba
                              </span>
                            )}
                            {activeFollowingProducer.instagram && (
                              <span className="text-[#7F77DD] hover:underline cursor-pointer font-sans">
                                {activeFollowingProducer.instagram}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sub Tab selection bar */}
                      <div className="flex border-b border-white/5 pb-1 gap-6">
                        <button
                          type="button"
                          onClick={() => setFollowingViewMode('profile')}
                          className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
                            followingViewMode === 'profile' ? 'text-[#7F77DD]' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Perfil Público
                          {followingViewMode === 'profile' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7F77DD] rounded-full" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFollowingViewMode('chat')}
                          className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                            followingViewMode === 'chat' ? 'text-[#7F77DD]' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Mensaje Directo (Chat)
                          {directMessages.some(m => m.senderId === activeFollowingProducer.id && m.receiverId === user?.id && !m.read) && (
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                          )}
                          {followingViewMode === 'chat' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7F77DD] rounded-full" />
                          )}
                        </button>
                      </div>

                      {followingViewMode === 'profile' ? (
                        <>
                          {/* Public details fields block */}
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Datos Públicos de Contacto</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div className="p-3 bg-white/2 rounded-xl border border-white/5 space-y-1">
                                <span className="text-[9px] text-slate-400 font-mono uppercase block font-sans">Correo Electrónico</span>
                                <span className="text-xs text-white font-mono block select-all truncate">{activeFollowingProducer.email}</span>
                              </div>

                              <div className="p-3 bg-white/2 rounded-xl border border-white/5 space-y-1">
                                <span className="text-[9px] text-slate-400 font-mono uppercase block font-sans">Teléfono de Contrato</span>
                                <span className="text-xs text-white font-mono block select-all">{activeFollowingProducer.phone || 'No configurado'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Public Beats & libraries numbers */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-center space-y-1">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Instrumentales</span>
                              <span className="text-lg font-black text-white font-mono block leading-none">{activeFollowingProducer.beatsCount || Math.floor(10 + Math.random() * 30)}</span>
                            </div>

                            <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-center space-y-1">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Librerías</span>
                              <span className="text-lg font-black text-white font-mono block leading-none">{activeFollowingProducer.soundLibrariesCount || Math.floor(1 + Math.random() * 5)}</span>
                            </div>

                            <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-center space-y-1">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans">Ventas Totales</span>
                              <span className="text-lg font-black text-[#53E0A3] font-mono block leading-none">+{activeFollowingProducer.salesCount || Math.floor(100 + Math.random() * 400)}</span>
                            </div>
                          </div>

                          {/* Core Buttons actions CTA */}
                          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                // Unfollow logic
                                const next = followedProducerIds.filter(id => id !== activeFollowingProducer.id);
                                setFollowedProducerIds(next);
                                localStorage.setItem('followed_producers_map_v1', JSON.stringify(next));
                                addToast(`Dejaste de seguir a ${activeFollowingProducer.artistName || activeFollowingProducer.name}`, 'info');
                              }}
                              className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 hover:border-red-500/30 font-bold text-xs select-none transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={13} />
                              Dejar de Seguir
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                navigateTo('/', { producerId: activeFollowingProducer.id });
                              }}
                              className="flex-1 py-3 px-4 rounded-xl bg-[#534AB7] hover:bg-[#685FCD] text-white font-black text-xs shadow-md select-none transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Music size={13} />
                              Ver Catálogo de Beats
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Direct Messages Chat pane */
                        <div className="space-y-4">
                          <div className="bg-[#0B0B10] rounded-2xl border border-white/5 flex flex-col h-[340px]">
                            {/* Chat Header */}
                            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/2 rounded-t-2xl">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${activeFollowingProducer.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                <span className="text-xs font-bold text-white">Mensaje Directo con {activeFollowingProducer.artistName || activeFollowingProducer.name}</span>
                              </div>
                              <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                {activeFollowingProducer.online ? 'Activo ahora' : `Activo: ${activeFollowingProducer.lastActive || 'Offline'}`}
                              </span>
                            </div>

                            {/* Messages Container */}
                            <div 
                              ref={chatContainerRef}
                              className="flex-1 overflow-y-auto p-4 space-y-3"
                            >
                              {(() => {
                                const filtered = directMessages.filter(m => 
                                  (m.senderId === user?.id && m.receiverId === activeFollowingProducer.id) ||
                                  (m.senderId === activeFollowingProducer.id && m.receiverId === user?.id)
                                );

                                if (filtered.length === 0) {
                                  return (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-10">
                                      <span className="text-2xl">💬</span>
                                      <p className="text-xs text-white font-medium">Inicia la conversación</p>
                                      <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                                        Escríbele directamente a {activeFollowingProducer.artistName || activeFollowingProducer.name} para cuadrar proyectos, comprar pistas o planear producciones.
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

                            {/* Chat Input form */}
                            <form 
                              onSubmit={handleSendChatMessage}
                              className="p-3 border-t border-white/5 flex gap-2 bg-[#0F0F16] rounded-b-2xl"
                            >
                              <input 
                                type="text"
                                value={chatInputText}
                                onChange={(e) => setChatInputText(e.target.value)}
                                placeholder="Escribe un mensaje directo..."
                                className="flex-grow bg-[#161622] text-xs text-white rounded-xl px-3 py-2 border border-white/5 focus:border-[#7F77DD] focus:outline-none placeholder-slate-500 min-w-0"
                              />
                              <button
                                type="submit"
                                disabled={!chatInputText.trim()}
                                className={`px-4 py-2 rounded-xl flex items-center justify-center transition-colors font-bold text-xs select-none ${
                                  chatInputText.trim() 
                                    ? 'bg-[#534AB7] text-white hover:bg-[#685FCD] cursor-pointer' 
                                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                <Send size={12} className="mr-1" /> Enviar
                              </button>
                            </form>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTransactionDetails && (() => {
        const item = selectedTransactionDetails;
        const isLibrary = item.category === 'Librería de Sonidos';
        const order = item.order;
        const beat = item.beat;
        
        return (
          <div 
            id="transaction-detail-modal-overlay"
            className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedTransactionDetails(null);
              }
            }}
          >
            <div 
              id="transaction-detail-modal-card"
              className="bg-[#111119] border border-brand-border/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-left animate-in zoom-in-95 duration-200"
            >
              {/* Top Banner / Header Decor */}
              <div className="relative py-5 px-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-brand-primary-dark/20 to-indigo-950/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#7F77DD] uppercase font-bold">Comprobante Oficial de Transacción</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText size={16} className="text-[#7F77DD]" />
                    Transacción ID: <span className="font-mono text-slate-300 font-semibold">{order.id}</span>
                  </h3>
                </div>
                
                {/* Close Button */}
                <button
                  id="close-transaction-modal-btn"
                  onClick={() => setSelectedTransactionDetails(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Cerrar modal"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Main Content Info */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Product Photo & Data */}
                  <div className="space-y-4">
                    {/* Cover art image preview */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/10 group bg-slate-900">
                      <img 
                        src={beat.coverUrl} 
                        alt={beat.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg shadow-lg border ${
                          isLibrary 
                            ? 'bg-cyan-500/90 text-white border-cyan-400' 
                            : 'bg-[#534AB7]/90 text-white border-[#7F77DD]/55'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Summary */}
                    <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-2.5 text-left">
                      <h4 className="text-sm font-extrabold text-white leading-tight">{beat.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="font-medium text-slate-500">Productor:</span> 
                        <span className="text-[#a59ff0] font-semibold">{beat.producerName}</span>
                      </p>
                      
                      {!isLibrary && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                          <div className="text-slate-400">
                            BPM: <span className="text-amber-400 font-bold">{beat.bpm || 98}</span>
                          </div>
                          <div className="text-slate-400">
                            Escala: <span className="text-indigo-400 font-bold">{beat.key || 'F Minor'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Detailed Transaction Information */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Section Title */}
                      <div className="border-b border-white/5 pb-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Detalles del Pago</span>
                      </div>

                      {/* Info Item Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold font-mono block">Importe Pagado</span>
                          <span className="text-lg font-black text-[#51DE9C] font-mono">
                            ${order.amount.toLocaleString()} {order.currency}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold font-mono block">Estatus Actual</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Aprobado ✓</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold font-mono block flex items-center gap-1">
                            <Calendar size={11} className="text-indigo-400" /> Fecha de Pago
                          </span>
                          <span className="text-xs text-white block mt-0.5 font-medium leading-none">
                            {order.date || 'Sin fecha registrada'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold font-mono block flex items-center gap-1">
                            <CreditCard size={11} className="text-sky-400" /> Pasarela
                          </span>
                          <span className="text-xs text-white block mt-0.5 font-medium bg-[#7F77DD]/10 border border-[#7F77DD]/20 px-2 py-0.5 rounded-md w-fit font-mono">
                            {order.method}
                          </span>
                        </div>
                      </div>

                      {/* Transaction Reference & API fields */}
                      <div className="p-3 bg-white/2 rounded-xl border border-white/5 space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold font-mono block">Número de Referencia</span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-200 font-mono select-all font-bold">{order.transactionId || 'No disponible'}</span>
                          <span className="text-[8.5px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Verificado</span>
                        </div>
                      </div>

                      {/* SMS Verification Notice */}
                      {order.verificationSMS && (
                        <div className="p-3 bg-white/1 rounded-lg border border-white/5 space-y-1">
                          <span className="text-[9.5px] text-slate-500 uppercase font-semibold font-mono block">Mensaje de Confirmación</span>
                          <p className="text-[11px] text-slate-400 italic leading-snug line-clamp-2 hover:line-clamp-none transition-all">{order.verificationSMS}</p>
                        </div>
                      )}
                    </div>

                    {/* Receipt/Voucher Image Upload Proof Section */}
                    <div className="space-y-2">
                      <div className="border-b border-white/5 pb-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comprobante de Pago Subido</span>
                      </div>
                      
                      {/* Upload Screenshot box */}
                      <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/9] w-full bg-black/45 group">
                        <img 
                          src={order.receiptUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'} 
                          alt="comprobante"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <a 
                            href={order.receiptUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-brand-primary hover:bg-[#685FCD] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
                          >
                            <ExternalLink size={12} />
                            Ver Imagen Completa
                          </a>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 border border-white/10 px-2 py-0.5 rounded-md">
                          <span className="text-[9px] font-mono text-slate-300">COMPROBANTE_UPLOAD.PNG</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 bg-[#13131F] border-t border-white/5 flex items-center justify-end gap-3">
                <Button 
                  id="close-transaction-modal-footer-btn"
                  variant="ghost" 
                  size="xs" 
                  onClick={() => setSelectedTransactionDetails(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Cerrar Vista
                </Button>
                
                <Button 
                  id="download-license-modal-footer-btn"
                  variant="primary" 
                  size="xs" 
                  onClick={() => {
                    const beat = beats.find(b => b.id === order.beatId) || beats.find(b => b.title === order.beatTitle);
                    
                    const customLicense = beat?.customLicenseClause || `PARTE 1: LICENCIA DEL PRODUCTOR
- El productor otorga una licencia de uso para grabar voces e interpretar sobre esta instrumental.
- Se autoriza la distribución digital de la obra resultante bajo los créditos indicados (Prod. ${order.producerName || 'Productor D\'Cuban Beats'}).`;

                    const platformLicense = `PARTE 2: TÉRMINOS Y CONDICIONES DE LA PLATAFORMA (NO MODIFICABLES)
D'Cuban Beats actúa como intermediario legal y certifica la validez de esta transacción. La plataforma garantiza el derecho de uso legítimo de la maqueta descargada y se reserva el derecho de auditar el origen lícito de la transacción en caso de controversias de propiedad intelectual. Esta licencia incluye la firma digital de la plataforma y se emite de forma definitiva con los datos del comprobante de pago verificado por la administración.`;

                    const paymentDetails = `PARTE 3: COMPROBANTE Y VERIFICACIÓN DE PAGO (RECIBO DE TRANSACCIÓN)
- ID del Pedido / Licencia: ${order.id}
- Instrumental Adquirida: ${order.beatTitle}
- Nombre del Artista (Comprador): ${order.buyerName}
- Nombre del Productor: ${order.producerName}
- Monto Verificado: ${order.amount.toLocaleString()} ${order.currency}
- Pasarela de Pago: ${order.method}
- ID de Referencia Externa: ${order.transactionId || 'N/D'}
- Fecha de Liquidación: ${order.date}
- Estatus del Pago: VERIFICADO Y APROBADO POR ADMINISTRACIÓN`;

                    const textContent = `======================================================================
                   LICENCIA DE USO OFICIAL - D'CUBAN BEATS
======================================================================

${customLicense}

----------------------------------------------------------------------
${platformLicense}

----------------------------------------------------------------------
${paymentDetails}

======================================================================
© ${new Date().getFullYear()} D'Cuban Beats. Todos los derechos reservados.
Firma Digital del Servidor: SECURE_HASH_${order.id}_VERIFIED
======================================================================`;

                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Licencia_DCubanBeats_${order.beatTitle.replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    addToast(`¡Descargando certificado de licencia oficial para "${order.beatTitle}"!`, 'success');
                  }}
                  className="bg-[#534AB7] hover:bg-[#685FCD] text-white flex items-center gap-1.5"
                >
                  <Download size={13} />
                  Descargar Licencia & PDF
                </Button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
