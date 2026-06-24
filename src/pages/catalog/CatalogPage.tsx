import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Music, Play, Pause, ShoppingCart, 
  Tag, Download, Calendar, Flame, Eye, Edit2, CheckCircle, 
  ExternalLink, ArrowRight, Star, Heart, Radio, Disc, Share2,
  BadgeCheck, Award, ShieldCheck, Wallet, Landmark, CreditCard, Check
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
    verifiedProducersTask, addToast, likedBeats, toggleLikeBeat, addProducerNotification,
    convertPrice
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

  // Producer Follow State for All Viewers (Artists, Producers, Admins, Guests)
  const [followedProducerIds, setFollowedProducerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('followed_producers_map_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFollowProducer = (pId: string) => {
    if (!user || (user.role !== 'client' && user.role !== 'producer')) {
      addToast('Debes iniciar sesión con una cuenta de artista o productor para poder seguir estudios de producción.', 'error');
      return;
    }
    let next;
    const isUnfollow = followedProducerIds.includes(pId);
    if (isUnfollow) {
      next = followedProducerIds.filter(id => id !== pId);
      addToast('Has dejado de seguir a este productor', 'info');
      
      // Trigger live notification for producer
      addProducerNotification(
        'unfollow',
        'Seguidor Perdido 📉',
        `El artista "${user.artistName || user.name}" ha dejado de seguir tu estudio de producción.`
      );
    } else {
      next = [...followedProducerIds, pId];
      addToast('¡Siguiendo a este productor!', 'success');

      // Trigger live notification for producer
      addProducerNotification(
        'new_follower',
        '¡Tienes un Nuevo Seguidor! 👥',
        `El artista "${user.artistName || user.name}" ha comenzado a seguir tu catálogo y recibirá alertas de tus nuevos instrumentales.`
      );
    }
    setFollowedProducerIds(next);
    localStorage.setItem('followed_producers_map_v1', JSON.stringify(next));
  };

  const getFollowerCount = (pId: string) => {
    let hash = 0;
    for (let i = 0; i < pId.length; i++) {
      hash += pId.charCodeAt(i);
    }
    // Give a realistic stable base range (e.g. 150 - 570)
    const baseFollowers = 150 + (hash % 420);
    const isFollowed = followedProducerIds.includes(pId);
    return baseFollowers + (isFollowed ? 1 : 0);
  };

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
               email: 'producer@dcubanbeats.cu',
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

  // Merge real beats from catalog with high-fidelity simulated ones for the producer up to their beatsCount
  const maxSimulatedBeats = useMemo(() => {
    if (!detailProducer) return [];
    
    const realProducerBeats = beats.filter(b => b.producerId === detailProducer.id || b.producerName === detailProducer.artistName);
    
    // Explicitly handle standard range requested by user: can be 1 or even 18
    const targetCount = detailProducer.beatsCount || Math.max(1, realProducerBeats.length);
    const result = [...realProducerBeats];
    
    const genresPool = ['Reggaetón', 'Trap', 'Dembow', 'R&B', 'Hip Hop', 'Drill', 'Reparto'];
    const keysPool = ['F Minor', 'G Major', 'C# Minor', 'A Minor', 'E Major', 'D Major'];
    const titlesPool = [
      'Guanabacoa Bass', 'Centro Habana Drill', 'Maleconazo Reggaetón', 'Playa Sunset Vibes',
      'Calle G Dembow', 'Reparto Pro', 'Timba Soundz', 'Lofi Vedado', 'Tropicana Groove',
      'Cojímar Sunset', 'Habana 500', 'San Isidro Club', 'Regla Flow', 'Drill de la Guinea'
    ];
    
    while (result.length < targetCount && result.length < 18) {
      const idx = result.length;
      const title = titlesPool[idx % titlesPool.length];
      const genre = genresPool[idx % genresPool.length];
      const key = keysPool[idx % keysPool.length];
      const bpm = 80 + (idx * 7) % 80;
      const priceBasic = 500 + (idx * 50) % 650;
      
      result.push({
        id: `sim_b_${detailProducer.id}_${idx}`,
        title: `${title} (Pista #${idx + 1})`,
        producerName: detailProducer.artistName || detailProducer.name,
        producerId: detailProducer.id,
        genre,
        bpm,
        key,
        priceBasic,
        priceExclusive: priceBasic * 8,
        tags: [genre.toLowerCase(), 'cuba', 'ritmo'],
        coverUrl: `https://images.unsplash.com/photo-${1500000000000 + idx * 10000}?q=80&w=600&auto=format&fit=crop`,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        status: idx % 6 === 0 ? 'sold' : 'available',
        plays: 1200 + idx * 243,
        downloads: 140 + idx * 45,
        duration: '3:12',
        releasedAt: 'Hace poco'
      } as any);
    }
    
    return result;
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
      
      {user?.role === 'producer' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/20 pb-4 animate-in fade-in duration-300">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Music className="text-[#7F77DD]" size={22} /> Catálogo de Beats
            </h1>
            <p className="text-xs text-gray-400">Escucha las instrumentales de la comunidad en modo de demostración.</p>
          </div>
        </div>
      )}

      {/* 1. HERO BANNER LANDING */}
      {user?.role !== 'producer' && user?.role !== 'admin' && (
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
              Instrumentales de alta calidad con sonido unique caribeño. Descarga demostraciones y paga en pesos locales vía <span className="text-emerald-400 font-bold">Transfermóvil</span>, <span className="text-cyan-400 font-bold">EnZona</span> o <span className="text-sky-400 font-bold">QvaPay</span>.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-3">
              <Button variant="primary" onClick={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="group">
                Explorar Catálogo
                <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 1.5 CERTIFIED PRODUCERS SLIDER SECTION (Accessible to all guests & users) */}
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <BadgeCheck size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Productores Certificados</h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Sello de Confianza
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {verifiedProducersTask.map((producer) => (
            <div 
              key={producer.id}
              onClick={() => navigateTo('/', { producerId: producer.id })}
              className="bg-[#13131F]/80 p-4 rounded-2xl border border-white/5 hover:border-[#7F77DD]/40 hover:bg-[#1C1C2E] cursor-pointer text-center space-y-2.5 transition-all group flex flex-col items-center justify-center"
              id={`featured-producer-${producer.id}`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#7F77DD]/50 transition-colors mx-auto">
                <img 
                  src={producer.avatarUrl || 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=200&auto=format&fit=crop'} 
                  alt={producer.artistName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center justify-center gap-1 max-w-full">
                <h4 className="text-xs font-bold text-white group-hover:text-[#7F77DD] transition-colors truncate">
                  {producer.artistName || producer.name}
                </h4>
                {producer.verified && (
                  <BadgeCheck size={14} className="text-blue-500 fill-blue-500/10 flex-shrink-0" title="Verificado" />
                )}
              </div>
            </div>
          ))}
        </div>
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
              {user?.role === 'admin' ? (
                <div 
                  className="flex flex-col justify-center py-0.5 select-none opacity-50 cursor-not-allowed"
                  title="Los administradores no pueden dar me gusta a los beats"
                >
                  <span className="text-[10px] text-white/40 block flex items-center justify-center gap-1">
                    <Heart size={10} className="text-white/30" />
                    Me gusta
                  </span>
                  <span className="font-mono text-xs font-semibold text-white/50">
                    {((detailBeat.likes ?? Math.max(5, Math.floor((detailBeat.plays * 0.18) + (detailBeat.id.charCodeAt(detailBeat.id.length - 1) % 15)))).toLocaleString())}
                  </span>
                </div>
              ) : (
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
              )}
              <div className="flex flex-col justify-center py-0.5">
                <span className="text-[10px] text-white/40 block">Lanzamiento</span>
                <span className="text-xs font-semibold">{detailBeat.releasedAt}</span>
              </div>
            </div>

            {/* License options selector details */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white/60">
                {user?.role === 'producer' ? 'Información y Enlace de Difusión' : 'Licenciamiento Disponible'}
              </h5>
              
              {user?.role === 'producer' ? (
                <div className="bg-[#1C1C2E] p-5 rounded-2xl border border-[rgba(127,119,221,0.2)] text-center space-y-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary-light">
                    <Share2 size={24} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-sm text-white">Consola de Compartición de Productor</h5>
                    <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
                      Como productor, tienes acceso a la vista de pre-escucha. Comparte este beat con otros artistas para potenciar su visibilidad fuera del panel y ganar más oyentes.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}?beatId=${detailBeat.id}`;
                        let copiedWithClipboard = false;
                        try {
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(shareUrl).then(() => {
                              addToast('¡Enlace del beat copiado al portapapeles! Compártelo con los artistas.', 'success');
                            });
                            copiedWithClipboard = true;
                          }
                        } catch (e) {
                          // blocked by permissions policy
                        }

                        if (!copiedWithClipboard) {
                          try {
                            const textArea = document.createElement("textarea");
                            textArea.value = shareUrl;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-9999px";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            const successful = document.execCommand('copy');
                            document.body.removeChild(textArea);
                            if (successful) {
                              addToast('¡Enlace del beat copiado al portapapeles! Compártelo con los artistas.', 'success');
                            } else {
                              addToast('No se pudo copiar de forma automática. Por favor selecciónalo manualmente.', 'error');
                            }
                          } catch (err) {
                            addToast('No se pudo copiar de forma automática.', 'error');
                          }
                        }
                      }}
                      className="mx-auto flex items-center gap-1.5"
                    >
                      <Share2 size={13} />
                      Copiar Enlace para Compartir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Basic License info */}
                  <div className="bg-[#1C1C2E] p-4 rounded-xl border border-[rgba(127,119,221,0.2)] flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">Licencia Básica</span>
                        <span className="text-xs text-brand-primary-light font-bold">{convertPrice(detailBeat.priceBasic).formatted}</span>
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
                      disabled={detailBeat.status === 'sold' || user?.role === 'admin'}
                      className="mt-4 text-xs"
                    >
                      {user?.role === 'admin' ? 'No disponible para Administradores' : 'Añadir Básica'}
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
                        <span className="text-xs text-brand-accent-amber font-bold">{convertPrice(detailBeat.priceExclusive).formatted}</span>
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
                      disabled={detailBeat.status === 'sold' || user?.role === 'admin'}
                      className="mt-4 text-xs bg-indigo-500/20 text-[#7F77DD] hover:bg-indigo-500/30 border border-[#7F77DD]/35 disabled:opacity-40"
                    >
                      {user?.role === 'admin' ? 'No disponible para Administradores' : 'Comprar Exclusiva'}
                    </Button>
                  </div>
                </div>
              )}
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
                {/* Photo with responsive blue verified checkmark overlay */}
                <div className="relative w-23.5 h-23.5 rounded-2xl overflow-hidden bg-brand-primary-dark border-2 border-[#7F77DD]/40 flex-shrink-0">
                  <img 
                    src={detailProducer.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'} 
                    alt="Producer avatar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  {detailProducer.verified && (
                    <div className="absolute bottom-0.5 right-0.5 bg-blue-500 rounded-full p-0.5 shadow-lg border-2 border-[#1C1C2E] flex items-center justify-center" title="Productor Verificado">
                      <BadgeCheck size={14} className="text-white fill-white/10" />
                    </div>
                  )}
                </div>

                {/* Profile detail tags */}
                <div className="text-center sm:text-left flex-grow space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                    <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
                      {detailProducer.artistName || detailProducer.name}
                    </h4>
                  </div>
                  
                  {/* Real full name to see transparency */}
                  <p className="text-white/50 text-xs font-medium">Nombre Real: <span className="text-white/80 font-mono">{detailProducer.name || 'Productor Asociado'}</span></p>
                  
                  {/* Direct Instagram Profile Link */}
                  <div className="pt-0.5">
                    <a 
                      href={`https://instagram.com/${(detailProducer.instagram || 'dcubanbeats').replace('@', '').trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7F77DD] hover:text-[#9B94EC] font-mono text-xs font-bold hover:underline inline-flex items-center gap-1.5"
                    >
                      {detailProducer.instagram || '@dcubanbeats_producer'}
                      <ExternalLink size={11} className="opacity-70" />
                    </a>
                  </div>
                  
                  <p className="text-white/70 text-xs max-w-md pt-2 leading-relaxed">
                    {detailProducer.bio || 'Este productor no ha añadido una biografía sobre sí mismo todavía.'}
                  </p>
                </div>

                {/* Edit details if own profile */}
                {isOwnProducerProfile ? (
                  <button 
                    onClick={openProfileEdit}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg cursor-pointer transform hover:scale-102 transition-all self-center sm:self-start flex items-center gap-1.5 text-xs text-brand-primary-light border border-white/5"
                    title="Editar Fotos/Biografía"
                  >
                    <Edit2 size={13} />
                    Editar Perfil
                  </button>
                ) : user?.role === 'admin' ? (
                  <div className="text-[11px] text-slate-400 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                    Modo Administrador Activo
                  </div>
                ) : (
                  <button 
                    onClick={() => toggleFollowProducer(detailProducer.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transform hover:scale-102 transition-all self-center sm:self-start flex items-center gap-1.5 text-xs font-bold border ${
                      followedProducerIds.includes(detailProducer.id)
                        ? 'bg-[#7F77DD]/20 text-white border-[#7F77DD]/35 hover:bg-[#7F77DD]/30'
                        : 'bg-white text-brand-surface border-white hover:bg-gray-100'
                    }`}
                  >
                    <Heart size={13} className={followedProducerIds.includes(detailProducer.id) ? 'fill-red-500 text-red-500 animate-pulse' : ''} />
                    {followedProducerIds.includes(detailProducer.id) ? 'Siguiendo' : 'Seguir Productor'}
                  </button>
                )}
              </div>
            </div>

            {/* A. SELLO DE VERIFICACIÓN OFICIAL (Emblema de Confianza) */}
            <div className="bg-gradient-to-br from-[#12121E] to-[#1E112D] p-4 rounded-xl border border-brand-accent-amber/15 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-full bg-brand-accent-amber/10 border-2 border-brand-accent-amber/35 flex items-center justify-center text-brand-accent-amber flex-shrink-0 animate-pulse">
                  <Award size={22} className="text-brand-accent-amber" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-brand-accent-amber">Sello de Verificación Oficial</span>
                    {detailProducer.verified ? (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">Acreditado</span>
                    ) : (
                      <span className="bg-white/5 text-white/40 text-[8.5px] font-bold px-2 py-0.5 rounded-full border border-white/10 uppercase">En Proceso</span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                    {detailProducer.verified 
                      ? "Este sello garantiza la legitimidad jurídica del creador, la validez certificada de su cuenta Transfermóvil/QvaPay y el cumplimiento de los estándares de D'Cuban Beats."
                      : "Este productor se encuentra completando su carga de documentos oficiales (KYC/CUP) en la plataforma."}
                  </p>
                </div>
              </div>
              
              {detailProducer.verified && (
                <div className="flex flex-col items-center justify-center bg-brand-accent-amber/5 px-4 py-2 border border-brand-accent-amber/20 rounded-xl flex-shrink-0 text-center">
                  <BadgeCheck size={28} className="text-brand-accent-amber fill-brand-accent-amber/10" />
                  <span className="text-[8.5px] font-mono font-extrabold text-[#EF9F27] mt-1 tracking-wider uppercase">SELLO ACTIVO</span>
                </div>
              )}
            </div>

            {/* B. ACCEPTED PAYMENT METHODS - Simplified requested view */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-white/60 font-bold uppercase tracking-wider">
                <Landmark size={14} className="text-brand-primary-light" />
                <span>Métodos de Pago Aceptados</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-[#1C1C2E] px-4 py-2.5 rounded-xl border border-indigo-500/20 shadow-sm">
                  <Landmark size={15} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white font-mono">Transfermóvil</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                <div className="flex items-center gap-2 bg-[#1C1C2E] px-4 py-2.5 rounded-xl border border-cyan-500/20 shadow-sm">
                  <Wallet size={15} className="text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono">QvaPay</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Beats Disponibles</span>
                <span className="font-mono text-base font-bold text-white">
                  {maxSimulatedBeats.length}
                </span>
              </div>
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Ventas Totales</span>
                <span className="font-mono text-base font-bold text-[#7F77DD]">{detailProducer.salesCount || 12} Beats</span>
              </div>
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Seguidores</span>
                <span className="font-mono text-base font-bold text-brand-accent-amber mt-0.5 block">
                  {getFollowerCount(detailProducer.id)}
                </span>
              </div>
              <div className="bg-[#1C1C2E] p-3 rounded-xl text-center border border-white/5">
                <span className="text-[10px] text-white/40 block leading-tight">Canal Seguro</span>
                <span className="text-white font-semibold text-[10px] block mt-1 hover:underline">Venta Garantizada</span>
              </div>
            </div>

            {/* List of Beats by this producer */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold uppercase tracking-wider text-white/60">Catálogo de Beats Autorizados</h5>
                <span className="text-[10px] text-white/40 font-mono">Mostrando {maxSimulatedBeats.length} de {detailProducer.beatsCount || maxSimulatedBeats.length} activos</span>
              </div>
              
              {maxSimulatedBeats.length === 0 ? (
                <div className="p-10 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                  <p className="text-xs text-white/40">Este productor no tiene beats activos cargados en la tienda actualmente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
                  {maxSimulatedBeats.map((prodBeat) => {
                    const isPlayingThis = activeBeat?.id === prodBeat.id && isPlaying;
                    return (
                      <div 
                        key={prodBeat.id}
                        className="flex items-center gap-3 p-2.5 bg-[#1C1C2E] rounded-xl hover:bg-[#26215C]/20 border border-white/5 group/row transition-all text-left relative"
                      >
                        {/* Play overlay button on cover */}
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d0d14]">
                          <img 
                            src={prodBeat.coverUrl} 
                            className="w-full h-full object-cover transition-transform group-hover/row:scale-105" 
                            alt={prodBeat.title} 
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playBeat(prodBeat);
                            }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity rounded-lg cursor-pointer"
                          >
                            {isPlayingThis ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                          </button>
                        </div>
                        
                        <div className="flex-grow min-w-0" onClick={() => navigateTo('/', { beatId: prodBeat.id })}>
                          <span className="text-xs font-bold text-white group-hover/row:text-brand-primary-light transition-colors truncate block cursor-pointer" title={prodBeat.title}>
                            {prodBeat.title}
                          </span>
                          <span className="text-[9.5px] text-white/40 font-mono block truncate">{prodBeat.genre} • {prodBeat.bpm} BPM • {prodBeat.key}</span>
                        </div>
                        
                        <div className="text-right flex-shrink-0 flex flex-col justify-center items-end gap-1">
                          <span className="text-xs text-brand-primary-light font-bold block">{convertPrice(prodBeat.priceBasic).formatted}</span>
                          {prodBeat.status === 'sold' ? (
                            <span className="text-[8px] bg-red-500/15 text-red-400 font-extrabold px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-wide">Vendido</span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prodBeat, 'basic');
                                addToast(`"${prodBeat.title}" añadido al carrito`, 'success');
                              }}
                              disabled={user?.role === 'admin' || user?.role === 'producer'}
                              className="text-[8.5px] bg-[#534AB7]/10 text-[#7F77DD] hover:bg-[#534AB7]/20 disabled:opacity-40 font-semibold px-1.5 py-0.5 rounded border border-[#7F77DD]/20 uppercase tracking-wide cursor-pointer"
                            >
                              Añadir
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
