# NutriFlow - Auditoría Integral y Propuesta de IA

## Resumen Ejecutivo

Este documento presenta una auditoría completa del estado actual de NutriFlow, identificando áreas de mejora y proponiendo la implementación de un LLM de bajo costo para automatizar la generación de planes nutricionales y listas de compras.

---

## PARTE 1: Auditoría del Software

## 1.1 Estado Actual de Funcionalidades

### ✅ Funcionalidades Implementadas

| Funcionalidad | Estado | Calidad |
|---------------|--------|---------|
| Dashboard principal | ✅ Completo | Alta |
| Gestión de pacientes | ✅ Completo | Alta |
| Registro de mediciones | ✅ Completo | Alta |
| Gráficos de evolución | ✅ Completo | Alta |
| Planes con macros | ✅ Completo | Media |
| Generación automática de planes | ✅ Completo | Media |
| Vista detallada del plan | ✅ Completo | Media |
| Lista de compras | ⚠️ Incompleto | Baja |
| Pacientes en riesgo | ✅ Completo | Alta |
| Citas y agenda | ✅ Completo | Media |

### ⚠️ Áreas que Requieren Mejora

#### 1. Lista de Compras
- **Problema**: No muestra los items de forma visible cuando ya existe una lista
- **Necesita**: Mostrar categorías, items, cantidades agregadas, checklist

#### 2. Generación de Planes
- **Problema**: Solo usa plantillas predefinidas
- **Necesita**: Personalización basada en preferencias del paciente

#### 3. Detalle de Comidas
- **Problema**: Las comidas se generan pero no hay forma de personalizarlas después
- **Necesita**: Editar meals, cambiar alimentos, ajustar porciones

#### 4. Seguimiento del Paciente
- **Problema**: Solo el nutritionist puede ver datos
- **Necesita**: Portal del paciente (Fase 2)

---

## 1.2 Bugs y Problemas Identificados

### Bugs Activos

| Bug | Severity | Ubicación |
|-----|----------|------------|
| Lista de compras no muestra items | Alta | ShoppingList.tsx |
| No hay forma de editar meals del plan | Media | PlanDetail.tsx |
| No hay portal para el paciente | Alta | No existe |
| Measurements: RLS puede bloquear inserciones | Media | useCreateMeasurement |

---

## 1.3 Propuestas de Mejora Inmediata

### Prioridad Alta

1. **Mejorar Lista de Compras**
   - Mostrar categorías e items siempre
   - Agregar checklist interactivo
   - Persistir estado de compras

2. **Agregar edición de meals**
   - allows nutritionist to modify foods in each meal
   - Add/remove foods from meals
   - Adjust portions

3. **Mejoras visuales del plan**
   - Distribution bar of calories by meal
   - More icons for food categories
   - Better print layout

### Prioridad Media

4. **Agregar más métricas**
   - Agua diaria recomendada
   - Ejercicio recomendado
   - Suplementos

5. **Mejoras en citas**
   - Notificaciones automáticas
   - Recordatorios 24h antes

---

## PARTE 2: Implementación de LLM

## 2.1 Visión General

### ¿Por qué un LLM?

Actualmente, los planes se generan usando plantillas predefinidas. Un LLM permitiría:

1. **Personalización real**: Adaptar el plan a las preferencias específicas del paciente
2. **Variedad**: No comer los mismos alimentos todos los días
3. **Adaptación**: Ajustar según restricciones (alergias, intolerancias)
4. **Mejora continua**: El LLM aprende de los comentarios del paciente

### Objetivo

Crear un sistema que:
- Input: Datos del paciente, objetivo, restricciones
- Output: Plan nutricional personalizado + Lista de compras

---

