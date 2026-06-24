import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Music, Receipt, DollarSign, UserCheck, 
  CreditCard, Landmark, Users, Radio, ArrowLeft, Menu, X, CheckCircle,
  BarChart3, Bell, Sparkles, LogOut, HelpCircle
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Modal } from '../ui/Modal';

interface PanelLayoutProps {
  children: React.ReactNode;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({ children }) => {
  const { 
    user, setUser, currentPath, navigateTo, addToast,
    adminNotifications = [], markAdminNotificationRead, markAllAdminNotificationsRead, clearAdminNotifications, addAdminNotification,
    displayCurrency, setDisplayCurrency
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isProducer = user?.role === 'producer';
  const isAdmin = user?.role === 'admin';

  // Producer Side Menu Items
  const PRODUCER_MENU = [
    { name: 'Escritorio', icon: LayoutDashboard, path: '/producer/dashboard' },
    { name: 'Analítica y Métricas', icon: BarChart3, path: '/producer/analytics' },
    { name: 'Mis Beats', icon: Music, path: '/producer/beats' },
    { name: 'Pedidos de Venta', icon: Receipt, path: '/producer/orders' },
    { name: 'Transacciones', icon: DollarSign, path: '/producer/transactions' },
    { name: 'Mi Perfil Studio', icon: UserCheck, path: '/producer/profile' },
    { name: 'Métodos de Pago', icon: CreditCard, path: '/producer/payment-methods' },
    { name: 'Mis Planes', icon: Radio, path: '/producer/plans' },
  ];

  // Admin Side Menu Items
  const ADMIN_MENU = [
    { name: 'Dashboard Global', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Estadísticas Globales', icon: BarChart3, path: '/admin/stats' },
    { name: 'Gestionar Usuarios', icon: Users, path: '/admin/users' },
    { name: 'Transacciones', icon: Receipt, path: '/admin/transactions' },
    { name: 'Configurar Planes', icon: Radio, path: '/admin/plans' },
    { name: 'Mi Perfil Admin', icon: UserCheck, path: '/admin/profile' },
  ];

  const menuItems = isProducer ? PRODUCER_MENU : ADMIN_MENU;

  const handleNav = (path: string) => {
    navigateTo(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col md:flex-row transition-colors">
      
      {/* 1. Mobile Header (Visible on small screens) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b shadow-sm z-30 transition-all bg-brand-surface border-brand-border/40 text-white">
        <div className="flex items-center gap-2" onClick={() => navigateTo('/')}>
          <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
            <Music size={15} />
          </span>
          <span className="font-bold tracking-tight text-sm text-white">
            D'Cuban<span className="text-[#7F77DD] font-mono">[Beats]</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick link back */}
          <button 
            onClick={() => navigateTo('/')}
            className="p-1 px-3 rounded-lg text-xs font-semibold cursor-pointer bg-[#534AB7]/20 text-[#7F77DD] hover:bg-[#534AB7]/30"
          >
            Catálogo
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg cursor-pointer text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* 2. Sidebar Navigation (Desktop fixed, Mobile floating) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r flex flex-col justify-between py-6 z-40 transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-brand-surface border-brand-border/40 text-white
      `}>
        <div>
          {/* Logo Brand Header */}
          <div className="px-6 pb-6 border-b items-center justify-center hidden md:flex border-brand-border/20">
            <div className="flex items-center gap-2 cursor-pointer animate-in fade-in duration-300" onClick={() => navigateTo('/')}>
              <span className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/10">
                <Music size={16} fill="currentColor" />
              </span>
              <span className="font-bold text-base tracking-tight text-white">
                D'Cuban<span className="text-[#7F77DD] font-semibold font-mono">[Beats]</span>
              </span>
            </div>
          </div>

          {/* User Badge Status Inside panel */}
          <div className="px-6 py-4 flex items-center gap-3 m-4 rounded-xl border bg-brand-card/30 border-brand-border/30">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                className="w-10 h-10 rounded-xl object-cover border border-[#534AB7]/30" 
                alt="profile" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="text-left overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold truncate block text-white font-sans">
                  {user?.role === 'admin' 
                    ? `${user?.name} ${user?.lastName || ''}`.trim()
                    : (user?.artistName || user?.name || 'Productor')}
                </span>
                {user?.verified && (
                  <CheckCircle size={12} className="text-green-500 flex-shrink-0 animate-pulse" fill="currentColor text-white" />
                )}
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 text-[#7F77DD] bg-[#534AB7]/20">
                {user?.role === 'producer' 
                  ? `Productor (${user?.plan || 'Gratis'})` 
                  : (user?.role === 'client' ? 'Cliente' : (user?.position || 'Administrador'))}
              </span>
            </div>
          </div>


          {/* Nav list options */}
          <nav className="px-3 mt-4 space-y-1">
            {menuItems.map((item, i) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleNav(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-[#534AB7]/30 text-[#7F77DD] font-bold shadow-sm'
                      : 'text-gray-400 hover:bg-brand-card/50 hover:text-white'}
                  `}
                >
                  <Icon size={16} className={isActive ? 'text-[#7F77DD]' : 'text-gray-400'} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions panel */}
        <div className="px-4 space-y-2">
          <button
            onClick={() => {
              setUser(null);
              navigateTo('/');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border border-[#FF5C5C]/20 bg-red-500/10 hover:bg-red-500/15 text-red-400"
          >
            <LogOut size={13} />
            Cerrar Sesión
          </button>

          <button
            onClick={() => navigateTo('/')}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md bg-gradient-to-r from-[#26215C] to-[#534AB7] hover:opacity-90 text-white"
          >
            <ArrowLeft size={13} />
            Volver al Catálogo
          </button>
          
          <p className="text-[10px] text-gray-400 text-center mt-3 font-mono tracking-wider">
            D'Cuban Beats v1.0
          </p>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-35 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 3. Main Content Screen Container */}
      <section className="flex-grow p-4 md:p-8 max-h-screen overflow-y-auto mb-16 md:mb-0 transition-all flex flex-col justify-between">
        <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 flex-grow relative">
          
          {/* Admin Custom Header with Notification Bell Dropdown */}
          {isAdmin && (
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-brand-border/30">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7F77DD]">Consola de Control</span>
                <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight">Administración General</h1>
              </div>

              {/* Notification System Button Container */}
              <div className="relative">
                <button
                  id="admin-notif-bell-btn"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`relative p-2.5 rounded-xl cursor-pointer transition-all border outline-none duration-150 flex items-center justify-center ${
                    notifDropdownOpen 
                      ? 'bg-[#534AB7]/25 border-[#7F77DD] text-[#7F77DD] shadow-lg shadow-brand-primary/10' 
                      : 'bg-brand-surface border-brand-border/30 text-gray-300 hover:text-white hover:border-brand-border/60'
                  }`}
                  aria-label="Notificaciones de administración"
                >
                  <Bell size={18} className={adminNotifications.filter(n => !n.read).length > 0 ? "animate-pulse" : ""} />
                  
                  {adminNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-brand-accent-red text-white text-[9px] font-extrabold border border-brand-surface flex items-center justify-center animate-pulse min-w-[18px]">
                      {adminNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Menu */}
                {notifDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setNotifDropdownOpen(false)} 
                    />
                    
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#13131F] rounded-2xl border border-brand-border/40 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      
                      {/* Title block */}
                      <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <div className="text-left">
                          <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                            <Bell size={13} className="text-[#7F77DD]" /> 
                            Notificaciones de Actividad
                          </h4>
                          <span className="text-[10px] font-medium text-gray-400">
                            {adminNotifications.filter(n => !n.read).length} nuevas hoy
                          </span>
                        </div>
                        
                        {adminNotifications.filter(n => !n.read).length > 0 && (
                          <button
                            onClick={() => {
                              markAllAdminNotificationsRead();
                              addToast('Todas las notificaciones marcadas como leídas', 'success');
                            }}
                            className="bg-[#534AB7]/10 hover:bg-[#534AB7]/25 text-[#7F77DD] border border-[#534AB7]/20 hover:border-[#534AB7]/40 px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors"
                          >
                            Leídas
                          </button>
                        )}
                      </div>

                      {/* Notif Body List */}
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
                        {adminNotifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 space-y-2">
                            <Bell size={24} className="mx-auto text-gray-600 opacity-60" />
                            <p className="text-xs font-medium">No tienes notificaciones hoy</p>
                            <p className="text-[10px] text-gray-600">Los eventos importantes se mostrarán aquí.</p>
                          </div>
                        ) : (
                          adminNotifications.map((notif) => {
                            const isUnread = !notif.read;
                            return (
                              <div 
                                key={notif.id}
                                onClick={() => markAdminNotificationRead(notif.id)}
                                className={`p-4 text-left transition-colors cursor-pointer flex gap-3 relative ${
                                  isUnread ? 'bg-[#534AB7]/5 hover:bg-[#534AB7]/10' : 'hover:bg-white/5'
                                }`}
                              >
                                {isUnread && (
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#7F77DD]" />
                                )}

                                {/* Dedicated Custom Icon by Type */}
                                <div className="flex-shrink-0 mt-0.5 pl-1.5">
                                  {notif.type === 'beat_uploaded' && (
                                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                                      <Music size={14} />
                                    </span>
                                  )}
                                  {notif.type === 'user_registered' && (
                                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                                      <Users size={14} />
                                    </span>
                                  )}
                                  {notif.type === 'plan_purchased' && (
                                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center">
                                      <Sparkles size={14} />
                                    </span>
                                  )}
                                  {notif.type === 'beat_sold' && (
                                    <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center">
                                      <DollarSign size={14} />
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-0.5 overflow-hidden flex-grow text-left">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <span className="text-xs font-extrabold text-white truncate">
                                      {notif.title}
                                    </span>
                                    <span className="text-[9px] font-mono text-gray-500 flex-shrink-0">
                                      {notif.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] leading-relaxed text-gray-300 break-words font-sans">
                                    {notif.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Dropdown Action Footer control bar */}
                      <div className="p-3 border-t border-white/5 bg-[#0D0D14] rounded-b-2xl flex justify-between gap-2">
                        <button
                          onClick={() => {
                            clearAdminNotifications();
                            addToast('Historial vaciado correctamente', 'info');
                          }}
                          className="text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-1"
                        >
                          Limpiar todo
                        </button>

                        <button
                          onClick={() => {
                            const types: Array<'beat_uploaded' | 'user_registered' | 'plan_purchased' | 'beat_sold'> = [
                              'beat_uploaded', 'user_registered', 'plan_purchased', 'beat_sold'
                            ];
                            const randomType = types[Math.floor(Math.random() * types.length)];
                            
                            let t = '';
                            let d = '';
                            if (randomType === 'beat_uploaded') {
                              t = 'Nuevo Beat Cubano';
                              d = 'El productor "La Clave Music" ha subido un nuevo beat titulado "Ritmo Varadero" (105 BPM).';
                            } else if (randomType === 'user_registered') {
                              t = 'Nuevo Cliente Registrado';
                              d = 'Se ha registrado un nuevo cliente de la Habana: "Yusniel Rap" (yusniel@correo.cu).';
                            } else if (randomType === 'plan_purchased') {
                              t = 'Plan Membresía Elite';
                              d = 'El productor "El Chama" ha ascendido al Plan Elite ($1,200 CUP/mes).';
                            } else {
                              t = '¡Beat Vendido con Éxito!';
                              d = 'Se ha vendido la Licencia Básica de "Malecón Sunset" por un monto de $600 CUP.';
                            }
                            
                            addAdminNotification(randomType, t, d);
                            addToast('Nuevo evento simulado con éxito', 'success');
                          }}
                          className="text-[10px] font-bold text-[#7F77DD] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1 flex items-center gap-1"
                        >
                          <Sparkles size={11} /> Simular Evento
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full flex-grow flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Minimalist Panel Footer */}
        {isAdmin && (
          <footer className="mt-16 pt-5 border-t w-full max-w-6xl mx-auto flex items-center justify-center text-[11px] font-medium border-brand-border/20 text-gray-500">
            <span>D'Cuban Beats &copy; {new Date().getFullYear()}</span>
          </footer>
        )}

        {isProducer && (
          <footer className="mt-16 pt-5 border-t w-full max-w-6xl mx-auto flex items-center justify-between text-[11px] font-medium border-brand-border/20 text-gray-500">
            <span>D'Cuban Beats &copy; {new Date().getFullYear()}</span>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#7F77DD] font-medium bg-transparent border-none cursor-pointer transition-colors"
            >
              <HelpCircle size={14} className="text-[#7F77DD]" />
              Ayuda Interna
            </button>
          </footer>
        )}

        {/* Producers Internal Help Modal */}
        <Modal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Guía de Herramientas del Dashboard"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-left py-2 font-sans">
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Bienvenido a tu panel de control de D'Cuban Beats. A continuación te explicamos detalladamente cómo funciona cada una de las herramientas diseñadas para potenciar tu carrera musical:
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#534AB7]/10 border border-[#534AB7]/25 text-[#7F77DD] flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Escritorio (Dashboard)</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Es el centro operativo principal. Te brinda un resumen gráfico sobre el rendimiento de tu cuenta, mostrando ingresos mensuales estimativos, el total de reproducciones, acumulados de visitas y conversiones de ventas en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#534AB7]/10 border border-[#534AB7]/25 text-[#7F77DD] flex items-center justify-center flex-shrink-0">
                  <Music size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Mis Beats</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Aquí gestionas tu catálogo de ritmos. Permite subir pistas nuevas especificando género, velocidad (BPM) y configurar individualmente los precios en CUP de tus licencias (Básica, Premium, y Exclusiva/Pro).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#534AB7]/10 border border-[#534AB7]/25 text-[#7F77DD] flex items-center justify-center flex-shrink-0">
                  <Receipt size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Pedidos de Venta</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Lleva un registro histórico y de control sobre cada transacción realizada por artistas compradores. Puedes verificar números de factura, estados de transacción y detalles técnicos de entrega de las licencias adquiridas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#534AB7]/10 border border-[#534AB7]/25 text-[#7F77DD] flex items-center justify-center flex-shrink-0">
                  <UserCheck size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Mi Perfil Studio</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Tu carta de presentación pública. Diseña tu portal de productor cargando tu avatar, biografía, imagen de portada y enlaces de redes sociales para infundir la máxima confianza y profesionalidad en los visitantes de tu estudio.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#534AB7]/10 border border-[#534AB7]/25 text-[#7F77DD] flex items-center justify-center flex-shrink-0">
                  <CreditCard size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Métodos de Pago</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Configura de manera segura los datos de cobro oficiales para transferencias cubanas. Registra tu tarjeta de banco (CUP) vinculable para permitir y certificar transferencias directas inmediatas mediante SMS de Transfermóvil.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-[#534AB7]/10 border border-[#534AB7]/25 text-[#7F77DD] flex items-center justify-center flex-shrink-0">
                  <Radio size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Mis Planes</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Permite observar tu nivel de membresía activo. Desde allí puedes ascender de escala para remover comisiones por ventas, expandir límites de subidas de pistas ilimitadas y ganar mayor destaque en nuestro catálogo principal.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2.5 bg-[#534AB7] hover:bg-[#534AB7]/80 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Comprendido
              </button>
            </div>
          </div>
        </Modal>
      </section>

    </div>
  );
};
