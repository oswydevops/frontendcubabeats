import React, { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Music, Trash2, Search, SlidersHorizontal, Eye } from 'lucide-react';

export const AdminBeats: React.FC = () => {
  const { beats, deleteBeat } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBeats = useMemo(() => {
    return beats.filter((b) => {
      return b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             b.producerName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [beats, searchQuery]);

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      
      {/* Header */}
      <div className="border-b border-brand-border/25 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Music className="text-[#7F77DD]" /> Moderar Catálogo de Instrumentales
        </h2>
        <p className="text-xs text-gray-400">Inspecciona y modera pistas publicadas por todos los productores en el catálogo nacional.</p>
      </div>

      {/* Toolbar filters */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
        <input
          type="text"
          placeholder="Buscar por beat, productor, hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1C1C2E] border border-brand-border/40 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-[#7F77DD] transition-all"
        />
      </div>

      {/* Beats Moderation table list */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-[#1C1C2E]/40 border-b border-brand-border/20 text-gray-400 font-bold uppercase select-none">
                <th className="py-3 px-4">Portada</th>
                <th className="py-3 px-4">Beat / Pista</th>
                <th className="py-3 px-4">Productor Creador</th>
                <th className="py-3 px-4">Género / BPM</th>
                <th className="py-3 px-4 text-center">Precio Básico</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Moderación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/10 text-gray-300">
              {filteredBeats.map((b) => (
                <tr key={b.id} className="hover:bg-brand-card/25 transition-colors">
                  <td className="py-3.5 px-4 animate-in">
                    <img 
                      src={b.coverUrl} 
                      className="w-9 h-9 rounded-lg object-cover border border-brand-border/20 flex-shrink-0" 
                      alt="mini art" 
                      referrerPolicy="no-referrer"
                    />
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white truncate max-w-[200px]" title={b.title}>
                    {b.title}
                    <span className="block text-[9px] text-[#7F77DD] font-mono mt-0.5">{b.key} scale</span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-white">{b.producerName}</td>
                  
                  <td className="py-3.5 px-4 leading-normal select-none">
                    <span className="font-semibold">{b.genre}</span>
                    <span className="block text-[10px] text-gray-500 font-mono">{b.bpm} BPM</span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                    ${b.priceBasic} CUP
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {b.status === 'sold' ? (
                      <Badge variant="red" className="text-[9px] bg-brand-accent-red/10 text-brand-accent-red border border-brand-accent-red/20">Vendido Excl.</Badge>
                    ) : (
                      <Badge variant="green" className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Disponible</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => deleteBeat(b.id)}
                      className="p-1 px-2.5 bg-brand-accent-red/10 text-brand-accent-red rounded-lg hover:bg-brand-accent-red/20 transition-colors cursor-pointer text-[11px] font-bold inline-flex items-center gap-1 border border-brand-accent-red/15"
                    >
                      <Trash2 size={12} />
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
