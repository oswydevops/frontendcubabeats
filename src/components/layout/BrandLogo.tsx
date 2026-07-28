import React from 'react';

interface BrandLogoProps {
  className?: string;
  withBackground?: boolean;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "h-9 w-auto", 
  withBackground = false,
  style
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 140" 
      className={className}
      style={style}
    >
      <defs>
        {/* Gradiente principal para las barras de sonido (De Morado Primario a Rojo Acento) */}
        <linearGradient id="cubaBeatsGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#534AB7" />   {/* Primary */}
          <stop offset="60%" stopColor="#7F77DD" />  {/* Primary Light */}
          <stop offset="100%" stopColor="#E24B4A" /> {/* Accent Red */}
        </linearGradient>
        
        {/* Gradiente suave para el texto BEATS */}
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF9F27" />   {/* Accent Amber */}
          <stop offset="100%" stopColor="#E24B4A" /> {/* Accent Red */}
        </linearGradient>
      </defs>
      
      {/* Fondo de la tarjeta usando tu Dark Card */}
      {withBackground && (
        <rect width="100%" height="100%" fill="#1C1C2E" rx="16"/>
      )}

      {/* Contenedor global centrado y alineado */}
      <g transform={withBackground ? "translate(30, 20)" : "translate(0, 20)"}>
        
        {/* ISOTIPO: Estrella + Onda de Audio */}
        <g transform="translate(10, 10)">
          {/* Lado izquierdo de la estrella (Sólido en Primary) */}
          <path d="M40 5 L27 32 L2 37 L22 58 L17 87 L40 73 Z" fill="#534AB7" />
          
          {/* Lado derecho de la estrella (Se transforma en barras de ecualizador) */}
          {/* Las alturas y posiciones en 'y' están calculadas para mantener la silueta de la estrella */}
          <rect x="46" y="14" width="6" height="52" rx="3" fill="url(#cubaBeatsGrad)" />
          <rect x="56" y="26" width="6" height="43" rx="3" fill="url(#cubaBeatsGrad)" />
          <rect x="66" y="37" width="6" height="30" rx="3" fill="url(#cubaBeatsGrad)" />
          {/* La última barra rompe con el Accent Amber para darle el toque de pico de volumen */}
          <rect x="76" y="48" width="6" height="15" rx="3" fill="#EF9F27" />
        </g>

        {/* TIPOGRAFÍA Y TEXTOS (Alineación vertical perfecta con el isotipo) */}
        {/* Nombre de la plataforma */}
        <text 
          x="115" 
          y="54" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          fontSize="34" 
          fontWeight="900" 
          fill="#FFFFFF" 
          letterSpacing="1.5"
        >
          D'CUBAN<tspan fill="url(#textGrad)">BEATS</tspan>
        </text>
        
        {/* Subtexto de tu Marca Personal / Rol */}
        <text 
          x="117" 
          y="78" 
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          fontSize="11" 
          fontWeight="600" 
          fill="#7F77DD" 
          letterSpacing="10"
        >
          PLATFORM SELLER
        </text>
      </g>
    </svg>
  );
};
