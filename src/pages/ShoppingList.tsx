import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  CheckCircle2, 
  Circle, 
  Download,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { usePatient, useActiveNutritionPlan, useMeals, useShoppingList } from '../hooks/useApi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import type { Meal, ShoppingItem as ShoppingItemType } from '../types'

interface AggregatedItem {
  name: string
  totalQuantity: number
  unit: string
  category: string
}

interface CategoryGroup {
  category: string
  items: AggregatedItem[]
}

const categoryLabels: Record<string, string> = {
  protein: 'Proteínas',
  vegetables: 'Verduras',
  fruits: 'Frutas',
  dairy: 'Lácteos',
  grains: 'Cereales y tubérculos',
  fats: 'Grasas y aceites',
  other: 'Otros'
}

const categoryIcons: Record<string, string> = {
  protein: '🥩',
  vegetables: '🥦',
  fruits: '🍎',
  dairy: '🥛',
  grains: '🍚',
  fats: '🫒',
  other: '📦'
}

export function ShoppingListPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  
  const { data: patient } = usePatient(patientId || '')
  const { data: activePlan } = useActiveNutritionPlan(patientId || '')
  const { data: meals = [] } = useMeals(activePlan?.id || '')
  const { data: shoppingList, refetch } = useShoppingList(patientId || '')

  useEffect(() => {
    if (patientId) {
      setLoading(false)
    }
  }, [patientId])

  const generateShoppingList = async () => {
    if (!activePlan || !patientId) return
    
    setGenerating(true)
    try {
      const { data: mealFoods, error } = await supabase
        .from('meal_food')
        .select('*')
        .in('meal_id', meals.map((m: Meal) => m.id))
      
      if (error) throw error

      const aggregated: Record<string, AggregatedItem> = {}
      
      mealFoods?.forEach(food => {
        const key = `${food.food_name}-${food.unit}`
        if (aggregated[key]) {
          aggregated[key].totalQuantity += food.quantity
        } else {
          aggregated[key] = {
            name: food.food_name,
            totalQuantity: food.quantity,
            unit: food.unit,
            category: food.category || 'other'
          }
        }
      })

      const { data: list, error: listError } = await supabase
        .from('shopping_list')
        .insert({
          patient_id: patientId,
          week_start_date: new Date().toISOString().split('T')[0],
          name: `Lista de compras - ${activePlan.name}`,
          status: 'draft'
        })
        .select()
        .single()
      
      if (listError) throw listError

      const shoppingItems = Object.values(aggregated).map(item => ({
        shopping_list_id: list.id,
        food_name: item.name,
        quantity: item.totalQuantity,
        unit: item.unit,
        category: item.category,
        is_purchased: false
      }))

      const { error: itemsError } = await supabase
        .from('shopping_item')
        .insert(shoppingItems)
      
      if (itemsError) throw itemsError

      await refetch()
    } catch (err) {
      console.error('Error generating shopping list:', err)
      alert('Error al generar la lista de compras')
    } finally {
      setGenerating(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const toggleItemPurchased = async (itemId: string, currentStatus: boolean) => {
    await supabase
      .from('shopping_item')
      .update({ is_purchased: !currentStatus })
      .eq('id', itemId)
    
    await refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  const categoryGroups: CategoryGroup[] = []
  
  if (shoppingList?.items) {
    const grouped = shoppingList.items.reduce((acc, item) => {
      const cat = item.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, typeof shoppingList.items>)

    Object.entries(grouped).forEach(([category, items]) => {
      categoryGroups.push({
        category,
        items: items.map(item => ({
          name: item.food_name,
          totalQuantity: item.quantity,
          unit: item.unit,
          category: item.category || 'other'
        }))
      })
    })
  }

  const totalItems = shoppingList?.items?.length || 0
  const purchasedItems = shoppingList?.items?.filter(i => i.is_purchased).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/plans/${patientId}`} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
          <p className="text-gray-500">{patient?.name} {patient?.last_name}</p>
        </div>
        
        {!shoppingList && activePlan && (
          <button
            onClick={generateShoppingList}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Generar Lista
              </>
            )}
          </button>
        )}
      </div>

      {!activePlan ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">El paciente no tiene un plan activo</p>
          <Link 
            to={`/plans/${patientId}`}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Crear plan nutricional →
          </Link>
        </div>
      ) : !shoppingList ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Genera una lista de compras basada en el plan nutricional</p>
          <button
            onClick={generateShoppingList}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Generar Lista de Compras
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-gray-500">{purchasedItems} / {totalItems} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            {categoryGroups.map((group) => (
              <div key={group.category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcons[group.category] || '📦'}</span>
                    <span className="font-medium text-gray-900">
                      {categoryLabels[group.category] || group.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({group.items.length} items)
                    </span>
                  </div>
                  {expandedCategories[group.category] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedCategories[group.category] && (
                  <div className="border-t border-gray-100 p-4 space-y-2">
                    {group.items.map((item, idx) => {
                      const originalItem = shoppingList.items?.find(
                        i => i.food_name === item.name && i.category === item.category
                      )
                      return (
                        <div 
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => originalItem && toggleItemPurchased(originalItem.id, originalItem.is_purchased)}
                              className="text-gray-400 hover:text-emerald-600"
                            >
                              {originalItem?.is_purchased ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>
                            <span className={`text-sm ${originalItem?.is_purchased ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {item.totalQuantity} {item.unit}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}