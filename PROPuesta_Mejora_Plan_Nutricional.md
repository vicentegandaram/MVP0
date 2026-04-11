# NutriFlow - Propuesta de Mejora: Plan Nutricional Detallado

## Estado Actual vs Estado Deseado

### Estado Actual
Cuando el nutricionista genera un plan con comidas, el sistema:
1. ✅ Crea el plan con macros (calorías, proteína, carbs, grasa)
2. ✅ Genera 35 comidas (5 días × 7 comidas) en la base de datos
3. ❌ **NO muestra las comidas de forma legible** - solo se ven los macros

### Estado Deseado
Un plan nutricional profesional como el PDF de ejemplo, que incluya:
1. 📋 **Encabezado**: Datos del paciente, objetivo, fechas, nutritionist
2. 🕐 **Horario diário**: Desayuno, Media mañana, Almuerzo, Merienda, Cena
3. 🍽️ **Detalle por comida**: 
   - Hora aproximada
   - Nombre de la comida
   - Lista de alimentos con porciones específicas
   - Macros de esa comida
4. 📊 **Resumen diario**: Totales de calorías y macros
5. 💧 **Recomendaciones**: Hidratación, ejercicio, suplementación

---

## Análisis del PDF de Ejemplo

### Estructura Identificada

```
┌─────────────────────────────────────────────────────────────┐
│ NUTRICIONISTA CLÍNICA - M.P. 1234                           │
│ Plan Nutricional Personalizado                               │
├─────────────────────────────────────────────────────────────┤
│ PACIENTE: [Nombre]    OBJETIVO: [Perder peso/ganar muscle]  │
│ EDAD: [X] años        PESO ACTUAL: [X] kg    PESO META: [X] │
│ TALLA: [X] cm         IMC: [X]            FECHAS: [date]   │
├─────────────────────────────────────────────────────────────┤
│ LUNES 7 DE ENERO                                             │
├─────────────────────────────────────────────────────────────┤
│ DESAYUNO (08:00)              MACROS: 380 kcal │ 25g P     │
│ ─────────────────────────────  │ 40g C │ 12g G              │
│ • Huevos revueltos (2 unidades)                               │
│ • Pan integral (50g)                                          │
│ • Aguacate (30g)                                              │
│ • Café sin azúcar                                            │
├─────────────────────────────────────────────────────────────┤
│ MEDIA MAÑANA (11:00)         MACROS: 150 kcal │ 8g P       │
│ ─────────────────────────────  │ 20g C │ 4g G               │
│ • Yogur natural descremado                                    │
│ • Frutos secos (20g)                                         │
├─────────────────────────────────────────────────────────────┤
│ ALMUERZO (14:00)             MACROS: 550 kcal | 45g P       │
│ ─────────────────────────────  │ 50g C │ 18g G              │
│ • Pollo a la plancha (150g)                                  │
│ • Arroz integral (80g)                                        │
│ • Ensalada mixta (150g)                                      │
│ • Aceite de oliva (10ml)                                      │
├─────────────────────────────────────────────────────────────┤
│ MERIENDA (17:30)             MACROS: 200 kcal | 15g P      │
│ ─────────────────────────────  │ 25g C │ 5g G                │
│ • Batido proteico                                             │
│ • Plátano (1 unidad)                                         │
├─────────────────────────────────────────────────────────────┤
│ CENA (21:00)                 MACROS: 400 kcal | 35g P       │
│ ─────────────────────────────  │ 30g C │ 15g G               │
│ • Merluza al horno (150g)                                    │
│ • Patatas asadas (100g)                                      │
│ • Verduras al vapor (100g)                                   │
├─────────────────────────────────────────────────────────────┤
│ TOTAL DÍA: 1680 kcal | 128g P | 165g C | 54g G              │
├─────────────────────────────────────────────────────────────┤
│ RECOMENDACIONES:                                            │
│ • Agua: 2-3 litros diarios                                   │
│ • Ejercicio: 30 min actividad física moderada                │
│ • No saltar comidas                                          │
│ • Cena antes de las 21:30                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Propuesta de Implementación

### 1. Nueva Página: Ver Plan Detallado

Crear una nueva ruta `/plans/:patientId/view` que muestre el plan de forma profesional:

**Componentes necesarios:**
- Header con datos del paciente
- Selector de día (Lun-Dom)
- Selector de tipo de vista: Resumen / Detallado
- Opción de exportar/imprimir PDF

### 2. Estructura de Datos Mejorada (Opcional)

Actualmente tenemos:
- `nutrition_plan` → Plan con macros globales
- `meal` → Comidas del plan
- `meal_food` → Alimentos por comida

**Para mejorar, agregar:**
- Campo `meal_time` en `meal` (hora de la comida)
- Campo `preparation_notes` en `meal` (cómo preparar)
- Campo `day_name` mostrar nombre del día

### 3. Vista de Impresión/PDF

- Diseño optimizado para imprimir
- Una página por día o semana completa
- Include logo del nutritionist
- Include recomendaciones personalizadas

---

## Roadmap de Implementación

### Fase 1: Ver Plan Detallado (Prioridad Alta)
- [ ] Crear nueva página `PlanViewPage.tsx`
- [ ] Mostrar todas las comidas del plan por día
- [ ] Mostrar alimentos con porciones
- [ ] Mostrar macros por comida y día
- [ ] Agregar selector de día

### Fase 2: Mejoras de UI (Prioridad Media)
- [ ] Agregar hora a cada comida
- [ ] Mostrar totales diarios
- [ ] Indicador visual de progreso (% de macros)

### Fase 3: Exportación (Prioridad Baja)
- [ ] Botón de exportar a PDF
- [ ] Diseño imprimible
- [ ] Include recomendaciones

---

## Consideraciones Técnicas

### Frontend
- Nueva página con React
- Usar los datos existentes de `meal` y `meal_food`
- Diseño responsive (mobile-friendly para el paciente)

### Base de Datos
- No requiere cambios (schema actual es suficiente)
- RPC existente para obtener meals del plan

### Valor para el Nutricionista
1. **Profesionalismo**: El paciente recibe un plan como el PDF ejemplo
2. **Clarity**: El paciente sabe exactly qué comer y cuánto
3. **Seguimiento**: El paciente puede revisar el plan desde su móvil

---

##结论

El sistema actual genera las comidas correctamente en la base de datos, pero **no las muestra de forma útil** para el nutritionist o el paciente.

La solución es crear una vista detallada del plan que reproduzca el formato profesional del PDF ejemplo, permitiendo:
- Ver todas las comidas del día con sus alimentos
- Ver los macros de cada comida
- Exportar/imprimir para el paciente

Esto elevaría significativamente la percepción de valor del software.