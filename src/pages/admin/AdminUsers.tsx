import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User } from '../../types';
import { 
  Users, UserMinus, ShieldAlert, Check, Search, MoreVertical,
  AlertTriangle, Trash2, ShieldOff, Mail, X, AlertCircle
} from 'lucide-react';

const DEFAULT_TEMPLATES = {
  warn: {
    title: 'Enviar Advertencia Formal',
    actionText: 'Enviar Advertencia',
    subject: 'Advertencia de moderación - CubaBeats',
    body: (name: string) => `Estimado(a) ${name},

Le escribimos de parte del equipo de moderación de CubaBeats.

Hemos recibido reportes o detectado un comportamiento inusual/disputa de derechos de autor con respecto a una de las piezas musicales o beats que ha publicado en nuestra plataforma.

Por favor, revise con detenimiento las normas comunitarias y asegúrese de contar con toda la documentación legal de sus composiciones. La acumulación de advertencias adicionales podría derivar en la suspensión temporal de su facultad para subir recursos musicales.

Esperamos su máxima cooperación y buenas prácticas en la comunidad.

Atentamente,
El Equipo de Soporte y Moderación de CubaBeats.`
  },
  block: {
    title: 'Confirmar Bloqueo de Cuenta',
    actionText: 'Bloquear Cuenta',
    subject: 'Notificación de Bloqueo de Cuenta por Seguridad - CubaBeats',
    body: (name: string) => `Estimado(a) ${name},

Lamentamos informarle que su perfil en CubaBeats ha sido suspendido y bloqueado permanentemente a partir del día de hoy.

Esta medida de contingencia responde a la violación severa o reiterada de nuestras Políticas de Servicio (incluyendo plagio musical, suplantación de identidad de un sello productor cubano, conductas fraudulentas en cobros o acumulación insostenible de alertas).

Quedan cancelados con efecto inmediato sus derechos de carga, streaming de beats y la sincronización con QvaPay o pasarelas CUP locales.

Para reclamos o aclaración de fondos retenidos, puede responder inmediatamente a este correo adjuntando su documento de identidad y las pistas de masterización de audio de sus arreglos.

Atentamente,
El Departamento de Ética y Moderación de CubaBeats.`
  },
  delete: {
    title: 'Confirmar Eliminación Definitiva',
    actionText: 'Eliminar Usuario',
    subject: 'Confirmación de Eliminación Definitiva de Cuenta - CubaBeats',
    body: (name: string) => `Estimado(a) ${name},

Le enviamos este mensaje para notificarle que su cuenta registrada en CubaBeats ha sido eliminada definitivamente de nuestros servidores a petición del equipo de administración pública.

Causa de la remoción: Inactividad comercial prolongada, falta de coincidencia con las pautas de calidad vigentes o por acumular reclamaciones severas sobre los derechos de autor de las instrumentales exhibidas.

Todos sus datos personales, catálogo de ritmos, fotos e historial de ventas no completadas han sido dados de baja de manera irreversible de acuerdo con las normativas de protección de datos.

Agradecemos el tiempo compartido en nuestro ecosistema.

Atentamente,
El Equipo de Sistemas de CubaBeats.`
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
    blockUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'verified' | 'unverified' | 'blocked'>('all');
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);

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
      
      {/* Header */}
      <div className="border-b border-brand-border/25 pb-4.5">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Users className="text-[#7F77DD]" /> Moderación y Control de Usuarios
        </h2>
        <p className="text-xs text-gray-400">Supervisa las cuentas registradas en CubaBeats. Advierte de malas conductas, bloquea infractores o elimina perfiles de forma definitiva.</p>
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
                <th className="py-3 px-4">Usuario / Productor</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Plan actual</th>
                <th className="py-3 px-4 text-center">Beats publicados</th>
                <th className="py-3 px-4 text-center">Estado Verificado</th>
                <th className="py-3 px-4 text-center">Insignias</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/10 text-gray-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                    No se encontraron usuarios activos en esta categoría.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-card/25 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#534AB7]/25 text-[#7F77DD] font-bold flex items-center justify-center text-xs">
                          {item.name ? item.name[0] : 'U'}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{item.artistName || item.name}</span>
                          </div>
                          <span className="block text-[10px] text-gray-500 font-normal">Titular: {item.name} {item.lastName || ''}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-400">{item.email}</td>

                    <td className="py-3.5 px-4 text-center font-semibold">
                      <Badge variant="purple" className="bg-[#534AB7]/20 text-[#7F77DD]">{item.plan}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {item.beatsCount || 0}
                    </td>

                    {/* ESTADO VERIFICADO EN VERDE / AMARILLO (NO MODIFICABLE) */}
                    <td className="py-3.5 px-4 text-center select-none">
                      {item.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Verificado en Verde ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          Sin Verificar
                        </span>
                      )}
                    </td>

                    {/* INSIGNIAS ESPECIALES (BLOQUEO Y ADVERTENCIAS) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        {item.blocked ? (
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-brand-accent-red/10 text-brand-accent-red border border-brand-accent-red/20">
                            Bloqueado
                          </span>
                        ) : null}
                        
                        {item.warningCount && item.warningCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25" title={`${item.warningCount} advertencias`}>
                            {item.warningCount} {item.warningCount === 1 ? 'Infracción' : 'Infracciones'}
                          </span>
                        ) : null}

                        {!item.blocked && (!item.warningCount || item.warningCount === 0) && (
                          <span className="text-gray-500 text-[10px] font-normal italic">Ninguna</span>
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
                  <strong className="text-gray-300">soporte@cubabeats.cu (Predeterminado)</strong>
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

    </div>
  );
};
