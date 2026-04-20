-- ============================================================
-- NutriFlow — Migración Decreto 41/2012 (Chile)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Campos de cumplimiento en tabla patient ──────────────
ALTER TABLE patient
  ADD COLUMN IF NOT EXISTS run            TEXT,           -- RUN (ej: 12.345.678-9)
  ADD COLUMN IF NOT EXISTS address        TEXT,           -- Calle y número
  ADD COLUMN IF NOT EXISTS commune        TEXT,           -- Comuna
  ADD COLUMN IF NOT EXISTS region         TEXT,           -- Región
  ADD COLUMN IF NOT EXISTS nationality    TEXT DEFAULT 'Chilena',
  ADD COLUMN IF NOT EXISTS consent_signed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_date   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip     TEXT;           -- IP al momento del consentimiento

-- ── 2. Crear patient_medical_history (faltaba en DB) ────────
CREATE TABLE IF NOT EXISTS patient_medical_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  condition       TEXT NOT NULL,
  diagnosed_date  DATE,
  current         BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Crear clinical_record (Decreto 41 — ficha cronológica)
CREATE TABLE IF NOT EXISTS clinical_record (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  nutritionist_id         UUID NOT NULL REFERENCES nutritionist(id),
  record_type             TEXT NOT NULL CHECK (record_type IN (
                            'anamnesis', 'consultation', 'follow_up',
                            'evaluation', 'consent', 'discharge'
                          )),
  -- Anamnesis
  reason_for_consultation TEXT,
  current_illness         TEXT,
  medical_background      TEXT,
  family_background       TEXT,
  dietary_habits          TEXT,
  physical_activity       TEXT,
  -- Diagnóstico y plan
  nutritional_diagnosis   TEXT,
  treatment_plan          TEXT,
  -- Signos vitales opcionales
  systolic_bp             INTEGER,
  diastolic_bp            INTEGER,
  -- Consentimiento informado
  consent_text            TEXT,
  consent_signed          BOOLEAN DEFAULT FALSE,
  patient_signature_url   TEXT,
  -- General
  notes                   TEXT,
  -- Metadatos cronológicos (inmutables por ley)
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_clinical_record_patient   ON clinical_record(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_record_recorded  ON clinical_record(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_medical_history   ON patient_medical_history(patient_id);

-- ── 4. RLS — patient ────────────────────────────────────────
ALTER TABLE patient ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nutritionist_own_patients"    ON patient;
DROP POLICY IF EXISTS "nutritionist_insert_patients" ON patient;
DROP POLICY IF EXISTS "nutritionist_update_patients" ON patient;
DROP POLICY IF EXISTS "nutritionist_delete_patients" ON patient;

CREATE POLICY "nutritionist_own_patients" ON patient
  FOR SELECT TO authenticated
  USING (nutritionist_id = (
    SELECT id FROM nutritionist WHERE user_id = auth.uid()
  ));

CREATE POLICY "nutritionist_insert_patients" ON patient
  FOR INSERT TO authenticated
  WITH CHECK (nutritionist_id = (
    SELECT id FROM nutritionist WHERE user_id = auth.uid()
  ));

CREATE POLICY "nutritionist_update_patients" ON patient
  FOR UPDATE TO authenticated
  USING (nutritionist_id = (
    SELECT id FROM nutritionist WHERE user_id = auth.uid()
  ));

CREATE POLICY "nutritionist_delete_patients" ON patient
  FOR DELETE TO authenticated
  USING (nutritionist_id = (
    SELECT id FROM nutritionist WHERE user_id = auth.uid()
  ));

-- ── 5. RLS — patient_medical_history ────────────────────────
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nutritionist_medical_history" ON patient_medical_history;
CREATE POLICY "nutritionist_medical_history" ON patient_medical_history
  FOR ALL TO authenticated
  USING (patient_id IN (
    SELECT id FROM patient
    WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
  ));

-- ── 6. RLS — clinical_record ─────────────────────────────────
ALTER TABLE clinical_record ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nutritionist_clinical_records" ON clinical_record;
CREATE POLICY "nutritionist_clinical_records" ON clinical_record
  FOR ALL TO authenticated
  USING (nutritionist_id = (
    SELECT id FROM nutritionist WHERE user_id = auth.uid()
  ));

-- ── 7. RLS — tablas relacionadas (si no tienen policy aún) ──
ALTER TABLE nutrition_plan         ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_food              ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list          ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_item          ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement            ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_document       ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_goal           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_preference     ENABLE ROW LEVEL SECURITY;

-- nutrition_plan: acceso vía patient del nutricionista
DROP POLICY IF EXISTS "np_access" ON nutrition_plan;
CREATE POLICY "np_access" ON nutrition_plan
  FOR ALL TO authenticated
  USING (patient_id IN (
    SELECT id FROM patient
    WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
  ));

-- meal: acceso vía nutrition_plan → patient
DROP POLICY IF EXISTS "meal_access" ON meal;
CREATE POLICY "meal_access" ON meal
  FOR ALL TO authenticated
  USING (plan_id IN (
    SELECT id FROM nutrition_plan
    WHERE patient_id IN (
      SELECT id FROM patient
      WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
    )
  ));

-- meal_food: acceso vía meal → plan → patient
DROP POLICY IF EXISTS "meal_food_access" ON meal_food;
CREATE POLICY "meal_food_access" ON meal_food
  FOR ALL TO authenticated
  USING (meal_id IN (
    SELECT id FROM meal
    WHERE plan_id IN (
      SELECT id FROM nutrition_plan
      WHERE patient_id IN (
        SELECT id FROM patient
        WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
      )
    )
  ));

-- appointment: nutricionista solo ve sus propias citas
DROP POLICY IF EXISTS "appointment_access" ON appointment;
CREATE POLICY "appointment_access" ON appointment
  FOR ALL TO authenticated
  USING (nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid()));

-- measurement, patient_document, patient_goal, patient_preference: vía patient
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['measurement','patient_document','patient_goal','patient_preference']
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_access" ON %I;
      CREATE POLICY "%s_access" ON %I
        FOR ALL TO authenticated
        USING (patient_id IN (
          SELECT id FROM patient
          WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
        ))', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- shopping_list: nutricionista solo ve las listas de sus pacientes
DROP POLICY IF EXISTS "shopping_list_access" ON shopping_list;
CREATE POLICY "shopping_list_access" ON shopping_list
  FOR ALL TO authenticated
  USING (patient_id IN (
    SELECT id FROM patient
    WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "shopping_item_access" ON shopping_item;
CREATE POLICY "shopping_item_access" ON shopping_item
  FOR ALL TO authenticated
  USING (shopping_list_id IN (
    SELECT id FROM shopping_list
    WHERE patient_id IN (
      SELECT id FROM patient
      WHERE nutritionist_id = (SELECT id FROM nutritionist WHERE user_id = auth.uid())
    )
  ));

-- ── 8. Comentarios de auditoría (Decreto 41) ─────────────────
COMMENT ON TABLE  clinical_record               IS 'Ficha clínica cronológica — Decreto 41/2012 Chile';
COMMENT ON COLUMN clinical_record.recorded_at   IS 'Fecha/hora del registro — inmutable por normativa';
COMMENT ON COLUMN patient.run                   IS 'RUN paciente — Cédula de identidad chilena';
COMMENT ON COLUMN patient.consent_signed        IS 'Consentimiento informado firmado — Decreto 41/2012';
COMMENT ON TABLE  patient_medical_history       IS 'Antecedentes médicos del paciente';

