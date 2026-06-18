import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Music, Play, Pause, ShoppingCart, 
  Tag, Download, Calendar, Flame, Eye, Edit2, CheckCircle, 
  ExternalLink, ArrowRight, Star, Heart, Radio, Disc
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { BeatCard } from '../../components/beats/BeatCard';
import { BeatCardSkeleton } from '../../components/beats/BeatCardSkeleton';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const CatalogPage: React.FC = () => {
  const { 
    beats, addToCart, cart, playBeat, activeBeat, isPlaying, 
    selectedBeatId, selectedProducerId, navigateTo, user, updateUserProfile,
    verifiedProducersTask, addToast, likedBeats, toggleLikeBeat
  } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [maxBpm, setMaxBpm] = useState(160);
  const [minBpm, setMinBpm] = useState(70);
  const [showFilters, setShowFilters] = useState(false);

  // Simulated Async Fetching Loading State 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Shimmer and pulse skeleton loads for 1.3 seconds on page mount
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);
    
    // Check deep-linking query params
    const params = new URLSearchParams(window.location.search);
    const bId = params.get('beatId');
    const pId = params.get('producerId');
    if (bId) {
      navigateTo('/', { beatId: bId });
    } else if (pId) {
      navigateTo('/', { producerId: pId });
    }

    return () => clearTimeout(timer);
  }, [navigateTo]);

  // Profile Edit Modal States
  const [bioEdit, setBioEdit] = useState('');
  const [avatarEdit, setAvatarEdit] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Genre Options
  const GENRES = ['Todos', 'Reggaetón', 'Trap', 'Dembow', 'R&B', 'Hip Hop', 'Drill', 'Son', 'Salsa', 'Timba', 'Reparto', 'Cubatón', 'Merengue', 'Bachata', 'Fusión'];

  // 1. FILTERING BEATS LOGIC
  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      const matchesSearch = 
        beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.producerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGenre = selectedGenre === 'Todos' || beat.genre.toLowerCase() === selectedGenre.toLowerCase();
      const matchesBpm = beat.bpm >= minBpm && beat.bpm <= maxBpm;

      return matchesSearch && matchesGenre && matchesBpm;
    });
  }, [beats, searchQuery, selectedGenre, minBpm, maxBpm]);

  // 2. ACTIVE BEAT DETAILS
  const detailBeat = useMemo(() => {
    if (selectedBeatId) {
      return beats.find(b => b.id === selectedBeatId) || null;
    }
    return null;
  }, [selectedBeatId, beats]);

  // 3. PRODUCER PUBLIC VIEWS
  const detailProducer = useMemo(() => {
    if (selectedProducerId) {
      return verifiedProducersTask.find(p => p.id === selectedProducerId) || 
             verifiedProducersTask.find(p => p.artistName?.toLowerCase() === selectedProducerId.toLowerCase()) ||
             {
               id: selectedProducerId,
               name: 'Productor Cubano',
               artistName: 'Havana Pro',
               email: 'producer@cubabeats.cu',
               role: 'producer' as const,
               plan: 'Pro' as const,
               verified: true,
               bio: 'Ingeniero de sonidos y productor experimental con sede en Guanabacoa, La Habana. Fusionando ritmos afrocubanos con bombo rap trap.',
               avatarUrl: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=200&auto=format&fit=crop',
               beatsCount: 8,
               salesCount: 4,
               totalEarningsCUP: 23000
             };
    }
    return null;
  }, [selectedProducerId, verifiedProducersTask]);

  // Producer specific filtered beats
  const producerBeats = useMemo(() => {
    if (detailProducer) {
      return beats.filter(b => b.producerId === detailProducer.id || b.producerName === detailProducer.artistName);
    }
    return [];
  }, [detailProducer, beats]);

  const isCurrentPlaying = (bId: string) => {
    return activeBeat?.id === bId && isPlaying;
  };

  const handleUpdateProfile = () => {
    updateUserProfile({
      bio: bioEdit,
      avatarUrl: avatarEdit || undefined
    });
    setIsEditingProfile(false);
  };

  const openProfileEdit = () => {
    setBioEdit(user?.bio || '');
    setAvatarEdit(user?.avatarUrl || '');
    setIsEditingProfile(true);
  };

  const isOwnProducerProfile = user?.role === 'producer' && detailProducer?.id === 'p2';

  return (
    <div className="px-4 md:px-10 lg:px-14 py-6 max-w-7xl mx-auto space-y-10">
      
      {/* 1. HERO BANNER LANDING */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl purple-glow border border-brand-primary-light/10">
        {/* Background Canvas Vector Art emulation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0D0D14] via-[#1C1C2E] to-[#26215C] z-0" />
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#0D0D14] to-transparent opacity-80 z-0" />
        
        {/* Absolute SVG shapes */}
        <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none z-0">
          <svg width="450" height="100%" viewBox="0 0 450 300" fill="none">
            <circle cx="250" cy="150" r="120" stroke="#7F77DD" strokeWidth="8" strokeDasharray="10 15 animate-spin" />
            <circle cx="250" cy="150" r="80" stroke="#E24B4A" strokeWidth="4" />
            <path d="M 150,150 L 350,150" stroke="#7F77DD" strokeWidth="3" />
            <path d="M 250,50 L 250,250" stroke="#E24B4A" strokeWidth="3" />
          </svg>
        </div>

        {/* Content Box */}
        <div className="relative z-10 px-8 py-12 md:p-14 text-left max-w-xl space-y-5">
          <Badge variant="purple" className="bg-brand-primary-light/20 text-brand-primary-light border-brand-primary-light/40 font-bold tracking-wider rounded-lg uppercase">
            🔥 Mercado Líder en Cuba
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Beats Exclusivos de <span className="text-brand-primary-light bg-clip-text">Productores Cubanos</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-md">
            Instrumentales de alta calidad con sonido único caribeño. Descarga demostraciones y paga en pesos locales vía <span className="text-emerald-400 font-bold">Transfermóvil</span>, <span className="text-cyan-400 font-bold">EnZona</span> o <span className="text-sky-400 font-bold">QvaPay</span>.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-3">
            <Button variant="primary" onClick={() => {
              const el = document.getElementById('catalog-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} className="group">
              Explorar Catálogo
              <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {user?.role === 'client' && (
              <Button variant="secondary" onClick={() => navigateTo('/register')}>
                Vender mis Beats
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC FILTERS TOOLBAR */}
      <div className="bg-[#13131F] border border-[rgba(127,119,221,0.15)] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main search input */}
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, productor, etiquetas (#lofi, #trap)..."
              className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.2)] rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-white/30 focus:border-[#7F77DD] outline-none"
            />
          </div>

          {/* Filter toggle and status info */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/40 font-mono">
              Encontrados: {filteredBeats.length} beats
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 bg-[#1C1C2E] rounded-xl text-xs border border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${showFilters ? 'text-brand-primary-light border-[#534AB7]' : 'text-white/70'}`}
            >
              <SlidersHorizontal size={14} />
              Rango BPM / Filtros
            </button>
          </div>
        </div>

        {/* Slidable Genre Badges row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 border-t border-white/5 scrollbar-thin">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'gradient-primary text-white shadow-md'
                  : 'bg-[#1C1C2E] border border-white/5 text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Sliding BPM toggles expanded */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#0D0D14] rounded-xl border border-white/5 animate-in slide-in-from-top-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-white/60 uppercase tracking-widest font-bold">BPM Mínimo: {minBpm}</span>
              </div>
              <input
                type="range"
                min="60"
                max="120"
                value={minBpm}
                onChange={(e) => setMinBpm(Number(e.target.value))}
                className="w-full accent-brand-primary-light cursor-pointer h-1 rounded-lg bg-gray-700"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-white/60 uppercase tracking-widest font-bold">BPM Máximo: {maxBpm}</span>
              </div>
              <input
                type="range"
                min="120"
                max="200"
                value={maxBpm}
                onChange={(e) => setMaxBpm(Number(e.target.value))}
                className="w-full accent-brand-primary-light cursor-pointer h-1 rounded-lg bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. CATALOG LISTING GRID */}
      <div id="catalog-grid" className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-brand-accent-amber" />
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">Beats de Tendencia</h2>
          </div>
          <span className="text-xs text-[#7F77DD] font-semibold">Sonido de Cuba en Vivo</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <BeatCardSkeleton key={idx} index={idx} />
            ))}
          </div>
        ) : filteredBeats.length === 0 ? (
          <div className="py-20 text-center bg-[#13131F] rounded-3xl border border-dashed border-white/10 space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/30">
              <Music size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-white font-medium text-sm">No se encontraron beats disponibles</p>
              <p className="text-white/40 text-xs">Intenta relajar los filtros de búsqueda o cambia de género.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSelectedGenre('Todos'); setMinBpm(70); setMaxBpm(160); }}>
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBeats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL: BEAT DETAIL SHEET VIEW */}
      <Modal
        isOpen={!!selectedBeatId && !selectedProducerId}
        onClose={() => navigateTo('/')}
        title="Detalles Musicales del Beat"
        themeMode="dark"
        maxWidth="max-w-2xl"
      >
        {detailBeat && (
          <div className="space-y-6 text-left">
            {/* Split top */}
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Cover Art layout */}
              <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 mx-auto sm:mx-0">
                <img 
                  src={detailBeat.coverUrl} 
                  alt="detail cover" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
                <button
                  onClick={() => playBeat(detailBeat)}
                  className="absolute inset-0 bg-black/45 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  {isCurrentPlaying(detailBeat.id) ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" className="ml-1" />
                  )}
                </button>
              </div>

              {/* Title, BPM, Key details */}
              <div className="flex-grow space-y-3">
                <div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{detailBeat.title}</h4>
                  <p 
                    onClick={() => navigateTo('/', { producerId: detailBeat.producerId })}
                    className="text-brand-primary-light text-xs font-semibold mt-1 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    Producido por {detailBeat.producerName}
                    <ExternalLink size={11} />
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <Badge variant="purple">{detailBeat.genre}</Badge>
                  <span className="bg-[#1C1C2E] px-2.5 py-1 rounded text-white/70 border border-white/5">🎹 Escala: {detailBeat.key}</span>
                  <span className="bg-[#1C1C2E] px-2.5 py-1 rounded text-white/70 border border-white/5">⏱️ BPM: {detailBeat.bpm}</span>
                </div>

                <p className="text-white/60 text-xs leading-relaxed font-normal">
                  {detailBeat.description || 'Sin descripción adicional para este beat. Mezcla premium estéreo con compresores analógicos.'}
                </p>
              </div>
            </div>

            {/* Platform metrics stats */}
            <div className="grid grid-cols-3 gap-2 bg-[#0C0C14] p-3 rounded-xl text-center border border-white/5">
              <div className="flex flex-col justify-center py-0.5">
                <span className="text-[10px] text-white/40 block">Reproducciones</span>
                <span className="font-mono text-xs font-semibold">{detailBeat.plays.toLocaleString()}</span>
              </div>
              <div 
                onClick={() => toggleLikeBeat(detailBeat.id)}
                className="flex flex-col justify-center py-0.5 cursor-pointer group hover:bg-white/5 rounded-lg transition-all"
                title={likedBeats.includes(detailBeat.id) ? 'Quitar de favoritos' : 'Me gusta'}
              >
                <span className="text-[10px] text-white/40 block flex items-center justify-center gap-1 group-hover:text-rose-400">
                  <Heart size={10} className={likedBeats.includes(detailBeat.id) ? "fill-rose-500 text-rose-500" : "text-white/40 group-hover:text-rose-400"} />
                  Me gusta
                </span>
                <span className={`font-mono text-xs font-semibold ${likedBeats.includes(detailBeat.id) ? "text-rose-400 font-bold" : "text-white group-hover:text-rose-400"}`}>
                  {((detailBeat.likes ?? Math.max(5, Math.floor((detailBeat.plays * 0.18) + (detailBeat.id.charCodeAt(detailBeat.id.length - 1) % 15)))) + (likedBeats.includes(detailBeat.id) ? 1 : 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col justify-center py-0.5">
                <span className="text-[10px] text-white/40 block">Lanzamiento</span>
                <span className="text-xs font-semibold">{detailBeat.releasedAt}</span>
              </div>
            </div>

            {/* License options selector details */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white/60">Licenciamiento Disponible</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Basic License info */}
                <div className="bg-[#1C1C2E] p-4 rounded-xl border border-[rgba(127,119,221,0.2)] flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">Licencia Básica</span>
                      <span className="text-xs text-brand-primary-light font-bold">${detailBeat.priceBasic} CUP</span>
                    </div>
                    <ul className="text-[10px] text-white/50 space-y-1 pt-2 list-disc list-inside">
                      <li>Archivo MP3 de alta calidad</li>
                      <li>Hasta 10,000 reproducciones</li>
                      <li>Uso no exclusivo</li>
                    </ul>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth 
                    onClick={() => {
                      addToCart(detailBeat, 'basic');
                      navigateTo('/');
                    }}
                    disabled={detailBeat.status === 'sold'}
                    className="mt-4 text-xs"
                  >
                    Añadir Básica
                  </Button>
                </div>

                {/* 2. Exclusive License info */}
                <div className="bg-[#1C1C2E] p-4 rounded-xl border border-[#7F77DD]/40 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#7F77DD] text-[#0D0D14] font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-bl">
                    Único
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">Licencia Exclusiva</span>
                      <span className="text-xs text-brand-accent-amber font-bold">${detailBeat.priceExclusive} CUP</span>
                    </div>
                    <ul className="text-[10px] text-white/50 space-y-1 pt-2 list-disc list-inside">
                      <li>Archivos WAV + Tracks separados (STEMS)</li>
                      <li>Uso comercial ilimitado</li>
                      <li>El beat se elimina de la tienda</li>
                    </ul>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fullWidth 
                    onClick={() => {
                      addToCart(detailBeat, 'exclusive');
                      navigateTo('/');
                    }}
                    disabled={detailBeat.status === 'sold'}
                    className="mt-4 text-xs bg-indigo-500/20 text-[#7F77DD] hover:bg-indigo-500/30 border border-[#7F77DD]/35"
                  >
                    Comprar Exclusiva
                  </Button>
                </div>
              </div>
            </div>


          </div>
        )}
      </Modal>

      {/* 5. MODAL: PRODUCER PUBLIC PROFILE VIEW */}
      <Modal
        isOpen={!!selectedProducerId}
        onClose={() => navigateTo('/')}
        title="Perfil de Productor Autorizado"
        themeMode="dark"
        maxWidth="max-w-3xl"
      >
        {detailProducer && (
          <div className="space-y-6 text-left">
            {/* Header info space with cover banner emulation */}
            <div className="relative rounded-xl overflow-hidden p-6 bg-gradient-to-r from-[#1C1C2E] to-[#26215C] border border-[#7F77DD]/25">
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                {/* Photo */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-brand-primary-dark border-2 border-[#7F77DD]/40 flex-shrink-0">
                  <img 
                    src={detailProducer.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'} 
                    alt="Producer avatar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Profile detail tags */}
                <div className="text-center sm:text-left flex-grow space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                    <h4 className="text-lg font-bold text-white tracking-tight">{detailProducer.artistName || detailProducer.name}</h4>
                    {detailProducer.verified && (
                      <Badge variant="green" className="text-[9px] font-bold py-0.5 px-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Verificado
                      </Badge>
                    )}
                    <span className="text-[10px] bg-brand-primary/30 text-brand-primary-light font-bold px-2 py-0.5 rounded">
                      Plan {detailProducer.plan}
                    </span>
                  </div>
                  
                  <p className="text-white/40 text-xs font-mono">{detailProducer.instagram || '@cubabeats_producer'}</p>
                  
                  <p className="text-white/70 text-xs max-w-md pt-2 leading-relaxed">
                    {detailProducer.bio || 'Este productor no ha añadido una biografía sobre sí mismo todavía.'}
                  </p>
                </div>

                {/* Edit details if own profile */}
                {isOwnProducerProfile && (
                  <button 
                    onClick={openProfileEdit}
                    className="p-2 bg-white/5 hover:bg-white/15 text-white/80 rounded-lg cursor-pointer transform hover:scale-103 transition-all self-start flex items-center gap-1.5 text-xs text-brand-primary-light"
                    title="Editar Fotos/Biografía"
                  >
                    <Edit2 size={13} />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Beats Disponibles</span>
                <span className="font-mono text-base font-bold text-white">{detailProducer.beatsCount || producerBeats.length}</span>
              </div>
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Ventas Totales</span>
                <span className="font-mono text-base font-bold text-[#7F77DD]">{detailProducer.salesCount || 12}</span>
              </div>
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Puntuación</span>
                <span className="font-semibold text-xs text-brand-accent-amber mt-1 flex items-center justify-center gap-0.5">
                  <Star size={12} fill="currentColor" /> 4.9 (42)
                </span>
              </div>
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Pagar Beat en</span>
                <span className="text-white font-semibold text-[10px] block mt-1 hover:underline">Tarjeta CUP / EnZona</span>
              </div>
            </div>

            {/* List of Beats by this producer */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white/60">Catálogo de Instrumentales</h5>
              
              {producerBeats.length === 0 ? (
                <div className="p-10 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                  <p className="text-xs text-white/40">Este productor no tiene beats activos cargados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {producerBeats.map((prodBeat) => (
                    <div 
                      key={prodBeat.id}
                      onClick={() => navigateTo('/', { beatId: prodBeat.id })}
                      className="flex items-center gap-3 p-2 bg-[#1C1C2E] rounded-xl hover:bg-[#26215C]/20 border border-white/5 cursor-pointer hover:border-brand-primary-light/30 transition-all text-left"
                    >
                      <img 
                        src={prodBeat.coverUrl} 
                        className="w-12 h-12 rounded-lg object-cover" 
                        alt="cover shadow" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow min-w-0">
                        <span className="text-xs font-medium text-white truncate block">{prodBeat.title}</span>
                        <span className="text-[10px] text-white/40 font-mono block">{prodBeat.genre} • {prodBeat.bpm} BPM</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-brand-primary-light font-bold block">${prodBeat.priceBasic} CUP</span>
                        {prodBeat.status === 'sold' ? (
                          <span className="text-[8px] text-red-400 font-bold uppercase">Vendido</span>
                        ) : (
                          <span className="text-[8px] text-emerald-400 font-bold uppercase">Disponible</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 6. MODAL: EDIT ACTIVE PROFILE PHOTO & BIO */}
      <Modal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        title="Personalizar mi Perfil Studio"
        themeMode="dark"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left">
          <Input 
            label="Enlace URL de tu Foto de Perfil"
            placeholder="Introduce URL: https://images.unsplash.com/..."
            value={avatarEdit}
            onChange={(e) => setAvatarEdit(e.target.value)}
            themeMode="dark"
          />

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60">Biografía de Productor</label>
            <textarea
              value={bioEdit}
              onChange={(e) => setBioEdit(e.target.value)}
              placeholder="Introduce una breve biografía sobre ti mismo..."
              rows={4}
              className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.2)] rounded-xl p-3 text-xs text-white outline-none focus:border-[#7F77DD] placeholder-white/35"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateProfile}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
