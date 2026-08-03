-- ============================================================================
-- Registro de aceptación de Términos de Servicio y Política de Privacidad
-- ============================================================================
-- Bajo la Ley 19.628 (y la 21.719 desde diciembre de 2026) hay que poder
-- demostrar que el usuario aceptó, qué versión aceptó y cuándo. Sin esta
-- constancia, la aceptación no sirve como prueba.
--
-- Aplicar en: Supabase Dashboard → SQL Editor → Run
-- Idempotente: se puede ejecutar más de una vez sin efectos adversos.
-- ============================================================================

ALTER TABLE public.nutritionist
  ADD COLUMN IF NOT EXISTS accepted_terms_version text,
  ADD COLUMN IF NOT EXISTS accepted_terms_at      timestamptz;

COMMENT ON COLUMN public.nutritionist.accepted_terms_version IS
  'Versión de los Términos aceptada al registrarse (ver TERMS_VERSION en src/pages/legal/entity.ts).';
COMMENT ON COLUMN public.nutritionist.accepted_terms_at IS
  'Momento en que el profesional aceptó los Términos y la Política de Privacidad.';

-- ---------------------------------------------------------------------------
-- El trigger de creación de perfil debe copiar también estos dos campos.
-- Se redefine completo para no depender del orden de las migraciones.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_nutritionist_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.nutritionist (
    user_id,
    name,
    last_name,
    email,
    license_number,
    accepted_terms_version,
    accepted_terms_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'license_number',
    NEW.raw_user_meta_data ->> 'accepted_terms_version',
    (NEW.raw_user_meta_data ->> 'accepted_terms_at')::timestamptz
  )
  ON CONFLICT (user_id) DO UPDATE
    SET accepted_terms_version = EXCLUDED.accepted_terms_version,
        accepted_terms_at      = EXCLUDED.accepted_terms_at
    WHERE public.nutritionist.accepted_terms_at IS NULL;

  RETURN NEW;
END;
$$;

-- El trigger original se creó vía MCP y su nombre no quedó en ningún archivo
-- del repo. Adivinarlo arriesga dejar DOS triggers activos y duplicar el
-- INSERT, así que los buscamos por la función que ejecutan y los eliminamos
-- antes de crear el definitivo.
DO $$
DECLARE
  trg record;
BEGIN
  FOR trg IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_proc  p ON p.oid = t.tgfoid
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.proname = 'handle_new_nutritionist_user'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER %I ON auth.users', trg.tgname);
  END LOOP;
END;
$$;

CREATE TRIGGER on_auth_user_created_create_nutritionist
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_nutritionist_user();
