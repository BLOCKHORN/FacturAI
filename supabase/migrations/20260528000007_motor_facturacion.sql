-- Migration: 20260528000007_motor_facturacion.sql
-- Purpose: Final cleanup and multi-line invoice support

-- 1. Eliminar tabla redundante
DROP TABLE IF EXISTS public.clients CASCADE;

-- 2. Normalizar la tabla 'invoices'
-- Eliminamos columnas que ahora vivirán en 'invoice_lines'
ALTER TABLE public.invoices DROP COLUMN IF EXISTS concept;
ALTER TABLE public.invoices DROP COLUMN IF EXISTS tax_percentage;

-- Aseguramos columnas de totales y metadatos necesarios
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS base_amount numeric(12, 2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_tax_amount numeric(12, 2) DEFAULT 0;

-- 3. Crear la tabla 'invoice_lines' (Requisito Verifactu)
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  description text NOT NULL,
  quantity numeric(10, 2) NOT NULL DEFAULT 1.00,
  unit_price numeric(12, 2) NOT NULL,
  tax_percentage numeric(4, 2) NOT NULL DEFAULT 21.00,
  tax_amount numeric(12, 2) NOT NULL,
  total_line_amount numeric(12, 2) NOT NULL,
  CONSTRAINT invoice_lines_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_lines_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE
);

-- 4. Seguridad (RLS)
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios gestionen sus propias líneas a través de la factura
CREATE POLICY "Users can manage lines of their own invoices"
  ON public.invoice_lines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_lines.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- 5. Actualizar la clave foránea de invoices (asegurar que apunta a tenant_private_clients)
-- Esto ya se intentó en la migración 05, pero lo reforzamos aquí por si acaso.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES public.tenant_private_clients(id) ON DELETE SET NULL;
  END IF;
END $$;
