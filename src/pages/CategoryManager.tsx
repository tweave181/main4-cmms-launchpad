import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Plus, Loader2, Download, Upload } from 'lucide-react';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { CategoryImportModal } from '@/components/categories/CategoryImportModal';
import { useCategories, Category } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/auth';
import { generateCSV, downloadCSV } from '@/utils/csvUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CategoryManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { categories, isLoading } = useCategories();
  const { isAdmin, userProfile } = useAuth();
  
  const { data: tenantName } = useQuery({
    queryKey: ['tenant-name', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return null;
      const { data } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', userProfile.tenant_id)
        .single();
      return data?.name || null;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleExport = () => {
    const csvData: string[][] = [
      ['Category Name', 'Description'],
      ...categories.map(cat => [cat.name, cat.description || ''])
    ];
    const csv = generateCSV(csvData);
    const date = new Date().toISOString().split('T')[0];
    const siteName = tenantName || 'export';
    downloadCSV(csv, `${siteName}-categories-${date}.csv`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Tag className="h-6 w-6 text-primary" />
              <span>Category Manager</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <Button variant="outline" onClick={handleExport} className="rounded-2xl">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportOpen(true)} className="rounded-2xl">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </>
              )}
              <Button onClick={handleCreateCategory} className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Manage categories for organizing your asset tag prefixes and other items.
          </p>
          
          <CategoryList
            categories={categories}
            onEditCategory={handleEditCategory}
            onCategoryClick={handleEditCategory}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}

      <CategoryImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};

export default CategoryManager;
