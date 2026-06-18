import React, { useRef } from 'react';
import { Play, Pause, Square, Volume2, HardDrive, Share2, ListMusic, Shuffle, SkipBack, SkipForward, Repeat, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const Player: React.FC = () => {
  const { activeBeat, isPlaying, togglePlay, playProgress, setPlayProgress, playbackTime, setPlaybackTime, volume, setVolume, beats, closePlayer } = useApp();
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  if (!activeBeat) return null;

  // Format Helper: 45 -> "0:45", 204 -> "3:24"
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (progressRef.current && activeBeat) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickPercent = Math.max(0, Math.min(100, (clickX / width) * 100));
      
      const [m, s] = activeBeat.duration.split(':').map(Number);
      const totalSec = m * 60 + s;
      const calculatedSec = Math.floor((clickPercent / 100) * totalSec);
      
      setPlayProgress(clickPercent);
      setPlaybackTime(calculatedSec);
    }
  };

  const handleVolumeBarClick = (e: React.MouseEvent) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickVol = Math.max(0, Math.min(1, clickX / width));
      setVolume(clickVol);
    }
  };

  const skipNext = () => {
    const idx = beats.findIndex(b => b.id === activeBeat.id);
    if (idx !== -1 && idx < beats.length - 1) {
      setPlayProgress(0);
      setPlaybackTime(0);
      // Play next beat
      beats[idx + 1] && togglePlay(); // trigger transition
    }
  };

  const skipPrev = () => {
    const idx = beats.findIndex(b => b.id === activeBeat.id);
    if (idx > 0) {
      setPlayProgress(0);
      setPlaybackTime(0);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0D0D14]/95 backdrop-blur-lg border-t border-[rgba(127,119,221,0.25)] flex items-center justify-between px-6 z-50 text-white transition-all select-none">
      
      {/* Left: Metadata thumbnail */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-brand-primary/20">
          <img 
            src={activeBeat.coverUrl} 
            alt="active cover" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center gap-0.5 backdrop-blur-neutral">
              <span className="w-1 bg-[#7F77DD] animate-[bounce_1s_infinite_100ms]" style={{ height: '50%' }}></span>
              <span className="w-1 bg-[#7F77DD] animate-[bounce_1.2s_infinite]" style={{ height: '75%' }}></span>
              <span className="w-1 bg-[#7F77DD] animate-[bounce_0.8s_infinite_300ms]" style={{ height: '40%' }}></span>
            </div>
          )}
        </div>
        <div className="text-left truncate">
          <h5 className="text-white font-medium text-xs truncate max-w-[140px]" title={activeBeat.title}>
            {activeBeat.title}
          </h5>
          <p className="text-white/40 text-[10px] truncate max-w-[140px]">
            {activeBeat.producerName}
          </p>
        </div>
      </div>

      {/* Center: Controls & Timelines */}
      <div className="flex flex-col items-center flex-grow max-w-xl px-4">
        {/* Playback action items */}
        <div className="flex items-center gap-4 mb-2">
          <button className="text-white/40 hover:text-white/90 p-1 cursor-pointer transition-colors hidden sm:block">
            <Shuffle size={14} />
          </button>
          <button onClick={skipPrev} className="text-white/60 hover:text-white p-1 cursor-pointer transition-colors">
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white text-[#0D0D14] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={skipNext} className="text-white/60 hover:text-white p-1 cursor-pointer transition-colors">
            <SkipForward size={16} fill="currentColor" />
          </button>
          <button className="text-white/40 hover:text-white/90 p-1 cursor-pointer transition-colors hidden sm:block">
            <Repeat size={14} />
          </button>
        </div>

        {/* Play progress bar slider wrapper */}
        <div className="w-full flex items-center gap-3 text-[10px] text-white/50 font-mono">
          <span>{formatTime(playbackTime)}</span>
          
          <div 
            ref={progressRef}
            onClick={handleProgressBarClick}
            className="relative flex-grow h-1.5 bg-[#1C1C2E] rounded-full cursor-pointer hover:h-2 transition-all group overflow-hidden border border-white/5"
          >
            <div 
              style={{ width: `${playProgress}%` }}
              className="absolute left-0 top-0 bottom-0 gradient-primary rounded-full"
            />
          </div>
          
          <span>{activeBeat.duration}</span>
        </div>
      </div>

      {/* Right: Sound volume, preview badge */}
      <div className="flex items-center gap-4 w-1/4 justify-end min-w-[140px]">
        {/* Volume controls */}
        <div className="hidden sm:flex items-center gap-2">
          <Volume2 size={15} className="text-white/50" />
          <div 
            ref={volumeRef}
            onClick={handleVolumeBarClick}
            className="relative w-16 h-1 bg-[#1C1C2E] rounded-full cursor-pointer group hover:h-1.5 transition-all overflow-hidden"
          >
            <div 
              style={{ width: `${volume * 100}%` }}
              className="absolute left-0 top-0 bottom-0 bg-brand-primary-light rounded-full"
            />
          </div>
        </div>

        {/* Preview status tag */}
        <span className="px-2 py-1 bg-brand-primary-light/10 text-brand-primary-light border border-brand-primary-light/25 font-semibold text-[10px] rounded uppercase font-mono tracking-wider">
          Demo Track
        </span>

        {/* Close Button */}
        <button 
          onClick={closePlayer} 
          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-white/50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-white/5"
          title="Cerrar Reproductor"
        >
          <X size={14} />
        </button>
      </div>

    </div>
  );
};
