import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const TermsPage: React.FC = () => {
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
            Términos y Condiciones de Uso
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            D'Cuban Beats • Última actualización: Septiembre de 2026
          </p>
        </div>

        {/* Contenido secuencial por cláusula */}
        <div className="space-y-10 text-left text-sm leading-relaxed text-slate-300 divide-y divide-white/10">

          {/* 1. Aceptación de los Términos */}
          <section className="pt-6 first:pt-0 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              1. Aceptación de los Términos
            </h2>
            <p>
              Bienvenido a <strong>D'Cuban Beats</strong>. Al hacer clic en "Registrarse", acceder o utilizar nuestra plataforma web y servicios asociados, usted declara que ha leído, comprendido y aceptado quedar legalmente vinculado por la totalidad de las reglas y condiciones aquí descritas.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>Punto clave:</strong> Si no está de acuerdo con alguna de las reglas o términos de este documento, debe abstenerse de utilizar la plataforma y de registrar una cuenta.
              </li>
            </ul>
          </section>

          {/* 2. Registro y Seguridad de la Cuenta */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              2. Registro y Seguridad de la Cuenta
            </h2>
            <p>
              Para acceder a las funciones de compra, venta o publicación de beats en la plataforma, es necesario crear una cuenta personal.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Elegibilidad:</strong> El usuario debe tener al menos 18 años de edad para operar de forma autónoma. Los menores de edad sólo podrán utilizar la plataforma bajo la supervisión directa y consentimiento de sus padres o tutores legales.
              </li>
              <li>
                <strong>Responsabilidad:</strong> El usuario es el único responsable de salvaguardar su contraseña y datos de autenticación, así como de todas las acciones, transacciones o actividades que ocurran dentro de su perfil.
              </li>
              <li>
                <strong>Veracidad:</strong> Todos los datos introducidos en la plataforma (nombre completo, correo electrónico, documento de verificación y métodos de pago) deben ser reales, exactos y estar debidamente actualizados.
              </li>
            </ul>
          </section>

          {/* 3. Propiedad Intelectual y Licencias */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              3. Propiedad Intelectual y Licencias (El núcleo del negocio)
            </h2>
            <p>
              D'Cuban Beats opera bajo principios estrictos de respeto a los derechos de autor de la música y producciones instrumentales:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Intermediario:</strong> D'Cuban Beats no compra ni vende la música directamente, ni es propietario de las composiciones. La plataforma opera únicamente como un catálogo y mercado tecnológico que facilita la conexión directa entre productores musicales y compradores o artistas.
              </li>
              <li>
                <strong>Derechos de Autor:</strong> El productor retiene en todo momento la autoría original de su obra. Al subir una pista o instrumental, el productor garantiza formalmente que es el creador original y que no está usando samples (muestras sonoras de otras canciones o fonogramas) sin contar con la debida autorización o licencia correspondiente.
              </li>
              <li>
                <strong>Tipos de Licencias:</strong> Lo que el comprador adquiere al efectuar un pago no es la propiedad de la canción (a menos que adquiera una licencia "Exclusiva"), sino un derecho limitado de uso (licencia básica o comercial) sujeto a las condiciones y límites definidos para cada beat (límites de reproducciones en streaming, videos o radio).
              </li>
              <li>
                <strong>Cláusula de protección para la plataforma:</strong> Si un productor sube un beat con un sample robado, no autorizado o que infrinja derechos de terceros y se recibe un reclamo o demanda legal, dicho productor asume toda la responsabilidad y exime por completo a D'Cuban Beats y a sus administradores de cualquier responsabilidad legal, civil y económica.
              </li>
            </ul>
          </section>

          {/* 4. Pagos, Comisiones y Retiros */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              4. Pagos, Comisiones y Retiros
            </h2>
            <p>
              El procesamiento financiero y la gestión de saldos se rige bajo los siguientes lineamientos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Métodos de Pago:</strong> Las transacciones se efectúan a través de las pasarelas integradas, transferencias electrónicas y billeteras digitales habilitadas en el sitio (Transfermóvil, EnZona, QvaPay o transferencias bancarias directas en CUP y MLC).
              </li>
              <li>
                <strong>Comisión de la Plataforma:</strong> La plataforma retiene un porcentaje de comisión por cada transacción completada con éxito, el cual varía de acuerdo al plan de membresía activo del productor (0% de comisión para planes Elite, y el porcentaje estándar para planes inferiores).
              </li>
              <li>
                <strong>Retiros de Saldo:</strong> Los productores que acumulen fondos en su balance podrán solicitar el retiro hacia sus cuentas o monederos una vez superado el monto mínimo estipulado. Las transferencias se procesan en un plazo estimado de 24 a 48 horas hábiles tras la verificación.
              </li>
            </ul>
          </section>

          {/* 5. Reglas de Comportamiento */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              5. Reglas de Comportamiento (Uso Aceptable)
            </h2>
            <p>
              Para mantener una comunidad profesional, queda estrictamente prohibido:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>Subir material ofensivo, discriminatorio, difamatorio o que infrinja leyes vigentes.</li>
              <li>Utilizar bots, scripts automatizados o herramientas para inflar artificialmente las reproducciones, visitas o métricas de los beats.</li>
              <li>Intentar contactar a los compradores o productores por fuera de la plataforma con el objetivo de evadir la comisión del sitio tras haberlos conocido allí.</li>
              <li>Enviar comprobantes de pago falsos, manipulados o duplicados.</li>
            </ul>
          </section>

          {/* 6. Limitación de Responsabilidad */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              6. Limitación de Responsabilidad
            </h2>
            <p>
              El servicio se provee en las condiciones tecnológicas disponibles:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                D'Cuban Beats no se hace responsable por interrupciones temporales del servicio derivadas de fallas en la conexión a internet, caídas de telecomunicaciones, cortes eléctricos o labores de mantenimiento técnico del servidor.
              </li>
              <li>
                D'Cuban Beats no es responsable de desacuerdos, conflictos personales o disputas comerciales que surjan entre un productor y un artista después de concretada la compra de una licencia.
              </li>
            </ul>
          </section>

          {/* 7. Modificaciones y Cancelación de Cuentas */}
          <section className="pt-6 space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              7. Modificaciones y Cancelación de Cuentas
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Cambios:</strong> D'Cuban Beats se reserva el derecho de actualizar o modificar estos términos cuando sea necesario, notificando de dichos cambios a través de la web. El uso continuo de la plataforma implica la aceptación de los términos revisados.
              </li>
              <li>
                <strong>Baneo y Cierre:</strong> D'Cuban Beats se reserva el derecho de suspender temporalmente o eliminar de forma definitiva la cuenta de cualquier usuario que rompa estas reglas, sin derecho a reclamo de saldos o reembolsos en casos de fraude o infracción comprobada.
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
                navigateTo('/privacidad');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Políticas de Privacidad
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
