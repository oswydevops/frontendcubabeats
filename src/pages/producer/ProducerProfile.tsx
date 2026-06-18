import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  User, CheckCircle, Mail, Camera, FileText, Globe, 
  ExternalLink, Eye, Phone, MapPin, Upload, ShieldCheck, Lock, Check, ShieldAlert, AlertCircle
} from 'lucide-react';

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

export const ProducerProfile: React.FC = () => {
  const { 
    user, updateUserProfile, navigateTo, addToast,
    kycStep, setKycStep, kycData, setKycDocType, setKycImage, completeKyc 
  } = useApp();

  // Profile fields state
  const [artistName, setArtistName] = useState(user?.artistName || 'Flow Habano');
  const [name, setName] = useState(user?.name || 'Carlos');
  const [lastName, setLastName] = useState(user?.lastName || 'Santana');
  const [phone, setPhone] = useState(user?.phone || '+53 58349202');
  const [instagram, setInstagram] = useState(user?.instagram || '@flow_habano_music');
  const [provincia, setProvincia] = useState(user?.provincia || 'La Habana');
  const [municipio, setMunicipio] = useState(user?.municipio || 'Plaza de la Revolución');
  const [bio, setBio] = useState(user?.bio || 'Especialista en ritmos latinos y fusión caribeña.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName || !name) {
      addToast('Por favor, ingresa los campos requeridos', 'error');
      return;
    }

    // MANDATORY STRINGS VALIDATIONS
    if (!phone || phone.trim().length <= 5) {
      addToast('El número de teléfono móvil es obligatorio para formalizar contratos de licencias.', 'error');
      return;
    }

    if (!provincia) {
      addToast('La provincia es un campo obligatorio para las estadísticas demográficas del portal.', 'error');
      return;
    }

    if (!municipio || municipio.trim().length === 0) {
      addToast('El municipio es un campo obligatorio para el análisis geográfico.', 'error');
      return;
    }

    updateUserProfile({
      artistName,
      name,
      lastName,
      instagram,
      phone,
      provincia,
      municipio: municipio.trim(),
      bio,
      avatarUrl: avatarUrl || undefined
    });
    
    addToast('¡Datos de Perfil guardados y actualizados!', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Por favor, selecciona una imagen con formato válido (.jpg, .png)', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        addToast('La imagen excede el límite de tamaño permitido de 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          addToast('Foto de perfil cargada correctamente del dispositivo', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // KYC stepper simulation helpers
  const handleSimulateUpload = (field: 'frontImage' | 'backImage' | 'selfieImage') => {
    setUploadProgress(25);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setKycImage(field, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==');
          addToast('Comprobante de documento de identidad cargado correctamente', 'success');
          return 0;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleKycFlowNext = () => {
    if (kycStep === 1) {
      if (!kycData.docType) {
        addToast('Selecciona un tipo de identificación oficial primero', 'error');
        return;
      }
      setKycStep(2);
    } else if (kycStep === 2) {
      if (!kycData.frontImage || (kycData.docType === 'id_card' && !kycData.backImage)) {
        addToast('Sube las imágenes requeridas de forma nítida para continuar', 'error');
        return;
      }
      setKycStep(3);
    } else if (kycStep === 3) {
      if (!kycData.selfieImage) {
        addToast('Debes tomar y subir la foto selfie junto a tu documento', 'error');
        return;
      }
      completeKyc();
      addToast('Acreditación KYC para productores cargada y aprobada con éxito', 'success');
    }
  };

  return (
    <div className="space-y-8 text-left text-white bg-brand-bg animate-in fade-in duration-300 pb-12">
      
      {/* Header section */}
      <div className="border-b border-brand-border/40 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <User className="text-[#7F77DD]" /> Mi Perfil Studio CubaBeats
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure todos sus datos oficiales de beatmaker, requeridos para firmas de licencias, estadísticas nacionales y seguridad KYC.</p>
        </div>

        {/* View own public profile shortcut button */}
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigateTo('/', { producerId: user?.id })}
          className="text-xs font-semibold gap-1.5"
        >
          <Eye size={13} />
          Ver mi Perfil Público
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left col: Editing forms */}
        <div className="lg:col-span-8 space-y-8">
          
          <form onSubmit={handleProfileSave} className="bg-brand-surface p-6 md:p-8 rounded-2xl border border-brand-border/40 shadow-xl space-y-6">
            <div className="border-b border-brand-border pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Globe size={16} className="text-[#7F77DD]" /> Configuración Personal y Geográfica
              </h3>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-lg bg-[#534AB7]/15 text-[#7F77DD] border border-[#7F77DD]/20">
                Firma Autorizada
              </span>
            </div>
            
            {/* Direct Device Profile Photo Uplader - No URL Input */}
            <div className="space-y-1.5 text-left pb-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Foto de Perfil del Studio <span className="text-rose-500">*</span></label>
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-brand-card/30 p-5 rounded-2xl border border-brand-border/40">
                <div 
                  className="relative group w-20 h-20 rounded-2xl flex-shrink-0 bg-brand-surface border-2 border-dashed border-brand-border hover:border-[#7F77DD] overflow-hidden cursor-pointer flex items-center justify-center transition-colors" 
                  onClick={() => document.getElementById('device-profile-file-picker')?.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" alt="Profile preview" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center font-bold text-slate-500 text-[11px] gap-1">
                      <Camera size={18} className="text-slate-550" />
                      Subir
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white text-center p-1">
                    <Camera size={14} className="mb-0.5" />
                    Cambiar
                  </div>
                </div>
                
                <div className="text-left flex-grow space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload size={13} className="text-[#7F77DD]" />
                    Subir foto desde tu dispositivo
                  </span>
                  <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                    Formatos admitidos: .png o .jpg (Tamaño máx: 2MB). El logotipo o rostro cargado se usará en tus firmas de contratos de beats de catálogo.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    id="device-profile-file-picker"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('device-profile-file-picker')?.click()}
                      className="px-3.5 py-1.5 bg-[#534AB7]/20 hover:bg-[#534AB7]/30 text-[#7F77DD] border border-[#7F77DD]/25 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Upload size={11} /> Seleccionar Archivo
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2.5 py-1.5 bg-brand-card/45 hover:bg-brand-card text-rose-400 hover:text-rose-350 border border-brand-border/40 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Quitar Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Nombre Artístico</label>
                <Input
                  placeholder="Ej. El Alfa Beats"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  themeMode="dark"
                  required
                />
                <span className="text-[9.5px] text-slate-500 block leading-tight">Será el nombre que visualicen los cantantes en la tienda.</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Usuario Instagram</label>
                <Input
                  placeholder="@elalfabeats"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  themeMode="dark"
                />
                <span className="text-[9.5px] text-slate-500 block leading-tight">Enlace social para que te descubran otros artistas.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Nombre Real</label>
                <Input
                  placeholder="Carlos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  themeMode="dark"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Apellidos</label>
                <Input
                  placeholder="Santana"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  themeMode="dark"
                />
              </div>
            </div>

            {/* Email (Readonly) and Phone (Mandatory) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                  <Lock size={12} className="text-slate-500" /> Correo Electrónico <span className="text-slate-500">(No modificable)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'p@cubabeats.cu'}
                    className="w-full pl-9 bg-brand-card/40 border border-brand-border/30 rounded-xl p-3 text-xs text-slate-400 cursor-not-allowed opacity-80 font-mono outline-none"
                  />
                  <Lock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                <span className="text-[9.5px] text-slate-500 block leading-normal flex items-center gap-1">
                  El correo de la cuenta está enlazado a la membresía y no es modificable por seguridad fiscal.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                  <Phone size={11} className="text-[#7F77DD]" /> Número de Teléfono / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="+53 58349202"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  themeMode="dark"
                  required
                />
                <span className="text-[9.5px] text-rose-400 block leading-tight">Obligatorio para recibir SMS de venta de beats y coordinar licencias.</span>
              </div>

            </div>

            {/* Country and Municipal Area (Mandatory Province & Municipality) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                  <Globe size={11} className="text-[#7F77DD]" /> Provincia de Cuba <span className="text-rose-500">*</span>
                </label>
                <select
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  className="w-full bg-[#1C1C2E] border border-brand-border/40 focus:border-[#534AB7] rounded-xl p-3 text-xs text-white outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Seleccione de la lista...</option>
                  {CUBA_PROVINCES.map((p) => (
                    <option key={p} value={p} className="bg-brand-surface text-white">
                      {p}
                    </option>
                  ))}
                </select>
                <span className="text-[9.5px] text-rose-400 block leading-tight">Obligatorio para el posicionamiento y estadísticas geográficas nacionales.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                  <MapPin size={11} className="text-[#7F77DD]" /> Municipio <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Ej. Centro Habana o San Miguel del Padrón"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  themeMode="dark"
                  required
                />
                <span className="text-[9.5px] text-rose-400 block leading-tight">Obligatorio para registrar contratos de propiedad intelectual vigentes.</span>
              </div>

            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Biografía Profesional para Clientes</label>
              <textarea
                rows={4}
                placeholder="Escribe sobre tu trayectoria de producción, instrumentos, licencias y géneros..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#1C1C2E] border border-brand-border/30 focus:border-[#534AB7] focus:ring-1 focus:ring-[#534AB7]/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            <div className="pt-3 border-t border-brand-border/20 flex items-center justify-between gap-4 flex-wrap">
              <span className="text-[10px] text-slate-450 italic max-w-sm font-sans leading-normal">
                * Todos los campos señalados con asterisco son rigurosos para operar legalmente y validar transacciones.
              </span>
              <Button variant="primary" size="sm" type="submit" className="shadow-lg shadow-indigo-600/15 gap-1.5">
                <CheckCircle size={14} />
                Guardar Cambios de Perfil
              </Button>
            </div>
          </form>

          {/* KYC SECURE SECTION: Mandatory For Security and Beats Upload & Sales Block */}
          <div className="bg-brand-surface p-6 md:p-8 rounded-2xl border border-brand-border/40 shadow-xl space-y-6 text-left">
            
            <div className="border-b border-brand-border pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#7F77DD]" />
                  Acreditación de Identidad KYC (Obligatoria)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Habilita la subida de beats y la facturación segura mediante verificación legal.</p>
              </div>

              {user?.verified ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 animate-pulse-slow">
                  <CheckCircle size={12} /> Verificado
                </span>
              ) : (
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase flex items-center gap-1">
                  <ShieldAlert size={12} /> No Acreditado
                </span>
              )}
            </div>

            {user?.verified ? (
              <div className="p-6 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">¡Su cuenta de Productor está Acreditada!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Felicidades, tus documentos han sido validados con éxito. Tienes acceso completo para subir y vender beats ilimitadamente en CubaBeats.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <span className="text-xs font-bold text-white block">Aviso Importante</span>
                    <p className="text-[11px] text-slate-305 leading-relaxed font-sans">
                      Al no contar con verificación KYC de identidad, <strong className="text-red-400">no podrá subir ni vender ningún beat</strong> en la plataforma. Este candado de seguridad garantiza la idoneidad legal y el correcto pago de membresías y comisiones.
                    </p>
                  </div>
                </div>

                {/* Stepper indicators */}
                <div className="flex items-center justify-between bg-brand-card/40 p-3.5 rounded-xl border border-brand-border/40">
                  <span className="text-xs font-bold text-white">Paso {kycStep} de 3</span>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                      <div 
                        key={step} 
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                          kycStep === step 
                            ? 'bg-[#534AB7] text-white scale-110 ring-4 ring-[#534AB7]/15' 
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
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-[#7F77DD] uppercase tracking-wider font-mono">Paso 1: Tipo de Documento Oficial</h4>
                      <p className="text-xs text-slate-300">Elija qué identificación usará para acreditar su firma oficial en la base de datos de productores.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setKycDocType('id_card')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                          kycData.docType === 'id_card'
                            ? 'bg-[#534AB7]/10 border-[#7F77DD]'
                            : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <FileText className={kycData.docType === 'id_card' ? 'text-[#7F77DD]' : 'text-slate-500'} size={22} />
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-bold block text-white">Carné de Identidad Cubano</span>
                          <span className="text-[10px] text-slate-400 block leading-relaxed font-sans">Documento oficial tradicional emitido por la República de Cuba.</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setKycDocType('passport')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                          kycData.docType === 'passport'
                            ? 'bg-[#534AB7]/10 border-[#7F77DD]'
                            : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <ShieldCheck className={kycData.docType === 'passport' ? 'text-[#7F77DD]' : 'text-slate-500'} size={22} />
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-bold block text-white">Pasaporte</span>
                          <span className="text-[10px] text-slate-400 block leading-relaxed font-sans">Pasaporte internacional cubano o extranjero vigente.</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {kycStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-[#7F77DD] uppercase tracking-wider font-mono">Paso 2: Foto Legible del Documento</h4>
                      <p className="text-xs text-slate-300">Sube fotos legibles donde se lean todos tus nombres, número oficial y firma.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front doc */}
                      <div className="p-4 bg-[#1C1C2E] border border-white/5 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                        <span className="text-xs font-bold text-white block">Imagen Delantera (Anverso)</span>
                        
                        {kycData.frontImage ? (
                          <div className="h-20 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                            <Check className="text-emerald-400" size={16} />
                            <span className="text-[10px] text-emerald-400 font-bold mt-1">Cargado</span>
                            <button type="button" onClick={() => setKycImage('frontImage', '')} className="text-[9px] text-red-450 hover:underline mt-1 font-bold">Quitar</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSimulateUpload('frontImage')}
                            className="w-full h-20 border border-dashed border-white/10 hover:border-[#7F77DD] rounded-xl flex flex-col items-center justify-center p-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <Upload size={16} className="mb-1" />
                            <span className="text-[10px] font-bold">Subir Anverso</span>
                          </button>
                        )}
                      </div>

                      {/* Back doc (id_card only) */}
                      {kycData.docType === 'id_card' ? (
                        <div className="p-4 bg-[#1C1C2E] border border-white/5 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                          <span className="text-xs font-bold text-white block">Imagen Trasera (Reverso)</span>
                          
                          {kycData.backImage ? (
                            <div className="h-20 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                              <Check className="text-emerald-400" size={16} />
                              <span className="text-[10px] text-emerald-400 font-bold mt-1">Cargado</span>
                              <button type="button" onClick={() => setKycImage('backImage', '')} className="text-[9px] text-red-450 hover:underline mt-1 font-bold">Quitar</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSimulateUpload('backImage')}
                              className="w-full h-20 border border-dashed border-white/10 hover:border-[#7F77DD] rounded-xl flex flex-col items-center justify-center p-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <Upload size={16} className="mb-1" />
                              <span className="text-[10px] font-bold">Subir Reverso</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-[#1C1C2E]/30 border border-brand-border/40 rounded-2xl flex items-center justify-center text-center">
                          <p className="text-[10px] text-slate-500 leading-normal font-sans">Los pasaportes no exigen cara posterior (reverso).</p>
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
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-[#7F77DD] uppercase tracking-wider font-mono">Paso 3: Foto Selfie con tu Documento</h4>
                      <p className="text-xs text-slate-300">Tómate una foto sosteniendo tu identificación cerca de tu rostro para validar la titularidad de firma.</p>
                    </div>

                    <div className="p-6 bg-[#1C1C2E] border border-white/5 rounded-2xl text-center space-y-4">
                      {!kycData.selfieImage && (
                        <div className="w-12 h-12 rounded-full bg-[#534AB7]/10 text-[#7F77DD] flex items-center justify-center mx-auto">
                          <Camera size={20} />
                        </div>
                      )}

                      {kycData.selfieImage ? (
                        <div className="max-w-xs mx-auto py-2.5 px-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between animate-in zoom-in-95">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Check size={14} className="flex-shrink-0" />
                            <span className="text-[10px] font-bold">Selfie verificadora armada y lista</span>
                          </div>
                          <button type="button" onClick={() => setKycImage('selfieImage', '')} className="text-[9px] text-[#7F77DD] hover:underline font-bold cursor-pointer">Cambiar</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Button
                            variant="secondary" 
                            size="xs"
                            type="button"
                            onClick={() => handleSimulateUpload('selfieImage')}
                            className="mx-auto text-[10px] font-bold"
                          >
                            <Camera size={12} className="mr-1.5" />
                            Sincronizar Cámara & Tomar Selfie
                          </Button>
                          <span className="text-[9px] text-slate-500 block mt-2">La cámara verificará tu rostro contra la foto de identidad en segundos.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer buttons controls */}
                <div className="flex justify-between items-center pt-4 border-t border-brand-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setKycStep(kycStep - 1)}
                    disabled={kycStep === 1}
                  >
                    Atrás
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={handleKycFlowNext}
                    className="gap-1 shadow-lg shadow-indigo-600/15"
                  >
                    {kycStep === 3 ? 'Completar y Guardar' : 'Siguiente Paso'}
                  </Button>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Right col: Avatar live preview card */}
        <div className="lg:col-span-4 bg-brand-surface p-6 rounded-2xl border border-brand-border/40 shadow-xl text-center space-y-4 sticky top-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-brand-border/20 pb-2">Vista Previa CubaBeats</span>
          
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-md mx-auto border-4 border-[#534AB7]/25 flex-shrink-0 bg-brand-card">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar simulation preview" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-[#7F77DD] text-lg bg-[#534AB7]/10">
                Studio
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h4 className="text-sm font-bold text-white">{artistName || 'Productor'}</h4>
              {user?.verified && (
                <CheckCircle size={14} className="text-emerald-500" fill="currentColor text-white" />
              )}
            </div>
            
            <p className="text-xs font-mono text-slate-400 leading-none">{instagram || '@username'}</p>
          </div>

          <p className="text-[11px] text-slate-300 bg-brand-card p-3.5 rounded-xl leading-relaxed text-left border border-brand-border/30">
            {bio || 'Escribe una biografía para que tus clientes del catálogo conozcan tu trayectoria.'}
          </p>

          <div className="flex justify-between items-center text-[10.5px] border-t border-brand-border/20 pt-3">
            <span className="text-slate-450 flex items-center gap-1"><MapPin size={11} /> Procedencia</span>
            <span className="text-white font-bold">{municipio ? `${municipio}, ${provincia || 'Cuba'}` : (provincia || 'Havana, Cuba')}</span>
          </div>

          <div className="flex justify-between items-center text-[10.5px] border-t border-brand-border/20 pt-2 pb-0.5">
            <span className="text-slate-450">Acreditación Legal</span>
            {user?.verified ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">● KYC Verificado</span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-1">● KYC Pendiente</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
