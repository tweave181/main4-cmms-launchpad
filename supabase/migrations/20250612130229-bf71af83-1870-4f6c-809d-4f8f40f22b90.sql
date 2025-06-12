
-- Create enum types for inventory
CREATE TYPE part_unit AS ENUM ('pieces', 'kg', 'lbs', 'liters', 'gallons', 'meters', 'feet', 'hours');
CREATE TYPE stock_transaction_type AS ENUM ('usage', 'restock', 'adjustment', 'initial');

-- Create inventory_parts table
CREATE TABLE public.inventory_parts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT NOT NULL,
    category TEXT,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    reorder_threshold INTEGER NOT NULL DEFAULT 0,
    unit_of_measure part_unit NOT NULL DEFAULT 'pieces',
    storage_locations TEXT[] DEFAULT '{}',
    linked_asset_type TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_sku_per_tenant UNIQUE (tenant_id, sku)
);

-- Create stock_transactions table for tracking stock history
CREATE TABLE public.stock_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    part_id UUID NOT NULL REFERENCES public.inventory_parts(id) ON DELETE CASCADE,
    transaction_type stock_transaction_type NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_id UUID, -- Can reference work_order_id, asset_id, etc.
    reference_type TEXT, -- 'work_order', 'asset', 'manual', etc.
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create part_asset_associations table for linking parts to assets
CREATE TABLE public.part_asset_associations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    part_id UUID NOT NULL REFERENCES public.inventory_parts(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_part_asset UNIQUE (part_id, asset_id)
);

-- Create part_work_order_usage table for tracking part usage in work orders
CREATE TABLE public.part_work_order_usage (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    part_id UUID NOT NULL REFERENCES public.inventory_parts(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for inventory_parts
ALTER TABLE public.inventory_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view parts in their tenant" ON public.inventory_parts
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create parts in their tenant" ON public.inventory_parts
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update parts in their tenant" ON public.inventory_parts
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete parts in their tenant" ON public.inventory_parts
    FOR DELETE USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Add RLS policies for stock_transactions
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock transactions for their tenant parts" ON public.stock_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can create stock transactions for their tenant parts" ON public.stock_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Add RLS policies for part_asset_associations
ALTER TABLE public.part_asset_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part-asset associations for their tenant" ON public.part_asset_associations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can create part-asset associations for their tenant" ON public.part_asset_associations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can delete part-asset associations for their tenant" ON public.part_asset_associations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Add RLS policies for part_work_order_usage
ALTER TABLE public.part_work_order_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part usage for their tenant" ON public.part_work_order_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can create part usage for their tenant" ON public.part_work_order_usage
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inventory_parts p 
            WHERE p.id = part_id AND p.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_parts_updated_at
    BEFORE UPDATE ON public.inventory_parts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle stock transactions and update part quantities
CREATE OR REPLACE FUNCTION public.process_stock_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the part quantity
    UPDATE public.inventory_parts 
    SET quantity_in_stock = NEW.quantity_after,
        updated_at = now()
    WHERE id = NEW.part_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock transactions
CREATE TRIGGER process_stock_transaction_trigger
    AFTER INSERT ON public.stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.process_stock_transaction();
