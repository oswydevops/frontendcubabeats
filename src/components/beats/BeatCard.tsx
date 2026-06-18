import React, { useState } from 'react';
import { Play, Pause, ShoppingCart, Check, Share2, Copy, X, Heart } from 'lucide-react';
import { Beat } from '../../types';
import { useApp } from '../../store/AppContext';
import { Badge } from '../ui/Badge';

interface BeatCardProps {
  beat: Beat;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  const { 
    activeBeat, isPlaying, playBeat, addToCart, cart, navigateTo, addToast,
    likedBeats = [], toggleLikeBeat
  } = useApp();
  const [showShare, setShowShare] = useState(false);

  const isCurrent = activeBeat?.id === beat.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isSold = beat.status === 'sold';
  const isLiked = likedBeats.includes(beat.id);
  
  const inCart = cart.some((item) => item.beat.id === beat.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBeat(beat);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSold) return;
    addToCart(beat, 'basic');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShare(!showShare);
  };

  const shareText = `Escucha "${beat.title}", una excelente pista ${beat.genre} producida por ${beat.producerName} en CubaBeats. ¡Disponible para grabar encima por $${beat.priceBasic} CUP! 🎧🔥`;
  const shareUrl = `${window.location.origin}?beatId=${beat.id}`;

  return (
    <div
      onClick={() => navigateTo('/', { beatId: beat.id })} // Navigate to catalog / detail view
      className={`group relative flex flex-col bg-[#13131F] rounded-2xl border transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer overflow-hidden ${
        isCurrent 
          ? 'border-[#534AB7] shadow-[0_0_20px_rgba(83,74,183,0.3)]' 
          : 'border-[rgba(127,119,221,0.1)] hover:border-[rgba(127,119,221,0.3)]'
      }`}
    >
      {/* Absolute Share Overlay overlay */}
      {showShare && (
        <div 
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering card navigation
          }}
          className="absolute inset-[1px] bg-[#0E0E16]/98 rounded-2xl flex flex-col justify-between p-3.5 z-20 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Title block */}
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider">
              <Share2 size={13} className="text-[#7F77DD]" />
              <span>Compartir Beat</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowShare(false);
              }}
              className="w-5 h-5 rounded-full hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          {/* Social Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 my-auto">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                addToast('Abriendo WhatsApp...', 'success');
                setShowShare(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all text-center space-y-1 group/btn"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 group-hover/btn:scale-110 transition-transform">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-[10px] text-emerald-400 font-bold">WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                addToast('Abriendo Telegram...', 'success');
                setShowShare(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all text-center space-y-1 group/btn"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-sky-400 group-hover/btn:scale-110 transition-transform">
                <path d="M20.665 3.717l-17.73 6.837c-1.21.485-1.203 1.16-.22 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.578.192l-8.533 7.701-.33 4.955c.485 0 .7-.223.972-.485l2.333-2.27 4.852 3.585c.893.493 1.537.24 1.76-.827l3.18-14.992c.325-1.302-.5-1.9-1.353-1.513z"/>
              </svg>
              <span className="text-[10px] text-sky-400 font-bold">Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                addToast('Abriendo Facebook...', 'success');
                setShowShare(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-center space-y-1 group/btn"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-blue-400 group-hover/btn:scale-110 transition-transform">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
              <span className="text-[10px] text-blue-400 font-bold">Facebook</span>
            </a>

            {/* Copy Link */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(shareUrl);
                addToast('¡Enlace del beat copiado al portapapeles!', 'success');
                setShowShare(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-350 border border-gray-500/20 transition-all text-center space-y-1 group/btn cursor-pointer"
            >
              <Copy size={16} className="text-gray-300 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] text-gray-300 font-bold">Copiar</span>
            </button>
          </div>

          {/* Inline footer */}
          <div className="bg-[#1C1C2E] border border-white/5 rounded-xl p-2 text-center text-[9px] text-gray-400">
            Comparte la pista de <span className="text-white font-semibold">{beat.producerName}</span> para darle mayor alcance en ventas.
          </div>
        </div>
      )}

      {/* Cover Image container */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#0D0D14]">
        <img
          src={beat.coverUrl}
          alt={beat.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Cover Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {/* Circular Play Button Bottom Right */}
          <button
            onClick={handlePlayClick}
            className="absolute bottom-3 right-3 w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95"
          >
            {isCurrentlyPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>

        {/* Heart Favorite Button */}
        <button
          id={`like-btn-${beat.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeBeat(beat.id);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black/50 hover:bg-black/75 hover:scale-105 border border-white/5 cursor-pointer backdrop-blur-xs"
          title={isLiked ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart 
            size={14} 
            className={isLiked ? "fill-red-500 text-red-500 animate-pulse" : "text-gray-300 hover:text-white"} 
          />
        </button>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isSold ? (
            <Badge variant="red" className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 shadow-lg">
              Vendido
            </Badge>
          ) : isCurrent ? (
            <Badge variant="purple" className="font-semibold text-[10px] px-2 py-0.5 flex items-center gap-1 shadow-lg bg-brand-primary text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {isCurrentlyPlaying ? 'Reproduciendo' : 'Cargado'}
            </Badge>
          ) : null}
          
          <span className="absolute top-1 right-[-100px] group-hover:right-3 transition-all duration-300 text-[10px] bg-black/60 px-2 py-0.5 rounded-full text-white font-mono backdrop-blur-sm">
            {beat.bpm} BPM
          </span>
        </div>
      </div>

      {/* Info Part */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h4 className="text-white font-medium text-sm truncate group-hover:text-brand-primary-light transition-colors" title={beat.title}>
            {beat.title}
          </h4>
          <p className="text-white/40 text-xs mt-0.5 hover:text-white/60 transition-colors" onClick={(e) => { e.stopPropagation(); navigateTo('/', { producerId: beat.producerId }); }}>
            {beat.producerName}
          </p>

          {/* Miniature Tags */}
          <div className="flex flex-wrap gap-1 mt-2 mb-3">
            {beat.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] font-mono text-white/50 bg-[#1C1C2E] border border-white/5 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            <span className="text-[10px] font-mono text-brand-primary-light bg-brand-primary-dark/20 px-1.5 py-0.5 rounded">
              {beat.key}
            </span>
          </div>
        </div>

        {/* Pricing tag & Cart action */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
          <div>
            <span className="text-[10px] text-white/40 block">Licencia Básica</span>
            <span className="text-brand-primary-light font-semibold text-sm">
              ${beat.priceBasic.toLocaleString()} CUP
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Share Socials Button */}
            <button
              onClick={handleShareClick}
              className="w-8 h-8 rounded-lg bg-white/5 text-white/65 hover:bg-white/12 hover:text-white border border-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Compartir en redes"
            >
              <Share2 size={13} />
            </button>

            {!isSold && (
              <button
                onClick={handleCartClick}
                disabled={inCart}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  inCart 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-brand-primary-light/10 text-brand-primary-light hover:bg-brand-primary/20 border border-[#7F77DD]/25 active:scale-95'
                }`}
                title={inCart ? 'En el carrito' : 'Añadir al carrito'}
              >
                {inCart ? <Check size={14} /> : <ShoppingCart size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
