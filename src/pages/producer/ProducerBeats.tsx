import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Plus, Edit2, Trash2, Search, SlidersHorizontal, Music, 
  Disc, Tag, CheckCircle2, DollarSign, CloudUpload, Play, Pause,
  Lock, ShieldAlert, Share2, FolderArchive, FileArchive, Library, ArrowLeft, Crown
} from 'lucide-react';

export const ProducerBeats: React.FC = () => {
  const { beats, addBeat, deleteBeat, updateBeat, navigateTo, playBeat, activeBeat, isPlaying, addToast, user, convertPrice, plans, exchangeRates } = useApp();

  const activePlan = useMemo(() => {
    const planName = user?.plan || 'Gratis';
    return plans.find(p => p.name.toLowerCase() === planName.toLowerCase()) || plans[0];
  }, [user, plans]);

  const isPremium = activePlan ? (activePlan.stemsAllowed || (activePlan.allowedFormats || '').toUpperCase().includes('WAV')) : false;

  // Active Tab for Beats vs Libraries
  const [activeTab, setActiveTab] = useState<'beats' | 'libraries'>('beats');

  // Library Form States
  const [isLibrarySetupMode, setIsLibrarySetupMode] = useState(false);
  const [libraryStep, setLibraryStep] = useState(1);
  const [libraryTitle, setLibraryTitle] = useState('');
  const [libraryFileCount, setLibraryFileCount] = useState('150');
  const [libraryGenre, setLibraryGenre] = useState('Reparto');
  const [libraryCoverUrl, setLibraryCoverUrl] = useState('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop');
  const [libraryPrice, setLibraryPrice] = useState('900');
  const [libraryFileName, setLibraryFileName] = useState('');
  const [libraryFileSizeMB, setLibraryFileSizeMB] = useState(100); // default simulated size in MB
  const [libraryDescription, setLibraryDescription] = useState('Librería de sonidos premium con percusiones cubanas, loops de reparto y sintetizadores analógicos listos para usar.');

  const [searchQuery, setSearchQuery] = useState('');
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);

  // Form States for Upload/Edit
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Reggaetón');
  const [bpm, setBpm] = useState('94');
  const [scaleKey, setScaleKey] = useState('C Minor');
  const [priceBasic, setPriceBasic] = useState('');
  const [priceExclusive, setPriceExclusive] = useState('');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [isLocalAudioPlaying, setIsLocalAudioPlaying] = useState(false);
  const localAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Stems & License States
  const [stemsUrl, setStemsUrl] = useState('');
  const [stemsFileName, setStemsFileName] = useState('');

  const DEFAULT_LICENSE_TEMPLATE = `LICENCIA EXCLUSIVA DE POR VIDA - TÉRMINOS DEL PRODUCTOR (ESTILO BEATSTARS)

1. CANTIDAD DE COPIAS A DISTRIBUIR:
✓ [ILIMITADO] Se concede al artista el derecho ilimitado de fabricar, distribuir y vender copias físicas (CDs, vinilos) y descargas digitales de la canción grabada de por vida.

2. CANTIDAD DE VIDEOS:
✓ [ILIMITADO] Se autoriza la creación y distribución de un número ilimitado de videos musicales, videoclips oficiales y sincronizaciones audiovisuales en plataformas como YouTube, Vimeo y redes sociales, con derecho a monetización ilimitada de por vida.

3. PLATAFORMAS DE STREAMING:
✓ [ILIMITADO] Se permite la reproducción y transmisión ilimitada de la canción en todas las plataformas de streaming de audio digital (incluyendo Spotify, Apple Music, Amazon Music, Tidal, Deezer, etc.) de por vida, sin límite de reproducciones.

4. DERECHOS DE AUTOR SOBRE EL BEAT:
✓ [DE POR VIDA] El artista adquiere la exclusividad comercial absoluta de esta obra. El beat se retira del catálogo comercial para nuevos compradores. Los derechos de explotación comercial quedan reservados de por vida para el comprador original bajo los créditos indicados.`;

  // Step Setup Form States
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [paymentTransfermovil, setPaymentTransfermovil] = useState(true);
  const [paymentEnzona, setPaymentEnzona] = useState(true);
  const [paymentQvapay, setPaymentQvapay] = useState(false);
  const [customLicenseClause, setCustomLicenseClause] = useState('');

  const [licCopiesUnlimited, setLicCopiesUnlimited] = useState(false);
  const [licVideosUnlimited, setLicVideosUnlimited] = useState(false);
  const [licStreamingUnlimited, setLicStreamingUnlimited] = useState(false);
  const [licCopyrightLifetime, setLicCopyrightLifetime] = useState(false);
  const [licStemsIncluded, setLicStemsIncluded] = useState(false);
  const [licAudioFormatWav, setLicAudioFormatWav] = useState(false);

  // Copyright Agreement Checkboxes for Step 5
  const [copyrightChecked1, setCopyrightChecked1] = useState(false);
  const [copyrightChecked2, setCopyrightChecked2] = useState(false);

  // Real-time visual validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation checks for each step of the beat wizard
  const stepsValidity = useMemo(() => {
    const isStep1Valid = !!title.trim() && !!bpm && Number(bpm) > 0 && !!scaleKey.trim();
    const isStep2Valid = !!audioUrl || !!audioFileName;
    const isStep3Valid = !!priceBasic && Number(priceBasic) > 0;
    const isStep4Valid = true; // optional
    const isStep5Valid = copyrightChecked1 && copyrightChecked2;
    
    return {
      step1: isStep1Valid,
      step2: isStep2Valid,
      step3: isStep3Valid,
      step4: isStep4Valid,
      step5: isStep5Valid,
      allValid: isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && isStep5Valid
    };
  }, [title, bpm, scaleKey, audioUrl, audioFileName, priceBasic, copyrightChecked1, copyrightChecked2]);

  // Plan configuration and limits for sound libraries
  const planLimits = useMemo(() => {
    if (!activePlan) return { maxCount: 0, maxSizeMB: 0, allowed: false };
    const maxCount = activePlan.limitLibrariesCount ?? 0;
    const maxSizeMB = activePlan.maxLibrarySizeEach ?? 0;
    const allowed = maxCount > 0;
    return { maxCount, maxSizeMB, allowed };
  }, [activePlan]);

  // Filter beats belonging to this producer (EXCLUDING sound libraries)
  const myBeats = useMemo(() => {
    return beats.filter((beat) => {
      const isMine = beat.producerId === (user?.id || 'p2') || beat.producerName === (user?.artistName || 'Flow Habano');
      const isBeat = !beat.isSoundLibrary;
      const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            beat.genre.toLowerCase().includes(searchQuery.toLowerCase());
      return isMine && isBeat && matchesSearch;
    });
  }, [beats, searchQuery, user]);

  // Filter sound libraries belonging to this producer
  const myLibraries = useMemo(() => {
    return beats.filter((beat) => {
      const isMine = beat.producerId === (user?.id || 'p2') || beat.producerName === (user?.artistName || 'Flow Habano');
      const isLib = !!beat.isSoundLibrary;
      const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            beat.genre.toLowerCase().includes(searchQuery.toLowerCase());
      return isMine && isLib && matchesSearch;
    });
  }, [beats, searchQuery, user]);

  const stopLocalAudio = () => {
    if (localAudioRef.current) {
      localAudioRef.current.pause();
    }
    setIsLocalAudioPlaying(false);
  };

  const handleShareBeat = (beatId: string) => {
    const url = `${window.location.origin}?beatId=${beatId}`;
    let copiedWithClipboard = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          addToast('¡Enlace de beat copiado al portapapeles! Compártelo en tus redes.', 'success');
        }).catch(() => {
          // fallback if promise rejected
          try {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            addToast('¡Enlace de beat copiado al portapapeles! Compártelo en tus redes.', 'success');
          } catch (err) {}
        });
        copiedWithClipboard = true;
      }
    } catch (e) {
      // blocked by permissions policy
    }

    if (!copiedWithClipboard) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          addToast('¡Enlace de beat copiado al portapapeles! Compártelo en tus redes.', 'success');
        } else {
          addToast('No se pudo copiar de forma automática. Por favor selecciónalo manualmente.', 'error');
        }
      } catch (err) {
        addToast('No se pudo copiar de forma automática.', 'error');
      }
    }
  };

  const handleOpenUploadLibrary = () => {
    if (!user?.verified) {
      addToast('Verificación KYC obligatoria: Debes acreditar tu identidad en Mi Perfil para subir u ofrecer librerías.', 'error');
      return;
    }
    if (!planLimits.allowed) {
      addToast('Tu plan actual (Gratis) no permite subir librerías de sonidos. Actualízate en la sección Planes.', 'error');
      return;
    }
    if (myLibraries.length >= planLimits.maxCount) {
      addToast(`Límite alcanzado: Tu plan actual (${user?.plan}) solo permite subir hasta ${planLimits.maxCount} librerías de sonido.`, 'error');
      return;
    }
    
    setEditingLibraryId(null);
    // reset library fields
    setLibraryTitle('');
    setLibraryFileCount('150');
    setLibraryGenre('Reparto');
    setLibraryCoverUrl('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop');
    setLibraryPrice('900');
    setLibraryFileName('');
    setLibraryFileSizeMB(100);
    setLibraryDescription('Librería de sonidos premium con percusiones cubanas, loops de reparto y sintetizadores analógicos listos para usar.');
    
    setLibraryStep(1);
    setIsLibrarySetupMode(true);
  };

  const handleOpenEditLibrary = (lib: any) => {
    if (!user?.verified) {
      addToast('Verificación KYC obligatoria: Debes acreditar tu identidad en Mi Perfil para gestionar e instrumentar cambios.', 'error');
      return;
    }
    
    setEditingLibraryId(lib.id);
    setLibraryTitle(lib.title);
    setLibraryFileCount((lib.fileCount || 150).toString());
    setLibraryGenre(lib.genre || 'Reparto');
    setLibraryCoverUrl(lib.coverUrl);
    
    const rateUSD = exchangeRates?.USD || 360.0;
    const cupPrice = Math.round(lib.priceBasic * rateUSD);
    setLibraryPrice(cupPrice.toString());
    
    setLibraryFileName(lib.libraryFileName || '');
    setLibraryFileSizeMB(lib.librarySizeMB || 100);
    setLibraryDescription(lib.description || '');
    
    setLibraryStep(1);
    setIsLibrarySetupMode(true);
  };

  const handleSaveLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!libraryTitle.trim()) {
      addToast('El nombre de la librería es requerido', 'error');
      return;
    }
    if (!libraryPrice || Number(libraryPrice) <= 0) {
      addToast('Ingresa un precio válido para la librería', 'error');
      return;
    }
    if (!libraryFileName) {
      addToast('Debes seleccionar o arrastrar un archivo .zip o .rar para la librería', 'error');
      return;
    }
    if (libraryFileSizeMB > planLimits.maxSizeMB) {
      addToast(`El archivo excede el tamaño máximo permitido por tu plan (${planLimits.maxSizeMB} MB)`, 'error');
      return;
    }
    if (!editingLibraryId && myLibraries.length >= planLimits.maxCount) {
      addToast('Ya has alcanzado el límite de librerías permitidas en tu plan.', 'error');
      return;
    }

    const rateUSD = exchangeRates?.USD || 360.0;
    const libPayload = {
      id: editingLibraryId || `library_new_${Date.now()}`,
      title: libraryTitle,
      producerName: user?.artistName || user?.name || 'Flow Habano',
      producerId: user?.id || 'p2',
      genre: libraryGenre || 'Librería de Sonidos', // Use chosen genre for synchronization
      bpm: 0,
      key: 'N/A',
      priceBasic: Number(libraryPrice) / rateUSD,
      priceExclusive: Number(libraryPrice) / rateUSD, // Single price
      tags: [libraryGenre.toLowerCase(), 'samples', 'sound kit', 'loops'],
      coverUrl: libraryCoverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
      audioUrl: '', // No single audio preview required or simulated
      status: 'available' as const,
      plays: editingLibraryId ? (beats.find(b => b.id === editingLibraryId)?.plays ?? 0) : 0,
      downloads: editingLibraryId ? (beats.find(b => b.id === editingLibraryId)?.downloads ?? 0) : 0,
      description: libraryDescription,
      duration: 'Librería',
      releasedAt: 'Hoy',
      isSoundLibrary: true,
      fileCount: Number(libraryFileCount),
      librarySizeMB: libraryFileSizeMB,
      libraryFileName: libraryFileName,
      customLicenseClause: `LICENCIA DE USO COMERCIAL DE LIBRERÍA DE SONIDOS - D'CUBAN BEATS

Esta licencia otorga al comprador un derecho no exclusivo e intransferible para utilizar los samples, loops, sonidos y archivos incluidos en "${libraryTitle}" en sus propias producciones musicales de forma 100% libre de regalías (Royalty-Free) de por vida. Se permite el uso comercial y de distribución pública.`
    };

    if (editingLibraryId) {
      updateBeat(libPayload);
      addToast('¡Librería de sonidos actualizada con éxito!', 'success');
    } else {
      addBeat(libPayload);
      addToast('¡Librería de sonidos publicada con éxito!', 'success');
    }
    setIsLibrarySetupMode(false);
  };

  const handleDeviceLibraryCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setLibraryCoverUrl(tempUrl);
      addToast('Mockup de la librería cargado correctamente', 'success');
    }
  };

  const handleDeviceZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = file.name;
      const lower = name.toLowerCase();
      if (!lower.endsWith('.zip') && !lower.endsWith('.rar')) {
        addToast('Formato no permitido: El archivo debe ser un archivo comprimido .zip o .rar', 'error');
        return;
      }
      
      // Calculate file size in MB
      const sizeMB = Math.round((file.size / (1024 * 1024)) * 10) / 10 || 1.2;
      
      if (sizeMB > planLimits.maxSizeMB) {
        addToast(`El archivo pesa ${sizeMB} MB, lo cual excede el límite máximo de tu plan para librerías (${planLimits.maxSizeMB} MB).`, 'error');
        return;
      }

      setLibraryFileName(name);
      setLibraryFileSizeMB(sizeMB);
      addToast(`Archivo de sonido "${name}" (${sizeMB} MB) cargado correctamente`, 'success');
    }
  };

  const handleOpenUpload = () => {
    if (!user?.verified) {
      addToast('Verificación KYC obligatoria: Debes acreditar tu identidad en Mi Perfil para subir u ofrecer instrumentales.', 'error');
      return;
    }
    const limit = activePlan?.limit ?? 5;
    if (myBeats.length >= limit) {
      addToast(`Límite de beats alcanzado: Tu plan actual (${user?.plan || 'Gratis'}) solo permite publicar hasta ${limit} beats. Por favor, actualiza tu plan en la pestaña de Planes.`, 'error');
      return;
    }
    setEditingBeatId(null);
    setTitle('');
    setGenre('Reggaetón');
    setBpm('94');
    setScaleKey('C Minor');
    setPriceBasic('');
    setPriceExclusive('');
    setTags('reggaeton, perreo, cuba');
    setCoverUrl('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop');
    setDescription('Mezcla estéreo, gorda con sintetizadores retros grabada en La Habana.');
    setAudioUrl('');
    setAudioFileName('');
    setStemsUrl('');
    setStemsFileName('');
    stopLocalAudio();
    setPaymentTransfermovil(true);
    setPaymentEnzona(true);
    setPaymentQvapay(false);
    setLicCopiesUnlimited(false);
    setLicVideosUnlimited(false);
    setLicStreamingUnlimited(false);
    setLicCopyrightLifetime(false);
    setLicStemsIncluded(false);
    setLicAudioFormatWav(false);
    setCopyrightChecked1(false);
    setCopyrightChecked2(false);
    setCustomLicenseClause(DEFAULT_LICENSE_TEMPLATE);
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
    
    const rateUSD = exchangeRates?.USD || 360.0;
    const cupPriceBasic = Math.round(beat.priceBasic * rateUSD);
    const cupPriceExclusive = Math.round(beat.priceExclusive * rateUSD);
    
    setPriceBasic(cupPriceBasic.toString());
    setPriceExclusive(cupPriceExclusive.toString());
    setTags(beat.tags.join(', '));
    setCoverUrl(beat.coverUrl);
    setDescription(beat.description || '');
    setAudioUrl(beat.audioUrl || '');
    setAudioFileName(beat.audioFileName || (beat.audioUrl ? 'beat_track_audio.mp3' : ''));
    setStemsUrl(beat.stemsUrl || '');
    setStemsFileName(beat.stemsFileName || '');
    stopLocalAudio();
    setPaymentTransfermovil(beat.paymentTransfermovil ?? true);
    setPaymentEnzona(beat.paymentEnzona ?? true);
    setPaymentQvapay(beat.paymentQvapay ?? false);
    
    const licText = beat.customLicenseClause || '';
    const hasCopiesLimited = licText.includes('✗ [LIMITADO] Cantidad de copias') || licText.includes('✗ [LIMITADO] Distribución sujeta');
    const hasVideosLimited = licText.includes('✗ [LIMITADO] Cantidad de videos') || licText.includes('✗ [LIMITADO] Uso en videoclips');
    const hasStreamingLimited = licText.includes('✗ [LIMITADO] Plataformas de streaming') || licText.includes('✗ [LIMITADO] Transmisiones digitales');
    const hasCopyrightLimited = licText.includes('✗ [LIMITADO] Derechos de autor') || licText.includes('✗ [LIMITADO] Derechos exclusivos');
    const hasStemsExcluded = licText.includes('✗ [NO INCLUIDO] Pistas por separado') || licText.includes('✗ No incluye pistas por separado');
    const isMp3Format = licText.includes('[FORMATO] Audio entregado en formato MP3') || licText.includes('Calidad de audio: MP3');

    setLicCopiesUnlimited(!hasCopiesLimited);
    setLicVideosUnlimited(!hasVideosLimited);
    setLicStreamingUnlimited(!hasStreamingLimited);
    setLicCopyrightLifetime(!hasCopyrightLimited);
    setLicStemsIncluded(!hasStemsExcluded);
    setLicAudioFormatWav(!isMp3Format);

    setCopyrightChecked1(false);
    setCopyrightChecked2(false);

    setCustomLicenseClause(beat.customLicenseClause || DEFAULT_LICENSE_TEMPLATE);
    setErrors({});
    setIsSetupMode(true);
    setSetupStep(1);
  };

  const handleSaveBeat = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBeatId) {
      const limit = activePlan?.limit ?? 5;
      if (myBeats.length >= limit) {
        addToast(`Límite de beats alcanzado: Tu plan actual (${user?.plan || 'Gratis'}) solo permite publicar hasta ${limit} beats. Por favor, actualiza tu plan en la pestaña de Planes.`, 'error');
        return;
      }
    }
    
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'El título de la instrumental es requerido';
    if (!bpm || Number(bpm) <= 0) tempErrors.bpm = 'Ingresa un valor de BPM válido';
    if (!scaleKey.trim()) tempErrors.scaleKey = 'La escala armónica (tono) es requerida';
    if (!audioUrl && !audioFileName) tempErrors.audio = 'Debes subir un archivo local de audio (.MP3 o .WAV)';
    if (!priceBasic || Number(priceBasic) <= 0) tempErrors.priceBasic = 'Debes ingresar un precio válido mayor que cero';

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

    if (!copyrightChecked1 || !copyrightChecked2) {
      addToast('Debes aceptar las declaraciones de derechos de autor en el Paso 5 para poder publicar el beat', 'error');
      setSetupStep(5);
      return;
    }

    setErrors({});

    const tagsArray = tags.split(',').map((t) => t.trim()).filter((t) => t !== '');

    const rateUSD = exchangeRates?.USD || 360.0;
    const beatPayload = {
      id: editingBeatId || `beat_new_${Date.now()}`,
      title,
      producerName: user?.artistName || user?.name || 'Flow Habano',
      producerId: user?.id || 'p2',
      genre,
      bpm: Number(bpm),
      key: scaleKey,
      priceBasic: Number(priceBasic) / rateUSD,
      priceExclusive: Number(priceBasic) / rateUSD,
      tags: tagsArray,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
      audioUrl: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioFileName: audioFileName || 'SoundHelix-Song-1.mp3',
      stemsUrl: stemsUrl || '',
      stemsFileName: stemsFileName || '',
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
      const fileNameLower = file.name.toLowerCase();
      const isWav = fileNameLower.endsWith('.wav') || file.type.includes('wav');
      
      if (!isWav && !fileNameLower.endsWith('.mp3')) {
        addToast('El sistema requiere formato WAV (.wav) para la generación automática de FLAC máster y MP3 vista previa.', 'error');
        return;
      }

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

      addToast(`Archivo WAV "${file.name}" cargado. Se procesará la conversión automática a FLAC (máster) y MP3 (preview con watermark).`, 'success');
    }
  };

  const handleDeviceStemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stemsAllowed = activePlan?.stemsAllowed ?? false;
    if (!stemsAllowed) {
      addToast(`La subida de STEMS (pistas separadas) no está permitida en su plan actual (${activePlan?.name || 'Gratis'}).`, 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const fileNameLower = file.name.toLowerCase();
      const isArchive = fileNameLower.endsWith('.zip') || fileNameLower.endsWith('.rar');
      if (!isArchive) {
        addToast('Por favor, suba un archivo comprimido en formato .ZIP o .RAR para los stems.', 'error');
        return;
      }
      const tempUrl = URL.createObjectURL(file);
      setStemsUrl(tempUrl);
      setStemsFileName(file.name);
      addToast('Archivo de STEMS cargado correctamente', 'success');
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

  React.useEffect(() => {
    if (isSetupMode) {
      const generated = `LICENCIA EXCLUSIVA DE POR VIDA - TÉRMINOS DEL PRODUCTOR (ESTILO BEATSTARS)

1. CANTIDAD DE COPIAS A DISTRIBUIR:
${licCopiesUnlimited ? '✓ [ILIMITADO] Se concede al artista el derecho ilimitado de fabricar, distribuir y vender copias físicas (CDs, vinilos) y descargas digitales de la canción grabada de por vida.' : '✗ [LIMITADO] Distribución sujeta a negociación directa previa.'}

2. CANTIDAD DE VIDEOS:
${licVideosUnlimited ? '✓ [ILIMITADO] Se autoriza la creación y distribución de un número ilimitado de videos musicales, videoclips oficiales y sincronizaciones audiovisuales en plataformas como YouTube, Vimeo y redes sociales, con derecho a monetización ilimitada de por vida.' : '✗ [LIMITADO] Uso en videoclips y sincronizaciones audiovisuales limitado o sujeto a aprobación previa.'}

3. PLATAFORMAS DE STREAMING:
${licStreamingUnlimited ? '✓ [ILIMITADO] Se permite la reproducción y transmisión ilimitada de la canción en todas las plataformas de streaming de audio digital (incluyendo Spotify, Apple Music, Amazon Music, Tidal, Deezer, etc.) de por vida, sin límite de reproducciones.' : '✗ [LIMITADO] Transmisiones digitales y reproducciones limitadas o sujetas a regalías previas.'}

4. DERECHOS DE AUTOR SOBRE EL BEAT:
${licCopyrightLifetime ? '✓ [DE POR VIDA] El artista adquiere la exclusividad comercial absoluta de esta obra. El beat se retira del catálogo comercial para nuevos compradores. Los derechos de explotación comercial quedan reservados de por vida para el comprador original bajo los créditos indicados.' : '✗ [LIMITADO] Derechos exclusivos de autor de por vida sujetos a condiciones adicionales.'}

5. ARCHIVOS Y PISTAS INCLUIDAS:
${licStemsIncluded ? '✓ [INCLUIDO] Pistas por separado (STEMS) incluidas en la descarga para mezcla y masterización profesional.' : '✗ [NO INCLUIDO] Pistas por separado (STEMS) no incluidas en la descarga.'}

6. FORMATO DE AUDIO:
${licAudioFormatWav ? '✓ [FORMATO] Audio de alta calidad entregado en formato WAV profesional de 24 bits.' : '✓ [FORMATO] Audio entregado en formato MP3 comprimido de alta fidelidad (320 kbps).'}`;

      setCustomLicenseClause(generated);
    }
  }, [licCopiesUnlimited, licVideosUnlimited, licStreamingUnlimited, licCopyrightLifetime, licStemsIncluded, licAudioFormatWav, isSetupMode]);

  const isCurrentPlaying = (bId: string) => {
    return activeBeat?.id === bId && isPlaying;
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg">
      
      {/* CASE A-1: LIBRARY SETUP MODE (Asistente de Publicación de Librería de Sonidos) */}
      {isLibrarySetupMode ? (
        <div className="bg-brand-surface border border-brand-border/40 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300 text-left text-white">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-brand-border/20 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Library className="text-[#7F77DD]" size={18} /> {editingLibraryId ? 'Editar Parámetros de la Librería' : 'Asistente de Publicación de Librería'}
              </h3>
              <p className="text-xs text-gray-400">Publica un kit de samples, loops o efectos de sonido para artistas.</p>
            </div>
            <button
              onClick={() => setIsLibrarySetupMode(false)}
              className="text-xs font-semibold text-[#7F77DD] bg-[#534AB7]/10 border border-[#534AB7]/30 hover:bg-[#534AB7]/25 px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              ← Cancelar
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 select-none">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${libraryStep === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {libraryStep > 1 ? '✓' : '1'}
              </span>
              <span className={`text-xs font-bold ${libraryStep === 1 ? 'text-white' : 'text-gray-400'}`}>Datos Básicos</span>
            </div>
            <div className="h-px bg-brand-border w-8"></div>
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${libraryStep === 2 ? 'bg-indigo-600 text-white' : 'bg-brand-border text-gray-400'}`}>
                2
              </span>
              <span className={`text-xs font-bold ${libraryStep === 2 ? 'text-white' : 'text-gray-400'}`}>Subir Archivo (.ZIP / .RAR)</span>
            </div>
          </div>

          <form onSubmit={handleSaveLibrary} className="space-y-6">
            {libraryStep === 1 ? (
              /* SECCION 1: DATOS BASICOS */
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block">Nombre de la Librería *</label>
                  <input
                    type="text"
                    required
                    value={libraryTitle}
                    onChange={(e) => setLibraryTitle(e.target.value)}
                    placeholder="Ej. La Habana Reparto Loop Kit Vol. 1"
                    className="w-full bg-brand-bg border border-brand-border/40 focus:border-[#534AB7] focus:ring-1 focus:ring-indigo-555/20 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Genre */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 block">Género Principal *</label>
                    <select
                      value={libraryGenre}
                      onChange={(e) => setLibraryGenre(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border/40 focus:border-[#534AB7] rounded-xl py-2 px-3 text-xs text-white outline-none animate-in fade-in duration-200"
                    >
                      <option value="Reparto">Reparto</option>
                      <option value="Reggaetón">Reggaetón</option>
                      <option value="Dembow">Dembow</option>
                      <option value="Dancehall">Dancehall</option>
                      <option value="Salsa">Salsa / Afro-Cuban</option>
                      <option value="Timba">Timba</option>
                      <option value="Songo">Songo / Rumba</option>
                      <option value="Bachata">Bachata</option>
                      <option value="Merengue">Merengue</option>
                      <option value="Trap">Trap</option>
                      <option value="Drill">Drill</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                      <option value="R&B">R&B</option>
                      <option value="Afrobeats">Afrobeats</option>
                      <option value="Urban">Urban / Pop</option>
                      <option value="Percusión">Percusión / SFX</option>
                      <option value="Electronic">Electronic / EDM</option>
                    </select>
                  </div>

                  {/* Quantity of files */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300 block">Cantidad de Elementos / Archivos *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={libraryFileCount}
                      onChange={(e) => setLibraryFileCount(e.target.value)}
                      placeholder="Ej. 150"
                      className="w-full bg-brand-bg border border-brand-border/40 focus:border-[#534AB7] focus:ring-1 focus:ring-indigo-555/20 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block">Precio de la Librería (CUP) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono">CUP</span>
                    <input
                      type="number"
                      required
                      min={50}
                      value={libraryPrice}
                      onChange={(e) => setLibraryPrice(e.target.value)}
                      placeholder="900"
                      className="w-full bg-brand-bg border border-brand-border/40 focus:border-[#534AB7] focus:ring-1 focus:ring-indigo-555/20 rounded-xl py-2 pl-12 pr-3 text-xs text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 block">Descripción / Detalles</label>
                  <textarea
                    value={libraryDescription}
                    onChange={(e) => setLibraryDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe qué contiene la librería (Ej. 30 kicks, 40 percusiones cubanas, stems de ritmos...)"
                    className="w-full bg-brand-bg border border-brand-border/40 focus:border-[#534AB7] focus:ring-1 focus:ring-indigo-555/20 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 outline-none resize-none"
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 block">Mockup o Imagen de Portada *</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-brand-bg/50 p-4 border border-brand-border/20 rounded-2xl">
                    <div className="w-20 h-20 bg-brand-card rounded-xl overflow-hidden border border-brand-border/40 flex-shrink-0 relative group">
                      <img
                        src={libraryCoverUrl}
                        alt="Library Mockup"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 text-left flex-1 w-full">
                      <span className="text-[10px] text-gray-400 block leading-relaxed">Sube una imagen cuadrada para tu librería desde tu dispositivo local (Soporta JPG, PNG o WEBP).</span>
                      <div className="flex">
                        <label className="px-4 py-2 bg-[#534AB7] hover:bg-[#433A9B] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors block text-center shadow-sm shadow-[#534AB7]/10">
                          Examinar Dispositivo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDeviceLibraryCoverChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SECCION 2: SUBIR ARCHIVO (.ZIP o .RAR) */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-indigo-300 text-xs text-left space-y-1.5">
                  <h4 className="font-bold flex items-center gap-1.5 text-white">
                    <Crown size={14} className="text-amber-400" /> Límites de tu Plan ({user?.plan || 'Gratis'})
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                    <li>Capacidad máxima por librería: <strong className="text-white">{planLimits.maxSizeMB} MB</strong></li>
                    <li>Cantidad de librerías permitidas: <strong className="text-white">{planLimits.maxCount}</strong></li>
                    <li>Librerías publicadas actualmente: <strong className="text-white">{myLibraries.length} / {planLimits.maxCount}</strong></li>
                  </ul>
                </div>

                {/* ZIP drag zone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 block">Archivo Comprimido (.ZIP o .RAR) *</label>
                  
                  {libraryFileName ? (
                    /* File uploaded display */
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex items-center justify-between gap-3 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                          <FileArchive size={20} />
                        </div>
                        <div className="text-left space-y-0.5">
                          <span className="text-xs font-bold text-white block truncate max-w-xs">{libraryFileName}</span>
                          <span className="text-[10px] text-gray-400 font-mono block">{libraryFileSizeMB} MB / Límite de {planLimits.maxSizeMB} MB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLibraryFileName('')}
                        className="p-1 px-2 border border-red-900/30 text-red-400 hover:bg-red-950/40 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    /* File upload target zone */
                    <label className="border-2 border-dashed border-brand-border/50 hover:border-[#534AB7]/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-brand-bg/20 hover:bg-brand-bg/40 transition-all cursor-pointer text-center group">
                      <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#7F77DD] group-hover:scale-105 transition-all">
                        <CloudUpload size={24} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block group-hover:text-[#7F77DD] transition-colors">Selecciona tu archivo de sonidos .zip o .rar</span>
                        <span className="text-[10px] text-gray-400 block">Capacidad máxima: {planLimits.maxSizeMB} MB</span>
                      </div>
                      <input
                        type="file"
                        accept=".zip,.rar"
                        onChange={handleDeviceZipChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="p-3 bg-brand-card/50 rounded-xl border border-brand-border/30 text-left space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Términos de la Plataforma (No Modificable)</span>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Al subir esta librería, certificas que todos los samples, bucles y efectos de sonido son 100% de tu autoría, creados de forma lícita y libres de regalías. La licencia se emitirá automáticamente de por vida con carácter comercial y libre de regalías para el comprador.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Commands */}
            <div className="flex justify-between pt-4 border-t border-brand-border/30 gap-2">
              <button
                type="button"
                disabled={libraryStep === 1}
                onClick={() => setLibraryStep(1)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer select-none transition-all ${
                  libraryStep === 1 
                    ? 'border-brand-border/10 text-gray-600 cursor-not-allowed bg-transparent' 
                    : 'border-[#534AB7] text-[#7F77DD] bg-brand-surface hover:bg-brand-card'
                }`}
              >
                ← Anterior
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLibrarySetupMode(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  Descartar
                </button>

                {libraryStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!libraryTitle.trim()) {
                        addToast('Ingresa el nombre de la librería', 'error');
                        return;
                      }
                      if (!libraryPrice || Number(libraryPrice) <= 0) {
                        addToast('Ingresa un precio de venta lícito', 'error');
                        return;
                      }
                      setLibraryStep(2);
                    }}
                    className="px-5 py-2 bg-[#534AB7] hover:bg-[#433A9B] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm shadow-[#534AB7]/10"
                  >
                    Siguiente (Subir Archivo) →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm shadow-emerald-600/10"
                  >
                    Publicar Librería Now ✓
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : isSetupMode ? (
        <div className="bg-brand-surface border border-brand-border/40 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          
          {/* Wizard Header and back toolbar */}
          <div className="flex justify-between items-center pb-4 border-b border-brand-border/20 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingBeatId ? 'Editar Parámetros de la Instrumental' : 'Asistente de Publicación de Beats'}
              </h3>
              <p className="text-xs text-gray-400">Completa los pasos obligatorios para preparar tu pista.</p>
            </div>
            
            <button
              onClick={() => setIsSetupMode(false)}
              className="text-xs font-semibold text-[#7F77DD] bg-[#534AB7]/10 border border-[#534AB7]/30 hover:bg-[#534AB7]/25 px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              ← Cancelar e Ir Atrás
            </button>
          </div>

          {/* Sequential Step Progress Tracker Indicator */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-gray-400 select-none">
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
                  : stepsValidity.step4 
                    ? 'border-emerald-500 text-emerald-400 hover:text-emerald-300' 
                    : 'border-brand-border/20 hover:text-gray-200'
              }`}
            >
              4. Licencia {stepsValidity.step4 ? '✓' : ''}
            </div>
            <div 
              onClick={() => {
                if (stepsValidity.step1 && stepsValidity.step2 && stepsValidity.step3 && stepsValidity.step4) {
                  setSetupStep(5);
                } else {
                  addToast('Completa todos los pasos requeridos anteriores primero', 'info');
                }
              }}
              className={`pb-2 border-b-2 cursor-pointer transition-all ${
                setupStep === 5 
                  ? 'border-[#7F77DD] text-white' 
                  : stepsValidity.step5 
                    ? 'border-emerald-500 text-emerald-400 hover:text-emerald-300' 
                    : 'border-brand-border/20 hover:text-gray-200'
              }`}
            >
              5. Copyright {stepsValidity.step5 ? '✓' : '⚠'}
            </div>
          </div>

          {/* Form Step Contents rendering */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            
            {/* STEP 1: INFORMACIÓN BÁSICA */}
            {setupStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">1</div>
                  <span>Propiedades e información descriptiva del beat instrumental en D'Cuban Beats.</span>
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
                  <span>Arte y Audio. Selecciona la portada de tu instrumental y carga la pista.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Photo upload / select column */}
                  <div className="md:col-span-7 space-y-4">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Foto de Portada (Cover) *</span>
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
                    <span className="text-[10px] font-bold text-gray-450 block uppercase">Vista Previa</span>
                    <div className="w-36 h-36 rounded-2xl overflow-hidden mx-auto shadow-md border-2 border-brand-border/50 bg-brand-card relative group">
                      {coverUrl ? (
                        <img 
                          src={coverUrl} 
                          alt="Cover upload preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center text-gray-400 text-xs p-4">
                          <Music size={24} className="mb-1 text-gray-550" />
                          Sin portada
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real interactive high-bitrate audio track uploader */}
                  <div className={`border ${errors.audio ? 'border-brand-accent-red/80 bg-brand-accent-red/5' : 'border-[#534AB7]/30 bg-[#534AB7]/5'} p-5 rounded-2xl space-y-4 text-left transition-all duration-200`}>
                    <div className="flex justify-between items-center flex-wrap gap-2 pb-1 border-b border-brand-border/20">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7F77DD] block">Pista de Audio *</span>
                        <span className="text-[10px] text-gray-400">Subida exclusiva desde archivo local.</span>
                      </div>

                      {audioUrl && (
                        <span className="px-2 py-0.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 text-[9px] rounded-lg font-bold uppercase">
                          ✓ Cargado
                        </span>
                      )}
                    </div>

                    {errors.audio && (
                      <span className="text-xs text-brand-accent-red font-semibold block animate-pulse">
                        ⚠️ {errors.audio}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="p-3 bg-brand-surface/80 rounded-xl border border-brand-border/40 text-[11px] text-gray-300 space-y-1.5">
                        <span className="font-bold text-[#7F77DD] block flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-400" /> Proceso Automático de Transcodificación:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-[10px] text-gray-400">
                          <li>Sube tu archivo máster exclusivamente en formato <strong className="text-white">.WAV</strong>.</li>
                          <li>El sistema convierte automáticamente el WAV a <strong className="text-emerald-400">FLAC</strong> (compresión sin pérdida, mismo audio, menor peso).</li>
                          <li>Genera una vista previa en <strong className="text-indigo-300">MP3 128kbps con marca de agua (watermark)</strong> para reproducción pública.</li>
                        </ul>
                      </div>

                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10.5px] text-amber-200">
                        <strong>⚠️ Aviso Obligatorio para el Productor:</strong> Conserva siempre una copia local de tus archivos originales WAV. Pasadas 39h tras una venta o de no ser descargado, el máster se elimina del almacenamiento temporal y deberás entregarlo manualmente a tu cliente.
                      </div>

                      <div>
                        <input 
                          type="file" 
                          accept=".wav,audio/wav" 
                          id="device-audio-setup-input" 
                          className="hidden" 
                          onChange={handleDeviceAudioChange} 
                        />
                        <label 
                          htmlFor="device-audio-setup-input"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/30 text-[#7F77DD] border border-[#534AB7]/35 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all text-center h-[42px] whitespace-nowrap"
                        >
                          <CloudUpload size={14} />
                          Seleccionar Archivo Master WAV (.wav)
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
                          <span className="text-[11px] font-bold text-white block truncate" title={audioFileName}>
                            {audioFileName || 'pista_instrumental.mp3'}
                          </span>
                          <span className="text-[9px] text-gray-400 block font-mono leading-tight">
                            {isLocalAudioPlaying ? 'Reproduciendo...' : 'Comprobar audio'}
                          </span>
                        </div>

                        {isLocalAudioPlaying && (
                          <div className="flex gap-0.5 items-center h-4 px-1">
                            <span className="w-0.5 h-2 bg-[#534AB7] rounded-full animate-pulse"></span>
                            <span className="w-0.5 h-3 bg-[#534AB7] rounded-full animate-pulse delay-75"></span>
                            <span className="w-0.5 h-2 bg-[#534AB7] rounded-full animate-pulse delay-150"></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STEMS OF THE BEAT SECTION */}
                  <div className={`border ${activePlan?.stemsAllowed ? 'border-[#7F77DD]/30 bg-[#7F77DD]/5' : 'border-brand-border/25 bg-brand-surface/20 opacity-60'} p-5 rounded-2xl space-y-4 text-left transition-all duration-200`}>
                    <div className="flex justify-between items-center flex-wrap gap-2 pb-1 border-b border-brand-border/20">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7F77DD] block flex items-center gap-1">
                          {!activePlan?.stemsAllowed && <Lock size={12} className="text-amber-400" />} Pistas Separadas (STEMS)
                        </span>
                        <span className="text-[10px] text-gray-400">Sube un archivo comprimido .ZIP o .RAR.</span>
                      </div>

                      {activePlan?.stemsAllowed && stemsUrl && (
                        <span className="px-2 py-0.5 bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 text-[9px] rounded-lg font-bold uppercase">
                          ✓ ZIP/RAR Listo
                        </span>
                      )}
                    </div>

                    {!activePlan?.stemsAllowed ? (
                      <div className="space-y-2 py-2">
                        <p className="text-[11px] text-slate-300 leading-normal">
                          La subida de STEMS (pistas por separado) no está permitida en su plan actual (<strong>Plan {activePlan?.name || 'Gratis'}</strong>).
                        </p>
                        <button
                          type="button"
                          onClick={() => navigateTo('/producer/plans')}
                          className="text-[11px] text-[#7F77DD] hover:text-[#9B94EC] font-bold underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                          Adquirir Plan con Soporte de Stems para Activar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[11px] text-gray-400 leading-normal">
                          Los stems facilitan la mezcla oficial del cantante y aumentan considerablemente las ventas de licencias exclusivas.
                        </p>
                        
                        <div>
                          <input 
                            type="file" 
                            accept=".zip,.rar" 
                            id="device-stems-setup-input" 
                            className="hidden" 
                            onChange={handleDeviceStemsChange} 
                          />
                          <label 
                            htmlFor="device-stems-setup-input"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7F77DD]/10 hover:bg-[#7F77DD]/20 text-indigo-300 border border-[#7F77DD]/25 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all text-center h-[42px] whitespace-nowrap"
                          >
                            <CloudUpload size={14} />
                            {stemsFileName ? 'Reemplazar Stems ZIP/RAR' : 'Subir Stems (.ZIP/.RAR)'}
                          </label>
                        </div>

                        {stemsUrl && (
                          <div className="p-3 bg-brand-surface rounded-xl border border-brand-border/30 text-left">
                            <span className="text-[11px] font-bold text-slate-200 block truncate" title={stemsFileName}>
                              📁 {stemsFileName || 'stems_comprimidos.zip'}
                            </span>
                            <span className="text-[9px] text-indigo-300 block font-mono">
                              Archivo verificado y vinculado para entrega automática
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 block leading-normal text-left">
                  D'Cuban Beats encriptará de forma segura todos tus archivos para garantizar la protección absoluta de tus obras y propiedad intelectual.
                </p>
              </div>
            )}

            {/* STEP 3: PRECIO ÚNICO */}
            {setupStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">3</div>
                  <span>Establece la tarifa única para tu beat instrumental.</span>
                </div>

                <div className="max-w-md mx-auto">
                  <Input
                    label="Precio de la Instrumental (CUP) *"
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
                </div>

                <div className="p-4 rounded-xl border border-brand-border/20 bg-brand-card/45 space-y-2 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7F77DD] block flex items-center gap-1.5">
                    <Lock size={13} className="text-[#7F77DD]" /> Métodos de Pago Integrados Automáticamente
                  </span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Ya no es necesario configurar métodos de pago específicos para cada beat. Al momento de pagar, el artista visualizará de forma automática los canales activos que has configurado en tus <strong>Métodos de Pago de Productor</strong> (Transfermóvil, EnZona y/o QvaPay).
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: LICENCIA (OPCIONAL/PREESTABLECIDA) */}
            {setupStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">4</div>
                  <span>Licencia Contractual. Configura los términos de uso exclusivo para tu instrumental.</span>
                </div>

                {/* Section 1: Beatstars-style license terms */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-indigo-300 tracking-wider">Parte 1: Términos y Condiciones de Uso (Estilo Beatstars) — Licencia Exclusiva</label>
                    <span className="px-2 py-0.5 bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 text-[9px] rounded-lg font-bold uppercase">
                      ★ De por vida
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Marca las casillas para confirmar las cláusulas ilimitadas del contrato. Al ser una Licencia Exclusiva, estas condiciones tendrán validez permanente e ilimitada para el artista comprador.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Checkbox 1 */}
                    <label className="flex items-start gap-3 bg-brand-card/45 p-4 border border-brand-border/40 hover:border-[#534AB7]/55 rounded-2xl cursor-pointer hover:bg-brand-card/75 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={licCopiesUnlimited} 
                        onChange={(e) => setLicCopiesUnlimited(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white block leading-tight">Distribución Digital e Impresa Ilimitada</span>
                          {licCopiesUnlimited && (
                            <span className="px-1.5 py-0.2 bg-emerald-950/20 text-emerald-400 text-[8px] font-extrabold rounded uppercase tracking-wider scale-95">Ilimitado</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">Permite al artista fabricar, distribuir y vender copias físicas y digitales (CDs, descargas, vinilos) de por vida.</p>
                      </div>
                    </label>

                    {/* Checkbox 2 */}
                    <label className="flex items-start gap-3 bg-brand-card/45 p-4 border border-brand-border/40 hover:border-[#534AB7]/55 rounded-2xl cursor-pointer hover:bg-brand-card/75 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={licVideosUnlimited} 
                        onChange={(e) => setLicVideosUnlimited(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white block leading-tight">Videos Musicales y Sincronizaciones Ilimitados</span>
                          {licVideosUnlimited && (
                            <span className="px-1.5 py-0.2 bg-emerald-950/20 text-emerald-400 text-[8px] font-extrabold rounded uppercase tracking-wider scale-95">Ilimitado</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">Autoriza la grabación y monetización de videos oficiales o promocionales de YouTube, TikTok, etc., sin topes de vistas.</p>
                      </div>
                    </label>

                    {/* Checkbox 3 */}
                    <label className="flex items-start gap-3 bg-brand-card/45 p-4 border border-brand-border/40 hover:border-[#534AB7]/55 rounded-2xl cursor-pointer hover:bg-brand-card/75 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={licStreamingUnlimited} 
                        onChange={(e) => setLicStreamingUnlimited(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white block leading-tight">Transmisión Digital (Streaming) Ilimitada</span>
                          {licStreamingUnlimited && (
                            <span className="px-1.5 py-0.2 bg-emerald-950/20 text-emerald-400 text-[8px] font-extrabold rounded uppercase tracking-wider scale-95">Ilimitado</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">Habilita transmisiones ilimitadas en plataformas principales como Spotify, Apple Music, Tidal, Deezer y más.</p>
                      </div>
                    </label>

                    {/* Checkbox 4 */}
                    <label className="flex items-start gap-3 bg-brand-card/45 p-4 border border-brand-border/40 hover:border-[#534AB7]/55 rounded-2xl cursor-pointer hover:bg-brand-card/75 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={licCopyrightLifetime} 
                        onChange={(e) => setLicCopyrightLifetime(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white block leading-tight">Derechos de Autor y Exclusividad de por Vida</span>
                          {licCopyrightLifetime && (
                            <span className="px-1.5 py-0.2 bg-emerald-950/20 text-emerald-400 text-[8px] font-extrabold rounded uppercase tracking-wider scale-95">De Por Vida</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">Otorga exclusividad absoluta sobre la obra musical. El beat se remueve de catálogos y se reserva al artista de por vida.</p>
                      </div>
                    </label>

                    {/* Checkbox 5 (Stems) */}
                    <label className="flex items-start gap-3 bg-brand-card/45 p-4 border border-brand-border/40 hover:border-[#534AB7]/55 rounded-2xl cursor-pointer hover:bg-brand-card/75 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={licStemsIncluded} 
                        onChange={(e) => setLicStemsIncluded(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white block leading-tight">Incluye Pistas por Separado (STEMS)</span>
                          {licStemsIncluded && (
                            <span className="px-1.5 py-0.2 bg-emerald-950/20 text-emerald-400 text-[8px] font-extrabold rounded uppercase tracking-wider scale-95">Stems Listos</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">Marca si la descarga incluirá las pistas individuales o canales separados del beat para mezcla profesional.</p>
                      </div>
                    </label>

                    {/* Checkbox 6 (Audio Format) */}
                    <label className="flex items-start gap-3 bg-brand-card/45 p-4 border border-brand-border/40 hover:border-[#534AB7]/55 rounded-2xl cursor-pointer hover:bg-brand-card/75 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={licAudioFormatWav} 
                        onChange={(e) => setLicAudioFormatWav(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white block leading-tight">Formato de Alta Calidad WAV</span>
                          <span className={`px-1.5 py-0.2 text-[8px] font-extrabold rounded uppercase tracking-wider scale-95 ${licAudioFormatWav ? 'bg-indigo-950/40 text-indigo-300' : 'bg-amber-950/20 text-amber-400'}`}>
                            {licAudioFormatWav ? 'WAV' : 'MP3'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">Si se marca, el formato es WAV profesional de 24 bits. Si se desmarca, el formato es MP3 de alta fidelidad (320 kbps).</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Optional Contract Preview Drawer */}
                <div className="space-y-1.5 text-left bg-brand-surface p-3.5 border border-brand-border/45 rounded-xl">
                  <span className="text-[10.5px] font-bold text-indigo-200 block uppercase tracking-wider">Vista Previa del Contrato Generado (Basado en Selección)</span>
                  <div className="max-h-[110px] overflow-y-auto bg-brand-bg/60 border border-brand-border/30 rounded-lg p-2.5 text-[10px] font-mono text-gray-400 leading-relaxed whitespace-pre-wrap select-none scrollbar-thin">
                    {customLicenseClause}
                  </div>
                </div>

                {/* Section 2: Platform terms and conditions (Fixed) */}
                <div className="space-y-1.5 text-left opacity-90 border-t border-brand-border/30 pt-4">
                  <label className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <Lock size={12} /> Parte 2: Términos Generales de la Plataforma (No Modificable)
                  </label>
                  <p className="text-[10px] text-gray-400">Normativa del portal D'Cuban Beats que protege legalmente a productores y artistas en la transacción.</p>
                  <div className="w-full h-[95px] bg-brand-surface border border-brand-border/60 rounded-xl p-3 text-[10.5px] text-gray-400 overflow-y-auto font-sans leading-relaxed select-none font-sans">
                    D'Cuban Beats actúa como intermediario legal y certifica la validez de esta transacción. La plataforma garantiza el derecho de uso legítimo de la maqueta descargada y se reserva el derecho de auditar el origen lícito de la transacción en caso de controversias de propiedad intelectual. Esta licencia incluye la firma digital de la plataforma y se emitirá de forma definitiva con los datos exactos del comprobante de pago verificado por la administración al momento de liberarse la descarga.
                  </div>
                  <span className="text-[10px] text-emerald-500 block font-semibold">✓ El sistema de descargas integrará de forma automática el comprobante de pago al PDF.</span>
                </div>

                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/30 text-emerald-400 text-xs text-left leading-relaxed flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <strong>✓ Todo listo para publicación:</strong> Al confirmar y publicar, los términos seleccionados estilo Beatstars se indexarán en el contrato de este beat para descargas automáticas por parte de los intérpretes en su cuenta personal.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: COPYRIGHT */}
            {setupStep === 5 && (
              <div className="space-y-5 animate-in fade-in duration-200 text-left">
                <div className="p-3 bg-[#534AB7]/10 border border-[#534AB7]/20 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-[#534AB7] text-white rounded font-mono font-bold">5</div>
                  <span>Declaración de autoría y propiedad intelectual (Copyright).</span>
                </div>

                <div className="bg-brand-card/45 border border-brand-border/40 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-[#7F77DD] uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={16} className="text-[#7F77DD]" /> Declaración de Derechos de Autor
                  </h4>
                  <p className="text-xs text-gray-400 leading-normal">
                    Como parte de nuestro compromiso para proteger la propiedad intelectual de todos los creadores en D'Cuban Beats, debes confirmar los siguientes puntos antes de publicar tu obra.
                  </p>

                  <div className="space-y-4 pt-2">
                    {/* Checkbox 1 */}
                    <label className="flex items-start gap-3 bg-brand-bg/50 p-4 border border-brand-border/30 hover:border-[#534AB7]/40 rounded-xl cursor-pointer hover:bg-brand-bg/80 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={copyrightChecked1} 
                        onChange={(e) => setCopyrightChecked1(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5 cursor-pointer"
                      />
                      <div className="text-left">
                        <span className="text-xs font-medium text-white block leading-relaxed">
                          Declaro que soy el autor original de este beat, o que cuento con los derechos y licencias necesarias para distribuirlo en D'Cuban Beats, y que no infringe derechos de autor de terceros.
                        </span>
                      </div>
                    </label>

                    {/* Checkbox 2 */}
                    <label className="flex items-start gap-3 bg-brand-bg/50 p-4 border border-brand-border/30 hover:border-[#534AB7]/40 rounded-xl cursor-pointer hover:bg-brand-bg/80 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={copyrightChecked2} 
                        onChange={(e) => setCopyrightChecked2(e.target.checked)}
                        className="rounded border-brand-border/50 text-[#7F77DD] focus:ring-[#534AB7]/30 h-4.5 w-4.5 bg-brand-surface mt-0.5 cursor-pointer"
                      />
                      <div className="text-left">
                        <span className="text-xs font-medium text-white block leading-relaxed">
                          Entiendo que si se determina que este contenido no es de mi autoria, mi cuenta puede ser suspendida y podre ser responsable legal ante reclamos de terceros.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex items-center gap-2 text-[11px] text-gray-300">
                  <CheckCircle2 size={14} className="text-indigo-400 flex-shrink-0" />
                  <span>Ambas confirmaciones son requeridas de forma obligatoria para habilitar el botón de publicación.</span>
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

                {setupStep < 5 ? (
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
                        if (!priceBasic || Number(priceBasic) <= 0) tempErrors.priceBasic = 'Debes ingresar un precio válido mayor que cero';
                        if (Object.keys(tempErrors).length > 0) {
                          setErrors(tempErrors);
                          addToast('Corrige los errores de precios', 'error');
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
                    disabled={!copyrightChecked1 || !copyrightChecked2}
                    onClick={handleSaveBeat}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Por motivos de seguridad fiscal y protección de derechos de autor, todos los productores de D'Cuban Beats deben acreditar su identidad antes de operar.
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
                <Disc className="text-[#7F77DD] animate-spin-slow" /> Mis Beats y Librerías Publicadas
              </h2>
              <p className="text-xs text-gray-400">Carga, edita o elimina instrumentales y librerías de sonidos de la tienda D'Cuban Beats.</p>
            </div>

            {activeTab === 'beats' ? (
              <Button 
                variant={user?.verified ? "primary" : "secondary"} 
                onClick={handleOpenUpload} 
                className={`text-xs font-bold gap-1.5 self-start sm:self-center ${!user?.verified ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {user?.verified ? <Plus size={15} /> : <Lock size={14} className="text-rose-450" />}
                Subir Nuevo Beat
              </Button>
            ) : (
              <Button 
                variant={(planLimits.allowed && myLibraries.length < planLimits.maxCount) ? "primary" : "secondary"}
                disabled={!planLimits.allowed || myLibraries.length >= planLimits.maxCount}
                onClick={handleOpenUploadLibrary}
                className={`text-xs font-bold gap-1.5 self-start sm:self-center ${(!planLimits.allowed || myLibraries.length >= planLimits.maxCount) ? 'opacity-70 cursor-not-allowed' : ''}`}
                title={
                  !planLimits.allowed 
                    ? 'Tu plan Gratis no permite subir librerías' 
                    : myLibraries.length >= planLimits.maxCount 
                      ? `Límite de ${planLimits.maxCount} librerías alcanzado` 
                      : 'Subir librería comprimida .zip / .rar'
                }
              >
                {!planLimits.allowed ? (
                  <Lock size={14} className="text-rose-450" />
                ) : myLibraries.length >= planLimits.maxCount ? (
                  <CheckCircle2 size={14} className="text-emerald-450" />
                ) : (
                  <Plus size={15} />
                )}
                Subir Librería
              </Button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-brand-border/30 gap-1">
            <button
              onClick={() => setActiveTab('beats')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'beats'
                  ? 'border-[#7F77DD] text-white bg-brand-surface/40'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-brand-surface/10'
              }`}
            >
              <Music size={14} /> Beats Publicados ({myBeats.length})
            </button>
            <button
              onClick={() => setActiveTab('libraries')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'libraries'
                  ? 'border-[#7F77DD] text-white bg-brand-surface/40'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-brand-surface/10'
              }`}
            >
              <Library size={14} /> Librerías de Sonidos ({myLibraries.length} / {planLimits.allowed ? planLimits.maxCount : 0})
            </button>
          </div>

          {/* Grid Filter Search */}
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder={activeTab === 'beats' ? "Buscar entre mis beats..." : "Buscar entre mis librerías..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border/40 focus:border-[#534AB7] focus:ring-1 focus:ring-indigo-550/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>

          {/* Tab content conditional rendering */}
          {activeTab === 'beats' ? (
            myBeats.length === 0 ? (
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
                        <th className="py-3 px-4">Precio (CUP)</th>
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
                            <div>{Math.round(beat.priceBasic * (exchangeRates?.USD || 360.0))} CUP</div>
                          </td>

                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => handleShareBeat(beat.id)}
                              className="p-1 px-2 border border-[#8D84F7]/30 text-[#8D84F7] hover:bg-[#8D84F7]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                              title="Compartir enlace"
                            >
                              <Share2 size={13} />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(beat)}
                              className="p-1 px-2 border border-[#534AB7]/40 text-[#7F77DD] hover:bg-[#534AB7]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                              title="Editar parámetros"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => deleteBeat(beat.id)}
                              className="p-1 px-2 border border-red-900/40 text-red-450 hover:bg-red-955/20 rounded-lg hover:text-red-400 transition-colors cursor-pointer inline-flex items-center"
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
            )
          ) : (
            myLibraries.length === 0 ? (
              <div className="py-20 text-center bg-brand-surface rounded-3xl border border-dashed border-brand-border/30 space-y-4">
                <div className="w-12 h-12 bg-brand-card text-gray-450 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <FolderArchive size={20} className="text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white text-sm">No has publicado librerías de sonidos</p>
                  <p className="text-xs text-gray-400">Publica colecciones de samples, ritmos cubanos o loops listos para descargar.</p>
                </div>
                <Button
                  variant={(planLimits.allowed && myLibraries.length < planLimits.maxCount) ? "primary" : "secondary"}
                  disabled={!planLimits.allowed || myLibraries.length >= planLimits.maxCount}
                  onClick={handleOpenUploadLibrary}
                  size="sm"
                  className={`${(!planLimits.allowed || myLibraries.length >= planLimits.maxCount) ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  Subir tu Primera Librería
                </Button>
              </div>
            ) : (
              <div className="bg-brand-surface rounded-2xl border border-brand-border/40 overflow-hidden shadow-sm animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead>
                      <tr className="bg-brand-card/30 border-b border-brand-border/30 text-gray-400 font-bold uppercase select-none">
                        <th className="py-3 px-4">Mockup</th>
                        <th className="py-3 px-4">Librería de Sonidos</th>
                        <th className="py-3 px-4">Elementos</th>
                        <th className="py-3 px-4">Tamaño</th>
                        <th className="py-3 px-4">Precio Único</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/20 text-gray-300">
                      {myLibraries.map((lib) => (
                        <tr key={lib.id} className="hover:bg-brand-card/25 transition-colors">
                          <td className="py-3 px-4">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-brand-border/20 flex-shrink-0">
                              <img 
                                src={lib.coverUrl} 
                                alt="mini mockup" 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          </td>
                          
                          <td className="py-3 px-4 font-bold text-white truncate max-w-[200px]" title={lib.title}>
                            {lib.title}
                            <span className="block text-[8px] text-indigo-400 font-bold uppercase tracking-wide mt-0.5">● Sound Kit ({lib.libraryFileName || '.zip'})</span>
                          </td>

                          <td className="py-3 px-4 font-semibold text-white">
                            {lib.fileCount || 150} archivos
                          </td>

                          <td className="py-3 px-4 text-gray-400 font-mono">
                            {lib.librarySizeMB || 100} MB
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-[#7F77DD]">
                            <div>{Math.round(lib.priceBasic * (exchangeRates?.USD || 360.0))} CUP</div>
                          </td>

                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => handleShareBeat(lib.id)}
                              className="p-1 px-2 border border-[#8D84F7]/30 text-[#8D84F7] hover:bg-[#8D84F7]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                              title="Compartir enlace de librería"
                            >
                              <Share2 size={13} />
                            </button>
                            <button 
                              onClick={() => handleOpenEditLibrary(lib)}
                              className="p-1 px-2 border border-[#534AB7]/40 text-[#7F77DD] hover:bg-[#534AB7]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                              title="Editar parámetros de la librería"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => deleteBeat(lib.id)}
                              className="p-1 px-2 border border-red-900/40 text-red-450 hover:bg-red-955/20 rounded-lg hover:text-red-400 transition-colors cursor-pointer inline-flex items-center"
                              title="Eliminar librería"
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
            )
          )}
        </>
      )}

    </div>
  );
};
