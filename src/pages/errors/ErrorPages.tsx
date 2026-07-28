import React from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ShieldX, Disc, Flame, WifiOff, ArrowLeft, Home, RotateCcw } from 'lucide-react';

interface ErrorPageProps {
  code?: '401' | '403' | '404' | '500' | '503';
}

export const ErrorPages: React.FC<ErrorPageProps> = ({ code = '404' }) => {
  const { navigateTo, addToast } = useApp();

  // Custom configurations for each error code
  const errorConfigs = {
    '401': {
      title: 'Acceso No Autorizado',
      subtitle: 'Requiere autenticación de usuario',
      description: 'Lo sentimos, pero para acceder a esta sección de D\'Cuban Beats necesitas iniciar sesión o contar con credenciales válidas. Es posible que tu sesión haya expirado.',
      icon: <ShieldAlert className="text-rose-500 w-16 h-16 animate-bounce" />,
      colorClass: 'text-rose-400',
      actionText: 'Iniciar Sesión',
      actionPath: '/login',
      secondaryActionText: 'Ir al Catálogo',
      secondaryActionPath: '/',
    },
    '403': {
      title: 'Acceso Prohibido',
      subtitle: 'Zona de plataforma restringida',
      description: '¡Alto ahí! Tus credenciales actuales no tienen los permisos requeridos para acceder a esta área de control. Esta sección está reservada exclusivamente para administradores autorizados o productores Elite.',
      icon: <ShieldX className="text-amber-500 w-16 h-16 animate-pulse" />,
      colorClass: 'text-amber-400',
      actionText: 'Volver al Inicio',
      actionPath: '/',
      secondaryActionText: 'Reportar Problema',
      secondaryActionPath: '/about', // Contacts or team page
    },
    '404': {
      title: 'Beat Extraviado',
      subtitle: 'Ritmo no encontrado',
      description: 'El ritmo que estás buscando no se encuentra en nuestras pistas, o la dirección ha sido reubicada. ¿Por qué no exploras nuestro catálogo general de beats premium de alta fidelidad?',
      icon: <Disc className="text-indigo-400 w-16 h-16 animate-spin duration-3000" style={{ animationDuration: '4s' }} />,
      colorClass: 'text-indigo-400',
      actionText: 'Explorar Beats',
      actionPath: '/',
      secondaryActionText: 'Ver Quiénes Somos',
      secondaryActionPath: '/about',
    },
    '500': {
      title: 'Fallo de Sintetizador',
      subtitle: 'Error interno del servidor',
      description: '¡Ups! Algo se sobrecalentó en nuestra mesa de mezclas digital. Nuestros ingenieros de soporte han sido notificados automáticamente y ya están calibrando los faders para solucionarlo.',
      icon: <Flame className="text-red-500 w-16 h-16 animate-pulse" />,
      colorClass: 'text-red-400',
      actionText: 'Reintentar Carga',
      actionPath: 'reload',
      secondaryActionText: 'Volver a la Página Principal',
      secondaryActionPath: '/',
    },
    '503': {
      title: 'Servicio No Disponible',
      subtitle: 'Servidor temporalmente saturado',
      description: 'Nuestra pasarela de ritmos está recibiendo una ola masiva de descargas y transferencias simultáneas. El servidor está tomando un breve respiro para procesarlo todo. Por favor, regresa en unos segundos.',
      icon: <WifiOff className="text-cyan-400 w-16 h-16 animate-pulse" />,
      colorClass: 'text-cyan-400',
      actionText: 'Probar de Nuevo',
      actionPath: 'reload',
      secondaryActionText: 'Ver Estado del Sistema',
      secondaryActionPath: '/',
    }
  };

  const config = errorConfigs[code] || errorConfigs['404'];

  const handlePrimaryClick = () => {
    if (config.actionPath === 'reload') {
      addToast('Reconectando y recargando datos...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } else {
      navigateTo(config.actionPath);
    }
  };

  const handleSecondaryClick = () => {
    navigateTo(config.secondaryActionPath);
  };

  return (
    <div id={`error-page-container-${code}`} className="px-4 py-16 md:py-24 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
      
      {/* Visual Indicator Halo */}
      <div id={`error-icon-halo-${code}`} className="relative p-6 bg-[#121220]/80 rounded-full border border-white/5 shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 to-[#7F77DD]/5 rounded-full blur-xl opacity-70" />
        <div className="relative z-10 flex items-center justify-center">
          {config.icon}
        </div>
        <div className="absolute -bottom-2 px-3 py-0.5 bg-brand-surface border border-white/10 rounded-full text-[11px] font-black tracking-widest text-white/90 shadow-lg font-mono">
          HTTP {code}
        </div>
      </div>

      {/* Message and Explanations */}
      <div id={`error-message-box-${code}`} className="space-y-3.5">
        <h1 className={`text-2xl md:text-4xl font-extrabold tracking-tight text-white`}>
          {config.title}
        </h1>
        <p className={`text-xs font-bold uppercase tracking-wider ${config.colorClass} font-mono`}>
          — {config.subtitle} —
        </p>
        <p className="text-[13.5px] leading-relaxed text-slate-400 font-normal max-w-lg mx-auto">
          {config.description}
        </p>
      </div>

      {/* Interaction Buttons */}
      <div id={`error-actions-${code}`} className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        <Button 
          id={`error-btn-primary-${code}`}
          variant="primary" 
          onClick={handlePrimaryClick}
          className="w-full sm:w-auto flex items-center gap-2 justify-center"
        >
          {config.actionPath === 'reload' ? <RotateCcw size={15} /> : <Home size={15} />}
          {config.actionText}
        </Button>
        <Button 
          id={`error-btn-secondary-${code}`}
          variant="secondary" 
          onClick={handleSecondaryClick}
          className="w-full sm:w-auto flex items-center gap-2 justify-center"
        >
          <ArrowLeft size={15} />
          {config.secondaryActionText}
        </Button>
      </div>

      {/* Systems telemetry badge */}
      <div id={`error-telemetry-${code}`} className="pt-6 text-[10px] text-white/35 font-mono">
        D'CUBAN BEATS CODESYSTEM v1.5 • SECURE CHECKOUT SHIELD ACTIVE
      </div>
    </div>
  );
};
