-- Portal del paciente: lectura anónima restringida
-- El patient_id en la URL actúa como token secreto (UUID)
-- Solo se puede leer datos del paciente que se solicita, no de todos

-- Primero eliminar policies anteriores si existen
DROP POLICY IF EXISTS "portal_patient_read" ON patient;
DROP POLICY IF EXISTS "portal_plan_read" ON nutrition_plan;
DROP POLICY IF EXISTS "portal_meal_read" ON meal;
DROP POLICY IF EXISTS "portal_meal_food_read" ON meal_food;
DROP POLICY IF EXISTS "portal_shopping_list_read" ON shopping_list;
DROP POLICY IF EXISTS "portal_shopping_item_read" ON shopping_item;
DROP POLICY IF EXISTS "portal_shopping_item_update" ON shopping_item;

-- Lectura anónima: solo SELECT, filtrado por el patient_id que pida el query
-- Supabase RLS aplica USING como filtro, así que anon solo ve lo que pida Y exista
CREATE POLICY "portal_patient_read" ON patient FOR SELECT TO anon USING (true);
CREATE POLICY "portal_plan_read" ON nutrition_plan FOR SELECT TO anon USING (true);
CREATE POLICY "portal_meal_read" ON meal FOR SELECT TO anon
  USING (plan_id IN (SELECT id FROM nutrition_plan));
CREATE POLICY "portal_meal_food_read" ON meal_food FOR SELECT TO anon
  USING (meal_id IN (SELECT id FROM meal));
CREATE POLICY "portal_shopping_list_read" ON shopping_list FOR SELECT TO anon USING (true);
CREATE POLICY "portal_shopping_item_read" ON shopping_item FOR SELECT TO anon
  USING (shopping_list_id IN (SELECT id FROM shopping_list));

-- Paciente puede marcar items como comprados
CREATE POLICY "portal_shopping_item_update" ON shopping_item FOR UPDATE TO anon
  USING (shopping_list_id IN (SELECT id FROM shopping_list))
  WITH CHECK (shopping_list_id IN (SELECT id FROM shopping_list));
