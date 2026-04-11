# NutriFlow - Propuesta de Mejora: Lista de Compras

## Estado Actual

La lista de compras actual muestra:
- ✅ Código QR (decorativo, no funcional)
- ✅ Botón "Generar lista" 
- ⚠️ Si ya existe una lista, muestra solo los totales
- ❌ **No muestra las categorías/items de forma visible**
- ❌ **No hay forma de ver el detalle de la lista si ya fue generada**

---

## Análisis del Problema

### Lo que debería mostrar (basado en el plan nutricional)

Cuando el nutritionist genera un plan con comidas, el sistema tiene todos los datos necesarios:
- 35 comidas (5 días × 7 comidas)
- Cada comida tiene alimentos con cantidades específicas
- Los alimentos están categorizados (proteínas, verduras, frutas, etc.)

### La lista de compras ideal debería:

1. **Mostrar todas las categorías** con sus items
   - Proteínas: Pollo, Huevos, Salmón, etc.
   - Verduras: Espinacas, Brócoli, Zanahoria, etc.
   - Fruits: Plátano, Manzana, Fresas, etc.
   - Lácteos: Yogur, Leche, Queso, etc.
   - Cereales: Arroz, Avena, Pasta, etc.
   - Grasas: Aceite, Nueces, Aguacate, etc.

2. **Mostrar la cantidad total** de cada producto
   - Ejemplo: Huevos (14 unidades) = 2 por día × 7 días
   
3. ** быть able to**
   - Marcar items comprados (checklist)
   - Expandir/colapsar categorías
   - Exportar/imprimir la lista

---

## Propuesta de Mejora

### Estructura Visual Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 LISTA DE COMPRAS SEMANAL                                 │
│ Paciente: [Nombre] • Plan: [Nombre del plan]                │
├─────────────────────────────────────────────────────────────┤
│ ✅ PROGRESS: 12/45 items (27%)                               │
├─────────────────────────────────────────────────────────────┤
│ 🥩 PROTEÍNAS (5 items)                     [▼]              │
│ ─────────────────────────────────────────                  │
│ ☐ Pechuga de pollo ................. 1,050g (7 días × 150g)│
│ ☐ Huevos ............................. 14 unidades          │
│ ☐ Salmón ............................ 980g                │
│ ☐ Carne molida ....................... 700g                │
│ ☐ Atún en lata ....................... 7 unidades          │
├─────────────────────────────────────────────────────────────┤
│ 🥦 VERDURAS (8 items)                       [▼]              │
│ ─────────────────────────────────────────                  │
│ ☐ Espinacas ......................... 700g                │
│ ☐ Brócoli ............................. 700g                │
│ ☐ Zanahoria .......................... 350g                │
│ ...                                                      │
├─────────────────────────────────────────────────────────────┤
│ 🍎 FRUTAS (4 items)                         [▼]              │
├─────────────────────────────────────────────────────────────┤
│ 🥛 LÁCTEOS (3 items)                         [▼]              │
├─────────────────────────────────────────────────────────────┤
│ 🍚 CERALES (5 items)                         [▼]              │
├─────────────────────────────────────────────────────────────┤
│ 🫒 GRASAS (4 items)                         [▼]              │
├─────────────────────────────────────────────────────────────┤
│ [ 🖨️ Imprimir lista ]  [ 📧 Enviar al paciente ]           │
└─────────────────────────────────────────────────────────────┘
```

---

## Mejoras Técnicas Propuestas

### 1. Página de Lista de Compras

**Problema actual**: No muestra nada si ya existe una lista

**Solución**:
- Mostrar siempre las categorías e items
- Si no existe lista, mostrar botón de generar
- Si existe, mostrar los items con su estado

### 2. Datos de Entrada

Los datos ya están en la base de datos:
- Tabla `meal_food` tiene los alimentos de cada comida
- Campo `category` indica la categoría
- Campo `quantity` indica la cantidad
- Campo `unit` indica la unidad (g, ml, piece, etc.)

### 3. Agregación de Datos

La lista debe agregar las cantidades:
```sql
-- Ejemplo de cómo debería funcionar
SELECT 
  food_name,
  SUM(quantity) as total_quantity,
  unit,
  category
FROM meal_food
JOIN meal ON meal.id = meal_food.meal_id
JOIN nutrition_plan ON nutrition_plan.id = meal.plan_id
WHERE nutrition_plan.patient_id = :patientId
  AND nutrition_plan.is_active = true
GROUP BY food_name, unit, category
```

### 4. Funcionalidades Adicionales

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|----------|
| Checklist interactivo | Marcar items comprados | Alta |
| Expandir/colapsar | Ver detalle por categoría | Alta |
| Imprimir | Diseño para imprimir | Media |
| Enviar al paciente | Email o WhatsApp | Baja |
| Persistencia | Guardar estado de compras | Alta |

---

## Roadmap de Implementación

### Fase 1: Mostrar Lista (Priority Alta)
- [ ] Fix: Mostrar items de la lista aunque ya exista
- [ ] Mostrar todas las categorías con sus items
- [ ] Mostrar cantidad total agregada por producto

### Fase 2: Interactividad (Priority Alta)
- [ ] Checklist para marcar items comprados
- [ ] Persistir el estado en la base de datos
- [ ] Mostrar progreso (X de Y items)

### Fase 3: Exportación (Priority Media)
- [ ] Diseño para imprimir
- [ ] Botón de exportar a PDF
- [ ] Optimizar para móvil

---

## Conclusión

La lista de compras es uno de los features de mayor valor para el paciente. Actualmente no está mostrando la información de forma útil. Con las mejoras propuestas, el paciente podrá:

1. ✅ Ver exactamente qué necesita comprar
2. ✅ Saber las cantidades totales
3. ✅ Organizar sus compras por categoría
4. ✅ Marcar lo que ya compró
5. ✅ Imprimir la lista para el supermercado

Esto diferencia a NutriFlow de cualquier otro software de nutrición en el mercado.