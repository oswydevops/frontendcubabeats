import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Plus, Edit2, Trash2, Search, SlidersHorizontal, Music, 
  Disc, Tag, CheckCircle2, DollarSign, CloudUpload, Play, Pause,
  Lock, ShieldAlert
} from 'lucide-react';

export const ProducerBeats: React.FC = () => {
  const { beats, addBeat, deleteBeat, updateBeat, navigateTo, playBeat, activeBeat, isPlaying, addToast, user } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);

  // Form States for Upload/Edit
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Reggaetón');
  const [bpm, setBpm] = useState('94');
  const [scaleKey, setScaleKey] = useState('C Minor');
  const [priceBasic, setPriceBasic] = useState('600');
  const [priceExclusive, setPriceExclusive] = useState('4500');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [isLocalAudioPlaying, setIsLocalAudioPlaying] = useState(false);
  const localAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Step Setup Form States
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [paymentTransfermovil, setPaymentTransfermovil] = useState(true);
  const [paymentEnzona, setPaymentEnzona] = useState(true);
  const [paymentQvapay, setPaymentQvapay] = useState(false);
  const [customLicenseClause, setCustomLicenseClause] = useState('');

  // Real-time visual validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation checks for each step of the beat wizard
  const stepsValidity = useMemo(() => {
    const isStep1Valid = !!title.trim() && !!bpm && Number(bpm) > 0 && !!scaleKey.trim();
    const isStep2Valid = !!audioUrl || !!audioFileName;
    const isStep3Valid = !!priceBasic && Number(priceBasic) > 0 && !!priceExclusive && Number(priceExclusive) > Number(priceBasic) && (paymentTransfermovil || paymentEnzona || paymentQvapay);
    const isStep4Valid = true; // optional
    
    return {
      step1: isStep1Valid,
      step2: isStep2Valid,
      step3: isStep3Valid,
      step4: isStep4Valid,
      allValid: isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid
    };
  }, [title, bpm, scaleKey, audioUrl, audioFileName, priceBasic, priceExclusive, paymentTransfermovil, paymentEnzona, paymentQvapay]);

  // Filter beats belonging to this producer
  const myBeats = useMemo(() => {
    return beats.filter((beat) => {
      const isMine = beat.producerId === 'p2' || beat.producerName === 'Flow Habano';
      const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            beat.genre.toLowerCase().includes(searchQuery.toLowerCase());
      return isMine && matchesSearch;
    });
  }, [beats, searchQuery]);

  const stopLocalAudio = () => {
    if (localAudioRef.current) {
      localAudioRef.current.pause();
    }
    setIsLocalAudioPlaying(false);
  };

  const handleOpenUpload = () => {
    if (!user?.verified) {
      addToast('Verificación KYC obligatoria: Debes acreditar tu identidad en Mi Perfil para subir u ofrecer instrumentales.', 'error');
      return;
    }
    setEditingBeatId(null);
    setTitle('');
    setGenre('Reggaetón');
    setBpm('94');
    setScaleKey('C Minor');
    setPriceBasic('600');
    setPriceExclusive('4500');
    setTags('reggaeton, perreo, cuba');
    setCoverUrl('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop');
    setDescription('Mezcla estéreo, gorda con sintetizadores retros grabada en La Habana.');
    setAudioUrl('');
    setAudioFileName('');
    stopLocalAudio();
    setPaymentTransfermovil(true);
    setPaymentEnzona(true);
    setPaymentQvapay(false);
    setCustomLicenseClause('');
    setErrors({});
    setIsSetupMode(true);
    setSetupStep(1);
  };

  const handleOpenEdit = (beat: any) => {
    if (!user?.verified) {
      addToast('Verificación KYC obligatoria: Debes acreditar tu identidad en Mi Perfil para gestionar e instrumentar cambios.', 'error');
      return;
    }
    setEditingBeatId(beat.id);
    setTitle(beat.title);
    setGenre(beat.genre);
    setBpm(beat.bpm.toString());
    setScaleKey(beat.key);
    setPriceBasic(beat.priceBasic.toString());
    setPriceExclusive(beat.priceExclusive.toString());
    setTags(beat.tags.join(', '));
    setCoverUrl(beat.coverUrl);
    setDescription(beat.description || '');
    setAudioUrl(beat.audioUrl || '');
    setAudioFileName(beat.audioFileName || (beat.audioUrl ? 'beat_track_audio.mp3' : ''));
    stopLocalAudio();
    setPaymentTransfermovil(beat.paymentTransfermovil ?? true);
    setPaymentEnzona(beat.paymentEnzona ?? true);
    setPaymentQvapay(beat.paymentQvapay ?? false);
    setCustomLicenseClause(beat.customLicenseClause ?? '');
    setErrors({});
    setIsSetupMode(true);
    setSetupStep(1);
  };

  const handleSaveBeat = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'El título de la instrumental es requerido';
    if (!bpm || Number(bpm) <= 0) tempErrors.bpm = 'Ingresa un valor de BPM válido';
    if (!scaleKey.trim()) tempErrors.scaleKey = 'La escala armónica (tono) es requerida';
    if (!audioUrl && !audioFileName) tempErrors.audio = 'Debes subir un archivo local de audio o indicar un enlace URL público';
    if (!priceBasic || Number(priceBasic) <= 0) tempErrors.priceBasic = 'Debes ingresar un precio básico válido mayor que cero';
    if (!priceExclusive || Number(priceExclusive) <= 0) tempErrors.priceExclusive = 'Debes ingresar un precio exclusivo válido mayor que cero';
    if (priceBasic && priceExclusive && Number(priceExclusive) <= Number(priceBasic)) {
      tempErrors.priceExclusive = 'El precio exclusivo debe ser mayor que el precio de la licencia básica';
    }
    if (!paymentTransfermovil && !paymentEnzona && !paymentQvapay) {
      tempErrors.payment = 'Debes activar al menos un método de pago';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      if (tempErrors.title || tempErrors.bpm || tempErrors.scaleKey) {
        setSetupStep(1);
      } else if (tempErrors.audio) {
        setSetupStep(2);
      } else {
        setSetupStep(3);
      }
      addToast('Por favor, completa todos los campos obligatorios correctamente', 'error');
      return;
    }

    setErrors({});

    const tagsArray = tags.split(',').map((t) => t.trim()).filter((t) => t !== '');

    const beatPayload = {
      id: editingBeatId || `beat_new_${Date.now()}`,
      title,
      producerName: 'Flow Habano',
      producerId: 'p2',
      genre,
      bpm: Number(bpm),
      key: scaleKey,
      priceBasic: Number(priceBasic),
      priceExclusive: Number(priceExclusive),
      tags: tagsArray,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
      audioUrl: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioFileName: audioFileName || 'SoundHelix-Song-1.mp3',
      status: 'available' as const,
      plays: editingBeatId ? 1802 : 0,
      downloads: editingBeatId ? 312 : 0,
      description,
      duration: '3:15',
      releasedAt: 'Hoy',
      paymentTransfermovil,
      paymentEnzona,
      paymentQvapay,
      customLicenseClause
    };

    if (editingBeatId) {
      updateBeat(beatPayload);
      addToast('¡Instrumental actualizada con éxito!', 'success');
    } else {
      addBeat(beatPayload);
      addToast('¡Nueva instrumental publicada con éxito!', 'success');
    }

    stopLocalAudio();
    setIsSetupMode(false);
  };

  const handleDeviceCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setCoverUrl(tempUrl);
      addToast('Foto de portada cargada correctamente', 'success');
    }
  };

  const handleDeviceAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      setIsLocalAudioPlaying(false);

      const tempUrl = URL.createObjectURL(file);
      setAudioUrl(tempUrl);
      setAudioFileName(file.name);
      
      if (errors.audio) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.audio;
          return next;
        });
      }

      addToast('Archivo de audio cargado correctamente', 'success');
    }
  };

  const handleToggleLocalAudio = () => {
    if (!audioUrl) {
      addToast('Por favor, indica un enlace de audio o carga un archivo local primero', 'info');
      return;
    }
    if (!localAudioRef.current) {
      localAudioRef.current = new Audio(audioUrl);
      localAudioRef.current.onended = () => {
        setIsLocalAudioPlaying(false);
      };
    } else if (localAudioRef.current.src !== audioUrl) {
      localAudioRef.current.pause();
      localAudioRef.current = new Audio(audioUrl);
      localAudioRef.current.onended = () => {
        setIsLocalAudioPlaying(false);
      };
    }

    if (isLocalAudioPlaying) {
      localAudioRef.current.pause();
      setIsLocalAudioPlaying(false);
    } else {
      localAudioRef.current.play().then(() => {
        setIsLocalAudioPlaying(true);
      }).catch((err) => {
        addToast('No se puede reproducir la URL de audio indicada', 'error');
        console.error(err);
      });
    }
  };

  React.useEffect(() => {
    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
    };
  }, []);

  const isCurrentPlaying = (bId: string) => {
    return activeBeat?.id === bId && isPlaying;
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg">
      
      {/* CASE A: SETUP MODE (Multi-step wizard instead of modal) */}
      {isSetupMode ? (
        <div className="bg-brand-surface border border-brand-border/40 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          
          {/* Wizard Header and back toolbar */}
          <div className="flex justify-between items-center pb-4 border-b border-brand-border/20 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingBeatId ? 'Editar Parámetros de la Instrumental' : 'Asistente de Publicación de Beats'}
              </h3>
              <p className="text-xs text-gray-400">Completa los 4 pasos obligatorios para preparar tu pista.</p>
            </div>
            
            <button
              onClick={() => setIsSetupMode(false)}
              className="text-xs font-semibold text-[#7F77DD] bg-[#534AB7]/10 border border-[#534AB7]/30 hover:bg-[#534AB7]/25 px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              ← Cancelar e Ir Atrás
            </button>
          </div>

          {/* Sequential Step Progress Tracker Indicator */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-gray-400 select-none">
            <div 
              onClick={() => setSetupStep(1)}
              className={`pb-2 border-b-2 cursor-pointer transition-all ${
                setupStep === 1 
                  ? 'border-[#7F77DD] text-white' 
                  : stepsValidity.step1 
                    ? 'border-emerald-500 text-emerald-400 hover:text-emerald-300' 
                    : 'border-brand-border/20 hover:text-gray-200'
              }`}
            >
              1. Datos Básicos {stepsValidity.step1 ? '✓' : '⚠'}
            </div>
            <div 
              onClick={() => {
                if (stepsValidity.step1) {
                  setSetupStep(2);
                } else {
                  addToast('Por favor completa los campos obligatorios del paso 1 primero', 'info');
                }
              }}
              className={`pb-2 border-b-2 cursor-pointer transition-all ${
                setupStep === 2 
                  ? 'border-[#7F77DD] text-white' 
                  : stepsValidity.step2 
                    ? 'border-emerald-500 text-emerald-400 hover:text-emerald-300' 
                    : 'border-brand-border/20 hover:text-gray-200'
              }`}
            >
              2. Arte y Audio {stepsValidity.step2 ? '✓' : '⚠'}
            </div>
            <div 
              onClick={() => {
                if (stepsValidity.step1 && stepsValidity.step2) {
                  setSetupStep(3);
                } else {
                  addToast('Por favor completa los pasos 1 y 2 primero', 'info');
                }
              }}
              className={`pb-2 border-b-2 cursor-pointer transition-all ${
                setupStep === 3 
                  ? 'border-[#7F77DD] text-white' 
                  : stepsValidity.step3 
                    ? 'border-emerald-500 text-emerald-400 hover:text-emerald-300' 
                    : 'border-brand-border/20 hover:text-gray-200'
              }`}
            >
              3. Precios y Pago {stepsValidity.step3 ? '✓' : '⚠'}
            </div>
            <div 
              onClick={() => {
                if (stepsValidity.step1 && stepsValidity.step2 && stepsValidity.step3) {
                  setSetupStep(4);
                } else {
                  addToast('Completa todos los pasos requeridos anteriores primero', 'info');
                }
              }}
              className={`pb-2 border-b-2 cursor-pointer transition-all ${
                setupStep === 4 
                  ? 'border-[#7F77DD] text-white' 
                  : 'border-brand-border/20 hover:text-gray-200'
              }`}
            >
              4. Cláusulas {stepsValidity.step4 ? '✓' : ''}
            </div>
          </div>

          {/* Form Step Contents rendering */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            
            {/* STEP 1: INFORMACIÓN BÁSICA */}
            {setupStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">1</div>
                  <span>Propiedades e información descriptiva del beat instrumental en CubaBeats.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Título de la Instrumental *"
                    placeholder="Ej. Malecón Sunset (Fusión Rap)"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.title;
                          return next;
                        });
                      }
                    }}
                    error={errors.title}
                    themeMode="dark"
                  />
                  
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Género Principal</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card text-white focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7]/10 text-sm outline-none"
                    >
                      <option value="Reggaetón" className="bg-brand-surface">Reggaetón</option>
                      <option value="Trap" className="bg-brand-surface">Trap</option>
                      <option value="Dembow" className="bg-brand-surface">Dembow</option>
                      <option value="R&B" className="bg-brand-surface">R&B</option>
                      <option value="Hip Hop" className="bg-brand-surface">Hip Hop</option>
                      <option value="Drill" className="bg-brand-surface">Drill</option>
                      <option value="Boom Bap" className="bg-brand-surface">Boom Bap</option>
                      <option value="Son" className="bg-brand-surface">Son</option>
                      <option value="Salsa" className="bg-brand-surface">Salsa</option>
                      <option value="Timba" className="bg-brand-surface">Timba</option>
                      <option value="Reparto" className="bg-brand-surface">Reparto</option>
                      <option value="Cubatón" className="bg-brand-surface">Cubatón</option>
                      <option value="Merengue" className="bg-brand-surface">Merengue</option>
                      <option value="Bachata" className="bg-brand-surface">Bachata</option>
                      <option value="Fusión" className="bg-brand-surface">Fusión</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Velocidad (BPM) *"
                    type="number"
                    placeholder="94"
                    value={bpm}
                    onChange={(e) => {
                      setBpm(e.target.value);
                      if (errors.bpm) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.bpm;
                          return next;
                        });
                      }
                    }}
                    error={errors.bpm}
                    themeMode="dark"
                  />
                  <Input
                    label="Escala Armónica (Tono) *"
                    placeholder="F# Minor"
                    value={scaleKey}
                    onChange={(e) => {
                      setScaleKey(e.target.value);
                      if (errors.scaleKey) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.scaleKey;
                          return next;
                        });
                      }
                    }}
                    error={errors.scaleKey}
                    themeMode="dark"
                  />
                  <Input
                    label="Etiquetas (separadas por comas)"
                    placeholder="verano, sandungueo, perreo"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    themeMode="dark"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Descripción detallada</label>
                  <textarea
                    rows={3}
                    placeholder="Escribe detalles del beat para llamar la atención del cantante..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7]/10 rounded-xl p-3 text-xs text-white placeholder-gray-550 outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: ART COVER PHOTO PREVIEW & SELECTION */}
            {setupStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">2</div>
                  <span>Portada Visual. Tener una portada hermosa aumenta tus ventas un 40%.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Photo upload / select column */}
                  <div className="md:col-span-7 space-y-4">
                    <Input
                      label="Enlace URL de Imagen Pública (Opcional)"
                      placeholder="https://images.unsplash.com/..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      themeMode="dark"
                    />

                    <div className="text-center font-bold text-xs uppercase text-gray-500 select-none py-1">— O, usar tu dispositivo local —</div>

                    <div className="border border-dashed border-brand-border/40 rounded-2xl p-5 text-center bg-brand-card/45 space-y-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="device-cover-setup-input" 
                        className="hidden" 
                        onChange={handleDeviceCoverChange} 
                      />
                      <CloudUpload size={24} className="mx-auto text-[#7F77DD]" />
                      <div>
                        <span className="text-xs font-bold text-white block">Sube una carátula JPG/PNG</span>
                        <span className="text-[10px] text-gray-400">Dimensión recomendada de 800x800 píxeles.</span>
                      </div>
                      <label 
                        htmlFor="device-cover-setup-input"
                        className="px-4 py-1.5 bg-brand-surface border border-brand-border/80 hover:bg-brand-card text-white text-[11px] font-bold rounded-lg cursor-pointer inline-block shadow-sm transition-colors"
                      >
                        Seleccionar Archivo Local
                      </label>
                    </div>
                  </div>

                  {/* Art preview column */}
                  <div className="md:col-span-5 text-center space-y-2">
                    <span className="text-[10px] font-bold text-gray-450 block uppercase">Fotografía Cover Preview</span>
                    <div className="w-40 h-40 rounded-2xl overflow-hidden mx-auto shadow-md border-2 border-brand-border/50 bg-brand-card relative group">
                      {coverUrl ? (
                        <img 
                          src={coverUrl} 
                          alt="Cover upload preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center text-gray-400 text-xs p-4">
                          <Music size={24} className="mb-1" />
                          Sin portada
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Real interactive high-bitrate audio track uploader */}
                <div className={`border ${errors.audio ? 'border-brand-accent-red/80 bg-brand-accent-red/5' : 'border-[#534AB7]/30 bg-[#534AB7]/5'} p-5 rounded-2xl space-y-4 text-left transition-all duration-200`}>
                  <div className="flex justify-between items-center flex-wrap gap-2 pb-1 border-b border-brand-border/20">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7F77DD] block">Pista de Audio de la Instrumental (.MP3 o .WAV) *</span>
                      <span className="text-[11px] text-gray-450">Sube la maqueta que escucharán los cantantes en el catálogo general.</span>
                    </div>

                    {audioUrl && (
                      <span className="px-2 py-0.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 text-[10px] rounded-lg font-bold">
                        ✓ Archivo Cargado
                      </span>
                    )}
                  </div>

                  {errors.audio && (
                    <span className="text-xs text-brand-accent-red font-semibold block animate-pulse">
                      ⚠️ {errors.audio}
                    </span>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Paste URL */}
                    <div className="md:col-span-7">
                      <Input
                        label="Enlace de Audio URL (Opcional)"
                        placeholder="https://ejemplo.com/pistas/sunset.mp3"
                        value={audioUrl}
                        onChange={(e) => {
                          setAudioUrl(e.target.value);
                          if (e.target.value) {
                            setAudioFileName(e.target.value.split('/').pop() || 'archivo_url.mp3');
                            if (errors.audio) {
                              setErrors(prev => {
                                const next = { ...prev };
                                delete next.audio;
                                return next;
                              });
                            }
                          } else {
                            setAudioFileName('');
                          }
                        }}
                        themeMode="dark"
                      />
                    </div>

                    {/* Local File selection box */}
                    <div className="md:col-span-1 text-center font-bold text-xs text-gray-550 select-none hidden md:block pt-4">
                      O
                    </div>

                    <div className="md:col-span-4 pt-1 md:pt-0">
                      <input 
                        type="file" 
                        accept="audio/*" 
                        id="device-audio-setup-input" 
                        className="hidden" 
                        onChange={handleDeviceAudioChange} 
                      />
                      <label 
                        htmlFor="device-audio-setup-input"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/30 text-[#7F77DD] border border-[#534AB7]/35 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all text-center h-[42px] mt-2.5 whitespace-nowrap"
                      >
                        <CloudUpload size={14} />
                        Subir Archivo Local
                      </label>
                    </div>
                  </div>

                  {/* Audio file playing test control block */}
                  {audioUrl && (
                    <div className="flex items-center gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border/30 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={handleToggleLocalAudio}
                        className="w-8 h-8 rounded-full bg-[#534AB7] hover:bg-[#433A9B] text-white flex items-center justify-center cursor-pointer shadow transition-all flex-shrink-0"
                        title={isLocalAudioPlaying ? 'Pausar audición' : 'Escuchar audición'}
                      >
                        {isLocalAudioPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
                      </button>

                      <div className="flex-grow min-w-0 text-left">
                        <span className="text-xs font-bold text-white block truncate" title={audioFileName}>
                          {audioFileName || 'pista_instrumental.mp3'}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">
                          {isLocalAudioPlaying ? 'Reproduciendo vista previa en vivo...' : 'Presiona Play para verificar el audio subido'}
                        </span>
                      </div>

                      {/* Small visual audio wave */}
                      {isLocalAudioPlaying && (
                        <div className="flex gap-0.5 items-center h-5 px-1">
                          <span className="w-1 h-3 bg-[#534AB7] rounded-full animate-pulse"></span>
                          <span className="w-1 h-5 bg-[#534AB7] rounded-full animate-pulse delay-75"></span>
                          <span className="w-1 h-4 bg-[#534AB7] rounded-full animate-pulse delay-150"></span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 block leading-normal">
                    Formatos recomendados: MP3 de alta fidelidad (320kbps) o WAV estéreo de 44.1kHz. CubaBeats encriptará de forma segura el enlace de descarga para proteger tu propiedad intelectual.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: PRECIOS Y METODOS DE PAGO PERMITIDOS */}
            {setupStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">3</div>
                  <span>Establece tus tarifas y selecciona con qué métodos deseas que los artistas te envíen transferencias.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Precio Licencia Básica (CUP) *"
                    type="number"
                    placeholder="600"
                    value={priceBasic}
                    onChange={(e) => {
                      setPriceBasic(e.target.value);
                      if (errors.priceBasic) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.priceBasic;
                          return next;
                        });
                      }
                    }}
                    error={errors.priceBasic}
                    themeMode="dark"
                  />
                  <Input
                    label="Precio Adquisición Exclusiva ($ CUP) *"
                    type="number"
                    placeholder="4500"
                    value={priceExclusive}
                    onChange={(e) => {
                      setPriceExclusive(e.target.value);
                      if (errors.priceExclusive) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.priceExclusive;
                          return next;
                        });
                      }
                    }}
                    error={errors.priceExclusive}
                    themeMode="dark"
                  />
                </div>

                <div className={`p-4 rounded-xl border ${errors.payment ? 'border-brand-accent-red/80 bg-brand-accent-red/5' : 'border-brand-border/20 bg-brand-card/45'} space-y-3 transition-all duration-200`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-white block">Métodos de pago habilitados para este Beat *</span>
                    {errors.payment && (
                      <span className="text-xs text-brand-accent-red font-medium animate-pulse">⚠️ {errors.payment}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">Los clientes podrán usar únicamente los métodos habilitados que marques a continuación:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <label className="flex items-center gap-2 bg-brand-surface p-3 border border-brand-border/30 rounded-xl cursor-pointer hover:bg-brand-card transition-colors">
                      <input 
                        type="checkbox" 
                        checked={paymentTransfermovil} 
                        onChange={(e) => {
                          setPaymentTransfermovil(e.target.checked);
                          if (errors.payment) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.payment;
                              return next;
                            });
                          }
                        }}
                        className="rounded border-brand-border text-[#7F77DD] focus:ring-[#534AB7]/30 h-4 w-4 bg-brand-card"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block leading-tight">Transfermóvil</span>
                        <span className="text-[9px] text-gray-400">CUP pesos directos</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-[#1C1C2E] p-3 border border-brand-border/30 rounded-xl cursor-pointer hover:bg-brand-card transition-colors">
                      <input 
                        type="checkbox" 
                        checked={paymentEnzona} 
                        onChange={(e) => {
                          setPaymentEnzona(e.target.checked);
                          if (errors.payment) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.payment;
                              return next;
                            });
                          }
                        }}
                        className="rounded border-brand-border text-[#7F77DD] focus:ring-[#534AB7]/30 h-4 w-4 bg-brand-card"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block leading-tight">EnZona</span>
                        <span className="text-[9px] text-gray-400">CUP / MLC directo</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 bg-[#1C1C2E] p-3 border border-brand-border/30 rounded-xl cursor-pointer hover:bg-brand-card transition-colors">
                      <input 
                        type="checkbox" 
                        checked={paymentQvapay} 
                        onChange={(e) => {
                          setPaymentQvapay(e.target.checked);
                          if (errors.payment) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.payment;
                              return next;
                            });
                          }
                        }}
                        className="rounded border-brand-border text-[#7F77DD] focus:ring-[#534AB7]/30 h-4 w-4 bg-brand-card"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block leading-tight">QvaPay Checkout</span>
                        <span className="text-[9px] text-gray-400">Pasarela multi-moneda</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CLÁUSULAS ADICIONALES (OPCIONAL) */}
            {setupStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">4</div>
                  <span>Cláusulas u observaciones que se adjuntarán al contrato que firma el intérprete (Opcional).</span>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider leading-relaxed">Observación o Cláusula de Licencia Personalizada</label>
                  <textarea
                    rows={5}
                    placeholder="Ej. Queda rotundamente prohibido el uso de la pista para fines comerciales sin la debida mención (Prod. Flow Habano) en los créditos oficiales de Spotify o YouTube..."
                    value={customLicenseClause}
                    onChange={(e) => setCustomLicenseClause(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7]/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none font-sans leading-relaxed"
                  />
                  <span className="text-[10px] text-gray-400 block leading-none">Deja en blanco si deseas emplear las normas estándares del catálogo de CubaBeats.</span>
                </div>

                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/30 text-emerald-400 text-xs text-left leading-relaxed">
                  <strong>✓ Todo listo para publicación:</strong> Al hacer clic en publicar, los datos serán almacenados e indexados de forma inmediata en el buscador principal del portal para ser audicionados de inmediato.
                </div>
              </div>
            )}

            {/* Step navigation commands */}
            <div className="flex justify-between pt-4 border-t border-brand-border/30 flex-wrap gap-2">
              <button
                type="button"
                disabled={setupStep === 1}
                onClick={() => setSetupStep((p) => p - 1)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer select-none transition-all ${
                  setupStep === 1 
                    ? 'border-brand-border/10 text-gray-600 cursor-not-allowed bg-transparent' 
                    : 'border-[#534AB7] text-[#7F77DD] bg-brand-surface hover:bg-brand-card'
                }`}
              >
                ← Anterior
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSetupMode(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  Descartar
                </button>

                {setupStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (setupStep === 1) {
                        const tempErrors: Record<string, string> = {};
                        if (!title.trim()) tempErrors.title = 'El título de la instrumental es requerido';
                        if (!bpm || Number(bpm) <= 0) tempErrors.bpm = 'Ingresa un valor de BPM válido';
                        if (!scaleKey.trim()) tempErrors.scaleKey = 'La escala armónica es requerida';
                        if (Object.keys(tempErrors).length > 0) {
                          setErrors(tempErrors);
                          addToast('Por favor, completa todos los campos requeridos marcados con *', 'error');
                          return;
                        }
                        setErrors({});
                      }
                      
                      if (setupStep === 2) {
                        const tempErrors: Record<string, string> = {};
                        if (!audioUrl && !audioFileName) {
                          tempErrors.audio = 'Debes subir un archivo local de audio o indicar un enlace URL público';
                        }
                        if (Object.keys(tempErrors).length > 0) {
                          setErrors(tempErrors);
                          addToast('La pista de audio de la instrumental es requerida', 'error');
                          return;
                        }
                        setErrors({});
                      }

                      if (setupStep === 3) {
                        const tempErrors: Record<string, string> = {};
                        if (!priceBasic || Number(priceBasic) <= 0) tempErrors.priceBasic = 'Debes ingresar un precio básico válido mayor que cero';
                        if (!priceExclusive || Number(priceExclusive) <= 0) tempErrors.priceExclusive = 'Debes ingresar un precio exclusivo válido mayor que cero';
                        if (priceBasic && priceExclusive && Number(priceExclusive) <= Number(priceBasic)) {
                          tempErrors.priceExclusive = 'El precio exclusivo debe ser mayor que el precio básico';
                        }
                        if (!paymentTransfermovil && !paymentEnzona && !paymentQvapay) {
                          tempErrors.payment = 'Debes activar al menos un método de pago';
                        }
                        if (Object.keys(tempErrors).length > 0) {
                          setErrors(tempErrors);
                          addToast('Corrige los errores de precios o métodos de pago', 'error');
                          return;
                        }
                        setErrors({});
                      }

                      setSetupStep((p) => p + 1);
                    }}
                    className="px-5 py-2 bg-[#534AB7] hover:bg-[#433A9B] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm shadow-[#534AB7]/10"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveBeat}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm shadow-emerald-600/10"
                  >
                    {editingBeatId ? 'Guardar Cambios de Beat ✓' : 'Publicar Instrumental Now ✓'}
                  </button>
                )}
              </div>
            </div>

          </form>

        </div>
      ) : (

        /* CASE B: TABLE LIST VIEW MODE */
        <>
          {!user?.verified && (
            <div className="bg-[#E11D48]/10 border border-[#E11D48]/20 p-4 rounded-xl flex items-start gap-3 mt-1 mb-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <ShieldAlert className="text-[#E11D48] flex-shrink-0 mt-0.5" size={18} />
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold text-white block">Acceso Restringido - Verificación KYC Obligatoria</span>
                <p className="text-[11px] text-slate-305 leading-relaxed font-sans">
                  Por motivos de seguridad fiscal y protección de derechos de autor, todos los productores de CubaBeats deben acreditar su identidad antes de operar.
                  Actualmente <strong>no tiene permisos para subir nuevos beats ni editar los existentes</strong> en la plataforma.
                  Vaya a <button onClick={() => navigateTo('/producer/profile')} className="text-[#7F77DD] hover:text-[#9B94EC] underline font-bold bg-transparent border-none cursor-pointer p-0 inline">Mi Perfil Studio</button> para cargar sus documentos oficiales ahora.
                </p>
              </div>
            </div>
          )}

          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Disc className="text-[#7F77DD] animate-spin-slow" /> Mis Beats Publicados
              </h2>
              <p className="text-xs text-gray-400">Carga, edita o elimina instrumentales de la tienda CubaBeats.</p>
            </div>

            <Button 
              variant={user?.verified ? "primary" : "secondary"} 
              onClick={handleOpenUpload} 
              className={`text-xs font-bold gap-1.5 self-start sm:self-center ${!user?.verified ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {user?.verified ? <Plus size={15} /> : <Lock size={14} className="text-rose-450" />}
              Subir Nuevo Beat
            </Button>
          </div>

          {/* Grid Filter Search */}
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Buscar entre mis beats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border/40 focus:border-[#534AB7] focus:ring-1 focus:ring-indigo-550/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>

          {/* Beats Inventory table */}
          {myBeats.length === 0 ? (
            <div className="py-20 text-center bg-brand-surface rounded-3xl border border-dashed border-brand-border/30 space-y-4">
              <div className="w-12 h-12 bg-brand-card text-gray-450 rounded-full flex items-center justify-center mx-auto">
                <Music size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white text-sm">No has publicado beats para vender</p>
                <p className="text-xs text-gray-400">Comienza a rentabilizar tu música cargando tus primeros temas estéreo.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleOpenUpload}>
                Subir un Beat de Prueba
              </Button>
            </div>
          ) : (
            <div className="bg-brand-surface rounded-2xl border border-brand-border/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-card/30 border-b border-brand-border/30 text-gray-400 font-bold uppercase select-none">
                      <th className="py-3 px-4">Portada</th>
                      <th className="py-3 px-4">Título Instrumental</th>
                      <th className="py-3 px-4">Género / BPM</th>
                      <th className="py-3 px-4">Escala</th>
                      <th className="py-3 px-4">Precio (Básica / Excl.)</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/20 text-gray-300">
                    {myBeats.map((beat) => (
                      <tr key={beat.id} className="hover:bg-brand-card/25 transition-colors">
                        <td className="py-3 px-4">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-brand-border/20 flex-shrink-0 group">
                            <img 
                              src={beat.coverUrl} 
                              alt="mini cover" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <button 
                              onClick={() => playBeat(beat)}
                              className="absolute inset-0 bg-black/45 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
                            >
                              {isCurrentPlaying(beat.id) ? (
                                <Pause size={12} fill="currentColor" />
                              ) : (
                                <Play size={12} fill="currentColor" className="ml-0.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4 font-bold text-white truncate max-w-[200px]" title={beat.title}>
                          {beat.title}
                          {beat.status === 'sold' && (
                            <span className="block text-[8px] text-red-500 font-bold uppercase tracking-wide mt-0.5">● Vendido Exclusivo</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-white">{beat.genre}</span>
                          <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{beat.bpm} BPM</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-brand-card border border-brand-border text-gray-300 rounded font-medium font-mono text-[10px]">
                            {beat.key}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-[#7F77DD]">
                          <div>${beat.priceBasic} CUP</div>
                          <div className="text-gray-400 text-[10px] font-normal font-sans mt-0.5">Excl: ${beat.priceExclusive} CUP</div>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button 
                            onClick={() => handleOpenEdit(beat)}
                            className="p-1 px-2.5 border border-[#534AB7]/40 text-[#7F77DD] bg-transparent hover:bg-[#534AB7]/10 rounded-lg font-bold transition-colors cursor-pointer text-[11px]"
                          >
                            Editar Parámetros
                          </button>
                          <button 
                            onClick={() => deleteBeat(beat.id)}
                            className="p-1 px-2 border border-red-900/40 text-red-450 hover:bg-red-955/20 rounded-lg hover:text-red-400 transition-colors cursor-pointer"
                            title="Eliminar instrumental"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
