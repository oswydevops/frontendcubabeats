import React, { useState } from 'react';
import { Music, ShoppingCart, Bell, User, LayoutDashboard, LogOut, ChevronDown, CheckCheck, Landmark, Globe, Search, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Button } from '../ui/Button';
import { BrandLogo } from './BrandLogo';
import { GuestBecomeProducerModal } from '../auth/GuestBecomeProducerModal';
import { ExchangeRateBadge } from '../ui/ExchangeRateBadge';

export const Navbar: React.FC = () => {
  const { 
    cart, user, setUser, navigateTo, currentPath, 
    producerNotifications = [], markProducerNotificationRead, markAllProducerNotificationsRead, clearProducerNotifications,
    adminNotifications = [], markAdminNotificationRead, markAllAdminNotificationsRead, clearAdminNotifications,
    artistNotifications = [], markArtistNotificationRead, markAllArtistNotificationsRead, clearArtistNotifications,
    displayCurrency, setDisplayCurrency,
    verifiedProducersTask = []
  } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showGuestProducerModal, setShowGuestProducerModal] = useState(false);

  const totalCartCount = cart.length;

  return (
    <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[#0D0D14]/90 backdrop-blur-md border-b border-[rgba(127,119,221,0.15)] flex items-center justify-between px-6 z-40 transition-all">
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
        <BrandLogo className="h-20 w-auto transition-transform group-hover:scale-[1.02]" />
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex items-center relative flex-1 mx-4 max-w-[140px] lg:max-w-[240px] xl:max-w-[360px] transition-all duration-300 group/navsearch">
        <input
          type="text"
          placeholder="Buscar..."
          onClick={() => navigateTo('/')}
          className="w-full bg-[#13131F]/65 backdrop-blur-sm border border-[rgba(127,119,221,0.25)] hover:border-[#7F77DD]/50 focus:border-[#7F77DD] transition-all duration-200 rounded-xl py-1.5 pl-4 pr-10 text-[13px] font-normal text-white placeholder-white/35 outline-none"
        />
        <div className="absolute right-3.5 pointer-events-none text-[#7F77DD] opacity-60 group-focus-within/navsearch:opacity-100 transition-opacity">
          <Search size={15} />
        </div>
      </div>

      {/* Right Tools section */}
      <div className="flex items-center gap-4">
        {/* Quick public paths if developer/visitor wants */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateTo('/')}
            className={`text-[14px] font-medium cursor-pointer transition-colors ${currentPath === '/' ? 'text-[#7F77DD]' : 'text-white/60 hover:text-white'}`}
          >
            Catálogo
          </button>
          
          {(user?.role !== 'producer' && user?.role !== 'admin') && (
            <button
              onClick={() => navigateTo('/hazte-vendedor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-extrabold shadow-md cursor-pointer transition-all active:scale-95 ${
                currentPath === '/hazte-vendedor' ? 'ring-2 ring-amber-300' : ''
              }`}
              title="Ver planes y convertirte en vendedor de beats"
            >
              <Sparkles size={13} />
              <span>Hazte vendedor</span>
            </button>
          )}
        </div>
        
        {/* Currency Switcher Dropdown & Live Rate Badge */}
        {(currentPath === '/' || currentPath === '/cart' || currentPath === '/checkout') && (
          <div className="flex items-center gap-2">
            <ExchangeRateBadge variant="compact" />

            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrencyDropdown(!showCurrencyDropdown);
                  setShowRoleDropdown(false);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl text-white hover:border-[#7F77DD] transition-all text-[14px] cursor-pointer font-medium font-sans shadow-md"
                title="Moneda de visualización de precios"
              >
                <Globe size={14} className="text-brand-primary-light animate-pulse" />
                <span className="font-medium">
                  {displayCurrency === 'USD' && 'USD ($)'}
                  {displayCurrency === 'CUP' && 'CUP ($)'}
                  {displayCurrency === 'MLC' && 'MLC ($)'}
                </span>
                <ChevronDown size={14} className="opacity-60" />
              </button>

              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-xl shadow-2xl p-1.5 z-50 text-left animate-in fade-in slide-in-from-top-3">
                  <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase px-2 py-1 block font-mono">
                    Moneda
                  </span>
                  
                  {[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'CUP', label: 'CUP ($)' },
                    { value: 'MLC', label: 'MLC ($)' },
                  ].map((item) => {
                    const isActive = displayCurrency === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          setDisplayCurrency(item.value as any);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-brand-primary text-white font-bold' 
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <CheckCheck size={14} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shopping Cart button with dynamic animation */}
        {user?.role !== 'producer' && user?.role !== 'admin' && (
          <div className="relative">
            <button
              onClick={() => navigateTo('/cart')}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-[#7F77DD]/50 hover:shadow-[0_0_15px_rgba(127,119,221,0.25)] transition-all cursor-pointer flex items-center justify-center group relative"
              title="Carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={18} className="transition-transform duration-200 group-hover:scale-110 text-white/90 group-hover:text-white" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E24B4A] text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-md animate-bounce">
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
                setShowCurrencyDropdown(false);
              }
            }}
            className={`w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-[#7F77DD]/50 hover:shadow-[0_0_15px_rgba(127,119,221,0.25)] transition-all cursor-pointer flex items-center justify-center group relative ${user ? 'opacity-100' : 'opacity-60 cursor-not-allowed'}`}
            title={
              !user 
                ? "Inicia sesión para ver tus notificaciones" 
                : user.role === 'producer' 
                ? "Notificaciones de Productor (Studio)" 
                : user.role === 'admin' 
                ? "Notificaciones de Administrador" 
                : "Tus notificaciones de Artista"
            }
            aria-label="Notificaciones"
          >
            <Bell size={18} className="transition-transform duration-200 group-hover:scale-110 text-white/90 group-hover:text-white" />
            {user?.role === 'producer' && producerNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0D0D14] animate-pulse" />
            )}
            {user?.role === 'admin' && adminNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0D0D14] animate-pulse" />
            )}
            {user?.role === 'client' && artistNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#7F77DD] rounded-full ring-2 ring-[#0D0D14] animate-pulse" />
            )}
          </button>
 
          {/* Interactive notifications dropdown */}
          {showNotifications && user && (
            <div className="absolute right-0 mt-3 w-[360px] sm:w-[425px] bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-2xl shadow-2xl p-5 z-50 text-left animate-in fade-in slide-in-from-top-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Bell size={14} className="text-brand-primary-light" />
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
                          className="text-[11px] font-bold text-brand-primary-light hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Leídas
                        </button>
                      )}
                      {adminNotifications.length > 0 && (
                        <button 
                          onClick={() => clearAdminNotifications()}
                          className="text-[11px] font-bold text-red-400 hover:underline bg-transparent border-none cursor-pointer"
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
                          className="text-[11px] font-bold text-brand-primary-light hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Leídas
                        </button>
                      )}
                      {producerNotifications.length > 0 && (
                        <button 
                          onClick={() => clearProducerNotifications()}
                          className="text-[11px] font-bold text-red-400 hover:underline bg-transparent border-none cursor-pointer"
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
                          className="text-[11px] font-bold text-[#7F77DD] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Leídas
                        </button>
                      )}
                      {artistNotifications.length > 0 && (
                        <button 
                          onClick={() => clearArtistNotifications()}
                          className="text-[11px] font-bold text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
 
              <div className="space-y-2.5 pr-1">
                {user.role === 'admin' ? (
                  adminNotifications.length === 0 ? (
                    <div className="py-12 text-center text-white/30 text-xs">
                      No tienes notificaciones de administrador por el momento.
                    </div>
                  ) : (
                    adminNotifications.slice(0, 3).map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markAdminNotificationRead(notif.id)}
                        className={`p-3 rounded-xl text-left flex items-start gap-3 cursor-pointer transition-colors border ${
                          notif.read 
                            ? 'bg-transparent hover:bg-white/5 border-transparent opacity-65' 
                            : 'bg-[#534AB7]/10 hover:bg-[#534AB7]/15 border-[#534AB7]/25'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 w-9 h-9 flex items-center justify-center text-sm flex-shrink-0 ${
                          notif.type === 'new_user'
                            ? 'bg-blue-500/15 text-blue-400'
                            : notif.type === 'payout_requested'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {notif.type === 'new_user' ? '👤' : notif.type === 'payout_requested' ? '💸' : '💰'}
                        </div>
                        <div className="space-y-0.5 flex-grow min-w-0">
                          <p className="text-[13px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <p className="text-[12px] text-white/65 leading-normal break-words">{notif.description}</p>
                          <span className="text-[10px] text-white/40 block font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )
                ) : user.role === 'producer' ? (
                  producerNotifications.length === 0 ? (
                    <div className="py-12 text-center text-white/30 text-xs">
                      No tienes notificaciones por el momento.
                    </div>
                  ) : (
                    producerNotifications.slice(0, 3).map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markProducerNotificationRead(notif.id)}
                        className={`p-3 rounded-xl text-left flex items-start gap-3 cursor-pointer transition-colors border ${
                          notif.read 
                            ? 'bg-transparent hover:bg-white/5 border-transparent opacity-65' 
                            : 'bg-[#534AB7]/10 hover:bg-[#534AB7]/15 border-[#534AB7]/25'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 w-9 h-9 flex items-center justify-center text-sm flex-shrink-0 ${
                          notif.type === 'beat_liked'
                            ? 'bg-rose-500/15 text-rose-455'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {notif.type === 'beat_liked' ? '❤️' : '💰'}
                        </div>
                        <div className="space-y-0.5 flex-grow min-w-0">
                          <p className="text-[13px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <p className="text-[12px] text-white/65 leading-normal break-words">{notif.description}</p>
                          <span className="text-[10px] text-white/40 block font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  artistNotifications.length === 0 ? (
                    <div className="py-12 text-center text-white/30 text-xs">
                      No tienes notificaciones por el momento.
                    </div>
                  ) : (
                    artistNotifications.slice(0, 3).map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markArtistNotificationRead(notif.id)}
                        className={`p-3 rounded-xl text-left flex items-start gap-3 cursor-pointer transition-colors border ${
                          notif.read 
                            ? 'bg-transparent hover:bg-white/5 border-transparent opacity-65' 
                            : 'bg-[#7F77DD]/10 hover:bg-[#7F77DD]/15 border-[#7F77DD]/25'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 w-9 h-9 flex items-center justify-center text-sm flex-shrink-0 ${
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
                          <p className="text-[13px] font-bold text-white leading-tight truncate">{notif.title}</p>
                          <p className="text-[12px] text-white/65 leading-normal break-words">{notif.description}</p>
                          <span className="text-[10px] text-white/40 block font-mono mt-1">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Role Switcher Pill or Auth icon */}
        {!user ? (
          <div className="flex items-center gap-2" id="navbar-auth-buttons">
            <button
              onClick={() => navigateTo('/login')}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-[#7F77DD]/50 hover:shadow-[0_0_15px_rgba(127,119,221,0.25)] transition-all cursor-pointer flex items-center justify-center group relative"
              id="navbar-login-btn"
              title="Iniciar Sesión"
              aria-label="Iniciar Sesión"
            >
              <User size={18} className="transition-transform duration-200 group-hover:scale-110 text-white/90 group-hover:text-white" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifications(false);
                setShowCurrencyDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C2E] border border-[rgba(127,119,221,0.25)] rounded-xl text-white hover:border-[#7F77DD] transition-all text-[14px] cursor-pointer"
            >
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="avatar" 
                  referrerPolicy="no-referrer"
                  className="w-[32px] h-[32px] rounded-full object-cover border border-[#7F77DD]/40" 
                />
              ) : (
                <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[12px] font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="max-w-[100px] truncate font-medium">
                {user.artistName || user.name}
              </span>
              <ChevronDown size={14} className="opacity-60" />
            </button>

            {/* User profile details and panel action buttons */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-[#13131F] border border-[rgba(127,119,221,0.25)] rounded-xl shadow-2xl p-3.5 z-50 text-left animate-in fade-in slide-in-from-top-3">
                <div className="px-1 pb-2.5 border-b border-white/5 mb-2.5">
                  <p className="text-xs font-bold text-white truncate">
                    {user.artistName || user.name}
                  </p>
                  <p className="text-[11px] text-white/50 truncate mb-1">
                    {user.email}
                  </p>
                  <span className={`inline-block text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-amber-500/15 text-amber-400' 
                      : user.role === 'producer' 
                      ? 'bg-[#534AB7]/15 text-brand-primary-light' 
                      : 'bg-[#534AB7]/15 text-indigo-300'
                  }`}>
                    {user.role === 'admin' 
                      ? 'Administrador' 
                      : user.role === 'producer' 
                      ? `Productor • Plan ${user.plan || 'Elite'}` 
                      : 'Artista / Comprador'}
                  </span>
                </div>

                {/* Panel action button inside dropdown */}
                <div className="space-y-1">
                  {user.role === 'client' && (
                    <>
                      <button 
                        onClick={() => {
                          navigateTo('/artist/dashboard');
                          setShowRoleDropdown(false);
                        }}
                        className="w-full text-left text-xs font-semibold flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#534AB7]/10 text-indigo-300 border border-[#7F77DD]/10 cursor-pointer hover:bg-[#534AB7]/20 hover:text-white transition-all"
                      >
                        <LayoutDashboard size={14} className="text-[#7F77DD]" />
                        <span>Ir a Perfil de Artista</span>
                      </button>

                      <button 
                        onClick={() => {
                          navigateTo('/hazte-vendedor');
                          setShowRoleDropdown(false);
                        }}
                        className="w-full text-left text-xs font-semibold flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 hover:text-white transition-all"
                      >
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Hazte Vendedor (Ver Planes)</span>
                      </button>
                    </>
                  )}

                  {user.role === 'producer' && user.producerApprovalStatus !== 'pending' && (
                    <button 
                      onClick={() => {
                        navigateTo('/producer/dashboard');
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left text-xs font-semibold flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-primary/10 text-brand-primary-light border border-brand-primary-light/10 cursor-pointer hover:bg-brand-primary/20 hover:text-white transition-all"
                    >
                      <LayoutDashboard size={14} className="text-brand-primary-light" />
                      <span>Ir a Panel Productor</span>
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button 
                      onClick={() => {
                        navigateTo('/admin/dashboard');
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left text-xs font-semibold flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10 cursor-pointer hover:bg-amber-500/25 hover:text-white transition-all"
                    >
                      <Landmark size={14} className="text-amber-400" />
                      <span>Ir a Panel de Admin</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-white/5 my-2" />
                
                <button
                  onClick={() => {
                    setUser(null);
                    setShowRoleDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut size={13} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <GuestBecomeProducerModal
        isOpen={showGuestProducerModal}
        onClose={() => setShowGuestProducerModal(false)}
      />
    </nav>
  );
};
