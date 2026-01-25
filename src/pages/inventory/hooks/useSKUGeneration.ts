import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface CategoryWithSKU {
  id: string;
  name: string;
  sku_code: string | null;
  description: string | null;
  is_active: boolean;
}

export const useSKUGeneration = (initialCategoryId?: string | null) => {
  const { userProfile } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategoryId ?? null
  );
  const [generatedSKU, setGeneratedSKU] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch categories with sku_code
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['spare-parts-categories-with-sku'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spare_parts_categories')
        .select('id, name, sku_code, description, is_active')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as CategoryWithSKU[];
    },
  });

  // Generate next SKU when category changes
  const generateNextSKU = useCallback(async (categoryId: string) => {
    if (!userProfile?.tenant_id) {
      setError('User tenant not found');
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category?.sku_code) {
      setError('Category does not have an SKU code');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Find the highest sequence number for this SKU code pattern
      const { data: existingParts, error: queryError } = await supabase
        .from('inventory_parts')
        .select('sku')
        .eq('tenant_id', userProfile.tenant_id)
        .like('sku', `${category.sku_code}%`);

      if (queryError) throw queryError;

      // Extract sequence numbers and find max
      let maxSeq = 0;
      const skuPattern = new RegExp(`^${category.sku_code}(\\d{4})$`);
      
      for (const part of existingParts || []) {
        const match = part.sku?.match(skuPattern);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }

      if (maxSeq >= 9999) {
        setError(`SKU code ${category.sku_code} has reached maximum capacity (9999)`);
        return;
      }

      // Generate next SKU
      const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
      const nextSKU = `${category.sku_code}${nextSeq}`;
      
      setGeneratedSKU(nextSKU);
    } catch (err) {
      console.error('Error generating SKU:', err);
      setError('Failed to generate SKU');
    } finally {
      setIsGenerating(false);
    }
  }, [userProfile?.tenant_id, categories]);

  // Handle category selection change
  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      generateNextSKU(categoryId);
    } else {
      setGeneratedSKU('');
    }
  }, [generateNextSKU]);

  // Generate initial SKU if category is pre-selected
  useEffect(() => {
    if (initialCategoryId && categories.length > 0 && !generatedSKU) {
      generateNextSKU(initialCategoryId);
    }
  }, [initialCategoryId, categories, generatedSKU, generateNextSKU]);

  // Get selected category details
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return {
    categories,
    categoriesLoading,
    selectedCategoryId,
    selectedCategory,
    handleCategoryChange,
    generatedSKU,
    isGenerating,
    error,
  };
};
