import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  User, CheckCircle, Music, Heart, Camera, FileText, 
  ShieldCheck, Upload, Download, Trash2, LayoutDashboard, 
  SlidersHorizontal, Check, Play, Pause, ShoppingCart, AlertCircle,
  Mail, Phone, Lock, MapPin, Globe, FileImage
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
    user, updateUserProfile, beats, orders, likedBeats = [], toggleLikeBeat,
    kycStep, setKycStep, kycData, setKycDocType, setKycImage, completeKyc, 
    addToast, addToCart, cart, playBeat, activeBeat, isPlaying, navigateTo
  } = useApp();

  const [activeTab, setActiveTab] = useState<'desktop' | 'acquired' | 'favorites' | 'profile' | 'kyc'>('desktop');

  // Form input states
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [artistName, setArtistName] = useState(user?.artistName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [municipio, setMunicipio] = useState(user?.municipio || '');
  const [provincia, setProvincia] = useState(user?.provincia || '');

  // File upload input ref for profile photo from device
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KYC upload mock spinner
  const [uploadProgress, setUploadProgress] = useState(0);

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
      return {
        order: ord,
        beat: matchedBeat || {
          id: ord.beatId,
          title: ord.beatTitle,
          producerName: ord.producerName,
          producerId: ord.producerId,
          genre: 'Urbano',
          bpm: 98,
          key: 'F# Minor',
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
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
      municipio: municipio.trim()
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
                {user?.artistName || user?.fullName || user?.name || 'Artista CubaBeats'}
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

        <div className="z-10 flex-shrink-0">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigateTo('/')}
            className="w-full md:w-auto hover:bg-[#534AB7]/10"
          >
            <Music size={14} className="mr-1.5 text-[#7F77DD]" />
            Catálogo CubaBeats
          </Button>
        </div>
      </div>

      {/* 2. Selection Tabs */}
      <div className="flex border-b border-brand-border/30 gap-1 overflow-x-auto pb-0.5">
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
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <SlidersHorizontal size={14} />
          Ajustes de Perfil
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'kyc' 
              ? 'border-brand-primary text-white bg-white/5 rounded-t-xl' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/2'
          }`}
        >
          <ShieldCheck size={14} />
          Verificación (KYC)
        </button>
      </div>

      {/* 3. Panel Tab Rendering */}
      <div className="space-y-6">
        
        {/* TAB 1: DESKTOP HOME SUMMARY */}
        {activeTab === 'desktop' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Warning if unverified */}
            {!user?.verified && (
              <div className="p-5.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
                <div className="flex items-center gap-3.5 flex-col sm:flex-row">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0 animate-bounce">
                    <AlertCircle size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">¡Acreditación KYC Obligatoria Requerida!</h4>
                    <p className="text-xs text-amber-200/80 leading-relaxed font-normal">
                      Antes de realizar compras en CubaBeats, debes verificar tu cuenta subiendo una identificación. Esto garantiza licencias legalmente defendibles contra infracciones.
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  size="xs" 
                  onClick={() => setActiveTab('kyc')}
                  className="bg-amber-500 text-black border-none hover:bg-amber-600 font-bold flex-shrink-0"
                >
                  Verificarse Ahora
                </Button>
              </div>
            )}

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
                <button onClick={() => setActiveTab('kyc')} className="text-[10px] font-semibold text-[#7F77DD] hover:underline mt-2 inline-block">Ajustar ID Compliance →</button>
              </div>
            </div>

            {/* Recent Purchases Feed (Inline mini checklist) */}
            <div className="bg-[#13131F] border border-brand-border/35 rounded-2xl p-5 text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5">Actividad Reciente</h3>

              {acquiredBeatsWithDetails.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Aún no has adquirido beats en CubaBeats. ¡Explora el catálogo y añade instrumentales!
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-[250px] overflow-y-auto">
                  {acquiredBeatsWithDetails.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.beat.coverUrl} 
                          alt="art" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover" 
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">{item.beat.title}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Prod. {item.beat.producerName} • {item.order.id} </span>
                        </div>
                      </div>
                      <Badge variant="emerald" className="text-[9px] uppercase tracking-wider font-extrabold">Adquirido</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}

        {/* TAB 2: ACQUIRED BEATS (WITH AUDIO ACTIONS) */}
        {activeTab === 'acquired' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mis Licencias y Archivos Adquiridos</h3>
              <p className="text-xs text-slate-400">Escucha tus instrumentales y descarga los masters y multitracks en alta fidelidad.</p>
            </div>

            {acquiredBeatsWithDetails.length === 0 ? (
              <div className="py-16 text-center bg-[#13131F] rounded-2xl border border-dashed border-white/10 space-y-3">
                <Music size={32} className="mx-auto text-slate-500 opacity-60" />
                <p className="text-xs text-white font-medium">No posees descargas activas</p>
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

                      {/* Downloads actions */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => {
                            addToast(`Iniciando descarga: ${item.beat.title} (Master HQ .WAV y Stems)`, 'success');
                          }}
                          className="p-2.5 bg-brand-primary-dark/20 hover:bg-brand-primary/20 text-brand-primary-light border border-brand-primary-light/15 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                          title="Descargar paquete de pistas multitrack y WAV master"
                        >
                          <Download size={14} />
                        </button>
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
                            ${beat.priceBasic.toLocaleString()} CUP
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

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-[#13131F] border border-brand-border/30 rounded-2xl p-6 md:p-8 text-left max-w-3xl space-y-8 animate-in fade-in duration-200 shadow-xl">
            
            <div className="border-b border-brand-border pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User size={18} className="text-[#7F77DD]" />
                  Ajustes de Perfil de Artista
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure todos sus datos oficiales de artista, necesarios para contratos de licencias y estadísticas de CubaBeats.</p>
              </div>
              <span className="text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-lg bg-[#534AB7]/15 text-[#7F77DD] border border-[#7F77DD]/20">
                Cliente / MC
              </span>
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
                <span className="text-[9.5px] text-slate-500 block">Requerido para el procesamiento de sus firmas contractuales.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Music size={11} className="text-[#7F77DD]" />
                  Aka / Nombre Artístico
                </label>
                <Input 
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Ej. El Aldeano de la Loma"
                />
                <span className="text-[9.5px] text-slate-500 block">Se usará públicamente en los nombres de tracks del catálogo.</span>
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
                <span className="text-[9.5px] text-rose-400/80 block">Obligatorio para recibir avisos de descargas, licencias y soporte.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Mail size={11} className="text-slate-500" />
                  Correo de la Cuenta <span className="text-slate-500">(No modificable)</span>
                </label>
                <div className="relative">
                  <Input 
                    value={user?.email || ''}
                    disabled
                    className="pl-8 bg-brand-surface/30 border-brand-border/35 text-slate-400 cursor-not-allowed opacity-85 select-none font-mono"
                  />
                  <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-tight flex items-center gap-1">
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
                <span className="text-[9.5px] text-rose-400/80 block">Obligatorio para trazar estadísticas de mercado a nivel nacional.</span>
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
                <span className="text-[9.5px] text-rose-400/80 block">Obligatorio para análisis geográficos de productores y CubaBeats.</span>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Biografía / Presentación Corta</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ej. Mc independiente enfocado en rap conciencia y letras poéticas de Cuba..."
                  rows={3}
                  className="w-full bg-[#1C1C2E] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-primary font-sans"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center gap-4 flex-wrap">
              <span className="text-[11px] text-slate-500 italic max-w-sm font-sans">
                * Campos obligatorios para estadísticas geográficas de CubaBeats y la validación de licencias legítimas.
              </span>
              <Button type="submit" variant="primary" size="sm" className="gap-1.5 shadow-lg shadow-indigo-600/10">
                <CheckCircle size={13} />
                Guardar Ajustes de Perfil
              </Button>
            </div>
          </form>
        )}

        {/* TAB 5: KYC VERIFICATION PORTAL */}
        {activeTab === 'kyc' && (
          <div className="max-w-xl bg-[#13131F] border border-brand-border/30 rounded-2xl p-6 text-left space-y-6 animate-in fade-in duration-200">
            
            <div className="border-b border-white/5 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Acreditación de Identidad (KYC)</h3>
                <p className="text-xs text-slate-400">Requerido por regulaciones para habilitar la adquisición legítima de beats.</p>
              </div>

              {user?.verified && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-bold leading-none uppercase">
                  Verificado
                </span>
              )}
            </div>

            {user?.verified ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">¡Tu cuenta está completamente Acreditada!</h4>
                  <p className="text-xs text-slate-400">Puedes comprar los beats que quieras en la plataforma sin restricciones.</p>
                </div>
                <div className="pt-2">
                  <Button variant="secondary" size="xs" onClick={() => navigateTo('/')} className="mx-auto">
                    Explorar el Catálogo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stepper indicators */}
                <div className="flex items-center justify-between bg-white/2 p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-white">Paso {kycStep} de 3</span>
                  
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(step => (
                      <div 
                        key={step} 
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                          kycStep === step 
                            ? 'bg-brand-primary text-white scale-110 ring-4 ring-[#534AB7]/10' 
                            : kycStep > step 
                              ? 'bg-emerald-500 text-white' 
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
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400">Paso 1: Tipo de Documento</h4>
                      <p className="text-xs text-slate-300">Elija qué identificación oficial usará para acreditar su identidad en la plataforma.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <button
                        onClick={() => setKycDocType('id_card')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                          kycData.docType === 'id_card'
                            ? 'bg-brand-primary/10 border-brand-primary'
                            : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <FileText className={kycData.docType === 'id_card' ? 'text-[#7F77DD]' : 'text-slate-500'} size={22} />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold block text-white">Carné de Identidad Cubano</span>
                          <span className="text-[10px] text-slate-400 block leading-relaxed">Documento de identidad oficial físico tradicional.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setKycDocType('passport')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                          kycData.docType === 'passport'
                            ? 'bg-brand-primary/10 border-brand-primary'
                            : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <ShieldCheck className={kycData.docType === 'passport' ? 'text-[#7F77DD]' : 'text-slate-500'} size={22} />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold block text-white">Pasaporte Oficial</span>
                          <span className="text-[10px] text-slate-400 block leading-relaxed">Pasaporte internacional cubano u extranjero activo.</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {kycStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400">Paso 2: Foto del Documento</h4>
                      <p className="text-xs text-slate-300">Sube fotos bien nítidas donde se lean todos tus nombres, número oficial y firma.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front art */}
                      <div className="p-4 bg-[#1C1C2E] border border-white/5 rounded-2xl text-center space-y-3">
                        <span className="text-xs font-bold text-white block">Imagen Delantera</span>
                        
                        {kycData.frontImage ? (
                          <div className="h-20.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                            <Check className="text-emerald-400" size={16} />
                            <span className="text-[10px] text-emerald-400 font-bold mt-1">Listo</span>
                            <button onClick={() => setKycImage('frontImage', '')} className="text-[9px] text-red-400 hover:underline mt-1 font-semibold">Cambiar</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSimulateUpload('frontImage')}
                            className="w-full h-20.5 border border-dashed border-white/10 hover:border-brand-primary rounded-xl flex flex-col items-center justify-center p-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <Upload size={16} className="mb-1" />
                            <span className="text-[10px] uppercase font-bold">Subir Anverso</span>
                          </button>
                        )}
                      </div>

                      {/* Back art (for id card only) */}
                      {kycData.docType === 'id_card' ? (
                        <div className="p-4 bg-[#1C1C2E] border border-white/5 rounded-2xl text-center space-y-3">
                          <span className="text-xs font-bold text-white block">Imagen Trasera</span>
                          
                          {kycData.backImage ? (
                            <div className="h-20.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                              <Check className="text-emerald-400" size={16} />
                              <span className="text-[10px] text-emerald-400 font-bold mt-1">Listo</span>
                              <button onClick={() => setKycImage('backImage', '')} className="text-[9px] text-red-400 hover:underline mt-1 font-semibold">Cambiar</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSimulateUpload('backImage')}
                              className="w-full h-20.5 border border-dashed border-white/10 hover:border-brand-primary rounded-xl flex flex-col items-center justify-center p-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <Upload size={16} className="mb-1" />
                              <span className="text-[10px] uppercase font-bold">Subir Reverso</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-[#1C1C2E]/50 border border-white/5 rounded-2xl flex items-center justify-center text-center">
                          <p className="text-[10px] text-slate-500 leading-normal">Los pasaportes no exigen imagen reversible trasera.</p>
                        </div>
                      )}
                    </div>

                    {uploadProgress > 0 && (
                      <div className="space-y-1">
                        <div className="w-full bg-[#1C1C2E] h-1.5 rounded-full overflow-hidden">
                          <div className="gradient-primary h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">Subiendo archivo... {uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                )}

                {kycStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400">Paso 3: Foto Selfie Identitaria</h4>
                      <p className="text-xs text-slate-300">Tome una fotografía selfie sosteniendo el documento oficial cerca de su rostro.</p>
                    </div>

                    <div className="p-6 bg-[#1C1C2E] border border-white/5 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#534AB7]/10 text-[#7F77DD] flex items-center justify-center mx-auto">
                        <Camera size={20} />
                      </div>

                      {kycData.selfieImage ? (
                        <div className="max-w-xs mx-auto py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Check size={14} className="flex-shrink-0" />
                            <span className="text-[10px] font-bold">Foto selfie armada y lista</span>
                          </div>
                          <button onClick={() => setKycImage('selfieImage', '')} className="text-[9px] text-red-450 hover:underline cursor-pointer font-bold">Cambiar</button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost" 
                          size="xs"
                          onClick={() => handleSimulateUpload('selfieImage')}
                          className="mx-auto"
                        >
                          <Camera size={12} className="mr-1.5" />
                          Tomar Selfie de Validación
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer buttons controls */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setKycStep(kycStep - 1)}
                    disabled={kycStep === 1}
                  >
                    Atrás
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleKycFlowNext}
                  >
                    {kycStep === 3 ? 'Enviar y Aprobar' : 'Siguiente'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
