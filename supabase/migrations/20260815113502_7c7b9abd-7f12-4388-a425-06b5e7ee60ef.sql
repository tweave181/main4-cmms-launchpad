
-- 1. TABLE
CREATE TABLE public.equipment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  description text,
  prefix_letter text NOT NULL,
  number_code integer NOT NULL,
  display_prefix text GENERATED ALWAYS AS (prefix_letter || number_code::text) STORED,
  next_sequence integer NOT NULL DEFAULT 1,
  max_sequence integer NOT NULL DEFAULT 999,
  status text NOT NULL DEFAULT 'active',
  icon text,
  legacy_category_id uuid,
  legacy_prefix_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT equipment_categories_prefix_letter_chk CHECK (prefix_letter ~ '^[A-Z]$'),
  CONSTRAINT equipment_categories_number_code_chk CHECK (number_code BETWEEN 1 AND 999),
  CONSTRAINT equipment_categories_status_chk CHECK (status IN ('active','inactive')),
  CONSTRAINT equipment_categories_next_sequence_chk CHECK (next_sequence >= 1),
  CONSTRAINT equipment_categories_max_sequence_chk CHECK (max_sequence BETWEEN 1 AND 999),
  CONSTRAINT equipment_categories_tenant_prefix_key UNIQUE (tenant_id, prefix_letter, number_code)
);

CREATE UNIQUE INDEX equipment_categories_tenant_name_key
  ON public.equipment_categories (tenant_id, lower(category_name));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_categories TO authenticated;
GRANT ALL ON public.equipment_categories TO service_role;

ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view equipment categories"
  ON public.equipment_categories FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Admins can insert equipment categories"
  ON public.equipment_categories FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins can update equipment categories"
  ON public.equipment_categories FOR UPDATE TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE POLICY "Admins can delete equipment categories"
  ON public.equipment_categories FOR DELETE TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

CREATE TRIGGER update_equipment_categories_updated_at
  BEFORE UPDATE ON public.equipment_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. AUDIT LOG (mirrors existing per-entity audit log pattern)