## 2.2 Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA LLM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PACIENTE                                                   │
│  ┌─────────────────┐                                       │
│  │ • Objetivo      │                                       │
│  │ • Restricciones │────┐                                  │
│  │ • Preferencias  │    │                                  │
│  │ • Alergias      │    ▼                                  │
│  └─────────────────┘    ┌─────────────────────────────┐   │
│                        │     API LLM (OpenAI/Gemini)   │   │
│                        │     + System Prompt           │   │
│                        └───────────────┬───────────────┘   │
│                                        │                   │
│                                        ▼                   │
│                        ┌───────────────────────────────┐   │
│                        │   PLAN NUTRICIONAL             │   │
│                        │   + LISTA DE COMPRAS          │   │
│                        └───────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2.3 Selección del LLM

### Opciones de Bajo Costo

| LLM | Costo por 1K tokens | Calidad | Velocidad | Recomendación |
|-----|---------------------|---------|-----------|---------------|
| **GPT-4o Mini** | $0.15 | Alta | Rápida | ✅ **MEJOR OPCIÓN** |
| **GPT-3.5 Turbo** | $0.50 | Media | Rápida | ✅ Alternativa |
| **Gemini Flash** | $0.00* | Alta | Rápida | ⚠️ Limitado |
| **Claude Haiku** | $0.25 | Alta | Rápida | ✅ Alternativa |

*Gratis hasta cierto límite

### Recomendación: GPT-4o Mini

- Mejor costo-beneficio
- Suficiente para generación de planes
- Compatible con estructura de JSON
- API estable

---

## 2.4 System Prompt Propuesto

```python
SYSTEM_PROMPT = """
Eres un nutricionista profesional con 10 años de experiencia. 
Tu tarea es crear planes nutricionales personalizados y listas de compras.

## CONTEXTO DEL PACIENTE
- Objetivo: {objective} (perder peso, ganar músculo, mantener, médico)
- Restricciones: {restrictions}
- Preferencias: {preferences}
- Calorías diarias objetivo: {daily_calories} kcal
- Macros objetivo: P: {protein}g, C: {carbs}g, G: {fat}g

## INSTRUCCIONES

1. GENERA UN PLAN PARA 7 DÍAS (debes responder en JSON)
2. Cada día debe tener 5 comidas: Desayuno, Media mañana, Almuerzo, Merienda, Cena
3. Cada comida debe incluir:
   - Nombre de la comida
   - Hora aproximada
   - Lista de alimentos con cantidades específicas (en gramos o unidades)
   - Macros de esa comida (debe sumar correctamente)

4. RESTRICCIONES IMPORTANTES:
   - No repetitions más de 2 veces la misma comida en la semana
   - Incluye variedad de proteínas: pollo, pescado, carne, huevos, legumbres
   - Incluye variedad de verduras: mínimo 5 diferentes por día
   - Los alimentos deben ser reales y alcanzables en supermercado

5. GENERA LISTA DE COMPRAS:
   - Agrega todas las cantidades de alimentos del plan semanal
   - Agrupa por categoría: proteínas, verduras, frutas, lácteos, cereales, grasas
   - Calcula el total de cada producto

## FORMATO DE RESPUESTA (JSON)

{
  "plan": {
    "days": [
      {
        "day": 1,
        "day_name": "Lunes",
        "meals": [
          {
            "type": "breakfast",
            "name": "Nombre de la comida",
            "time": "08:00",
            "calories": 350,
            "protein": 25,
            "carbs": 30,
            "fat": 15,
            "foods": [
              {"name": "Alimento", "quantity": 100, "unit": "g"}
            ]
          }
        ]
      }
    ]
  },
  "shopping_list": {
    "proteins": [{"name": "Pollo", "total_quantity": 1500, "unit": "g"}],
    "vegetables": [...],
    "fruits": [...],
    "dairy": [...],
    "grains": [...],
    "fats": [...]
  }
}

Sé preciso con los cálculos de macros. La suma de todas las comidas debe coincidir con las kcal objetivo.
"""
```

---

## 2.5 Flujo de Implementación

### Fase 1: Integración Básica (1-2 días)

