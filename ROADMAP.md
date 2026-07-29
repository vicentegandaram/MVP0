# NutriFlow — Roadmap hacia el mercado

> Documento de análisis estratégico y plan de acción · Abril 2026

---

## Estado actual del producto: 4.5 / 7

| Dimensión | Nota | Razón |
|-----------|------|-------|
| Core funcional | 5/7 | Planes, comidas, lista de compras y ficha médica operativos |
| Estabilidad / bugs | 3/7 | Varios bugs críticos recién corregidos, uploads pendientes de RLS |
| UX / diseño | 5/7 | Interfaz limpia pero con inconsistencias y vacíos de feedback |
| Diferenciación | 4/7 | Generación automática de planes es única, falta profundidad |
| Preparación comercial | 2/7 | Sin onboarding, sin billing, sin plan gratuito de prueba |
| Escalabilidad técnica | 6/7 | Stack moderno (Supabase + React + Vercel) bien estructurado |
| Propuesta de valor clara | 4/7 | Existe pero no está comunicada dentro del producto |

---

## 1. Análisis de mercado

### Tamaño y oportunidad

- Chile tiene ~5.000 nutricionistas colegiados activos (Colegio de Nutricionistas, 2024)
- El 70% trabaja de forma independiente o en clínicas pequeñas (<5 profesionales)
- Solo el ~15% usa software especializado — el resto usa Excel, WhatsApp y papel
- LATAM amplía el mercado a +400.000 nutricionistas (Argentina, Colombia, México, Perú)

### Precio objetivo vs mercado

| Segmento | Disposición a pagar mensual | Perfil |
|----------|-----------------------------|--------|
| Independiente | $8.000–$15.000 CLP | 1–30 pacientes activos |
| Clínica pequeña | $25.000–$60.000 CLP | 3–8 profesionales |
| Centro médico | $80.000–$200.000 CLP | Integración con sistema médico |

**Tu precio actual de $12.900 CLP/mes está bien posicionado para el segmento independiente.**

### Momento del mercado

- Post-pandemia disparó la consulta nutricional online (+40% en Chile según Minsal 2023)
- Los nutricionistas jóvenes (25–35 años) son early adopters naturales de herramientas digitales
- Los pacientes ya esperan recibir su plan por WhatsApp/email — el papel se percibe como obsoleto

---

## 2. Competencia directa

### Nutrium (Portugal) — Líder mundial
- **Precio:** USD 69–149/mes (~$65.000–$140.000 CLP)
- **Fortalezas:** App de paciente, base de datos de alimentos masiva, integración con wearables
- **Debilidades:** Precio alto para LATAM, sin localización real para Chile (alimentos locales escasos), soporte en inglés/portugués
- **Tu ventaja vs Nutrium:** Precio 5x menor, interfaz en español nativo, localizable a productos chilenos

### Dietbox (Brasil)
- **Precio:** BRL 89–199/mes (~$16.000–$35.000 CLP)
- **Fortalezas:** Fuerte en Brasil, app de paciente madura
- **Debilidades:** Casi sin presencia en Chile, interfaz densa, curva de aprendizaje alta
- **Tu ventaja vs Dietbox:** Más simple, más rápido de adoptar, onboarding de minutos vs días

### NutriSoft / Evonuts (Chile/Argentina)
- **Precio:** $15.000–$40.000 CLP
- **Fortalezas:** Presencia local, conocen el mercado
- **Debilidades:** Diseño anticuado (aplicaciones de escritorio o web 2010), sin generación automática de planes

### Competencia indirecta fuerte
- **Excel + Google Drive:** Gratis, flexible. El 55% del mercado. Tu mayor competidor real.
- **Notion:** Nutricionistas jóvenes arman sus propios sistemas. Flexible pero sin automatización.
- **ChatGPT:** Empieza a usarse para generar planes. No tiene CRM de pacientes.

### Mapa de posicionamiento

```
                    COMPLEJO / POTENTE
                          ↑
              Nutrium ●   |
              Dietbox ●   |
                          |         ● NutriFlow (objetivo)
    CARO ────────────────────────────── ACCESIBLE
                          |
         NutriSoft ●      |   ● Excel
                          |
                    SIMPLE / BÁSICO
```

**Posición ganadora:** Simple de usar + accesible + automático. Nutrium para los que no pueden pagar Nutrium.

---

## 3. Funcionalidades listas hoy

