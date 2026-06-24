import React, { useState } from 'react';
import { Music, ShoppingCart, Bell, User, LayoutDashboard, LogOut, ChevronDown, CheckCheck, Landmark, Globe } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { 
    cart, user, setUser, navigateTo, currentPath, 
    producerNotifications = [], markProducerNotificationRead, markAllProducerNotificationsRead, clearProducerNotifications,
    adminNotifications = [], markAdminNotificationRead, markAllAdminNotificationsRead, clearAdminNotifications,
    artistNotifications = [], markArtistNotificationRead, markAllArtistNotificationsRead, clearArtistNotifications,
    displayCurrency, setDisplayCurrency
  } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Simulated Roles list
  const ROLES = [
    { name: 'Comprador (Cliente)', email: 'cliente@dcubanbeats.cu', role: 'client', plan: 'Gratis', verified: false, artistName: 'Artista Cubano' },
    { name: 'Productor (Vendedor)', email: 'carlitos.flow@gmail.com', role: 'producer', plan: 'Elite', verified: true, artistName: 'Flow Habano' },
    { name: 'Admin (D\'Cuban Beats)', email: 'admin@dcubanbeats.cu', role: 'admin', plan: 'Elite', verified: true, artistName: 'Admin D\'Cuban Beats' }
  ];

  const handleRoleSelect = (roleItem: any) => {
    setUser({
      id: roleItem.role === 'producer' ? 'carlos_producer' : `user_${roleItem.role}`,
      name: roleItem.role === 'admin' ? 'Administrador' : roleItem.name.split(' ')[0],
      lastName: roleItem.role === 'admin' ? 'General' : undefined,
      position: roleItem.role === 'admin' ? 'Presidente Ejecutivo' : undefined,
      email: roleItem.email,
      role: roleItem.role as 'client' | 'producer' | 'admin',
      artistName: roleItem.artistName,
      avatarUrl: roleItem.role === 'producer' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
        : (roleItem.role === 'admin' 
           ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
           : undefined),
      plan: roleItem.plan as 'Gratis' | 'Pro' | 'Elite',
      verified: roleItem.verified
    });
    setShowRoleDropdown(false);
  };

  const totalCartCount = cart.length;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D0D14]/90 backdrop-blur-md border-b border-[rgba(127,119,221,0.15)] flex items-center justify-between px-6 z-40 transition-all">
      {/* Brand Logo Left */}
      <div 
        onClick={() => {
          if (user?.role === 'producer') {
            navigateTo('/');
          } else if (user?.role === 'admin') {
            navigateTo('/');
          } else {
            navigateTo('/');
          }
        }} 
        className="flex items-center gap-2 cursor-pointer group"
      >
        <span className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/10">
          <Music size={18} fill="currentColor" />
        </span>
        <span className="text-white font-medium text-lg tracking-tight">
          D'Cuban<span className="text-[#7F77DD] font-semibold font-mono">[Beats]</span>
        </span>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex items-center relative w-1/3 max-w-md">
        <input
          type="text"
          placeholder="Buscar beats por género, BPM, productor..."
          onClick={() => navigateTo('/')}
          className="w-full bg-[#1C1C2E] border border-[rgba(127,119,221,0.2)] hover:border-[rgba(127,119,221,0.4)] transition-all duration-200 rounded-xl py-1.5 pl-4 pr-10 text-xs text-white placeholder-white/35 outline-none focus:border-[#7F77DD]"
        />
        <span className="absolute right-3 text-white/30 text-xs">⌘K</span>
      </div>

      {/* Right Tools section */}
      <div className="flex items-center gap-4">
        {/* Quick public paths if developer/visitor wants */}
        <button 
          onClick={() => navigateTo('/')}
          className={`text-xs font-semibold cursor-pointer transition-colors ${currentPath === '/' ? 'text-[#7F77DD]' : 'text-white/60 hover:text-white'}`}
        >
          Catálogo
        </button>
        <button 
          onClick={() => navigateTo('/about')}
          className={`text-xs font-semibold cursor-pointer transition-colors ${currentPath === '/about' ? 'text-[#7F77DD]' : 'text-white/60 hover:text-white'}`}
        >
          Sobre Nosotros
        </button>
        
        {/* Dynamic Panel access button if user is authenticated */}
        {user && user.role === 'client' && (
          <button 
            onClick={() => navigateTo('/artist/dashboard')}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#534AB7]/15 text-[#7F77DD] border border-[#7F77DD]/20 cursor-pointer hover:bg-[#534AB7]/25 transition-colors ${currentPath.startsWith('/artist') ? 'bg-[#534AB7]/25 text-white' : ''}`}
            id="panel-artista-btn"
          >
            <LayoutDashboard size={13} />
            Perfil de Artista
          </button>
        )}

        {user && user.role === 'producer' && (
          <button 
            onClick={() => navigateTo('/producer/dashboard')}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary-dark/40 text-brand-primary-light border border-brand-primary-light/20 cursor-pointer hover:bg-brand-primary-dark/60 transition-colors ${currentPath.startsWith('/producer') ? 'bg-brand-primary/20 text-white' : ''}`}
          >
            <LayoutDashboard size={13} />
            Panel Productor
          </button>
        )}

        {user && user.role === 'admin' && (
          <button 
            onClick={() => navigateTo('/admin/dashboard')}
            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/25 transition-colors"
          >
            <Landmark size={13} />
            Panel Admin
          </button>
        )}

        {/* Currency Switcher Dropdown */}
        <div className="relative flex items-center bg-[#131322] border border-[rgba(127,119,221,0.22)] rounded-xl px-2.5 py-1.5 text-xs gap-1.5 shadow-inner">
          <Globe size={13} className="text-brand-primary-light animate-pulse" />
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value as any)}
            className="bg-transparent text-white focus:outline-none focus:ring-0 text-[11px] font-bold cursor-pointer border-none py-0.5 pr-1.5 outline-none font-sans"
            title="Moneda de visualización de precios"
          >
            <option value="USD" className="bg-[#13131F] text-white">USD ($)</option>
            <option value="CUP" className="bg-[#13131F] text-white">CUP ($)</option>
            <option value="MLC" className="bg-[#13131F] text-white">MLC ($)</option>
            <option value="CLASICA" className="bg-[#13131F] text-white">Clásica ($)</option>
          </select>
        </div>

        {/* Shopping Cart button with dynamic animation */}
        {user?.role !== 'producer' && user?.role !== 'admin' && (
          <div className="relative">
            <button
              onClick={() => navigateTo('/cart')}
              className="relative p-2 text-white/70 hover:text-white backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <ShoppingCart size={18} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E24B4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              if (user) {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
              }
            }}
            className={`p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all block cursor-pointer relative ${user ? 'opacity-100 hover:scale-105' : 'opacity-60 cursor-not-allowed'}`}
            title={
              !user 
                ? "Inicia sesión para ver tus notificaciones" 
                : user.role === 'producer' 
                ? "Notificaciones de Productor (Studio)" 
                : user.role === 'admin' 
                ? "Notificaciones de Administrador" 
                : "Tus notificaciones de Artista"
            }
          >
            <Bell size={18} />
            {user?.role === 'producer' && producerNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-[#0D0D14] animate-pulse" />
            )}
            {user?.role === 'admin' && adminNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-[#0D0D14] animate-pulse" />
            )}
            {user?.role === 'client' && artistNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7F77DD] rounded-full ring-1 ring-[#0D0D14] animate-pulse" />
            )}
          </button>
 
          {/* Interactive notifications dropdown */}
          {showNotifications && user && (
            <div className="absolute right-0 mt-3 w-80 bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-2xl shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell size={12} className="text-brand-primary-light" />
                  {user.role === 'admin' 
                    ? "Panel Control D'Cuban Beats" 
                    : user.role === 'producer' 
                    ? "D'Cuban Beats Studio" 
                    : "Notificaciones Artista"
                  } ({
                    user.role === 'admin' 
                      ? adminNotifications.length 
                      : user.role === 'producer' 
                      ? producerNotifications.length 
                      : artistNotifications.length
                  })
                </span>
                <div className="flex gap-2">
                  {user.role === 'admin' ? (
                    <>
                      {adminNotifications.some(n => !n.read) && (
                        <button 
                          onClick={() => markAllAdminNotificationsRead()}
                          className="text-[10px] font-bold text-brand-primary-light hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Leídas
                        </button>
                      )}
                      {adminNotifications.length > 0 && (
                        <button 
                          onClick={() => clearAdminNotifications()}
                          className="text-[10px] font-bold text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </>
                  ) : user.role === 'producer' ? (
                    <>
                      {producerNotifications.some(n => !n.read) && (
                        <button 
                          onClick={() => markAllProducerNotificationsRead()}
                          className="text-[10px] font-bold text-brand-primary-light hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Leídas
                        </button>
                      )}
                      {producerNotifications.length > 0 && (
                        <button 
                          onClick={() => clearProducerNotifications()}
                          className="text-[10px] font-bold text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {artistNotifications.some(n => !n.read) && (
                        <button 
                          onClick={() => markAllArtistNotificationsRead()}
                          className="text-[10px] font-bold text-[#7F77DD] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Leídas
                        </button>
                      )}
                      {artistNotifications.length > 0 && (
                        <button 
                          onClick={() => clearArtistNotifications()}
                          className="text-[10px] font-bold text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
 
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {user.role === 'admin' ? (
                  adminNotifications.length === 0 ? (
                    <div className="py-8 text-center text-white/30 text-xs">
                      No tienes notificaciones de administrador por el momento.
                    </div>
                  ) : (
                    adminNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markAdminNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl text-left flex items-start gap-2.5 cursor-pointer transition-colors border ${
                          notif.read 
                            ? 'bg-transparent hover:bg-white/5 border-transparent opacity-65' 
                            : 'bg-[#534AB7]/10 hover:bg-[#534AB7]/15 border-[#534AB7]/25'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 w-7 h-7 flex items-center justify-center text-xs ${
                          notif.type === 'new_user'
                            ? 'bg-blue-500/15 text-blue-400'
                            : notif.type === 'payout_requested'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {notif.type === 'new_user' ? '👤' : notif.type === 'payout_requested' ? '💸' : '💰'}
                        </div>
                        <div className="space-y-0.5 flex-grow min-w-0">
                          <p className="text-[11px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <p className="text-[10px] text-white/65 leading-normal break-words">{notif.description}</p>
                          <span className="text-[8px] text-white/40 block font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )
                ) : user.role === 'producer' ? (
                  producerNotifications.length === 0 ? (
                    <div className="py-8 text-center text-white/30 text-xs">
                      No tienes notificaciones por el momento.
                    </div>
                  ) : (
                    producerNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markProducerNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl text-left flex items-start gap-2.5 cursor-pointer transition-colors border ${
                          notif.read 
                            ? 'bg-transparent hover:bg-white/5 border-transparent opacity-65' 
                            : 'bg-[#534AB7]/10 hover:bg-[#534AB7]/15 border-[#534AB7]/25'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 w-7 h-7 flex items-center justify-center text-xs ${
                          notif.type === 'beat_liked'
                            ? 'bg-rose-500/15 text-rose-455'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {notif.type === 'beat_liked' ? '❤️' : '💰'}
                        </div>
                        <div className="space-y-0.5 flex-grow min-w-0">
                          <p className="text-[11px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <p className="text-[10px] text-white/65 leading-normal break-words">{notif.description}</p>
                          <span className="text-[8px] text-white/40 block font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  artistNotifications.length === 0 ? (
                    <div className="py-8 text-center text-white/30 text-xs">
                      No tienes notificaciones por el momento.
                    </div>
                  ) : (
                    artistNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markArtistNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl text-left flex items-start gap-2.5 cursor-pointer transition-colors border ${
                          notif.read 
                            ? 'bg-transparent hover:bg-white/5 border-transparent opacity-65' 
                            : 'bg-[#7F77DD]/10 hover:bg-[#7F77DD]/15 border-[#7F77DD]/25'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 w-7 h-7 flex items-center justify-center text-xs ${
                          notif.type === 'kyc_status'
                            ? 'bg-indigo-550/15 text-[#7F77DD]'
                            : notif.type === 'account_blocked'
                            ? 'bg-red-500/15 text-red-400'
                            : notif.type === 'payment_status'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-indigo-500/15 text-indigo-400'
                        }`}>
                          {notif.type === 'kyc_status' ? '📑' : notif.type === 'account_blocked' ? '🚫' : notif.type === 'payment_status' ? '💳' : '🎵'}
                        </div>
                        <div className="space-y-0.5 flex-grow min-w-0">
                          <p className="text-[11px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <p className="text-[10px] text-white/65 leading-normal break-words">{notif.description}</p>
                          <span className="text-[8px] text-white/40 block font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Role Switcher Pill or Auth buttons */}
        {!user ? (
          <div className="flex items-center gap-2" id="navbar-auth-buttons">
            <button
              onClick={() => navigateTo('/login')}
              className="text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
              id="navbar-login-btn"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigateTo('/register')}
              className="text-xs font-bold text-white bg-brand-primary hover:bg-[#9B94EC] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md shadow-brand-primary/10"
              id="navbar-register-btn"
            >
              Registrarse
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl text-white hover:border-[#7F77DD] transition-all text-xs cursor-pointer"
            >
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="avatar" 
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-md object-cover border border-[#7F77DD]/40" 
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="max-w-[100px] truncate font-medium">
                {user.artistName || user.name}
              </span>
              <ChevronDown size={14} className="opacity-60" />
            </button>

            {/* Quick switcher list */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-xl shadow-2xl p-2 z-50 text-left animate-in fade-in slide-in-from-top-3">
                <span className="text-[10px] font-bold tracking-wider text-white/35 uppercase px-3 py-2 block">
                  Simulador de Roles
                </span>
                
                {ROLES.map((roleObj, i) => {
                  const isActive = user?.role === roleObj.role;
                  return (
                    <button
                      key={i}
                      onClick={() => handleRoleSelect(roleObj)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                        isActive 
                          ? 'bg-brand-primary text-white font-medium' 
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{roleObj.name}</span>
                        <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-white/40'}`}>
                          {roleObj.artistName} • {roleObj.plan}
                        </span>
                      </div>
                      {isActive && <CheckCheck size={14} className="text-white" />}
                    </button>
                  );
                })}

                <div className="border-t border-white/5 my-1.5" />
                
                <button
                  onClick={() => setUser(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-brand-accent-red/10 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut size={13} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
