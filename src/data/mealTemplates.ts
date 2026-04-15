export type MealObjective = 'lose_weight' | 'muscle_gain' | 'maintain' | 'medical'

export interface MealTemplateFood {
  name: string
  quantity: number
  unit: 'g' | 'ml' | 'piece' | 'cup'
  category: 'protein' | 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'fats' | 'other'
}

export interface MealTemplate {
  name: string
  meal_type: 'breakfast' | 'mid_morning' | 'lunch' | 'afternoon' | 'dinner' | 'snack'
  calories: number
  protein: number
  carbs: number
  fat: number
  foods: MealTemplateFood[]
}

export const mealTemplatesByObjective: Record<MealObjective, MealTemplate[]> = {
  lose_weight: [
    // Desayuno
    {
      name: 'Huevos revueltos con verduras',
      meal_type: 'breakfast',
      calories: 350,
      protein: 25,
      carbs: 15,
      fat: 20,
      foods: [
        { name: 'Huevo', quantity: 2, unit: 'piece', category: 'protein' },
        { name: 'Espinacas', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Tomate', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 10, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Avena con frutas y nueces',
      meal_type: 'breakfast',
      calories: 380,
      protein: 12,
      carbs: 55,
      fat: 14,
      foods: [
        { name: 'Avena', quantity: 50, unit: 'g', category: 'grains' },
        { name: 'Plátano', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Nueces', quantity: 15, unit: 'g', category: 'fats' },
        { name: 'Leche descremada', quantity: 200, unit: 'ml', category: 'dairy' }
      ]
    },
    // Media mañana
    {
      name: 'Yogur con frutos rojos',
      meal_type: 'mid_morning',
      calories: 180,
      protein: 12,
      carbs: 25,
      fat: 3,
      foods: [
        { name: 'Yogur griego', quantity: 150, unit: 'ml', category: 'dairy' },
        { name: 'Fresas', quantity: 50, unit: 'g', category: 'fruits' },
        { name: 'Arándanos', quantity: 30, unit: 'g', category: 'fruits' }
      ]
    },
    {
      name: 'Manzana con almendras',
      meal_type: 'mid_morning',
      calories: 200,
      protein: 4,
      carbs: 25,
      fat: 10,
      foods: [
        { name: 'Manzana', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Almendras', quantity: 15, unit: 'g', category: 'fats' }
      ]
    },
    // Almuerzo
    {
      name: 'Pechuga de pollo con arroz y verduras',
      meal_type: 'lunch',
      calories: 550,
      protein: 45,
      carbs: 50,
      fat: 15,
      foods: [
        { name: 'Pechuga de pollo', quantity: 150, unit: 'g', category: 'protein' },
        { name: 'Arroz integral', quantity: 80, unit: 'g', category: 'grains' },
        { name: 'Brócoli', quantity: 100, unit: 'g', category: 'vegetables' },
        { name: 'Zanahoria', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 10, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Salmón con batata y ensalada',
      meal_type: 'lunch',
      calories: 520,
      protein: 40,
      carbs: 45,
      fat: 18,
      foods: [
        { name: 'Salmón', quantity: 140, unit: 'g', category: 'protein' },
        { name: 'Batata', quantity: 100, unit: 'g', category: 'grains' },
        { name: 'Lechuga', quantity: 80, unit: 'g', category: 'vegetables' },
        { name: 'Tomate', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 15, unit: 'ml', category: 'fats' }
      ]
    },
    // Merienda
    {
      name: 'Batido proteico con plátano',
      meal_type: 'afternoon',
      calories: 250,
      protein: 25,
      carbs: 30,
      fat: 5,
      foods: [
        { name: 'Proteína de suero', quantity: 30, unit: 'g', category: 'protein' },
        { name: 'Plátano', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Leche descremada', quantity: 250, unit: 'ml', category: 'dairy' }
      ]
    },
    {
      name: 'Requesón con pepino',
      meal_type: 'afternoon',
      calories: 180,
      protein: 20,
      carbs: 8,
      fat: 8,
      foods: [
        { name: 'Requesón', quantity: 100, unit: 'g', category: 'dairy' },
        { name: 'Pepino', quantity: 100, unit: 'g', category: 'vegetables' }
      ]
    },
    // Cena
    {
      name: 'Merluza con ensalada mixta',
      meal_type: 'dinner',
      calories: 400,
      protein: 35,
      carbs: 20,
      fat: 18,
      foods: [
        { name: 'Merluza', quantity: 150, unit: 'g', category: 'protein' },
        { name: 'Lechuga', quantity: 80, unit: 'g', category: 'vegetables' },
        { name: 'Tomate', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Pepino', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 15, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Tortilla de claras con verduras',
      meal_type: 'dinner',
      calories: 350,
      protein: 30,
      carbs: 12,
      fat: 20,
      foods: [
        { name: 'Claras de huevo', quantity: 150, unit: 'ml', category: 'protein' },
        { name: 'Espinacas', quantity: 80, unit: 'g', category: 'vegetables' },
        { name: 'Champiñones', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 10, unit: 'ml', category: 'fats' }
      ]
    }
  ],
  muscle_gain: [
    // Desayuno
    {
      name: 'Huevos revueltos con bacon y pan',
      meal_type: 'breakfast',
      calories: 550,
      protein: 35,
      carbs: 40,
      fat: 28,
      foods: [
        { name: 'Huevo', quantity: 3, unit: 'piece', category: 'protein' },
        { name: 'Bacon', quantity: 50, unit: 'g', category: 'protein' },
        { name: 'Pan integral', quantity: 60, unit: 'g', category: 'grains' },
        { name: 'Queso cheddar', quantity: 30, unit: 'g', category: 'dairy' }
      ]
    },
    {
      name: 'Batido de avena con plátano y peanut butter',
      meal_type: 'breakfast',
      calories: 500,
      protein: 25,
      carbs: 65,
      fat: 18,
      foods: [
        { name: 'Avena', quantity: 60, unit: 'g', category: 'grains' },
        { name: 'Plátano', quantity: 2, unit: 'piece', category: 'fruits' },
        { name: 'Mantequilla de maní', quantity: 30, unit: 'g', category: 'fats' },
        { name: 'Leche entera', quantity: 300, unit: 'ml', category: 'dairy' }
      ]
    },
    // Media mañana
    {
      name: 'Pollo con arroz',
      meal_type: 'mid_morning',
      calories: 450,
      protein: 40,
      carbs: 45,
      fat: 12,
      foods: [
        { name: 'Pechuga de pollo', quantity: 120, unit: 'g', category: 'protein' },
        { name: 'Arroz blanco', quantity: 80, unit: 'g', category: 'grains' }
      ]
    },
    {
      name: 'Barra proteica con frutos secos',
      meal_type: 'mid_morning',
      calories: 350,
      protein: 25,
      carbs: 35,
      fat: 15,
      foods: [
        { name: 'Barra proteica', quantity: 1, unit: 'piece', category: 'protein' },
        { name: 'Almendras', quantity: 20, unit: 'g', category: 'fats' }
      ]
    },
    // Almuerzo
    {
      name: 'Bistec con arroz y patatas',
      meal_type: 'lunch',
      calories: 700,
      protein: 50,
      carbs: 70,
      fat: 25,
      foods: [
        { name: 'Bistec', quantity: 180, unit: 'g', category: 'protein' },
        { name: 'Arroz blanco', quantity: 120, unit: 'g', category: 'grains' },
        { name: 'Patata', quantity: 150, unit: 'g', category: 'grains' },
        { name: 'Aceite de oliva', quantity: 15, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Pasta con carne molida y queso',
      meal_type: 'lunch',
      calories: 680,
      protein: 45,
      carbs: 75,
      fat: 22,
      foods: [
        { name: 'Pasta', quantity: 120, unit: 'g', category: 'grains' },
        { name: 'Carne molida', quantity: 150, unit: 'g', category: 'protein' },
        { name: 'Salsa de tomate', quantity: 80, unit: 'g', category: 'vegetables' },
        { name: 'Queso parmesano', quantity: 30, unit: 'g', category: 'dairy' }
      ]
    },
    // Merienda
    {
      name: 'Batido masivo de plátano',
      meal_type: 'afternoon',
      calories: 450,
      protein: 35,
      carbs: 55,
      fat: 12,
      foods: [
        { name: 'Proteína de suero', quantity: 40, unit: 'g', category: 'protein' },
        { name: 'Plátano', quantity: 2, unit: 'piece', category: 'fruits' },
        { name: 'Avena', quantity: 30, unit: 'g', category: 'grains' },
        { name: 'Leche entera', quantity: 300, unit: 'ml', category: 'dairy' }
      ]
    },
    {
      name: 'Sandwich de pavo y queso',
      meal_type: 'afternoon',
      calories: 400,
      protein: 30,
      carbs: 35,
      fat: 18,
      foods: [
        { name: 'Pan', quantity: 80, unit: 'g', category: 'grains' },
        { name: 'Pavo', quantity: 100, unit: 'g', category: 'protein' },
        { name: 'Queso', quantity: 40, unit: 'g', category: 'dairy' },
        { name: 'Aguacate', quantity: 50, unit: 'g', category: 'fats' }
      ]
    },
    // Cena
    {
      name: 'Salmón con quinoa y verduras',
      meal_type: 'dinner',
      calories: 550,
      protein: 45,
      carbs: 40,
      fat: 25,
      foods: [
        { name: 'Salmón', quantity: 160, unit: 'g', category: 'protein' },
        { name: 'Quinoa', quantity: 80, unit: 'g', category: 'grains' },
        { name: 'Espárragos', quantity: 100, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 15, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Pollo al curry con arroz',
      meal_type: 'dinner',
      calories: 580,
      protein: 45,
      carbs: 55,
      fat: 20,
      foods: [
        { name: 'Pechuga de pollo', quantity: 160, unit: 'g', category: 'protein' },
        { name: 'Arroz basmati', quantity: 100, unit: 'g', category: 'grains' },
        { name: 'Leche de coco', quantity: 100, unit: 'ml', category: 'dairy' },
        { name: 'Curry', quantity: 10, unit: 'g', category: 'other' }
      ]
    }
  ],
  maintain: [
    // Desayuno
    {
      name: 'Tostadas con aguacate y huevo',
      meal_type: 'breakfast',
      calories: 450,
      protein: 20,
      carbs: 35,
      fat: 25,
      foods: [
        { name: 'Pan integral', quantity: 60, unit: 'g', category: 'grains' },
        { name: 'Aguacate', quantity: 80, unit: 'g', category: 'fats' },
        { name: 'Huevo', quantity: 1, unit: 'piece', category: 'protein' },
        { name: 'Tomate', quantity: 50, unit: 'g', category: 'vegetables' }
      ]
    },
    {
      name: 'Smoothie proteico de frutas',
      meal_type: 'breakfast',
      calories: 380,
      protein: 20,
      carbs: 55,
      fat: 10,
      foods: [
        { name: 'Plátano', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Fresas', quantity: 80, unit: 'g', category: 'fruits' },
        { name: 'Proteína de suero', quantity: 25, unit: 'g', category: 'protein' },
        { name: 'Leche de almendra', quantity: 250, unit: 'ml', category: 'dairy' }
      ]
    },
    // Media mañana
    {
      name: 'Fruta con nueces',
      meal_type: 'mid_morning',
      calories: 250,
      protein: 5,
      carbs: 30,
      fat: 12,
      foods: [
        { name: 'Uvas', quantity: 100, unit: 'g', category: 'fruits' },
        { name: 'Nueces', quantity: 20, unit: 'g', category: 'fats' }
      ]
    },
    {
      name: 'Hummus con verduras',
      meal_type: 'mid_morning',
      calories: 200,
      protein: 8,
      carbs: 20,
      fat: 10,
      foods: [
        { name: 'Hummus', quantity: 80, unit: 'g', category: 'protein' },
        { name: 'Zanahoria', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Apio', quantity: 50, unit: 'g', category: 'vegetables' }
      ]
    },
    // Almuerzo
    {
      name: 'Ensalada de pollo con quinoa',
      meal_type: 'lunch',
      calories: 500,
      protein: 40,
      carbs: 40,
      fat: 18,
      foods: [
        { name: 'Pechuga de pollo', quantity: 130, unit: 'g', category: 'protein' },
        { name: 'Quinoa', quantity: 70, unit: 'g', category: 'grains' },
        { name: 'Lechuga', quantity: 80, unit: 'g', category: 'vegetables' },
        { name: 'Tomate', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 15, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Wrap de ternera con verduras',
      meal_type: 'lunch',
      calories: 480,
      protein: 35,
      carbs: 45,
      fat: 20,
      foods: [
        { name: 'Ternera', quantity: 120, unit: 'g', category: 'protein' },
        { name: 'Tortilla de harina', quantity: 1, unit: 'piece', category: 'grains' },
        { name: 'Lechuga', quantity: 50, unit: 'g', category: 'vegetables' },
        { name: 'Tomate', quantity: 40, unit: 'g', category: 'vegetables' }
      ]
    },
    // Merienda
    {
      name: 'Yogur con granola',
      meal_type: 'afternoon',
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 10,
      foods: [
        { name: 'Yogur', quantity: 200, unit: 'ml', category: 'dairy' },
        { name: 'Granola', quantity: 40, unit: 'g', category: 'grains' },
        { name: 'Miel', quantity: 10, unit: 'g', category: 'other' }
      ]
    },
    {
      name: 'Galletas con queso',
      meal_type: 'afternoon',
      calories: 280,
      protein: 10,
      carbs: 30,
      fat: 14,
      foods: [
        { name: 'Galletas integrales', quantity: 30, unit: 'g', category: 'grains' },
        { name: 'Queso cottage', quantity: 80, unit: 'g', category: 'dairy' }
      ]
    },
    // Cena
    {
      name: 'Pescado al horno con verduras',
      meal_type: 'dinner',
      calories: 420,
      protein: 35,
      carbs: 25,
      fat: 20,
      foods: [
        { name: 'Pescado blanco', quantity: 150, unit: 'g', category: 'protein' },
        { name: 'Patata', quantity: 100, unit: 'g', category: 'grains' },
        { name: 'Judías verdes', quantity: 80, unit: 'g', category: 'vegetables' },
        { name: 'Aceite de oliva', quantity: 15, unit: 'ml', category: 'fats' }
      ]
    },
    {
      name: 'Estofado de carne con verduras',
      meal_type: 'dinner',
      calories: 500,
      protein: 40,
      carbs: 35,
      fat: 22,
      foods: [
        { name: 'Carne de ternera', quantity: 140, unit: 'g', category: 'protein' },
        { name: 'Patata', quantity: 100, unit: 'g', category: 'grains' },
        { name: 'Zanahoria', quantity: 60, unit: 'g', category: 'vegetables' },
        { name: 'Cebolla', quantity: 50, unit: 'g', category: 'vegetables' }
      ]
    }
  ],
  medical: [
    // Desayuno - Más suave
    {
      name: 'Papilla de avena con manzana',
      meal_type: 'breakfast',
      calories: 350,
      protein: 10,
      carbs: 60,
      fat: 8,
      foods: [
        { name: 'Avena', quantity: 60, unit: 'g', category: 'grains' },
        { name: 'Manzana', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Leche descremada', quantity: 200, unit: 'ml', category: 'dairy' },
        { name: 'Canela', quantity: 2, unit: 'g', category: 'other' }
      ]
    },
    {
      name: 'Tostada de pan integral con plátano',
      meal_type: 'breakfast',
      calories: 320,
      protein: 8,
      carbs: 55,
      fat: 9,
      foods: [
        { name: 'Pan integral', quantity: 60, unit: 'g', category: 'grains' },
        { name: 'Plátano', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Mermelada sin azúcar', quantity: 20, unit: 'g', category: 'other' }
      ]
    },
    // Media mañana
    {
      name: 'Fruta madura',
      meal_type: 'mid_morning',
      calories: 150,
      protein: 2,
      carbs: 38,
      fat: 1,
      foods: [
        { name: 'Plátano', quantity: 2, unit: 'piece', category: 'fruits' }
      ]
    },
    {
      name: 'Compota de frutas',
      meal_type: 'mid_morning',
      calories: 180,
      protein: 3,
      carbs: 45,
      fat: 1,
      foods: [
        { name: 'Manzana', quantity: 2, unit: 'piece', category: 'fruits' },
        { name: 'Pera', quantity: 1, unit: 'piece', category: 'fruits' },
        { name: 'Canela', quantity: 2, unit: 'g', category: 'other' }
      ]
    },
    // Almuerzo
    {
      name: 'Pollo hervido con arroz blanco',
      meal_type: 'lunch',
      calories: 450,
      protein: 38,
      carbs: 50,
      fat: 10,
      foods: [
        { name: 'Pechuga de pollo', quantity: 140, unit: 'g', category: 'protein' },
        { name: 'Arroz blanco', quantity: 100, unit: 'g', category: 'grains' },
        { name: 'Zanahoria', quantity: 60, unit: 'g', category: 'vegetables' }
      ]
    },
    {
      name: 'Pasta blanca con pollo desmenuzado',
      meal_type: 'lunch',
      calories: 480,
      protein: 35,
      carbs: 60,
      fat: 12,
      foods: [
        { name: 'Pasta', quantity: 100, unit: 'g', category: 'grains' },
        { name: 'Pechuga de pollo', quantity: 100, unit: 'g', category: 'protein' },
        { name: 'Salsa blanca', quantity: 50, unit: 'ml', category: 'dairy' }
      ]
    },
    // Merienda
    {
      name: 'Yogur líquido suave',
      meal_type: 'afternoon',
      calories: 150,
      protein: 8,
      carbs: 25,
      fat: 3,
      foods: [
        { name: 'Yogur líquido', quantity: 200, unit: 'ml', category: 'dairy' }
      ]
    },
    {
      name: 'Galletas María con leche',
      meal_type: 'afternoon',
      calories: 250,
      protein: 6,
      carbs: 40,
      fat: 8,
      foods: [
        { name: 'Galletas María', quantity: 40, unit: 'g', category: 'grains' },
        { name: 'Leche', quantity: 200, unit: 'ml', category: 'dairy' }
      ]
    },
    // Cena
    {
      name: 'Pescado blanco hervido con arroz',
      meal_type: 'dinner',
      calories: 380,
      protein: 32,
      carbs: 40,
      fat: 10,
      foods: [
        { name: 'Pescado blanco', quantity: 140, unit: 'g', category: 'protein' },
        { name: 'Arroz blanco', quantity: 80, unit: 'g', category: 'grains' },
        { name: 'Caldo de verduras', quantity: 150, unit: 'ml', category: 'other' }
      ]
    },
    {
      name: 'Sopa de pollo con fideos',
      meal_type: 'dinner',
      calories: 350,
      protein: 25,
      carbs: 40,
      fat: 12,
      foods: [
        { name: 'Pollo', quantity: 80, unit: 'g', category: 'protein' },
        { name: 'Fideos', quantity: 60, unit: 'g', category: 'grains' },
        { name: 'Caldo de pollo', quantity: 200, unit: 'ml', category: 'other' },
        { name: 'Zanahoria', quantity: 40, unit: 'g', category: 'vegetables' }
      ]
    }
  ]
}

// Obtener plantillas para un objetivo específico
export const getTemplatesForObjective = (objective: MealObjective): MealTemplate[] => {
  return mealTemplatesByObjective[objective] || mealTemplatesByObjective.maintain
}

// Obtener una comida por tipo
export const getMealByType = (objective: MealObjective, mealType: string): MealTemplate | undefined => {
  const templates = getTemplatesForObjective(objective)
  return templates.find(t => t.meal_type === mealType)
}

// Convertir plantilla a estructura de base de datos
export const templateToMealData = (
  template: MealTemplate,
  planId: string,
  dayOfWeek: number
) => ({
  plan_id: planId,
  day_of_week: dayOfWeek,
  meal_type: template.meal_type,
  name: template.name,
  calories: template.calories,
  protein: template.protein,
  carbs: template.carbs,
  fat: template.fat
})

export const templateFoodToMealFoodData = (
  food: MealTemplateFood,
  mealId: string
) => ({
  meal_id: mealId,
  food_name: food.name,
  quantity: food.quantity,
  unit: food.unit,
  category: food.category
})