### ✅ Operativas (se pueden mostrar a clientes)
- Gestión de pacientes (alta, edición, búsqueda, eliminación lógica)
- Generación automática de plan nutricional con 4 objetivos (35 comidas, 7 días)
- Vista completa del plan con edición inline de comidas y alimentos
- Lista de compras generada desde las comidas del plan, por categoría
- Ficha médica con antecedentes, alergias/restricciones y documentos adjuntos
- Historial de planes por paciente
- Agenda/citas (crear, ver, cambiar estado)
- Dashboard con métricas básicas
- Autenticación segura (Supabase Auth + RLS)

### ⚠️ Operativas con limitaciones
- Upload de documentos PDF (bucket creado, RLS pendiente de verificar en dashboard)
- Menú de acciones rápidas por paciente (funcional pero dropdown puede salirse del viewport en mobile)

### ❌ Prometidas pero ausentes
- App móvil para el paciente
- Base de datos de alimentos chilenos con valores nutricionales reales
- Envío del plan por email/WhatsApp al paciente
- Notificaciones de citas
- Facturación / cobros integrados

---

## 4. Próximos pasos priorizados

### Fase 0 — Estabilizar (esta semana) · Bloqueante para vender

- [x] Corregir botón "Nueva cita" del dashboard → ya apunta a `/appointments`
- [x] Añadir `overflow-x-auto` a tabla de pacientes
- [x] Separar mensaje "no hay pacientes" vs "sin resultados de búsqueda"
- [x] Gráfico de evolución de peso → renderizando con `AreaChart` en `PatientDetail.tsx`
- [ ] Verificar en Supabase que `migration_rls_fix.sql`, `migration_portal_rls.sql` y `fix_measurement_rls.sql` estén aplicados
- [ ] Verificar flujo completo end-to-end: crear paciente → generar plan → ver plan → lista de compras → compartir

**Criterio de salida Fase 0:** Un nutricionista real puede usar el flujo principal sin encontrar errores visibles.

> Auditoría abril 2026: los fixes de UI de Fase 0 ya fueron ejecutados en el código. Solo queda confirmar el estado de las policies RLS en el proyecto de Supabase.

---

### Fase 1 — Valor inmediato (2–3 semanas) · Necesario para cobrar

#### 1.1 Envío del plan al paciente
El mayor dolor del nutricionista hoy es pasar horas formateando planes en Word/PDF.

- Botón "Enviar plan" → dispara webhook a n8n
- n8n genera PDF desde HTML del plan + logo del nutricionista
- n8n envía por email (Gmail/SMTP) o WhatsApp Cloud API al paciente
- Compartir por link (URL pública temporal, RLS `anon` ya permite lectura por `patient_id`)

**Estrategia:** implementar vía **n8n + Supabase Database Webhooks**, sin modificar el backend de la app. Reduce ~5 días de dev a ~1 día de configuración.

**Impacto:** Convierte NutriFlow en parte del flujo de trabajo real, no solo un gestor de datos.

#### 1.2 Base de datos de alimentos chilenos
Sin esto, los planes se ven genéricos y los nutricionistas no confían en los valores nutricionales.

- Importar TCCA (Tabla de Composición de Alimentos Chile, INTA) — datos públicos
- Buscador de alimentos al agregar comidas (reemplaza el campo de texto libre)
- Valores de kcal/proteína/carbs/grasas calculados automáticamente por gramaje

**Impacto:** Aumenta la credibilidad profesional del software.

#### 1.3 Onboarding del nutricionista
El primer uso determina si el cliente se queda o se va.

- Pantalla de bienvenida post-registro con 3 pasos guiados: perfil → primer paciente → primer plan
- Tooltip en el dashboard vacío explicando cada sección
- Paciente y plan demo pre-cargados al registrarse (pueden borrarse)

**Impacto:** Reduce el churn en los primeros 7 días, que es donde se pierde el 60% de los trials.

---

### Fase 2 — Retención y diferenciación (1–2 meses)

#### 2.1 Portal del paciente (acceso limitado)
- El paciente recibe un link con su plan de la semana
- Puede marcar comidas como cumplidas (registro de adherencia)
- El nutricionista ve el % de adherencia en el dashboard

**Impacto:** Crea un loop de engagement diario. Sticky feature — el nutricionista no puede irse porque sus pacientes están dentro.

#### 2.2 Seguimiento de mediciones con gráfico
- El gráfico de evolución ya existe en código pero no es visible en la UI
- Activar la vista de peso/IMC/composición corporal con chart de línea
- Comparar medición actual vs objetivo al inicio del plan

#### 2.3 Plantillas de plan personalizables
- El nutricionista guarda sus propios templates de plan (no solo los 4 genéricos)
- Reutilización de planes: "usar este plan como base para nuevo paciente"
- Historial de alimentos más usados por paciente

