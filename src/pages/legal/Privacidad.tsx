import { LegalLayout } from './LegalLayout'
import { LEGAL_ENTITY, LEGAL_UPDATED_AT } from './entity'

export function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" updatedAt={LEGAL_UPDATED_AT}>
      <p>
        Esta política explica cómo {LEGAL_ENTITY.tradeName} trata los datos
        personales asociados al uso de la plataforma NutriFlow. Está redactada
        conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y se
        adecúa a la Ley N° 21.719, que entra en vigencia en diciembre de 2026.
      </p>

      <h2>1. Quién es responsable de tus datos</h2>
      <table>
        <tbody>
          <tr>
            <th>Titular</th>
            <td>{LEGAL_ENTITY.legalName}</td>
          </tr>
          <tr>
            <th>RUT</th>
            <td>{LEGAL_ENTITY.rut}</td>
          </tr>
          <tr>
            <th>Domicilio</th>
            <td>{LEGAL_ENTITY.address}</td>
          </tr>
          <tr>
            <th>Contacto</th>
            <td>
              <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`}>
                {LEGAL_ENTITY.privacyEmail}
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>2. Dos roles distintos: tus datos y los de tus pacientes</h2>
      <p>
        Esta es la distinción más importante de este documento, porque de ella
        depende quién responde por cada dato.
      </p>

      <h3>a) Datos de la cuenta profesional</h3>
      <p>
        Respecto de los datos de tu cuenta de nutricionista (nombre, apellido,
        correo, número de licencia profesional, datos de facturación y registros
        de uso), <strong>{LEGAL_ENTITY.tradeName} actúa como responsable</strong>{' '}
        del tratamiento.
      </p>

      <h3>b) Datos de tus pacientes</h3>
      <p>
        Respecto de la información que cargas sobre tus pacientes —fichas
        clínicas, antecedentes mórbidos, mediciones antropométricas, planes de
        alimentación, documentos adjuntos y registros de adherencia—{' '}
        <strong>el responsable del tratamiento eres tú</strong>, en tu calidad
        de profesional de la salud tratante.{' '}
        {LEGAL_ENTITY.tradeName} actúa únicamente como{' '}
        <strong>encargado del tratamiento</strong>: procesa esos datos por
        cuenta tuya, siguiendo tus instrucciones, y no los utiliza para fines
        propios.
      </p>
      <p>Como encargado, NutriFlow se obliga a:</p>
      <ul>
        <li>
          Tratar los datos de pacientes solo para prestarte el servicio, nunca
          para fines comerciales, publicitarios ni de entrenamiento de modelos
          de inteligencia artificial.
        </li>
        <li>
          No comunicarlos a terceros distintos de los proveedores listados en la
          sección 6.
        </li>
        <li>
          Aplicar medidas de seguridad técnicas y organizativas, incluyendo
          aislamiento por profesional a nivel de base de datos.
        </li>
        <li>
          Devolverte o eliminar los datos al término del servicio, según lo que
          instruyas.
        </li>
        <li>Notificarte cualquier brecha de seguridad que los afecte.</li>
      </ul>
      <p>
        Esto implica que obtener el consentimiento de tus pacientes y cumplir
        con la Ley N° 20.584 sobre derechos y deberes del paciente y con el
        Decreto N° 41/2012 del Ministerio de Salud sobre ficha clínica son
        responsabilidad tuya. NutriFlow te entrega las herramientas para
        registrar ese consentimiento, pero no lo sustituye.
      </p>

      <h2>3. Datos sensibles</h2>
      <p>
        Los datos de salud son <strong>datos sensibles</strong> bajo la
        legislación chilena. Su tratamiento exige consentimiento expreso del
        titular o que exista una autorización legal, y está sujeto a estándares
        de seguridad reforzados. La plataforma está construida asumiendo esa
        calificación: el acceso está restringido por profesional y los
        documentos clínicos se almacenan en repositorios privados.
      </p>

      <h2>4. Qué datos tratamos y con qué finalidad</h2>
      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Finalidad</th>
            <th>Base de licitud</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Identificación de la cuenta (nombre, correo, licencia)</td>
            <td>Crear y administrar tu cuenta, autenticarte</td>
            <td>Ejecución del contrato</td>
          </tr>
          <tr>
            <td>Datos de facturación</td>
            <td>Cobro de la suscripción y emisión de documentos tributarios</td>
            <td>Ejecución del contrato y obligación legal</td>
          </tr>
          <tr>
            <td>Registros técnicos y de error</td>
            <td>Detectar fallas, mantener la seguridad del servicio</td>
            <td>Interés legítimo</td>
          </tr>
          <tr>
            <td>Datos de pacientes cargados por ti</td>
            <td>Prestarte el servicio de gestión clínica y nutricional</td>
            <td>Instrucción del responsable (tú)</td>
          </tr>
          <tr>
            <td>Comunicaciones de soporte</td>
            <td>Responder tus consultas</td>
            <td>Ejecución del contrato</td>
          </tr>
        </tbody>
      </table>
      <p>
        No vendemos datos personales ni los cedemos a terceros con fines
        publicitarios.
      </p>

      <h2>5. Portal del paciente</h2>
      <p>
        Cuando compartes un plan, el sistema genera un enlace con un
        identificador aleatorio. Quien tenga ese enlace puede ver el plan
        asociado y registrar el cumplimiento de sus comidas, sin necesidad de
        crear una cuenta. El acceso se limita exclusivamente a los datos de ese
        paciente. Como el enlace es la credencial, debes compartirlo solo por
        canales privados con el paciente correspondiente.
      </p>

      <h2>6. Proveedores que tratan datos por nosotros</h2>
      <table>
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Servicio</th>
            <th>Ubicación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase (sobre AWS)</td>
            <td>Base de datos, autenticación y almacenamiento de documentos</td>
            <td>{LEGAL_ENTITY.dataRegion}</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Alojamiento y entrega de la aplicación web</td>
            <td>Estados Unidos</td>
          </tr>
          <tr>
            <td>Google (Gemini API)</td>
            <td>
              Extracción de alimentos desde documentos que subes de forma
              voluntaria
            </td>
            <td>Estados Unidos</td>
          </tr>
        </tbody>
      </table>

      <h3>Transferencia internacional</h3>
      <p>
        Los servidores están fuera de Chile. Al usar NutriFlow aceptas esta
        transferencia internacional, que se realiza bajo los acuerdos de
        tratamiento de datos suscritos con cada proveedor.
      </p>

      <h3>Sobre el procesamiento con inteligencia artificial</h3>
      <p>
        La extracción automática de alimentos desde un documento solo ocurre
        cuando tú subes ese archivo. El contenido se envía a la API de Google
        para procesarlo y se devuelve el resultado; no se emplea para entrenar
        modelos. Si el documento contiene datos identificatorios de un paciente,
        evalúa anonimizarlo antes de subirlo.
      </p>

      <h2>7. Conservación</h2>
      <ul>
        <li>
          <strong>Datos de tu cuenta:</strong> mientras la cuenta esté activa y
          hasta 12 meses después de cerrarla.
        </li>
        <li>
          <strong>Datos de pacientes:</strong> mientras mantengas la cuenta
          activa. Al cerrarla puedes exportarlos; transcurridos 30 días desde el
          cierre se eliminan de los sistemas activos.
        </li>
        <li>
          <strong>Documentos tributarios:</strong> por el plazo que exige la
          normativa tributaria chilena.
        </li>
      </ul>
      <p>
        Ten presente que la ficha clínica está sujeta a plazos legales de
        conservación propios, cuyo cumplimiento corresponde a ti como
        profesional tratante. Exporta la información antes de cerrar tu cuenta.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes solicitar acceso, rectificación, cancelación u oposición respecto
        de tus datos personales, así como la portabilidad de la información de
        tu cuenta, escribiendo a{' '}
        <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`}>
          {LEGAL_ENTITY.privacyEmail}
        </a>
        . Responderemos dentro de los plazos legales.
      </p>
      <p>
        Si eres paciente de un profesional que usa NutriFlow, dirige tu
        solicitud a ese profesional: él es el responsable de tus datos
        clínicos. Si nos escribes directamente, derivaremos la solicitud.
      </p>

      <h2>9. Seguridad</h2>
      <ul>
        <li>Cifrado en tránsito (HTTPS) y en reposo.</li>
        <li>
          Aislamiento de datos por profesional mediante políticas de seguridad a
          nivel de fila en la base de datos.
        </li>
        <li>Contraseñas almacenadas con funciones de hash irreversibles.</li>
        <li>Documentos clínicos en repositorios de acceso restringido.</li>
        <li>Registro de errores sin datos clínicos identificables.</li>
      </ul>
      <p>
        Ningún sistema es completamente infalible. Ante una brecha que afecte
        datos sensibles, te notificaremos sin dilación indebida junto con las
        medidas adoptadas.
      </p>

      <h2>10. Cookies</h2>
      <p>
        Utilizamos exclusivamente almacenamiento local del navegador para
        mantener tu sesión iniciada y recordar preferencias de la interfaz. No
        empleamos cookies publicitarias ni de seguimiento de terceros.
      </p>

      <h2>11. Menores de edad</h2>
      <p>
        La cuenta profesional está reservada a mayores de 18 años. Si registras
        pacientes menores de edad, eres responsable de contar con la
        autorización de su padre, madre o representante legal.
      </p>

      <h2>12. Cambios</h2>
      <p>
        Podemos actualizar esta política. Si el cambio es sustancial te
        avisaremos por correo o dentro de la aplicación con al menos 15 días de
        anticipación.
      </p>
    </LegalLayout>
  )
}
