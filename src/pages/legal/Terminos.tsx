import { LegalLayout } from './LegalLayout'
import { LEGAL_ENTITY, LEGAL_UPDATED_AT } from './entity'

export function TerminosPage() {
  return (
    <LegalLayout title="Términos de Servicio" updatedAt={LEGAL_UPDATED_AT}>
      <p>
        Estos términos regulan el uso de NutriFlow, plataforma de gestión
        clínica y nutricional operada por {LEGAL_ENTITY.legalName}, RUT{' '}
        {LEGAL_ENTITY.rut}, con domicilio en {LEGAL_ENTITY.address} (en adelante,
        «NutriFlow» o «nosotros»). Al crear una cuenta declaras haberlos leído y
        aceptado.
      </p>

      <h2>1. Quién puede usar el servicio</h2>
      <p>
        NutriFlow está dirigido a profesionales de la nutrición habilitados para
        ejercer. Al registrarte declaras que:
      </p>
      <ul>
        <li>Eres mayor de 18 años.</li>
        <li>
          Cuentas con el título profesional y las habilitaciones que exige la
          normativa chilena para atender pacientes.
        </li>
        <li>La información que entregas es veraz y está actualizada.</li>
      </ul>
      <p>
        Podemos suspender cuentas cuando existan antecedentes fundados de que
        estas declaraciones son falsas.
      </p>

      <h2>2. Qué es y qué no es NutriFlow</h2>
      <p>
        NutriFlow es una <strong>herramienta de apoyo administrativo y
        documental</strong>. Te permite registrar pacientes, elaborar planes de
        alimentación, generar listas de compra, llevar agenda y mantener fichas.
      </p>
      <p>
        NutriFlow <strong>no presta servicios de salud, no realiza diagnósticos
        ni emite indicaciones clínicas</strong>. Las plantillas de planes y los
        valores nutricionales que ofrece el sistema son un punto de partida
        editable, no una prescripción.{' '}
        <strong>
          Toda decisión clínica es de tu exclusiva responsabilidad profesional
        </strong>{' '}
        y debes revisar y validar cada plan antes de entregarlo a un paciente.
      </p>

      <h2>3. Tus obligaciones respecto de los datos de pacientes</h2>
      <p>
        Al cargar información de pacientes actúas como responsable del
        tratamiento de esos datos y te obligas a:
      </p>
      <ul>
        <li>
          Obtener el consentimiento informado que exigen la Ley N° 19.628 y la
          Ley N° 20.584 antes de registrar datos de salud.
        </li>
        <li>
          Cumplir el Decreto N° 41/2012 del Ministerio de Salud en lo relativo a
          la ficha clínica y su reserva.
        </li>
        <li>
          Mantener la confidencialidad de tus credenciales y no compartir tu
          cuenta con terceros.
        </li>
        <li>
          Compartir los enlaces del portal del paciente únicamente con el
          paciente que corresponda y por canales privados.
        </li>
        <li>
          Cargar solo los datos necesarios para la atención, evitando
          información excesiva.
        </li>
      </ul>
      <p>
        El detalle del tratamiento de datos está en la{' '}
        <a href="/privacidad">Política de Privacidad</a>, que forma parte
        integrante de estos términos.
      </p>

      <h2>4. Planes, precios y pagos</h2>
      <ul>
        <li>
          Los precios vigentes son los publicados en el sitio al momento de
          contratar e incluyen los impuestos aplicables.
        </li>
        <li>
          La suscripción se cobra por período anticipado y se renueva
          automáticamente salvo que la canceles antes del término del período en
          curso.
        </li>
        <li>
          Podemos modificar los precios avisándote con al menos 30 días de
          anticipación. El nuevo precio rige desde la renovación siguiente.
        </li>
        <li>
          La falta de pago habilita a suspender el acceso. Antes de eliminar
          información te daremos un plazo razonable para exportarla.
        </li>
      </ul>

      <h2>5. Derecho a retracto y cancelación</h2>
      <p>
        Puedes cancelar tu suscripción en cualquier momento; conservarás el
        acceso hasta el final del período ya pagado. Los derechos que te otorga
        la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores no
        se ven afectados por estos términos.
      </p>

      <h2>6. Disponibilidad del servicio</h2>
      <p>
        Trabajamos para mantener el servicio disponible de forma continua, pero
        no garantizamos un funcionamiento ininterrumpido ni libre de errores.
        Podemos realizar mantenimientos programados, avisando con antelación
        cuando sea previsible que afecten el uso.
      </p>

      <h2>7. Propiedad intelectual</h2>
      <p>
        El software, la marca y el diseño de NutriFlow nos pertenecen.{' '}
        <strong>
          El contenido que cargas —fichas, planes, documentos y datos de
          pacientes— sigue siendo tuyo.
        </strong>{' '}
        Nos autorizas únicamente a alojarlo y procesarlo en la medida necesaria
        para prestarte el servicio.
      </p>

      <h2>8. Exportación y cierre de cuenta</h2>
      <p>
        Puedes solicitar la exportación de tus datos en cualquier momento
        escribiendo a{' '}
        <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
          {LEGAL_ENTITY.supportEmail}
        </a>
        . Tras el cierre de la cuenta mantendremos la información disponible
        durante 30 días para que puedas descargarla; luego se elimina de los
        sistemas activos.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        En la medida que lo permita la ley, nuestra responsabilidad total frente
        a ti por cualquier causa relacionada con el servicio se limita al monto
        que hayas pagado en los 12 meses anteriores al hecho que la origina.
      </p>
      <p>
        No respondemos por decisiones clínicas adoptadas con apoyo de la
        herramienta, por la exactitud de los datos que tú ingresas, ni por el
        uso que hagas de la información de tus pacientes. Nada de lo anterior
        limita la responsabilidad por dolo o culpa grave, ni los derechos
        irrenunciables que te reconoce la legislación de consumo.
      </p>

      <h2>10. Suspensión y término</h2>
      <p>
        Podemos suspender o poner término a tu cuenta si incumples estos
        términos, si usas la plataforma con fines ilícitos o si pones en riesgo
        la seguridad del servicio o de los datos de otros usuarios. Salvo casos
        graves, te avisaremos primero y te daremos oportunidad de corregir.
      </p>

      <h2>11. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos. Los cambios sustanciales se
        comunicarán con al menos 15 días de anticipación por correo o dentro de
        la aplicación. Si continúas usando el servicio después de la entrada en
        vigencia, se entenderán aceptados.
      </p>

      <h2>12. Ley aplicable</h2>
      <p>
        Estos términos se rigen por la ley chilena. Cualquier controversia se
        someterá a los tribunales ordinarios de justicia de Chile, sin perjuicio
        de las acciones que puedas ejercer ante el Servicio Nacional del
        Consumidor.
      </p>

      <h2>13. Contacto</h2>
      <p>
        Para consultas sobre estos términos escríbenos a{' '}
        <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
          {LEGAL_ENTITY.supportEmail}
        </a>
        .
      </p>
    </LegalLayout>
  )
}
