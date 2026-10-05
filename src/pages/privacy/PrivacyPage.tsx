import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const PrivacyPage: React.FC = () => {
  const { navigateTo } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0A10] text-slate-300 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Barra superior simple */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft size={14} />
            <span>Volver al Catálogo</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <Printer size={14} />
            <span>Imprimir</span>
          </button>
        </div>

        {/* Encabezado del Documento */}
        <div className="mb-10 text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
            Políticas de Privacidad
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            D'Cuban Beats • Última actualización: Septiembre de 2026
          </p>
        </div>

        {/* Contenido secuencial por cláusula */}
        <div className="space-y-10 text-left text-sm leading-relaxed text-slate-300 divide-y divide-white/10">

          {/* 1. Introducción y Responsable del Sitio */}
          <section className="pt-6 first:pt-0 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              1. Introducción y Responsable del Sitio
            </h2>
            <p>
              El presente documento establece las políticas de privacidad y el tratamiento de datos personales en <strong>D'Cuban Beats</strong>. Asumimos el compromiso formal y prioritario de proteger, resguardar y gestionar de forma responsable la información que los usuarios nos confían al utilizar nuestros servicios.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>Punto clave:</strong> Al registrarte, acceder o utilizar la plataforma, aceptas expresamente la recopilación, almacenamiento y tratamiento de tus datos personales conforme a los términos descritos en este documento, necesarios para el correcto funcionamiento del servicio de compra y venta de instrumentales y licencias musicales.
              </li>
            </ul>
          </section>

          {/* 2. Datos Personales que Recolectamos */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              2. Datos Personales que Recolectamos
            </h2>
            <p>
              Recolectamos exclusivamente la información estrictamente requerida para operar y brindar el servicio. Clasificamos estos datos en las siguientes categorías:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Información de la Cuenta:</strong> Nombre, apellidos, dirección de correo electrónico, nombre de usuario y contraseña cifrada.
              </li>
              <li>
                <strong>Información del Perfil Público:</strong> Fotografía de perfil o avatar, ciudad de residencia, enlaces a perfiles de redes sociales y el catálogo de pistas de audio, beats o librerías sonoras que el productor suba a la plataforma.
              </li>
              <li>
                <strong>Datos de Transacciones y Pagos:</strong> Información necesaria para procesar cobros y pagos de licencias (por ejemplo, correos electrónicos vinculados a pasarelas de pago, direcciones de billeteras digitales o datos de cuentas bancarias nacionales para transferencias en CUP o MLC).
              </li>
              <li>
                <strong>Datos de Uso:</strong> Dirección IP, tipo de dispositivo, sistema operativo y navegador web, recopilados de forma técnica y automática para garantizar la seguridad, compatibilidad y correcta carga del sitio web.
              </li>
            </ul>
          </section>

          {/* 3. Cómo Utilizamos tu Información */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              3. Cómo Utilizamos tu Información
            </h2>
            <p>
              El tratamiento de los datos recolectados se limita a los fines operacionales del negocio:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                Para crear, autenticar, mantener y administrar las cuentas de usuario de productores musicales y artistas compradores.
              </li>
              <li>
                Para procesar de forma segura las transacciones comerciales, descargas de archivos de audio de alta fidelidad (WAV/MP3/Stems) y la generación y entrega de los contratos digitales de licencia de los beats.
              </li>
              <li>
                Para enviar notificaciones técnicas, confirmaciones de transacciones, avisos de actualizaciones esenciales en la plataforma y responder a consultas de soporte técnico.
              </li>
              <li>
                Para monitorear y optimizar el rendimiento técnico del sitio web, prevenir fraudes y detectar contenidos que infrinjan derechos de autor.
              </li>
            </ul>
          </section>

          {/* 4. Compartición de Datos */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              4. Compartición de Datos (El flujo del Marketplace)
            </h2>
            <p>
              Al ser D'Cuban Beats un mercado bilateral que conecta directamente a creadores musicales con compradores, se aplica la siguiente dinámica de datos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Nota importante para el usuario:</strong> Cuando un comprador adquiere un beat o descarga una licencia musical, la plataforma compartirá ciertos datos con el vendedor (como el nombre de usuario, correo electrónico y detalles de la transacción). Esto se efectúa de manera exclusiva para que el productor pueda respaldar jurídicamente los términos de la licencia de su música y ofrecer asistencia o soporte si es necesario.
              </li>
              <li>
                <strong>Restricción estricta:</strong> Los vendedores y productores tienen expresamente prohibido utilizar esta información de contacto para fines ajenos a la transacción comercial realizada, así como venderla, cederla o transferirla a terceras personas.
              </li>
              <li>
                <strong>Requerimientos Legales:</strong> Los datos personales únicamente serán divulgados a autoridades administrativas o judiciales competentes en caso de existir una orden o requerimiento legal vinculante, o cuando sea estrictamente necesario para proteger los derechos de autor y la propiedad intelectual de la plataforma.
              </li>
            </ul>
          </section>

          {/* 5. Cookies y Tecnologías de Rastreo */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              5. Cookies y Tecnologías de Rastreo
            </h2>
            <p>
              Utilizamos una gestión simplificada y orientada a la operatividad del sitio:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>Punto clave:</strong> Empleamos únicamente cookies técnicas y de almacenamiento local esenciales para recordar la sesión activa del usuario (evitando la necesidad de autenticarse repetidamente en cada navegación) y para preservar los instrumentales y artículos añadidos al carrito de compras durante la sesión.
              </li>
            </ul>
          </section>

          {/* 6. Seguridad y Retención de los Datos */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              6. Seguridad y Retención de los Datos
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                Implementamos medidas técnicas y organizativas comercialmente razonables y actualizadas para resguardar la información contra accesos no autorizados, alteración, pérdida o divulgación indebida.
              </li>
              <li>
                Los datos personales se conservarán exclusivamente mientras la cuenta del usuario permanezca activa en la plataforma o durante el periodo necesario para cumplir con el respaldo legal y fiscal de las transacciones y contratos de licencias musicales formalizadas.
              </li>
            </ul>
          </section>

          {/* 7. Derechos del Usuario y Contacto */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              7. Derechos del Usuario y Contacto
            </h2>
            <p>
              Garantizamos el control directo y la soberanía de los usuarios sobre sus datos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                Los usuarios tienen el derecho en todo momento de acceder, rectificar o actualizar sus datos personales de forma autónoma desde la sección de configuración de su perfil.
              </li>
              <li>
                Si un usuario desea dar de baja su cuenta de manera definitiva, ejercer sus derechos de cancelación de datos o tiene dudas sobre el tratamiento de su información, puede comunicarse directamente con nuestro equipo a través del correo oficial de soporte: <a href="mailto:soporte@dcubanbeats.cu" className="text-indigo-400 hover:underline font-mono">soporte@dcubanbeats.cu</a>.
              </li>
            </ul>
          </section>

        </div>

        {/* Pie de página del documento */}
        <div className="mt-14 pt-6 border-t border-white/10 text-xs text-slate-500 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} D'Cuban Beats. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                navigateTo('/terminos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Términos y Condiciones
            </button>
            <span>•</span>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Subir al inicio ↑
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
