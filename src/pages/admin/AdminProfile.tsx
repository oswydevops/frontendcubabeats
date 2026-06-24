import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  User, Shield, Mail, Camera, FileText, Globe, 
  ExternalLink, Eye, Phone, MapPin, Upload, ShieldCheck, Lock, Check, ShieldAlert, AlertCircle, CheckCircle
} from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, updateUserProfile, addToast } = useApp();

  // Profile fields state
  const [name, setName] = useState(user?.name || 'Administrador');
  const [lastName, setLastName] = useState(user?.lastName || 'General');
  const [position, setPosition] = useState(user?.position || 'Presidente Ejecutivo');
  const [email, setEmail] = useState(user?.email || 'admin@dcubanbeats.cu');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Por favor, ingresa tu nombre', 'error');
      return;
    }
    if (!lastName.trim()) {
      addToast('Por favor, ingresa tus apellidos', 'error');
      return;
    }
    if (!position.trim()) {
      addToast('Por favor, ingresa tu cargo en la plataforma', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      addToast('Por favor, ingresa un correo electrónico válido', 'error');
      return;
    }

    updateUserProfile({
      name,
      lastName,
      position,
      email,
      avatarUrl: avatarUrl || undefined
    });
    
    addToast('¡Perfil de Administrador guardado y actualizado con éxito!', 'success');
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
          addToast('Foto de administrador cargada correctamente', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 text-left text-white bg-brand-bg pb-10">
      
      {/* Header title toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="text-[#7F77DD]" size={22} /> Perfil del Administrador
          </h2>
          <p className="text-xs text-gray-400">
            Edita tus credenciales, foto oficial y cargo directivo que se mostrará en los registros de auditoría de D'Cuban Beats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Profile Card Preview */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-[#13131F] border border-brand-border/25 rounded-2xl p-6 shadow-xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#534AB7] opacity-10 rounded-full blur-3xl -mr-10 -mt-10" />
            
            {/* Avatar container */}
            <div className="relative w-28 h-28 mx-auto mb-4 group">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#7F77DD]/40 bg-brand-card shadow-inner">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="avatar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-white font-black text-3xl">
                    A
                  </div>
                )}
              </div>
              
              <label 
                htmlFor="admin-avatar-upload"
                className="absolute -bottom-2 -right-2 p-2 bg-[#534AB7] hover:bg-[#433A9B] border border-[#7F77DD]/35 text-white rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                title="Sube una nueva foto"
              >
                <Camera size={14} />
              </label>
              <input 
                type="file" 
                id="admin-avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                {name} {lastName}
                <ShieldCheck size={15} className="text-emerald-400" fill="currentColor text-white" />
              </h3>
              
              <Badge variant="purple" className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5">
                {position}
              </Badge>
              
              <p className="text-xs text-gray-400 font-mono pt-1.5">{email}</p>
            </div>

            <div className="border-t border-brand-border/20 mt-6 pt-6 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Lock size={13} className="text-[#7F77DD] flex-shrink-0" />
                <span>Nivel de Acceso: <strong className="text-white font-mono text-[10px]">SuperRoot (Nivel 5)</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                <span>Estado de Sesión: <strong className="text-emerald-400">Verificado & Seguro</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-[#13131F]/40 border border-brand-border/20 p-4 rounded-xl flex items-start gap-3 text-left">
            <Lock size={18} className="text-[#7F77DD] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-white">Seguridad de la Cuenta</span>
              <p className="text-[10.5px] text-gray-400 leading-relaxed font-sans">
                Las modificaciones en el nombre o el cargo se reflejarán instantáneamente en todos los contratos y auditorías de compraventa procesadas de D'Cuban Beats.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Form Fields */}
        <div className="lg:col-span-2">
          <form onSubmit={handleProfileSave} className="bg-[#13131F] border border-brand-border/25 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 text-left">
            <div>
              <h3 className="text-base font-bold text-white mb-1.5">Datos Administrativos</h3>
              <p className="text-xs text-gray-400">Actualiza tus nombres oficiales y cargo en la plataforma.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                placeholder="Ej. Roberto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                themeMode="dark"
              />
              <Input
                label="Apellidos *"
                placeholder="Ej. Pérez Alfonso"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                themeMode="dark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cargo / Posición Oficial *"
                placeholder="Ej. Director de Operaciones"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                themeMode="dark"
              />
              <Input
                label="Correo Electrónico *"
                placeholder="Ej. admin@dcubanbeats.cu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                themeMode="dark"
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-450 block uppercase tracking-wider">Foto del Perfil Administrativo (Avatar)</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8">
                  <Input
                    placeholder="URL de Imagen (Unsplash, etc.)"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    themeMode="dark"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label 
                    htmlFor="admin-avatar-input-file"
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#534AB7]/10 hover:bg-[#534AB7]/20 text-[#7F77DD] border border-[#534AB7]/30 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 h-[42px] mt-2 sm:mt-1 whitespace-nowrap"
                  >
                    <Upload size={14} />
                    Subir Archivo
                  </label>
                  <input 
                    type="file" 
                    id="admin-avatar-input-file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-brand-border/20 pt-6 flex justify-end gap-3 flex-wrap">
              <Button type="submit" variant="primary" size="md" className="font-bold text-xs shadow-lg shadow-indigo-600/25">
                Guardar Cambios de Perfil
              </Button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