```typescript
// Pseudocódigo
async function generatePlanWithLLM(patientData: PatientData) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(patientData) }
    ],
    response_format: { type: "json_object" }
  })
  
  const plan = JSON.parse(response.choices[0].message.content)
  
  // Guardar en base de datos
  await savePlanToDatabase(plan)
  await saveShoppingListToDatabase(plan.shopping_list)
  
  return plan
}
```

### Fase 2: Manejo de Errores y Retry (1 día)

- Si el LLM falla, usar plantilla de respaldo
- Retry automático con prompt simplificado
- Logging de errores para debugging

### Fase 3: Caché y Optimización (1 día)

- Cachear planes generados
- No regenerar si el paciente no cambió preferencias
- Rate limiting para evitar excesos de API

---

## 2.6 Costos Estimados

### Scenario: 100 pacientes, 1 plan por mes

| Concepto | Cálculo | Costo mensual |
|----------|---------|---------------|
| Tokens por plan | ~3,000 tokens | |
| Costo por paciente | $0.15 × 3K = $0.45 | |
| **100 pacientes** | $0.45 × 100 | **$45/month** |
| Buffer (errores/retry) | +20% | **$54/month** |

### Escala

| Pacientes/Mes | Costo estimado |
|---------------|-----------------|
| 50 | $27 |
| 100 | $54 |
| 500 | $270 |
| 1000 | $540 |

---

## 2.7 Datos del Paciente para el LLM

### Input Requerido

```typescript
interface LLMInput {
  // Datos del paciente
  name: string
  age: number
  weight: number
  height: number
  imc: number
  
  // Objetivo
  objective: 'lose_weight' | 'gain_weight' | 'maintain' | 'muscle_gain' | 'medical'
  target_weight?: number
  
  // Restricciones
  restrictions: {
    allergies: string[]        // ej: ['gluten', 'lactosa']
    intolerances: string[]     // ej: ['fructosa']
    rejected_foods: string[]    // ej: ['pollo', 'pescado']
    preferred_foods: string[]   // ej: ['arroz', 'pasta']
  }
  
  // Macros objetivo (calculados por el sistema)
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  
  // Preferencias del nutritionist
  meal_count: number           // typically 5
  snack_allowed: boolean
}
```

---

## 2.8 Beneficios del LLM vs Plantillas

| Aspecto | Plantillas Actuales | Con LLM |
|---------|---------------------|---------|
| Variedad | Limitada (10 plantillas) | Ilimitada |
| Personalización | Genérica | Personalizada |
| Preferencias | No consideradas | Respetadas |
| Alergias | Manual | Automático |
| Tiempo de creación | 30 segundos | 3-5 segundos |
| Costo | $0 | $0.45/plan |

---

## PARTE 3: Roadmap de Implementación

### Corto Plazo (1-2 semanas)

1. ✅ Completar Lista de Compras (fix actual)
2. ✅ Agregar edición de meals
3. 🔄 Implementar LLM básica

### Medio Plazo (1-2 meses)

4. Portal del paciente (ver su plan, registrar comidas)
5. Notificaciones automáticas
6. Mejoras con feedback del LLM

### Largo Plazo (3-6 meses)

7. Chat con el paciente (consultas sobre el plan)
8. Ajuste automático del plan basado en progreso
9. Integración con wearables (Apple Health, Google Fit)

---

## Conclusión

### Estado Actual
NutriFlow es un MVP sólido con las funcionalidades core implementadas. La lista de compras y algunas mejoras menores son las áreas prioritarias de mejora.

### Oportunidad LLM
La implementación de un LLM de bajo costo ($45/mes para 100 pacientes) permitiría:
- Planes verdaderamente personalizados
- Listas de compra automáticas y precisas
- Diferenciación competitiva significativa
- Escalabilidad sin incremento proporcional de esfuerzo

### Inversión Recomendada
- **Corto plazo**: $0 (mejoras de código)
- **Mediano plazo**: $54/mes (LLM básico)
- **ROI**: La feature de LLM se convierte en el principal diferenciador para inversores

---

*Documento generado: Abril 2026*
*Versión: 1.0*