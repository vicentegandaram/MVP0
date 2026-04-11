# NutriFlow - Propuesta de Mejora: Vista del Plan Nutricional

## Estado Actual

La vista actual del plan completo muestra:
- ✅ Día de la semana (LUNES)
- ✅ Totales diarios de macros (1680 kcal, P: 106g, C: 140g, G: 46g)
- ❌ **NO muestra las comidas individuales** (Desayuno, Almuerzo, Cena, etc.)
- ❌ **NO muestra los alimentos** de cada comida

---

## Análisis del Problema

El resultado esperado debería mostrar las 5-6 comidas del día:
```
LUNES
═══════════════════════════════════════════

🥣 DESAYUNO (08:00) ─── 350 kcal | P: 25g C: 15g G: 20g
   • Huevos revueltos (2 unidades)
   • Espinacas (50g)
   • Tomate (50g)
   • Aceite de oliva (10ml)

☕ MEDIA MAÑANA (11:00) ─── 180 kcal | P: 12g C: 25g G: 3g
   • Yogur natural descremado (150g)
   • Fresas (50g)

🍽️ ALMUERZO (14:00) ─── 550 kcal | P: 45g C: 50g G: 18g
   • Pechuga de pollo (150g)
   • Arroz integral (80g)
   • Brócoli (100g)
   • Zanahoria (50g)
   • Aceite de oliva (10ml)

🍪 MERIENDA (17:30) ─── 250 kcal | P: 25g C: 30g G: 5g
   • Batido proteico
   • Plátano (1 unidad)

🌙 CENA (21:00) ─── 350 kcal | P: 30g C: 20g G: 15g
   • Merluza al horno (150g)
   • Patatas asadas (100g)
   • Ensalada mixta (80g)

═══════════════════════════════════════════
TOTAL DÍA: 1680 kcal | P: 106g C: 140g G: 46g ✓
```

---

## Propuestas de Mejora

### 1. Mostrar Todas las Comidas del Día

**Problema**: Solo se ve el total, no las comidas individuales

**Solución**: Crear cards para cada comida con:
- Nombre de la comida (Desayuno, Almuerzo, etc.)
- Hora aproximada
- Macros de esa comida
- Lista de alimentos

### 2. Distribución Visual de Macros

**Agregar indicador visual de cómo se distribuyen los macros:**
```
Distribución de calorías:
Desayuno ████████░░░ 350kcal (21%)
Media MA█████░░░░░░ 180kcal (11%)
Almuerzo █████████████ 550kcal (33%)
Merienda ████░░░░░░░░ 250kcal (15%)
Cena    ██████░░░░░░ 350kcal (20%)
```

### 3. Progress Bar de Macros

**Mostrar cuánto representa cada comida del total:**
- Comparar macros de cada comida vs objetivo diario
- Color verde si está en rango
- Color rojo si excede

### 4. Diseño de Tarjetas por Comida

```
┌──────────────────────────────────────────────────────────┐
│ 🥣 DESAYUNO                              350 kcal      │
│ 08:00                                   P:25 C:15 G:20  │
├──────────────────────────────────────────────────────────┤
│ • Huevos revueltos .............. 2 unidades            │
│ • Espinacas ..................... 50g                   │
│ • Tomate ........................ 50g                   │
│ • Aceite de oliva ............... 10ml                  │
└──────────────────────────────────────────────────────────┘
```

### 5. Vista de Semana Completa

**Opcional: Ver toda la semana de un vistazo:**
- Una fila por día
- Columns para cada comida
- Quick view de totales

---

## Comparación: Antes vs Después

### Antes (Actual)
```
LUNES
════════════════════════════
1680 kcal
P: 106g | C: 140g | G: 46g
```

### Después (Propuesto)
```
LUNES 7 DE ENERO
═══════════════════════════════════════════════════════

🥣 DESAYUNO (08:00) .......... 350 kcal | P:25g C:15g G:20g
   Huevos (2) • Espinacas (50g) • Tomate (50g)

☕ MEDIA MAÑANA (11:00) ....... 180 kcal | P:12g C:25g G:3g
   Yogur (150g) • Fresas (50g)

🍽️ ALMUERZO (14:00) .......... 550 kcal | P:45g C:50g G:18g
   Pollo (150g) • Arroz (80g) • Brócoli (100g)

🍪 MERIENDA (17:30) .......... 250 kcal | P:25g C:30g G:5g
   Batido proteico • Plátano (1)

🌙 CENA (21:00) .............. 350 kcal | P:30g C:20g G:15g
   Merluza (150g) • Patatas (100g)

═══════════════════════════════════════════════════════
TOTAL: 1680 kcal ✓ (objetivo: 1800 kcal)
P: 106g | C: 140g | G: 46g
```

---

## Roadmap de Implementación

### Fase 1: Mostrar Comidas (Priority Alta)
- [ ] Loop through all meals for the selected day
- [ ] Display each meal as a card with:
  - Meal name (Desayuno, Almuerzo, etc.)
  - Time
  - Calories and macros
  - List of foods

### Fase 2: Mejoras Visuales (Priority Media)
- [ ] Add icons for each meal type
- [ ] Add progress bar showing % of daily macros
- [ ] Color code by meal type

### Fase 3: Interactividad (Priority Low)
- [ ] Click on meal to see full detail
- [ ] Add notes to meals
- [ ] Mark meals as completed (for patient tracking)

---

## Conclusión

La vista actual muestra solo los totales, pero el verdadero valor está en ver **cada comida con sus alimentos específicos**. Esto permite:

1. **Al paciente**: Saber exactamente qué comer y cuándo
2. **Al nutricionista**: Ver si el plan está bien equilibrado
3. **Seguimiento**: El paciente puede marcar qué comidas completó

Con estas mejoras, el plan nutricional será tan detallado como el PDF profesional que mostraste como ejemplo.