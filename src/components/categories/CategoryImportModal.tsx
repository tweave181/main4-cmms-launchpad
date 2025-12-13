import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface CategoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedCategory {
  name: string;
  description?: string;
  isValid: boolean;
  error?: string;
}

export const CategoryImportModal: React.FC<CategoryImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importCategories } = useCategories();

  const resetState = () => {
    setFile(null);
    setParsedCategories([]);
    setShowPreview(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'Category Name,Description\nHVAC,Heating ventilation and air conditioning\nElectrical,Electrical systems and equipment';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): ParsedCategory[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const categories: ParsedCategory[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing (handles quoted values)
      const matches = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
      if (!matches) continue;
      
      const values = matches.map(m => {
        let val = m.replace(/^,/, '');
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        return val.trim();
      });
      
      const name = values[0] || '';
      const description = values[1] || '';
      
      let isValid = true;
      let error: string | undefined;
      
      if (!name) {
        isValid = false;
        error = 'Name is required';
      } else if (name.length > 100) {
        isValid = false;
        error = 'Name must be 100 characters or less';
      }
      
      categories.push({ name, description, isValid, error });
    }
    
    return categories;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      setParsedCategories(parsed);
      setShowPreview(true);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    const validCategories = parsedCategories.filter(c => c.isValid);
    if (validCategories.length === 0) return;
    
    setIsImporting(true);
    try {
      await importCategories.mutateAsync(
        validCategories.map(c => ({ name: c.name, description: c.description }))
      );
      handleClose();
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedCategories.filter(c => c.isValid).length;
  const invalidCount = parsedCategories.filter(c => !c.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Categories
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple categories at once.
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Select a CSV file with columns: Category Name, Description
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {validCount} valid
              </span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-4 w-4" />
                  {invalidCount} invalid
                </span>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedCategories.map((category, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        {category.isValid ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">{category.error}</Badge>
                        )}
                      </td>
                      <td className="p-2">{category.name}</td>
                      <td className="p-2 text-muted-foreground">{category.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {showPreview && (
            <Button 
              onClick={handleImport} 
              disabled={validCount === 0 || isImporting}
            >
              {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Import {validCount} {validCount === 1 ? 'Category' : 'Categories'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
