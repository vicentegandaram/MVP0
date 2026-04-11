# NutriFlow - Propuestas de Implementación

## Prioridad: FACIL | Impacto: ALTO | Bugs: BAJO

---

## 1. Generación Automática de Planes Nutricionales 🎯

### Descripción
En lugar de crear planes vacíos con solo macros, el sistema generará automáticamente comidas basadas en el objetivo del paciente.

### Cómo funciona
- **Input**: objetivo (perder peso, ganar músculo, mantener), restricciones (alergias, preferencias)
- **Proceso**: El sistema asigna plantillas de comidas predefinidas
- **Output**: Plan con 5-6 comidas/día con alimentos específicos

### Implementación (Fácil - 2-3 días)

```typescript
// Estructura de plantilla de comida
interface MealTemplate {
  name: string
  meal_type: 'breakfast' | 'mid_morning' | 'lunch' | 'afternoon' | 'dinner' | 'snack'
  calories: number
  protein: number
  carbs: number
  fat: number
  foods: { name: string; quantity: number; unit: string }[]
}

// Templates predefinidos por objetivo
const weightLossTemplates = [...]
const muscleGainTemplates = [...]
const maintenanceTemplates = [...]
```

### Beneficio
- El nutricionista crea un plan completo en 30 segundos
- Paciente recibe un plan real, no solo números
- Base para la Fase 2 (listas de compra automáticas)

---

## 2. Dashboard de Pacientes en Riesgo 🔴

### Descripción
Sección en el Dashboard principal que muestra pacientes que requieren atención inmediata.

### Criterios de "Paciente en Riesgo"
- Sin registro de comidas en los últimos 7 días
- Última cita fue hace más de 30 días
- adherence_rate < 50% últimos 30 días

### Implementación (Fácil - 1 día)

```typescript
// En useApi.ts - nueva query
export const usePatientsAtRisk = () => {
  // Retorna pacientes que cumplen criterios
}
```

### UI Propuesta
```
┌─────────────────────────────────────────┐
│ ⚠️ PACIENTES QUE REQUIEREN ATENCIÓN    │
├─────────────────────────────────────────┤
│ 🔴 María García - Sin registro 8 días  │
│ 🟠 Juan Pérez - Cita hace 35 días       │
│ 🟠 Ana López - Adherencia 42%           │
└─────────────────────────────────────────┘
```

### Beneficio
- El nutritionist ve inmediatamente quién necesita acción
- Mejora retención de pacientes
- Feature diferenciador vs competencia

---

## 3. Lista de Compras Automática 🛒

### Descripción
Generar lista de supermercado basada en el plan nutricional activo del paciente.

### Cómo funciona
1. Paciente tiene plan activo con comidas
2. Sistema suma todos los ingredientes del plan
3. Agrupa por categoría (frutas, proteínas, lácteos...)
4. Descarga/visualiza lista

### Implementación (Media - 3 días)

**Requerimiento previo**: Plan con comidas específicas (Feature #1)

```typescript
// En useApi.ts
export const useGenerateShoppingList = (planId: string) => {
  // 1. Obtener todas las meal_food del plan
  // 2. Agrupar por food_name y sumar quantities
  // 3. Agrupar por category
  // 4. Retornar lista organizada
}
```

### Beneficio
- **ALTO VALOR**: El paciente ve utilidad inmediata
-Diferenciador clave del software
- Optimización para Fase 2 (compras reales)

---

## 4. Notificaciones de Seguimiento 🔔

### Descripción
Recordatorios automáticos para que el paciente registre sus comidas.

### Tipos de Notificaciones
- Recordatorio de comida (según horario del plan)
- "No has registrado tu cena" (si no hay log)
- Cita próxima (24h antes)

### Implementación (Media - 2 días)

```typescript
// Sistema de notificaciones (para fase 2 con backend real)
// Por ahora: UI de configuración de recordatorios

interface NotificationSettings {
  mealReminders: boolean
  reminderMinutesBefore: number // ej: 30 min
  dailySummary: boolean
  appointmentReminder: boolean
}
```

### Beneficio
- Mantiene al paciente comprometido
- Aumenta adherencia
- Prepara para integración con MagicBell/Novu

---

## 5. Gráficos de Evolución 📊

### Descripción
Mostrar evolución del peso/medidas del paciente en gráfico visual.

### Implementación (Fácil - 1 día)

```typescript
// Usar recharts o chart.js
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

<LineChart data={measurements}>
  <Line type="monotone" dataKey="weight" stroke="#10b981" />
  <XAxis dataKey="recorded_at" />
  <YAxis />
</LineChart>
```

### Datos necesarios (ya existen en schema)
- Tabla `measurement` con weight, height, imc, etc.
- Función RPC `get_patient_evolution_chart`

### Beneficio
- Visual inmediato del progreso
- Motiva al paciente
- Feature esperado en cualquier软件 de nutrición

---

## Matriz de Priorización

| Feature | Facilidad | Impacto | Bugs | Seleccionar |
|---------|------------|---------|-----|--------------|
| Generación auto de planes | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Bajo | ✅ **PRIORIDAD 1** |
| Dashboard pacientes en riesgo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Bajo | ✅ **PRIORIDAD 2** |
| Lista de compras auto | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medio | ✅ **PRIORIDAD 3** |
| Gráficos evolución | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Bajo | ✅ **PRIORIDAD 4** |
| Notificaciones | ⭐⭐⭐ | ⭐⭐⭐⭐ | Medio | ⏳ Fase 2 |

---

## Recomendación Final

**Implementar en orden:**

1. **Gráficos de Evolución** (1 día) - Visible rápido, bajo riesgo
2. **Dashboard Pacientes en Riesgo** (1 día) - Alto impacto, fácil
3. **Generación Automática de Planes** (3 días) - Diferenciador principal
4. **Lista de Compras** (3 días) - Requiere #3, alto valor

**Tiempo estimado total: 8 días**

**ROI**: Estos 4 features cubren el 80% de las necesidades del nutricionista y crean un MVP sólido para inversores.