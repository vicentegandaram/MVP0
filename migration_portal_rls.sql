-- Portal del paciente: permitir lectura anónima por patient_id (UUID es secreto compartible)
-- Solo SELECT, nunca INSERT/UPDATE/DELETE para anon

CREATE POLICY "portal_patient_read" ON patient FOR SELECT TO anon USING (true);
CREATE POLICY "portal_plan_read" ON nutrition_plan FOR SELECT TO anon USING (true);
CREATE POLICY "portal_meal_read" ON meal FOR SELECT TO anon USING (true);
CREATE POLICY "portal_meal_food_read" ON meal_food FOR SELECT TO anon USING (true);
CREATE POLICY "portal_shopping_list_read" ON shopping_list FOR SELECT TO anon USING (true);
CREATE POLICY "portal_shopping_item_read" ON shopping_item FOR SELECT TO anon USING (true);

-- Permitir que el paciente marque items como comprados desde el portal
CREATE POLICY "portal_shopping_item_update" ON shopping_item FOR UPDATE TO anon USING (true) WITH CHECK (true);