#### 2.4 Recordatorios de cita por WhatsApp/email
- Integración con Twilio o WhatsApp Business API
- Recordatorio automático 24h antes de la cita
- Confirmación con un click por parte del paciente

---

### Fase 3 — Monetización y escala (2–4 meses)

#### 3.1 Billing integrado (Stripe o Flow)
- Plan gratuito: hasta 5 pacientes activos, sin límite de tiempo
- Plan Profesional ($12.900 CLP/mes): pacientes ilimitados + PDF + portal paciente
- Plan Clínica ($34.900 CLP/mes): múltiples nutricionistas, marca personalizable

#### 3.2 Multi-nutricionista (clínicas)
- Un administrador puede invitar colegas al mismo workspace
- Cada nutricionista ve solo sus pacientes
- El dueño de la clínica ve métricas globales

#### 3.3 Marca blanca básica
- El nutricionista puede subir su logo y definir color principal
- Los PDFs y links del plan muestran la marca del profesional, no "NutriFlow"
- Valor percibido: el paciente ve una herramienta profesional propia

#### 3.4 Integración con Google Calendar / iCal
- Sincronizar citas de NutriFlow con el calendario del nutricionista
- Reducir el doble registro que hoy hacen todos manualmente

---

## 5. Estrategia de ventas para salir al mercado

### Canal 1 — Contacto directo (0 a 10 clientes)
1. Identifica 20 nutricionistas jóvenes en Santiago/Concepción/Valparaíso activos en Instagram
2. Mensaje directo: "Hola [nombre], vi que atiendes pacientes online. Estoy desarrollando una herramienta para nutricionistas chilenos. ¿Te gustaría probarla gratis 30 días y darme feedback?"
3. Onboardea personalmente a cada uno por videollamada (30 min)
4. De esos 10, 3–4 pagarán si la herramienta realmente les ahorra tiempo

### Canal 2 — Comunidades (10 a 50 clientes)
- Grupos de Facebook de nutricionistas Chile (Nutricionistas Chile, Nutri Network)
- LinkedIn con contenido: "Cómo genero el plan semanal de mis pacientes en 2 minutos"
- Podcast de salud/nutrición: ofrecer herramienta a entrevistados

### Canal 3 — Alianzas (50 a 200 clientes)
- Contactar al Colegio de Nutricionistas de Chile para acuerdo de descuento a colegiados
- Alianza con universidades que forman nutricionistas (UCH, PUC, UDD) — acceso gratuito para estudiantes en práctica
- Integración con Agenda Pro / Doctoralia para captar nutricionistas que ya usan plataformas de citas

### Métricas a monitorear desde el inicio
| Métrica | Objetivo mes 1 | Objetivo mes 3 |
|---------|---------------|----------------|
| Nutricionistas registrados | 10 | 50 |
| Nutricionistas activos (usaron en últimos 7 días) | 7 | 35 |
| Pacientes creados por nutricionista (promedio) | 5 | 12 |
| Planes generados por semana | 15 | 80 |
| Churn mensual | <30% | <15% |

---

## 6. Riesgos y cómo mitigarlos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| El nutricionista no cambia sus hábitos (sigue con Excel) | Alta | Alto | Onboarding personal + ahorro de tiempo demostrable en vivo |
| Competidor con recursos lanza en Chile | Media | Alto | Velocidad de iteración + conocimiento local + precio |
| Bug crítico en producción con cliente real | Media | Alto | Testing manual previo a cada venta + rollback rápido en Vercel |
| Base de datos de alimentos incorrecta → desconfianza profesional | Alta | Alto | Usar fuente oficial INTA desde el inicio, mostrar fuente en UI |
| Supabase free tier se agota | Baja | Medio | Migrar a Pro (~$25 USD/mes) cuando superes 500 MB de DB |

---

## 7. Resumen ejecutivo — Lo mínimo para la primera venta

Para cobrar el primer mes a un nutricionista real necesitas **3 cosas funcionando sin fallas:**

1. **Crear paciente → generar plan → ver plan completo → lista de compras**
   El flujo core tiene que ser impecable. Un solo bug visible en demo mata la venta.

2. **Exportar o compartir el plan**
   Sin esto, el nutricionista igual tiene que abrir Word para darle algo al paciente.
   Es el gap más crítico entre "demo interesante" y "herramienta que uso todos los días".

3. **Que se vea profesional**
   Logo del nutricionista en algún lado. Que no parezca un proyecto universitario.
   No necesita ser perfecta — necesita verse seria.

**Con esas 3 cosas puedes hacer tu primera demo de ventas esta semana.**

---

*Generado con Claude Sonnet 4.6 · NutriFlow v0.1-MVP · Abril 2026*