CREATE TABLE public.equipment_category_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_category_id uuid REFERENCES public.equipment_categories(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  action text NOT NULL,
  change_summary text,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid,
  timestamp timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.equipment_category_audit_log TO authenticated;
GRANT ALL ON public.equipment_category_audit_log TO service_role;

ALTER TABLE public.equipment_category_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view equipment category audit"
  ON public.equipment_category_audit_log FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Tenant users can insert equipment category audit"
  ON public.equipment_category_audit_log FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

CREATE OR REPLACE FUNCTION public.log_equipment_category_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.equipment_category_audit_log (equipment_category_id, tenant_id, action, change_summary, new_values, changed_by)
    VALUES (NEW.id, NEW.tenant_id, 'created', 'Equipment category created: ' || NEW.category_name, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.equipment_category_audit_log (equipment_category_id, tenant_id, action, change_summary, old_values, new_values, changed_by)
    VALUES (NEW.id, NEW.tenant_id,
      CASE WHEN NEW.status = 'inactive' AND OLD.status = 'active' THEN 'deactivated' ELSE 'updated' END,
      'Equipment category ' || NEW.category_name, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_equipment_category_audit
  AFTER INSERT OR UPDATE ON public.equipment_categories
  FOR EACH ROW EXECUTE FUNCTION public.log_equipment_category_change();

-- 3. ASSETS LINK
ALTER TABLE public.assets
  ADD COLUMN equipment_category_id uuid REFERENCES public.equipment_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_assets_equipment_category ON public.assets (equipment_category_id);

-- 4. MIGRATE legacy prefixes + categories -> equipment_categories
--    (audit trigger disabled during backfill to avoid noise)
ALTER TABLE public.equipment_categories DISABLE TRIGGER trg_equipment_category_audit;

INSERT INTO public.equipment_categories
  (tenant_id, category_name, description, prefix_letter, number_code, status, legacy_category_id, legacy_prefix_id)
SELECT DISTINCT ON (p.tenant_id, p.prefix_letter, (p.number_code)::int)
  p.tenant_id,
  COALESCE(c.name, p.description, p.prefix_letter || (p.number_code)::int::text),
  COALESCE(NULLIF(p.description, ''), c.description),
  upper(p.prefix_letter),
  (p.number_code)::int,
  'active',
  p.category_id,
  p.id
FROM public.asset_tag_prefixes p
LEFT JOIN public.categories c ON c.id = p.category_id
WHERE p.prefix_letter ~* '^[A-Za-z]$'
  AND p.number_code ~ '^[0-9]+$'
  AND (p.number_code)::int BETWEEN 1 AND 999
ORDER BY p.tenant_id, p.prefix_letter, (p.number_code)::int, p.created_at;

-- 5. Link existing assets by legacy category name (no tags changed)
UPDATE public.assets a
SET equipment_category_id = ec.id
FROM public.equipment_categories ec
WHERE a.equipment_category_id IS NULL
  AND ec.tenant_id = a.tenant_id
  AND a.category IS NOT NULL
  AND lower(a.category) = lower(ec.category_name);

-- Fallback: link by the tag's own prefix when the category name did not resolve
UPDATE public.assets a
SET equipment_category_id = ec.id
FROM public.equipment_categories ec
WHERE a.equipment_category_id IS NULL
  AND ec.tenant_id = a.tenant_id
  AND a.asset_tag IS NOT NULL
  AND a.asset_tag LIKE ec.display_prefix || '/%';

-- 6. next_sequence derived from highest existing tag (gaps are never reused)
UPDATE public.equipment_categories ec
SET next_sequence = LEAST(GREATEST(sub.max_seq + 1, 1), ec.max_sequence)
FROM (
  SELECT ec2.id,
         COALESCE(MAX(NULLIF(regexp_replace(split_part(a.asset_tag, '/', 2), '[^0-9]', '', 'g'), '')::int), 0) AS max_seq
  FROM public.equipment_categories ec2
  LEFT JOIN public.assets a
    ON a.tenant_id = ec2.tenant_id
   AND a.asset_tag LIKE ec2.display_prefix || '/%'
  GROUP BY ec2.id
) sub
WHERE sub.id = ec.id;

ALTER TABLE public.equipment_categories ENABLE TRIGGER trg_equipment_category_audit;

-- 7. Company-scoped asset tag uniqueness
CREATE UNIQUE INDEX assets_tenant_asset_tag_key
  ON public.assets (tenant_id, asset_tag)
  WHERE asset_tag IS NOT NULL AND asset_tag <> '';

-- 8. Concurrency-safe tag generation
CREATE OR REPLACE FUNCTION public.reserve_asset_tag(_equipment_category_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.equipment_categories%ROWTYPE;
  seq integer;
  tag text;
  caller_tenant uuid;
BEGIN
  caller_tenant := public.get_current_user_tenant_id();

  SELECT * INTO rec FROM public.equipment_categories
   WHERE id = _equipment_category_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipment category not found';
  END IF;
  IF rec.tenant_id IS DISTINCT FROM caller_tenant THEN
    RAISE EXCEPTION 'Not authorized for this equipment category';
  END IF;
  IF rec.status <> 'active' THEN
    RAISE EXCEPTION 'Equipment category % is inactive', rec.category_name;
  END IF;

  seq := GREATEST(rec.next_sequence, 1);
  LOOP
    IF seq > rec.max_sequence THEN
      RAISE EXCEPTION 'Equipment category % has reached its capacity of %', rec.display_prefix, rec.max_sequence;
    END IF;
    tag := rec.display_prefix || '/' || lpad(seq::text, 3, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.tenant_id = rec.tenant_id AND a.asset_tag = tag
    );
    seq := seq + 1;
  END LOOP;

  UPDATE public.equipment_categories
     SET next_sequence = LEAST(seq + 1, max_sequence + 1), updated_at = now()
   WHERE id = rec.id;

  RETURN tag;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_asset_tag(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_asset_tag(uuid) TO authenticated, service_role;

-- 9. Read-only preview (does not consume a number)
CREATE OR REPLACE FUNCTION public.preview_next_asset_tag(_equipment_category_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.equipment_categories%ROWTYPE;
  seq integer;
  tag text;
BEGIN
  SELECT * INTO rec FROM public.equipment_categories
   WHERE id = _equipment_category_id
     AND tenant_id = public.get_current_user_tenant_id();

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  seq := GREATEST(rec.next_sequence, 1);
  LOOP
    IF seq > rec.max_sequence THEN
      RETURN NULL;
    END IF;
    tag := rec.display_prefix || '/' || lpad(seq::text, 3, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.tenant_id = rec.tenant_id AND a.asset_tag = tag
    );
    seq := seq + 1;
  END LOOP;

  RETURN tag;
END;
$$;

REVOKE ALL ON FUNCTION public.preview_next_asset_tag(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_next_asset_tag(uuid) TO authenticated, service_role;
