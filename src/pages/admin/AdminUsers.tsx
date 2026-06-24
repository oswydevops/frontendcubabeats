import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User } from '../../types';
import { 
  Users, UserMinus, ShieldAlert, Check, Search, MoreVertical,
  AlertTriangle, Trash2, ShieldOff, Mail, X, AlertCircle,
  FileText, Camera, Globe, Phone, MapPin, CreditCard, Award, Activity,
  Lock, Unlock, Clock
} from 'lucide-react';

const DEFAULT_TEMPLATES = {
  warn: {
    title: 'Enviar Advertencia Formal',
    actionText: 'Enviar Advertencia',
    subject: 'Advertencia de moderación - D\'Cuban Beats',
    body: (name: string) => `Estimado(a) ${name},

Le escribimos de parte del equipo de moderación de D'Cuban Beats.

Hemos recibido reportes o detectado un comportamiento inusual/disputa de derechos de autor con respecto a una de las piezas musicales o beats que ha publicado en nuestra plataforma.

Por favor, revise con detenimiento las normas comunitarias y asegúrese de contar con toda la documentación legal de sus composiciones. La acumulación de advertencias adicionales podría derivar en la suspensión temporal de su facultad para subir recursos musicales.

Esperamos su máxima cooperación y buenas prácticas en la comunidad.

Atentamente,
El Equipo de Soporte y Moderación de D'Cuban Beats.`
  },
  block: {
    title: 'Confirmar Bloqueo de Cuenta',
    actionText: 'Bloquear Cuenta',
    subject: 'Notificación de Bloqueo de Cuenta por Seguridad - D\'Cuban Beats',
    body: (name: string) => `Estimado(a) ${name},

Lamentamos informarle que su perfil en D'Cuban Beats ha sido suspendido y bloqueado permanentemente a partir del día de hoy.

Esta medida de contingencia responde a la violación severa o reiterada de nuestras Políticas de Servicio (incluyendo plagio musical, suplantación de identidad de un sello productor cubano, conductas fraudulentas en cobros o acumulación insostenible de alertas).

Quedan cancelados con efecto inmediato sus derechos de carga, streaming de beats y la sincronización con QvaPay o pasarelas CUP locales.

Para reclamos o aclaración de fondos retenidos, puede responder inmediatamente a este correo adjuntando su documento de identidad y las pistas de masterización de audio de sus arreglos.

Atentamente,
El Departamento de Ética y Moderación de D'Cuban Beats.`
  },
  delete: {
    title: 'Confirmar Eliminación Definitiva',
    actionText: 'Eliminar Usuario',
    subject: 'Confirmación de Eliminación Definitiva de Cuenta - D\'Cuban Beats',
    body: (name: string) => `Estimado(a) ${name},

Le enviamos este mensaje para notificarle que su cuenta registrada en D'Cuban Beats ha sido eliminada definitivamente de nuestros servidores a petición del equipo de administración pública.

Causa de la remoción: Inactividad comercial prolongada, falta de coincidencia con las pautas de calidad vigentes o por acumular reclamaciones severas sobre los derechos de autor de las instrumentales exhibidas.

Todos sus datos personales, catálogo de ritmos, fotos e historial de ventas no completadas han sido dados de baja de manera irreversible de acuerdo con las normativas de protección de datos.

Agradecemos el tiempo compartido en nuestro ecosistema.

Atentamente,
El Equipo de Sistemas de D'Cuban Beats.`
  }
};

interface ActionModalState {
  isOpen: boolean;
  user: User | null;
  actionType: 'delete' | 'warn' | 'block' | null;
  subject: string;
  body: string;
}

