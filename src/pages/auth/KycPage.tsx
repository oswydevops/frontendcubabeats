import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Check, ShieldCheck, ClipboardCheck, Camera, FileText, Upload, Sparkles } from 'lucide-react';

export const KycPage: React.FC = () => {
  const { 
    kycStep, setKycStep, kycData, setKycDocType, setKycImage, completeKyc, addToast 
  } = useApp();

  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper mock upload
  const simulateUpload = (field: 'frontImage' | 'backImage' | 'selfieImage') => {
    setUploadProgress(20);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setKycImage(field, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==');
          addToast('Documento subido correctamente', 'success');
          return 0;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleNextStep = () => {
    if (kycStep === 1) {
      if (!kycData.docType) {
        addToast('Selecciona un tipo de documento oficial primero', 'error');
        return;
      }
      setKycStep(2);
    } else if (kycStep === 2) {
      if (!kycData.frontImage || (!kycData.backImage && kycData.docType === 'id_card')) {
        addToast('Sube las imágenes requeridas para continuar', 'error');
        return;
      }
      setKycStep(3);
    } else if (kycStep === 3) {
      if (!kycData.selfieImage) {
        addToast('La foto selfie con el documento es obligatoria', 'error');
        return;
      }
      completeKyc();
    }
  };

  const handleBack = () => {
    if (kycStep > 1) {
      setKycStep(kycStep - 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6 bg-[#13131F] border border-[rgba(127,119,221,0.2)] rounded-3xl p-8 shadow-2xl text-left">
      <div className="space-y-6">
        
        {/* Stepper Status Circles */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-[#7F77DD]" size={20} />
            <div>
              <h3 className="text-sm font-bold text-white">Verificación de Identidad (KYC)</h3>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">Exigido para cobros en Transfermóvil/EnZona</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                  kycStep === s 
                    ? 'bg-brand-primary text-white scale-110 ring-4 ring-[#534AB7]/20' 
                    : kycStep > s 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/10 text-white/50'
                }`}
              >
                {kycStep > s ? <Check size={10} /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: SELECT DOCUMENT */}
        {kycStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Paso 1: Selecciona el documento</h4>
              <p className="text-xs text-white/50">Debes elegir el carné oficial que vas a presentar para acreditar tu titularidad.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setKycDocType('id_card')}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all space-y-3 ${
                  kycData.docType === 'id_card'
                    ? 'bg-brand-primary/10 border-brand-primary shadow-lg ring-1 ring-brand-primary'
                    : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                }`}
              >
                <FileText className={kycData.docType === 'id_card' ? 'text-brand-primary-light' : 'text-white/40'} size={24} />
                <div className="space-y-1">
                  <span className="text-xs font-bold block text-white">Carné de Identidad Cubano</span>
                  <span className="text-[10px] text-white/40 block">Formato tradicional en papel o tarjeta magnética. Coincidencia completa de RUT.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKycDocType('passport')}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all space-y-3 ${
                  kycData.docType === 'passport'
                    ? 'bg-brand-primary/10 border-brand-primary shadow-lg ring-1 ring-brand-primary'
                    : 'bg-[#1C1C2E] border-white/5 hover:border-white/10'
                }`}
              >
                <ShieldCheck className={kycData.docType === 'passport' ? 'text-brand-primary-light' : 'text-white/40'} size={24} />
                <div className="space-y-1">
                  <span className="text-xs font-bold block text-white">Pasaporte Oficial</span>
                  <span className="text-[10px] text-white/40 block">Pasaporte de la República de Cuba activo o pasaporte extranjero internacional.</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UPLOAD PORTRAITS */}
        {kycStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Paso 2: Sube las fotos de tu carné</h4>
              <p className="text-xs text-white/50">Toma una fotografía nítida donde se lean todos los datos, números y fecha de caducidad.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Front side upload */}
              <div className="bg-[#1C1C2E] border border-white/5 p-4 rounded-xl text-center space-y-3">
                <span className="text-xs font-semibold block text-white">Cara Delantera (Anverso)</span>
                
                {kycData.frontImage ? (
                  <div className="h-24 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center p-2">
                    <Check className="text-emerald-400 mb-1" size={18} />
                    <span className="text-[10px] text-emerald-400 font-bold">Imagen Lista</span>
                    <button onClick={() => setKycImage('frontImage', '')} className="text-[9px] text-red-400 hover:underline cursor-pointer mt-1 font-semibold">Eliminar</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => simulateUpload('frontImage')}
                    className="w-full h-24 border border-dashed border-white/10 hover:border-[#7F77DD] rounded-lg flex flex-col items-center justify-center p-4 transition-colors cursor-pointer"
                  >
                    <Upload size={16} className="text-white/30 mb-1" />
                    <span className="text-[10px] uppercase font-bold text-white/50">Cargar Foto Anverso</span>
                  </button>
                )}
              </div>

              {/* Back side upload (only if ID Card) */}
              {kycData.docType === 'id_card' ? (
                <div className="bg-[#1C1C2E] border border-white/5 p-4 rounded-xl text-center space-y-3">
                  <span className="text-xs font-semibold block text-white">Reverso (Posterior)</span>
                  
                  {kycData.backImage ? (
                    <div className="h-24 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center p-2">
                      <Check className="text-emerald-400 mb-1" size={18} />
                      <span className="text-[10px] text-emerald-400 font-bold">Imagen Lista</span>
                      <button onClick={() => setKycImage('backImage', '')} className="text-[9px] text-red-400 hover:underline cursor-pointer mt-1 font-semibold">Eliminar</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => simulateUpload('backImage')}
                      className="w-full h-24 border border-dashed border-white/10 hover:border-[#7F77DD] rounded-lg flex flex-col items-center justify-center p-4 transition-colors cursor-pointer"
                    >
                      <Upload size={16} className="text-white/30 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-white/50">Cargar Foto Reverso</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-brand-primary-dark/10 p-4 rounded-xl border border-white/5 flex items-center justify-center text-center">
                  <p className="text-[10px] text-white/40">Para pasaportes solo se requiere la hoja principal delantera.</p>
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-[#1C1C2E] h-1.5 rounded-full overflow-hidden">
                <div className="gradient-primary h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SELFIE PHOTO */}
        {kycStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Paso 3: Foto Selfie sosteniendo el carné</h4>
              <p className="text-xs text-white/50">Tómate una selfie de frente sosteniendo el carné elegido junto a tu rostro, asegurando que tus facciones y los datos de la identificación se distingan perfectamente.</p>
            </div>

            <div className="bg-[#1C1C2E] border border-white/5 p-5 rounded-xl text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-brand-primary-light">
                <Camera size={26} />
              </div>

              {kycData.selfieImage ? (
                <div className="max-w-xs mx-auto py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="text-emerald-400" size={16} />
                    <span className="text-[11px] text-emerald-400 font-bold">Foto Capturada y Lista</span>
                  </div>
                  <button onClick={() => setKycImage('selfieImage', '')} className="text-xs text-red-400 hover:underline cursor-pointer font-semibold">Reiniciar</button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => simulateUpload('selfieImage')}
                  className="mx-auto"
                >
                  <Camera size={14} className="mr-1.5" />
                  Tomar Selfie de Prueba
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Actions Button */}
        <div className="flex gap-3 justify-between pt-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            disabled={kycStep === 1}
          >
            Atrás
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleNextStep}
          >
            {kycStep === 3 ? 'Completar y Guardar' : 'Siguiente Paso'}
          </Button>
        </div>

      </div>
    </div>
  );
};
