# NutriFlow - Auditoría de Funcionalidades y Valor para el Nutricionista

## Resumen Ejecutivo

Este documento presenta una auditoría completa de todas las funcionalidades implementadas en NutriFlow, detallando cómo cada característica aporta valor al seguimiento de los clientes de un nutricionista. El software ha sido diseñado para resolver los principales desafíos de la gestión de consultas nutricionales: seguimiento del progreso, retención de pacientes, eficiencia en la creación de planes y comunicación con el paciente.

---

## 1. Dashboard Principal

### Funcionalidades

**Tarjetas de estadísticas:**
- Pacientes activos: Total de pacientes registrados
- Citas hoy: Citas programadas para el día actual
- Esta semana: Citas programadas en los próximos 7 días
- Pendientes: Citas agendadas pendientes

**Próximas citas:**
- Lista de las próximas 5 citas con información del paciente
- Tipo de cita (primera visita, seguimiento, evaluación, emergencia)
- Fecha y hora de cada cita

**Acciones rápidas:**
- Nuevo paciente
- Nueva cita
- Ver pacientes

**Sección de Pacientes en Riesgo:**
- Detecta pacientes sin mediciones en más de 21 días
- Detecta pacientes sin citas en más de 35 días
- Clasificación por severidad: Urgente (rojo) / Atención (naranja)

### Valor Aportado

El dashboard es el centro de control del nutricionista. Proporciona una vista inmediata del estado de la consulta sin necesidad de buscar información. La sección de pacientes en riesgo es particularmente valiosa porque:

- **Detección temprana**: Identifica pacientes que podrían abandonar el tratamiento antes de que sea demasiado tarde
- **Acción proactiva**: Permite al nutricionista contactar pacientes que requieren atención inmediata
- **Retención**: Reduce la tasa de abandono al detectar problemas a tiempo

---

## 2. Gestión de Pacientes

### Funcionalidades

**Lista de pacientes:**
- Tabla con todos los pacientes activos
- Información: nombre, apellido, contacto (teléfono, email), edad calculada, estado
- Búsqueda con debounce de 300ms para evitar sobrecarga
- Acciones: ver detalle, editar, eliminar
- Paginación visual con mensajes de "sin resultados"

**Crear paciente (PatientNew):**
- Formulario con validación
- Campos: nombre, apellido, email, teléfono, fecha de nacimiento, género
- Integración con el ID del nutricionista autenticado
- Validación de email

**Detalle del paciente (PatientDetail):**
- Información general del paciente
- Stats rápidos: peso actual, IMC, cintura, última medición
- Evolución del peso con gráfico interactivo
- Selector de rango de tiempo: 7, 30, 90 días
- Plan nutricional activo con macros
- Próximas citas del paciente
- Historial de mediciones en tabla

### Valor Aportado

La gestión de pacientes es el núcleo del sistema. El beneficio principal es la **centralización de la información**:

- **Historia clínica digital**: Toda la información del paciente en un solo lugar
- **Edad correcta**: Cálculo de edad usando fecha de nacimiento (no guardamos edad directamente, evitando el error de "-1 años")
- **Seguimiento visual**: El gráfico de evolución permite ver el progreso del paciente de un vistazo
- **Decisiones basadas en datos**: El nutricionista puede tomar decisiones informadas viendo la tendencia del peso

---

## 3. Seguimiento de Mediciones

### Funcionalidades

**Registro de mediciones:**
- Peso (kg)
- Altura (cm) - calculado automáticamente
- IMC (calculado automáticamente)
- Circunferencia de cintura (cm)
- Circunferencia de cadera (cm)
- Porcentaje de grasa corporal
- Masa muscular

**Gráfico de evolución:**
- Tipo: AreaChart (gráfico de área)
- Datos: Peso a lo largo del tiempo
- Filtros: 7, 30, 90 días
- Tooltip con información detallada al pasar el cursor

**Tabla de historial:**
- Muestra las últimas 10 mediciones
- Campos: fecha, peso, IMC, cintura, % grasa

### Valor Aportado

El seguimiento de mediciones es donde el paciente ve resultados tangibles:

- **Motivación del paciente**: Ver la evolución gráfica motiva a continuar con el tratamiento
- **Detección de estancamientos**: Si el peso no baja, el nutritionist puede ajustar el plan
- **Objetivos claros**: El paciente puede ver cuánto le falta para llegar a su objetivo
- **Comunicación**: En las citas, se puede revisar el gráfico juntos y discutir el progreso

---

## 4. Planes Nutricionales

### Funcionalidades

**Creación manual de planes:**
- Nombre del plan
- Fecha de inicio y fin (opcional)
- Macros diarios: calorías, proteína, carbohidratos, grasas
- Observaciones
- Activación automática al crear (desactiva el anterior)

**Generación automática de planes:**
- Botón "Generar plan con comidas"
- Selección de objetivo:
  - Pérdida de peso (1800 kcal)
  - Ganancia de músculo (2600 kcal)
  - Mantenimiento (2200 kcal)
  - Seguimiento médico (2000 kcal)
- Genera 35 comidas (5 días × 7 comidas/día)
- Cada comida tiene alimentos específicos con cantidades

**Visualización del plan:**
- Plan activo marcado con etiqueta
- Macros del plan
- Botón para generar lista de compras

### Valor Aportado

Esta es la funcionalidad diferenciadora del software:

- **Eficiencia**: El nutritionist crea un plan completo en segundos, no minutos
- **Consistencia**: Las comidas están equilibradas y calculadas
- **Base para lista de compras**: Al tener meals con foods específicos, se puede generar la lista automáticamente
- **Personalización**: Cada plan se adapta al objetivo del paciente

---

## 5. Lista de Compras Automática

### Funcionalidades

**Generación:**
- Botón "Lista de compras" en el plan activo
- Agrega todas las cantidades de alimentos del plan
- Agrupa por categoría:
  - Proteínas 🥩
  - Verduras 🥦
  - Fruits 🍎
  - Lácteos 🥛
  - Cereales y tubérculos 🍚
  - Grasas y aceites 🫒
  - Otros 📦

**Interfaz:**
- Progreso visual (X de Y items comprados)
- Categorías expandibles
- Checkbox para marcar items comprados
- Persistencia del estado (se guarda en la base de datos)

### Valor Aportado

La lista de compras es el feature de **mayor valor percibido por el paciente**:

- **Facilidad**: El paciente no tiene que calcular qué comprar
- **Organización**: Las compras por categoría facilitan la visita al supermercado
- **Seguimiento**: Al marcar items comprados, el paciente interactúa con la app
- **Diferenciador**: Ningún otro software de nutrición ofrece esto de forma automática

---

## 6. Citas y Agenda

### Funcionalidades

**Gestión de citas:**
- Crear nueva cita
- Sélection de paciente
- Fecha y hora
- Tipo de cita: primera visita, seguimiento, evaluación, emergencia
- Duración (por defecto 60 minutos)
- Estado: agendada, confirmada, completada, cancelada, no asistida

**Vista de agenda:**
- Calendario mensual con días
- Indicador visual del número de citas por día
- Citas del mes actual

**Vista de lista:**
- Lista de citas upcoming
- Filtrado por estado

### Valor Aportado

La gestión de citas es fundamental para la operación:

- **Organización**: Evita double-booking y conflictos de horario
- **Seguimiento**: Permite ver cuándo fue la última cita del paciente
- **Recordatorios**: Base para implementar notificaciones en el futuro

---

## 7. Pacientes en Riesgo

### Funcionalidades

**Detección automática:**
- Sin mediciones en más de 21 días → severidad media
- Sin mediciones en más de 30 días → severidad alta
- Sin citas en más de 35 días → severidad alta

**Visualización:**
- Sección prominent en el Dashboard
- Tarjetas de pacientes con nombre, razón del riesgo
- Color según severidad (rojo/naranja)
- Enlace directo al detalle del paciente

### Valor Aportado

Esta funcionalidad aborda directamente el problema de la **retención de pacientes**:

- **Prevención de abandono**: El nutritionist puede contactar al paciente antes de que abandone
- **Priorización**: Know qué pacientes necesitan atención inmediata
- **Datos objetivos**: No depende de la memoria del nutritionist

---

## 8. Autenticación y Seguridad

### Funcionalidades

- Login con email y contraseña
- Registro de nuevos nutricionistas
- Persistencia de sesión
- Protección de rutas
- Aislamiento de datos por nutricionista

### Valor Aportado

- **Multi-tenant**: Varios nutricionistas pueden usar la app sin ver datos ajenos
- **Seguridad**: Datos de pacientes protegidos
- **UX**: Sesión persistente, no requiere login en cada visita

---

## Matriz de Valor

| Funcionalidad | Problema que Resuelve | Beneficio Principal |
|---------------|----------------------|---------------------|
| Dashboard | Desorientación, pérdida de tiempo | Vista inmediata del estado de la consulta |
| Pacientes en Riesgo | Abandono no detectado | Retención proactiva de pacientes |
| Detalle Paciente | Falta de seguimiento visual | Decisiones basadas en datos |
| Gráficos Evolución | Paciente desmotivado | Visualización del progreso |
| Planes Automáticos | Tardanza en crear planes | Eficiencia en 30 segundos |
| Lista de Compras | Paciente desorientado | Valor percibido inmediato |
| Citas | Desorganización | Agenda controlada |
| Auth | Datos no seguros | Aislamiento por nutricionista |

---

## Recomendaciones para el Nutricionista

### Para usar el software efectivamente:

1. **Registrar mediciones regularmente**: Cada cita, registrar el peso del paciente para que el gráfico funcione

2. **Revisar pacientes en riesgo diariamente**: La sección de riesgo está diseñada para revisarse cada mañana

3. **Usar planes automáticos como base**: Generar un plan y luego personalizarlo según las preferencias del paciente

4. **Generar lista de compras semanal**: Sugerir al paciente que revise su lista antes de ir al supermercado

5. **Programar citas de seguimiento**: Mantener citas regulares (cada 2-4 semanas) para mantener al paciente comprometido

---

## Conclusión

NutriFlow解決a los 4 problemas principales de una consulta nutricional:

1. **Seguimiento**: Gráficos de evolución y mediciones centralizadas
2. **Retención**: Pacientes en riesgo detectados automáticamente
3. **Eficiencia**: Planes con comidas generados en segundos
4. **Engagement**: Lista de compras que mantiene al paciente comprometido

El software está diseñado para que el nutritionist pueda hacer su trabajo mejor, más rápido, y con menos pacientes perdidos por abandono.

---

*Documento generado el 7 de abril de 2026*
*Versión del software: 1.0*
*URL de producción: https://nutriflow-lovat.vercel.app*