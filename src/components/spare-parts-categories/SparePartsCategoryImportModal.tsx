import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useSparePartsCategories } from '@/hooks/useSparePartsCategories';
import { toast } from 'sonner';

interface SparePartsCategoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedCategory {
  name: string;
  description?: string;
  is_active: boolean;
  valid: boolean;
  error?: string;
}

export const SparePartsCategoryImportModal: React.FC<SparePartsCategoryImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { importCategories } = useSparePartsCategories();
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        parseCSV(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      toast.error('CSV file must have at least a header row and one data row');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['category name', 'description', 'active'];
    
    if (!headers.includes('category name') && !headers.includes('name')) {
      toast.error('CSV must include a "Category Name" or "Name" column');
      return;
    }

    const parsed: ParsedCategory[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const nameIndex = headers.indexOf('category name') >= 0 
        ? headers.indexOf('category name') 
        : headers.indexOf('name');
      const descriptionIndex = headers.indexOf('description');
      const activeIndex = headers.indexOf('active');

      const name = values[nameIndex] || '';
      const description = descriptionIndex >= 0 ? values[descriptionIndex] : '';
      const activeValue = activeIndex >= 0 ? values[activeIndex] : 'true';
      const is_active = activeValue.toLowerCase() === 'true' || activeValue === '1';

      let valid = true;
      let error = '';

      if (!name) {
        valid = false;
        error = 'Name is required';
      } else if (name.length > 100) {
        valid = false;
        error = 'Name must be less than 100 characters';
      } else if (description && description.length > 500) {
        valid = false;
        error = 'Description must be less than 500 characters';
      }

      parsed.push({
        name,
        description: description || undefined,
        is_active,
        valid,
        error,
      });
    }

    setParsedCategories(parsed);
    setShowPreview(true);
  };

  const handleImport = async () => {
    const validCategories = parsedCategories.filter(cat => cat.valid);
    if (validCategories.length === 0) {
      toast.error('No valid categories to import');
      return;
    }

    try {
      await importCategories.mutateAsync(validCategories);
      onClose();
      resetState();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const resetState = () => {
    setFile(null);
    setCsvContent('');
    setParsedCategories([]);
    setShowPreview(false);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const downloadTemplate = () => {
    const template = 'Category Name,Description,Active\nFilters,Air and fluid filters,true\nBearings,Ball and roller bearings,true\nBelts,Drive belts and timing belts,true';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spare_parts_categories_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validCount = parsedCategories.filter(cat => cat.valid).length;
  const invalidCount = parsedCategories.length - validCount;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Spare Parts Categories</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple spare parts categories at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showPreview ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Expected CSV format:</p>
                    <code className="text-sm bg-muted p-1 rounded">
                      Category Name,Description,Active
                    </code>
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {parsedCategories.length} categories in CSV file.
                  {validCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {validCount} valid
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {invalidCount} invalid
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>

              <div className="max-h-64 overflow-y-auto border rounded-md p-4">
                <div className="space-y-2">
                  {parsedCategories.map((category, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded ${
                        category.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                          <p className="text-xs">
                            Status: {category.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          {category.valid ? (
                            <Badge variant="default">Valid</Badge>
                          ) : (
                            <Badge variant="destructive">Invalid</Badge>
                          )}
                        </div>
                      </div>
                      {!category.valid && category.error && (
                        <p className="text-xs text-red-600 mt-1">{category.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {showPreview && (
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || importCategories.isPending}
            >
              {importCategories.isPending ? (
                'Importing...'
              ) : (
                `Import ${validCount} Categories`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};