export const AdminUsers: React.FC = () => {
  const { 
    verifiedProducersTask, 
    deleteUser, 
    warnUser, 
    blockUser,
    toggleSalesRestriction,
    warnExpirationEmail,
    advanceTimeOneDay,
    beats,
    orders,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'verified' | 'unverified' | 'blocked'>('all');
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  const isUnverifiedProducer = selectedProfileUser?.role === 'producer' && !selectedProfileUser?.verified;

  // Helper counters
  const getFollowersCount = (pId: string) => {
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
  };

  const getArtistFollowingCount = (uId: string) => {
    if (uId === 'a1') return 2;
    if (uId === 'a2') return 1;
    if (uId === 'a3') return 3;
    return 1;
  };

  // Modal State
  const [modal, setModal] = useState<ActionModalState>({
    isOpen: false,
    user: null,
    actionType: null,
    subject: '',
    body: ''
  });

  // Filter list
  const filteredUsers = useMemo(() => {
    return verifiedProducersTask.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVerif = 
        filterRole === 'all' ||
        (filterRole === 'verified' && user.verified && !user.blocked) ||
        (filterRole === 'unverified' && !user.verified && !user.blocked) ||
        (filterRole === 'blocked' && user.blocked);

      return matchesSearch && matchesVerif;
    });
  }, [verifiedProducersTask, searchQuery, filterRole]);

  // Open action modal and pre-load templates
  const handleOpenActionModal = (user: User, actionType: 'delete' | 'warn' | 'block') => {
    const template = DEFAULT_TEMPLATES[actionType];
    const targetName = user.artistName || user.name;
    
    setModal({
      isOpen: true,
      user,
      actionType,
      subject: template.subject,
      body: template.body(targetName)
    });
  };

  const handleCloseModal = () => {
    setModal({
      isOpen: false,
      user: null,
      actionType: null,
      subject: '',
      body: ''
    });
  };

  const handleConfirmAction = () => {
    if (!modal.user || !modal.actionType) return;

    const uId = modal.user.id;
    const actionsMap = {
      delete: () => deleteUser(uId),
      warn: () => warnUser(uId),
      block: () => blockUser(uId)
    };

    // Execute context state change
    actionsMap[modal.actionType]();
    handleCloseModal();
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in pb-12">
      
      {/* Header with Simulator */}
      <div className="border-b border-brand-border/25 pb-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-[#7F77DD]" /> Moderación y Control de Usuarios
          </h2>
          <p className="text-xs text-gray-400 mt-1">Supervisa las cuentas registradas en D'Cuban Beats. Advierte de malas conductas, bloquea infractores o elimina perfiles de forma definitiva.</p>
        </div>
        
        {/* Automated Expiration Cron Sim block */}
        <div className="bg-[#1C1C2E]/60 border border-brand-border/40 p-2.5 rounded-xl flex items-center gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-[#7F77DD] uppercase tracking-wider">Simulación de Servidor</span>
            <span className="text-[9px] text-gray-400 leading-tight">Cron de expiración premium (30 días)</span>
          </div>
          <button
            onClick={() => {
              advanceTimeOneDay();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#534AB7] hover:bg-[#6359C7] text-white text-[11px] font-bold cursor-pointer transition-all active:scale-[0.98]"
          >
            <Clock size={12} className="animate-spin-slow animate-pulse" />
            Avanzar 1 Día
          </button>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Buscar por nombre, artista o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-[#7F77DD] transition-all"
          />
        </div>

        {/* Categories toggles */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${filterRole === 'all' ? 'bg-[#534AB7] text-white shadow-xs' : 'bg-[#1C1C2E] text-gray-400 hover:bg-brand-card/50'}`}
          >
            Todos ({verifiedProducersTask.length})
          </button>
          
          <button
            onClick={() => setFilterRole('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${filterRole === 'verified' ? 'bg-[#534AB7] text-white shadow-xs' : 'bg-[#1C1C2E] text-gray-400 hover:bg-brand-card/50'}`}
          >
            Acreditados ({verifiedProducersTask.filter(u => u.verified && !u.blocked).length})
          </button>

          <button
            onClick={() => setFilterRole('unverified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${filterRole === 'unverified' ? 'bg-[#534AB7] text-white shadow-xs' : 'bg-[#1C1C2E] text-gray-400 hover:bg-brand-card/50'}`}
          >
            No Verificados ({verifiedProducersTask.filter(u => !u.verified && !u.blocked).length})
          </button>

          <button
            onClick={() => setFilterRole('blocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${filterRole === 'blocked' ? 'bg-brand-accent-red text-white shadow-xs' : 'bg-[#1C1C2E] text-gray-400 hover:bg-brand-accent-red/10 hover:text-[#FF5C5C]'}`}
          >
            Bloqueados ({verifiedProducersTask.filter(u => u.blocked).length})
          </button>
        </div>

      </div>

      {/* Table list */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-[#1C1C2E]/40 border-b border-brand-border/20 text-gray-400 font-bold uppercase select-none">
                <th className="py-3 px-4">Usuario / Rol</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4 text-center">Plan actual</th>
                <th className="py-3 px-4 text-center">Beats / Tipo</th>
                <th className="py-3 px-4 text-center">Seguidores / Siguiendo</th>
                <th className="py-3 px-4 text-center">Estado Verificado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/10 text-gray-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500 font-medium">
                    No se encontraron usuarios activos en esta categoría.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-card/25 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#534AB7]/25 text-[#7F77DD] font-bold flex items-center justify-center text-xs overflow-hidden">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            item.name ? item.name[0] : 'U'
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{item.artistName || item.name}</span>
                            {item.verified && (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-500"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            )}
                          </div>
                          <span className="block text-[10px] text-gray-500 font-normal">Titular: {item.name} {item.lastName || ''}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-400">{item.email}</td>

                    <td className="py-3.5 px-4 font-mono text-gray-300 font-semibold">{item.phone || '+53 58349202'}</td>

                    <td className="py-3.5 px-4 text-center font-semibold">
                      <div className="flex flex-col items-center gap-1 justify-center">
                        <Badge variant="purple" className="bg-[#534AB7]/20 text-[#7F77DD]">{item.plan}</Badge>
                        {item.role === 'producer' && item.plan !== 'Gratis' && (
                          <span className="text-[10px] font-mono mt-1 block">
                            {(() => {
                              const elapsed = item.planDaysElapsed || 0;
                              if (elapsed < 30) {
                                const left = 30 - elapsed;
                                return (
                                  <span className={left <= 7 ? 'text-amber-400 font-bold animate-pulse' : 'text-emerald-400 font-semibold'}>
                                    Activo (Quedan {left}d)
                                  </span>
                                );
                              } else if (elapsed < 60) {
                                const leftGrace = 60 - elapsed;
                                return (
                                  <span className="text-rose-400 font-bold">
                                    Gracia (Expiró! {leftGrace}d)
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                    Vencido
                                  </span>
                                );
                              }
                            })()}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-mono font-bold text-white leading-none">
                        {item.role === 'producer' ? item.beatsCount || 0 : '—'}
                      </div>
                      <span className="text-[9px] text-[#7F77DD] font-semibold block mt-1 uppercase tracking-wider text-[8px]">
                        {item.role === 'producer' ? 'Productor' : 'Artista'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.role === 'producer' ? (
                        <div>
                          <span className="font-mono font-bold text-rose-400">{getFollowersCount(item.id)}</span>
                          <span className="text-[9px] text-gray-500 block">seguidores</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono font-bold text-blue-400">{getArtistFollowingCount(item.id)}</span>
                          <span className="text-[9px] text-gray-500 block">siguiendo</span>
                        </div>
                      )}
                    </td>

                    {/* ESTADO VERIFICADO EN VERDE / AMARILLO (NO MODIFICABLE) */}
                    <td className="py-3.5 px-4 text-center select-none">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        {item.verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Verificado ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            Sin Verificar
                          </span>
                        )}
                        {item.salesRestricted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold text-[9px] border border-red-500/20">
                            Ventas Restringidas
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ACCIONES (TRES PUNTITOS CON MENÚ DESPLEGABLE) */}
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex justify-end relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownUserId(activeDropdownUserId === item.id ? null : item.id);
                          }}
                          className="p-1.5 hover:bg-brand-card/50 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors"
                          title="Acciones de Control"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownUserId === item.id && (
                          <>
                            {/* Backdrop to close menu when click occurs anywhere */}
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={() => setActiveDropdownUserId(null)}
                            />
                            <div className="absolute right-0 top-9 w-48 bg-brand-surface border border-brand-border/40 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in slide-in-from-top-1 text-left">
                              <div className="px-3 py-1 border-b border-brand-border/20 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Acciones de Moderación
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedProfileUser(item);
                                  setActiveDropdownUserId(null);
                                }}
                                className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#534AB7]/15 text-[#7F77DD] font-bold cursor-pointer text-left transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7F77DD]"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Ver Perfil de Usuario
                              </button>

                              {item.role === 'producer' && (
                                <>
                                  <div className="border-t border-brand-border/20 my-1" />
                                  <button
                                    onClick={() => {
                                      toggleSalesRestriction(item.id);
                                      setActiveDropdownUserId(null);
                                    }}
                                    className={`w-full px-3 py-2 text-xs flex items-center gap-2 font-bold cursor-pointer text-left transition-colors ${
                                      item.salesRestricted 
                                        ? 'hover:bg-emerald-500/10 text-emerald-400' 
                                        : 'hover:bg-red-500/10 text-red-400'
                                    }`}
                                  >
                                    {item.salesRestricted ? <Unlock size={14} className="text-emerald-400" /> : <Lock size={14} className="text-red-400" />}
                                    {item.salesRestricted ? 'Habilitar Ventas' : 'Restringir Ventas'}
                                  </button>

                                  {item.plan !== 'Gratis' && (
                                    <button
                                      onClick={() => {
                                        warnExpirationEmail(item.id);
                                        setActiveDropdownUserId(null);
                                      }}
                                      className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/10 text-amber-500 font-bold cursor-pointer text-left transition-colors"
                                    >
                                      <Mail size={14} className="text-amber-500" />
                                      Avisar Expiración
                                    </button>
                                  )}
                                </>
                              )}

                              <div className="border-t border-brand-border/20 my-1" />
                              
                              <button
                                onClick={() => {
                                  handleOpenActionModal(item, 'warn');
                                  setActiveDropdownUserId(null);
                                }}
                                className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/10 text-amber-400 font-bold cursor-pointer text-left transition-colors"
                              >
                                <AlertTriangle size={14} className="text-amber-500" />
                                Enviar Advertencia
                              </button>

                              <button
                                onClick={() => {
                                  handleOpenActionModal(item, 'block');
                                  setActiveDropdownUserId(null);
                                }}
                                className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-brand-accent-red/10 text-brand-accent-red font-bold cursor-pointer text-left transition-colors"
                              >
                                <ShieldOff size={14} className="text-brand-accent-red" />
                                Bloquear Cuenta
                              </button>

                              <div className="border-t border-brand-border/20 my-1" />

                              <button
                                onClick={() => {
                                  handleOpenActionModal(item, 'delete');
                                  setActiveDropdownUserId(null);
                                }}
                                className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-brand-accent-red/15 text-[#FF5C5C] font-bold cursor-pointer text-left transition-colors"
                              >
                                <Trash2 size={14} className="text-brand-accent-red" />
                                Eliminar Usuario
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CORE MODAL FOR PRE-DETERMINED CORREO */}
      {modal.isOpen && modal.user && modal.actionType && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-surface rounded-2xl w-full max-w-lg shadow-xl border border-brand-border/40 overflow-hidden text-left flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-205">
            
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center ${
              modal.actionType === 'delete' ? 'bg-brand-accent-red/10 border-brand-accent-red/20 text-brand-accent-red' :
              modal.actionType === 'block' ? 'bg-brand-accent-red/10 border-brand-accent-red/20 text-brand-accent-red' :
              'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <div className="flex items-center gap-2">
                {modal.actionType === 'delete' && <Trash2 size={18} className="text-brand-accent-red" />}
                {modal.actionType === 'block' && <ShieldOff size={18} className="text-brand-accent-red" />}
                {modal.actionType === 'warn' && <AlertTriangle size={18} className="text-amber-400" />}
                <h3 className="text-sm font-bold tracking-tight">
                  {DEFAULT_TEMPLATES[modal.actionType].title}
                </h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Email form detail */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              <div className="bg-brand-bg/50 p-3 rounded-xl border border-brand-border/20 space-y-2">
                <div className="flex gap-2 text-xs">
                  <span className="w-14 text-gray-500 font-bold block">Para:</span>
                  <strong className="text-white font-mono text-[11px]">{modal.user.email}</strong>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="w-14 text-gray-500 font-bold block">De:</span>
                  <strong className="text-gray-300">soporte@dcubanbeats.cu (Predeterminado)</strong>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-gray-450 tracking-wider">Asunto del Correo Electrónico</label>
                <input
                  type="text"
                  value={modal.subject}
                  onChange={(e) => setModal(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl p-2.5 text-xs text-white font-semibold outline-none focus:border-[#7F77DD]"
                />
              </div>

              {/* Mail template editor */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-gray-450 tracking-wider flex justify-between">
                  <span>Cuerpo y Explicación del Motivo</span>
                  <span className="text-[#8D84F7] italic text-[9px] font-normal lowercase">(campo totalmente editable)</span>
                </label>
                <textarea
                  value={modal.body}
                  onChange={(e) => setModal(prev => ({ ...prev, body: e.target.value }))}
                  rows={10}
                  className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl p-3 text-xs text-gray-200 leading-relaxed outline-none focus:border-[#7F77DD] font-sans focus:bg-[#1C1C2E]/80 transition-all resize-none"
                />
              </div>

              {/* Action notice */}
              <div className="p-3.5 bg-brand-bg/40 rounded-xl border border-brand-border/20 flex gap-2">
                <AlertCircle size={15} className="mt-0.5 text-gray-500 flex-shrink-0" />
                <p className="text-[10.5px] text-gray-405 leading-relaxed">
                  Al confirmar la acción de <strong>{DEFAULT_TEMPLATES[modal.actionType].actionText.toLowerCase()}</strong>, se enviará automáticamente un correo electrónico simulado con las explicaciones e instrucciones detalladas del equipo de moderación. El estado del usuario se actualizará de inmediato en la base de datos de administración de la plataforma.
                </p>
              </div>

            </div>

            {/* Modal actions */}
            <div className="p-4 bg-[#1C1C2E]/40 border-t border-brand-border/20 flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="text-gray-300 bg-transparent border-brand-border/30 hover:bg-brand-card text-xs py-1.5 px-4 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={`text-xs py-1.5 px-4 rounded-xl font-bold text-white shadow-xs cursor-pointer ${
                  modal.actionType === 'delete' ? 'bg-brand-accent-red hover:opacity-90' :
                  modal.actionType === 'block' ? 'bg-brand-accent-red hover:opacity-90' :
                  'bg-amber-500 hover:opacity-90 text-neutral-900 font-extrabold'
                }`}
              >
                Confirmar y Despachar
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* SECCIÓN DEL PERFIL DE USUARIO PARA ADMINISTRADOR INDEPENDIENTE */}
      {selectedProfileUser && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-surface rounded-3xl w-full max-w-5xl shadow-2xl border border-brand-border/45 overflow-hidden text-left flex flex-col justify-between max-h-[92vh] animate-in zoom-in-95 duration-205">
            
            {/* Header banner */}
            <div className="relative h-20 bg-gradient-to-r from-[#534AB7]/45 via-[#7F77DD]/25 to-transparent p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9B94EC] bg-[#534AB7]/25 px-2.5 py-0.5 rounded-md font-mono tracking-wider border border-[#534AB7]/30">
                  Dossier Administrativo de Control
                </span>
                <h2 className="text-sm font-bold text-white mt-1">Expediente Completo de Usuario de la Plataforma</h2>
              </div>
              <button 
                onClick={() => setSelectedProfileUser(null)}
                className="p-1.5 px-3 border border-white/10 hover:bg-white/15 rounded-lg text-gray-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
              >
                ✕ Cerrar Expediente
              </button>
            </div>

            {/* Profile contents */}
            <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 text-gray-300">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* COLUMNA IZQUIERDA: RESUMEN DE IDENTIDAD */}
                <div className={`${isUnverifiedProducer ? 'md:col-span-6' : 'md:col-span-5'} space-y-5 border-b md:border-b-0 md:border-r border-brand-border/20 pb-5 md:pb-0 md:pr-6`}>
                  
                  {/* Avatar and name header card */}
                  <div className="flex gap-4 items-center bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/10">
                    <div className="w-20 h-20 rounded-2xl border-2 border-[#534AB7] bg-brand-surface shadow-xl flex-shrink-0 overflow-hidden relative">
                      {selectedProfileUser.avatarUrl ? (
                        <img src={selectedProfileUser.avatarUrl} alt={selectedProfileUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#534AB7]/55 text-white font-bold flex items-center justify-center text-2xl">
                          {selectedProfileUser.name ? selectedProfileUser.name[0] : 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                          {selectedProfileUser.artistName || selectedProfileUser.name}
                        </h3>
                        {selectedProfileUser.verified && (
                          <span className="inline-flex items-center gap-0.5 text-blue-500 font-bold" title="Cuenta con Verificación Completa">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-gray-400 mt-0.5 font-normal">
                        Nombre completo: <strong className="text-gray-200">{selectedProfileUser.name} {selectedProfileUser.lastName || ''}</strong>
                      </span>
                      <span className="inline-block text-[9px] text-[#7F77DD] font-bold bg-[#7F77DD]/10 px-2 py-0.5 rounded mt-1.5 font-mono">
                        UID: {selectedProfileUser.id}
                      </span>
                    </div>
                  </div>

                  {/* Informacion de Contacto y Ubicacion */}
                  <div className="bg-[#1C1C2E]/30 p-4 rounded-2xl border border-brand-border/15 space-y-3">
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] font-mono border-b border-white/5 pb-1">
                      Información de Contacto y Origen
                    </span>
                    
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-gray-500 text-[10px] block font-mono">Correo Electrónico</span>
                        <span className="text-gray-250 font-semibold font-mono">{selectedProfileUser.email}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 text-[10px] block font-mono">Número Telefónico Movil</span>
                        <span className="text-gray-250 font-extrabold font-mono text-[#7F77DD]">
                          {selectedProfileUser.phone || '+53 58349202'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500 text-[10px] block font-mono">Provincia</span>
                          <span className="text-gray-300 font-medium">{selectedProfileUser.provincia || 'La Habana'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] block font-mono">Municipio</span>
                          <span className="text-gray-300 font-medium">{selectedProfileUser.municipio || 'Plaza de la Revolución'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500 text-[10px] block font-mono">Redes de Enlace (Instagram)</span>
                        {selectedProfileUser.instagram ? (
                          <a 
                            href={`https://instagram.com/${selectedProfileUser.instagram.replace('@', '').trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7F77DD] hover:text-[#9B94EC] font-mono font-bold hover:underline inline-flex items-center gap-1"
                          >
                            {selectedProfileUser.instagram}
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">No configurado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalle del Rol de Sistema */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#1C1C2E]/50 p-3 rounded-xl border border-brand-border/10 text-center">
                      <span className="text-[8px] text-gray-500 block font-bold uppercase tracking-wider">Rol de Sistema</span>
                      <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5 uppercase tracking-wide">
                        {selectedProfileUser.role === 'producer' ? 'Productor' : 'Artista'}
                      </span>
                    </div>
                    <div className="bg-[#1C1C2E]/50 p-3 rounded-xl border border-brand-border/10 text-center">
                      <span className="text-[8px] text-gray-500 block font-bold uppercase tracking-wider">Nivel de Suscripción</span>
                      <span className="text-[10px] text-[#9B94EC] font-extrabold block mt-0.5 font-mono uppercase">
                        Plan {selectedProfileUser.plan || 'Gratis'}
                      </span>
                    </div>
                  </div>

                  {/* Bio block description */}
                  <div className="bg-[#1C1C2E]/20 p-3.5 rounded-2xl border border-brand-border/10 space-y-1 text-xs">
                    <span className="text-gray-500 font-bold block uppercase tracking-wider text-[8px] font-mono">Biografía / Presentación</span>
                    <p className="text-gray-300 leading-relaxed font-sans text-[11.5px]">
                      {selectedProfileUser.bio || 'Este usuario no ha configurado una biografía todavía en su perfil de D\'Cuban Beats.'}
                    </p>
                  </div>

                </div>

                {/* COLUMNA DERECHA: DOCUMENTACIÓN KYC, VENTAS E IMPACTO */}
                <div className={`${isUnverifiedProducer ? 'md:col-span-6' : 'md:col-span-12 lg:col-span-7'} space-y-6`}>
                  
                  {/* BLOCK ESTADÍSTICAS */}
                  {!isUnverifiedProducer && (
                    <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 space-y-3">
                      <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] font-mono">
                        Métricas e Impacto en D'Cuban Beats
                      </span>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      
                      <div className="bg-brand-surface p-2.5 rounded-xl border border-brand-border/10">
                        <span className="text-[8px] text-gray-500 block font-semibold uppercase">SEGUIDORES</span>
                        {selectedProfileUser.role === 'producer' ? (
                          <span className="text-sm font-extrabold text-rose-400 font-mono">
                            {getFollowersCount(selectedProfileUser.id)} seguidores
                          </span>
                        ) : (
                          <span className="text-sm font-extrabold text-blue-400 font-mono">
                            Sigue a {getArtistFollowingCount(selectedProfileUser.id)} estudios
                          </span>
                        )}
                      </div>

                      <div className="bg-brand-surface p-2.5 rounded-xl border border-brand-border/10">
                        <span className="text-[8px] text-gray-400 block font-semibold uppercase">
                          {selectedProfileUser.role === 'producer' ? 'BEATS PUBLICADOS' : 'ESTATUS COMERCIAL'}
                        </span>
                        <span className="text-sm font-extrabold text-white font-mono">
                          {selectedProfileUser.role === 'producer' ? (
                            `${(selectedProfileUser.beatsCount || beats.filter(b => b.producerId === selectedProfileUser.id).length || 0)} publicados`
                          ) : (
                            'Activo ✓'
                          )}
                        </span>
                      </div>

                      {selectedProfileUser.role === 'producer' && (
                        <div className="bg-brand-surface p-2.5 rounded-xl border border-brand-border/10 col-span-2 lg:col-span-1">
                          <span className="text-[8px] text-gray-400 block font-semibold uppercase font-mono">LIBRERÍAS DE SONIDOS</span>
                          <span className="text-sm font-extrabold text-[#7F77DD] font-mono">
                            {selectedProfileUser.soundLibrariesCount || 0} librerías
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                  )}

                  {/* METODOS DE PAGO que acepta si es productor (CON TARJETA BANMET INCLUIDA) */}
                  {selectedProfileUser.role === 'producer' && !isUnverifiedProducer && (
                    <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5 border-dashed">
                        <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] font-mono">
                          Canales de Liquidación Aceptados (Nacionales e Internacionales)
                        </span>
                        <span className="text-[8.5px] italic text-slate-500">
                          (Configurado en perfil del productor)
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Transfermovil con tarjetas BANDEC, BPA y BANMET */}
                        {(() => {
                          const hasTransfermovil = ['p1', 'p2', 'p4'].includes(selectedProfileUser.id) || selectedProfileUser.id.startsWith('new-');
                          return (
                            <div className={`p-3.5 rounded-xl border ${hasTransfermovil ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-brand-border/10 opacity-60'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-white">
                                  <span className={`w-2 h-2 rounded-full ${hasTransfermovil ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                                  Transfermóvil (CUP/MLC)
                                </span>
                                {hasTransfermovil && <span className="text-[8px] text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">HABILITADO</span>}
                              </div>
                              <p className="text-[10px] text-gray-300 mt-1.5 font-sans leading-relaxed">
                                {hasTransfermovil ? (
                                  <>
                                    Ventas recibidas en tarjetas de débito nacionales <strong className="text-white">BANMET (Banco Metropolitano)</strong>, <strong className="text-white">BANDEC</strong> y <strong className="text-white">BPA</strong>.
                                  </>
                                ) : (
                                  'Canal cubano no configurado en el perfil.'
                                )}
                              </p>
                            </div>
                          );
                        })()}

                        {/* QvaPay */}
                        {(() => {
                          const hasQvapay = ['p2', 'p3', 'p4'].includes(selectedProfileUser.id) || selectedProfileUser.id.startsWith('new-');
                          return (
                            <div className={`p-3.5 rounded-xl border ${hasQvapay ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/5 border-brand-border/10 opacity-60'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-white">
                                  <span className={`w-2 h-2 rounded-full ${hasQvapay ? 'bg-blue-500' : 'bg-gray-500'}`} />
                                  QvaPay (Suscripción o USDT)
                                </span>
                                {hasQvapay && <span className="text-[8px] text-blue-400 font-extrabold bg-blue-500/10 px-1.5 py-0.5 rounded">HABILITADO</span>}
                              </div>
                              <p className="text-[10px] text-gray-300 mt-1.5 font-sans leading-relaxed">
                                {hasQvapay ? 'Integración directa con pasarela cubana internacional para cobros en USDC/USDT.' : 'Billetera internacional no vinculada.'}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTOS Y COMPROBANTES DE VERIFICACIÓN KYC */}
                  <div className="bg-[#1C1C2E]/40 p-4 rounded-2xl border border-brand-border/15 space-y-3">
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] font-mono border-b border-white/5 pb-1">
                      Comprobación KYC (Acreditación de Identidad Obligatoria)
                    </span>
                    
                    {isUnverifiedProducer ? (
                      <div className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500">
                          <AlertTriangle size={20} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">PENDIENTE DE VERIFICACIÓN</h4>
                          <p className="text-gray-400 text-[11px] mt-1.5 max-w-sm leading-relaxed">
                            Este productor no cuenta con comprobantes KYC verificados ni activos en el sistema. Los expedientes de transacciones y canales de cobro están temporalmente deshabilitados.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2.5">
                        
                        {/* Imagen Frontal */}
                        <div className="bg-brand-surface p-2 rounded-xl border border-brand-border/15 text-center relative overflow-hidden group">
                          <span className="text-[8px] font-bold text-gray-400 block mb-1 uppercase text-center font-mono truncate">Anverso Identidad</span>
                          <div className="w-full h-16 rounded-lg overflow-hidden bg-black relative">
                            <img 
                              src="https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=400&auto=format&fit=crop" 
                              alt="Front ID" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-zoom-in" 
                            />
                          </div>
                          <span className="text-[8px] text-emerald-400 font-mono block mt-1 tracking-wider">FRONT_DOC.JPG</span>
                        </div>

                        {/* Imagen Reverso */}
                        <div className="bg-brand-surface p-2 rounded-xl border border-brand-border/15 text-center relative overflow-hidden group">
                          <span className="text-[8px] font-bold text-gray-400 block mb-1 uppercase text-center font-mono truncate">Reverso Identidad</span>
                          <div className="w-full h-16 rounded-lg overflow-hidden bg-black relative">
                            <img 
                              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" 
                              alt="Back ID" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-zoom-in" 
                            />
                          </div>
                          <span className="text-[8px] text-emerald-400 font-mono block mt-1 tracking-wider">BACK_DOC.JPG</span>
                        </div>

                        {/* Selfie del Propietario */}
                        <div className="bg-brand-surface p-2 rounded-xl border border-brand-border/15 text-center relative overflow-hidden group">
                          <span className="text-[8px] font-bold text-gray-400 block mb-1 uppercase text-center font-mono truncate">Selfie Retrato ID</span>
                          <div className="w-full h-16 rounded-lg overflow-hidden bg-black relative">
                            <img 
                              src={selectedProfileUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"} 
                              alt="Selfie ID Compliance" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-zoom-in" 
                            />
                          </div>
                          <span className="text-[8px] text-emerald-400 font-mono block mt-1 tracking-wider">SELFIE_AUTH.PNG</span>
                        </div>

                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Bottom action trigger */}
            <div className="p-5 bg-brand-bg/65 border-t border-brand-border/20 flex gap-3.5 justify-end">
              <button
                className="text-xs font-bold py-2.5 px-6 border border-brand-border/40 hover:bg-white/5 text-gray-300 rounded-xl cursor-pointer"
                onClick={() => setSelectedProfileUser(null)}
              >
                Cerrar Ventana del Expediente
              </button>
              
              <button 
                onClick={() => {
                  addToast(`Esbozando y exportando expediente administrativo de ${selectedProfileUser.artistName || selectedProfileUser.name} en formato PDF...`, 'success');
                  
                  // Simple high-end simulated PDF download
                  const link = document.createElement("a");
                  link.href = "#";
                  link.setAttribute("download", `Expediente_${selectedProfileUser.role}_${selectedProfileUser.id}.pdf`);
                  link.click();
                }}
                className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7F77DD] hover:from-[#6258C7] hover:to-[#8E86E7] text-white font-bold text-xs shadow-md shadow-[#534AB7]/35 transition-all text-center cursor-pointer"
              >
                <FileText size={14} />
                Exportar resumen en PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
