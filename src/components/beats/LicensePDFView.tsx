import React from 'react';
import { BrandLogo } from '../layout/BrandLogo';
import { FileText, Download, ShieldCheck, CheckCircle, Landmark, User, Calendar, CreditCard, Award } from 'lucide-react';
import { Order, Beat } from '../../types';

interface LicensePDFViewProps {
  order: Order;
  beat?: Beat;
  onClose?: () => void;
}

export const LicensePDFView: React.FC<LicensePDFViewProps> = ({ order, beat, onClose }) => {
  const producerCustomTerms = beat?.customLicenseClause || 
    `• El productor ("${order.producerName}") concede al artista ("${order.buyerName}") una licencia de uso no exclusiva para la grabación, masterización y distribución de una (1) sola canción/obra derivada sobre esta base musical.
• Se permite la distribución digital comercial en plataformas (Spotify, Apple Music, YouTube) con un límite de 50,000 reproducciones monetizadas.
• El artista debe acreditar al productor en todos los créditos y metadatos oficiales como: "Prod. ${order.producerName}".
• Queda prohibida la reventa, sublicencia, o redistribución de la base instrumental de manera aislada sin el consentimiento expreso por escrito de ${order.producerName}.`;

  const platformTerms = 
    `1. MARCO LEGAL DE OPERACIÓN: D'Cuban Beats (en adelante "La Plataforma") actúa como la entidad gestora e intermediaria tecnológica en Cuba de propiedad intelectual musical. Certifica de manera digital y formal que la presente transacción financiera ha sido validada por el productor vendedor y los fondos correspondientes han sido acreditados.
2. GARANTÍAS DE SEGURIDAD DE ARCHIVOS: La Plataforma asegura la entrega de los archivos originales de alta fidelidad (formato comprimido WAV/STEMS) asociados con esta orden.
3. INTRANSFERIBILIDAD Y REGISTRO: Esta licencia es personal, única e intransferible. Está vinculada permanentemente al ID de transacción bancaria ${order.transactionId || 'N/D'} y al número de referencia de orden ${order.id}. Cualquier falsificación, copia no autorizada o alteración de esta licencia anulará de manera automática los derechos de explotación sobre la obra de conformidad con la Ley de Derecho de Autor de la República de Cuba e instrumentos internacionales (Convenio de Berna).`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#13131F] border border-brand-border/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left max-h-[85vh]">
      {/* Dynamic style tag that activates ONLY when printing the page */}
      <style>{`
        @media print {
          /* Hide everything except the printable container */
          body * {
            visibility: hidden !important;
          }
          #printable-license-content, #printable-license-content * {
            visibility: visible !important;
          }
          #printable-license-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            color: black !important;
            padding: 30px !important;
            margin: 0 !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          /* Custom overrides to make colors print nicely in light mode */
          #printable-license-content .text-white {
            color: #000000 !important;
          }
          #printable-license-content .text-slate-400,
          #printable-license-content .text-slate-300,
          #printable-license-content .text-gray-450 {
            color: #333333 !important;
          }
          #printable-license-content .bg-brand-surface,
          #printable-license-content .bg-white\\/2,
          #printable-license-content .bg-[#0F172A],
          #printable-license-content .bg-brand-card\\/40 {
            background-color: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }
          #printable-license-content .border-brand-border\\/30,
          #printable-license-content .border-white\\/5,
          #printable-license-content .border-slate-800 {
            border-color: #cbd5e1 !important;
          }
          /* Prevent buttons or close controls from printing */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Actions Header */}
      <div className="p-4 bg-[#0D0D14] border-b border-white/5 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <FileText className="text-[#7F77DD]" size={18} />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
            Contrato de Licencia Oficial Certificado
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={13} />
            Imprimir / Guardar PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Main License Viewport Content */}
      <div className="overflow-y-auto p-6 md:p-8 space-y-6 flex-grow" id="printable-license-content">
        
        {/* Document Header with Logo and Stamp */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-brand-border/30">
          <div className="space-y-2">
            <BrandLogo className="h-14 w-auto text-white" />
            <p className="text-[10px] text-slate-400 font-sans tracking-wide">
              Plataforma de Licenciamiento de Beats en Cuba • www.dcubanbeats.cu
            </p>
          </div>
          
          <div className="p-3 bg-indigo-950/20 border border-[#7F77DD]/30 rounded-2xl flex items-center gap-2 max-w-xs bg-brand-surface">
            <ShieldCheck className="text-emerald-400 flex-shrink-0" size={28} />
            <div className="text-left font-sans">
              <span className="text-[10px] font-extrabold text-emerald-400 block uppercase tracking-wider leading-none">
                Licencia Certificada
              </span>
              <span className="text-[9px] text-slate-300 block font-mono mt-1">
                SECURE_HASH_APPROVED_{order.id}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider font-sans">
            CONTRATO DE LICENCIA DE EXPLOTACIÓN MUSICAL
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            Licencia ID: <strong className="text-indigo-300">{order.id}</strong> • Fecha de Emisión: {order.date}
          </span>
        </div>

        {/* Payment and Transaction Summary Grid */}
        <div className="bg-white/2 border border-brand-border/30 rounded-2xl p-4 space-y-3 bg-brand-surface">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F77DD] font-mono block">
            I. DECLARACIÓN DE TRANSACCIÓN Y COMPROBANTE DE COMPRA
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-left">
            <div className="space-y-1 p-2 bg-black/10 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Artista (Licenciatario)</span>
              <span className="font-bold text-white block">{order.buyerName}</span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">{order.buyerEmail || 'artista@dcubanbeats.com'}</span>
            </div>
            
            <div className="space-y-1 p-2 bg-black/10 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Productor (Licenciante)</span>
              <span className="font-bold text-white block">{order.producerName}</span>
              <span className="text-[10px] text-slate-400 block font-mono">ID Vendedor: {order.producerId}</span>
            </div>

            <div className="space-y-1 p-2 bg-black/10 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Pista Musical Adquirida</span>
              <span className="font-black text-[#7F77DD] block">{order.beatTitle}</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                Valor: ${order.amount} {order.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-brand-border/20 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-sans">
              <CreditCard size={14} className="text-indigo-400 flex-shrink-0" />
              <span>
                Método de Pago: <strong className="text-white font-mono">{order.method}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
              <Landmark size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                Ref. Bancaria: <strong className="text-white">{order.transactionId || 'No asignada'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Producer Custom Licensing Clauses */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 border-b border-brand-border/20 pb-1.5 text-left">
            <Award className="text-[#EF9F27]" size={15} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EF9F27] font-mono">
              II. TÉRMINOS ESPECIFICADOS POR EL PRODUCTOR
            </span>
          </div>
          <div className="bg-black/15 p-4 rounded-xl border border-brand-border/25 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed text-left font-sans bg-brand-surface">
            {producerCustomTerms}
          </div>
        </div>

        {/* Platform Legal Framework */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 border-b border-brand-border/20 pb-1.5 text-left">
            <CheckCircle className="text-[#7F77DD]" size={15} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F77DD] font-mono">
              III. CLÁUSULAS REGULADORAS DE LA PLATAFORMA D'CUBAN BEATS
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 whitespace-pre-wrap leading-relaxed text-left font-sans font-normal">
            {platformTerms}
          </p>
        </div>

        {/* Digital Stamps, Seals, and Signature blocks */}
        <div className="pt-6 border-t border-brand-border/30 grid grid-cols-1 md:grid-cols-3 gap-6 text-center font-sans text-xs">
          
          <div className="space-y-3">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Firma del Productor</span>
            <div className="h-10 flex items-end justify-center border-b border-slate-700/50 pb-1">
              <span className="font-serif italic text-white text-sm tracking-wide">{order.producerName}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono block">Firma electrónica de Vendedor</span>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Firma de Conformidad Artista</span>
            <div className="h-10 flex items-end justify-center border-b border-slate-700/50 pb-1">
              <span className="font-serif italic text-white text-sm tracking-wide">{order.buyerName}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono block">Firma electrónica de Licenciatario</span>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Sello de Seguridad D'Cuban Beats</span>
            <div className="h-10 flex items-center justify-center">
              <div className="border border-[#7F77DD]/30 px-3 py-1 rounded bg-[#7F77DD]/5 text-[8.5px] font-mono text-indigo-300 font-bold tracking-tight uppercase leading-none">
                ✓ VERIFICADO COMPLIANCE
                <br />
                <span className="text-[7.5px] text-slate-400 block mt-0.5">PLATFORM_STAMP_{order.id}</span>
              </div>
            </div>
            <span className="text-[9px] text-slate-500 font-mono block">Firma digital certificada</span>
          </div>

        </div>

        {/* Disclaimer footer */}
        <div className="pt-4 text-center text-[9px] text-slate-500 font-sans border-t border-brand-border/20 no-print">
          © {new Date().getFullYear()} D'Cuban Beats S.A. Todos los derechos reservados. Este documento cuenta con validez legal comercial en todo el territorio cubano y es auditable en línea por terceros autorizados.
        </div>
      </div>
    </div>
  );
};
