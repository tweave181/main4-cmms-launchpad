import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tag, Plus, Upload, Download, Search, Loader2 } from 'lucide-react';
import { SparePartsCategoryList } from '@/components/spare-parts-categories/SparePartsCategoryList';
import { SparePartsCategoryForm } from '@/components/spare-parts-categories/SparePartsCategoryForm';
import { SparePartsCategoryImportModal } from '@/components/spare-parts-categories/SparePartsCategoryImportModal';
import { useSparePartsCategories, type SparePartsCategory } from '@/hooks/useSparePartsCategories';

const SparePartsCategoryManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SparePartsCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const { categories, isLoading } = useSparePartsCategories();

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: SparePartsCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleExportCategories = () => {
    const csvContent = [
      'Category Name,Description,Active',
      ...categories.map(cat => `"${cat.name}","${cat.description || ''}",${cat.is_active}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spare_parts_categories.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });

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
              <span>Spare Parts Categories</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => setIsImportOpen(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={handleExportCategories} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreateCategory} className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Manage global spare parts categories that all users can use to organize inventory parts.
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Show inactive</Label>
            </div>
          </div>

          <SparePartsCategoryList
            categories={filteredCategories}
            onEditCategory={handleEditCategory}
            showInactive={showInactive}
          />
        </CardContent>
      </Card>

      <SparePartsCategoryForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        category={editingCategory}
      />

      <SparePartsCategoryImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};

export default SparePartsCategoryManager;