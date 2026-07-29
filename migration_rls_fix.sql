DROP POLICY IF EXISTS "patient_document_access" ON patient_document;
CREATE POLICY "patient_document_select" ON patient_document FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_document_insert" ON patient_document FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_document_update" ON patient_document FOR UPDATE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_document_delete" ON patient_document FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "measurement_access" ON measurement;
CREATE POLICY "measurement_select" ON measurement FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "measurement_insert" ON measurement FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "measurement_update" ON measurement FOR UPDATE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "measurement_delete" ON measurement FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "patient_goal_access" ON patient_goal;
CREATE POLICY "patient_goal_select" ON patient_goal FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_goal_insert" ON patient_goal FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_goal_delete" ON patient_goal FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "patient_preference_access" ON patient_preference;
CREATE POLICY "patient_preference_select" ON patient_preference FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_preference_insert" ON patient_preference FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "patient_preference_delete" ON patient_preference FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "np_access" ON nutrition_plan;
CREATE POLICY "np_select" ON nutrition_plan FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "np_insert" ON nutrition_plan FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "np_update" ON nutrition_plan FOR UPDATE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "np_delete" ON nutrition_plan FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "meal_access" ON meal;
CREATE POLICY "meal_select" ON meal FOR SELECT TO authenticated USING (plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));
CREATE POLICY "meal_insert" ON meal FOR INSERT TO authenticated WITH CHECK (plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));
CREATE POLICY "meal_update" ON meal FOR UPDATE TO authenticated USING (plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));
CREATE POLICY "meal_delete" ON meal FOR DELETE TO authenticated USING (plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));

DROP POLICY IF EXISTS "meal_food_access" ON meal_food;
CREATE POLICY "meal_food_select" ON meal_food FOR SELECT TO authenticated USING (meal_id IN (SELECT id FROM meal WHERE plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())))));
CREATE POLICY "meal_food_insert" ON meal_food FOR INSERT TO authenticated WITH CHECK (meal_id IN (SELECT id FROM meal WHERE plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())))));
CREATE POLICY "meal_food_delete" ON meal_food FOR DELETE TO authenticated USING (meal_id IN (SELECT id FROM meal WHERE plan_id IN (SELECT id FROM nutrition_plan WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())))));

DROP POLICY IF EXISTS "shopping_list_access" ON shopping_list;
CREATE POLICY "shopping_list_select" ON shopping_list FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "shopping_list_insert" ON shopping_list FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "shopping_list_update" ON shopping_list FOR UPDATE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "shopping_list_delete" ON shopping_list FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "shopping_item_access" ON shopping_item;
CREATE POLICY "shopping_item_select" ON shopping_item FOR SELECT TO authenticated USING (shopping_list_id IN (SELECT id FROM shopping_list WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));
CREATE POLICY "shopping_item_insert" ON shopping_item FOR INSERT TO authenticated WITH CHECK (shopping_list_id IN (SELECT id FROM shopping_list WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));
CREATE POLICY "shopping_item_delete" ON shopping_item FOR DELETE TO authenticated USING (shopping_list_id IN (SELECT id FROM shopping_list WHERE patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()))));

DROP POLICY IF EXISTS "nutritionist_medical_history" ON patient_medical_history;
CREATE POLICY "medical_history_select" ON patient_medical_history FOR SELECT TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "medical_history_insert" ON patient_medical_history FOR INSERT TO authenticated WITH CHECK (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));
CREATE POLICY "medical_history_delete" ON patient_medical_history FOR DELETE TO authenticated USING (patient_id IN (SELECT id FROM patient WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "nutritionist_clinical_records" ON clinical_record;
CREATE POLICY "clinical_record_select" ON clinical_record FOR SELECT TO authenticated USING (nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()));
CREATE POLICY "clinical_record_insert" ON clinical_record FOR INSERT TO authenticated WITH CHECK (nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()));
CREATE POLICY "clinical_record_update" ON clinical_record FOR UPDATE TO authenticated USING (nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()));
CREATE POLICY "clinical_record_delete" ON clinical_record FOR DELETE TO authenticated USING (nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()));
