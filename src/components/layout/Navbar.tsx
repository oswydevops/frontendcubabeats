import React, { useState } from 'react';
import { Music, ShoppingCart, Bell, User, LayoutDashboard, LogOut, ChevronDown, CheckCheck, Landmark } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { cart, user, setUser, navigateTo, currentPath } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Simulated Roles list
  const ROLES = [
    { name: 'Comprador (Cliente)', email: 'cliente@cubabeats.cu', role: 'client', plan: 'Gratis', verified: false, artistName: 'Artista Cubano' },
    { name: 'Productor (Vendedor)', email: 'carlitos.flow@gmail.com', role: 'producer', plan: 'Elite', verified: true, artistName: 'Flow Habano' },
    { name: 'Admin (CubaBeats)', email: 'admin@cubabeats.cu', role: 'admin', plan: 'Elite', verified: true, artistName: 'Admin CubaBeats' }
  ];

  const handleRoleSelect = (roleItem: any) => {
    setUser({
      id: roleItem.role === 'producer' ? 'carlos_producer' : `user_${roleItem.role}`,
      name: roleItem.name.split(' ')[0],
      email: roleItem.email,
      role: roleItem.role as 'client' | 'producer' | 'admin',
      artistName: roleItem.artistName,
      avatarUrl: roleItem.role === 'producer' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
        : undefined,
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
          Cuba<span className="text-[#7F77DD] font-semibold font-mono">[Beats]</span>
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
        
        {/* Dynamic Panel access button if user is authenticated */}
        {user && user.role === 'client' && (
          <button 
            onClick={() => navigateTo('/artist/dashboard')}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#534AB7]/15 text-[#7F77DD] border border-[#7F77DD]/20 cursor-pointer hover:bg-[#534AB7]/25 transition-colors ${currentPath.startsWith('/artist') ? 'bg-[#534AB7]/25 text-white' : ''}`}
            id="panel-artista-btn"
          >
            <LayoutDashboard size={13} />
            Panel Artista
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

        {/* Shopping Cart button with dynamic animation */}
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

        {/* Notification Bell */}
        <button className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all hidden sm:block cursor-pointer">
          <Bell size={18} />
        </button>

        {/* Interactive Role Switcher Pill */}
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
                C
              </div>
            )}
            <span className="max-w-[100px] truncate font-medium">
              {user ? (user.artistName || user.name) : 'Invitado'}
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
              
              {user ? (
                <button
                  onClick={() => setUser(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-brand-accent-red/10 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut size={13} />
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={() => handleRoleSelect(ROLES[1])}
                  className="w-full text-center py-2 text-xs text-brand-primary-light font-medium hover:bg-white/5 rounded-lg cursor-pointer"
                >
                  Iniciar Sesión como Productor
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
