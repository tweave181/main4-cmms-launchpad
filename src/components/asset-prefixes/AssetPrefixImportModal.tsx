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
import { useAssetPrefixes } from '@/hooks/useAssetPrefixes';
import { useCategories } from '@/hooks/useCategories';

interface AssetPrefixImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedPrefix {
  prefix_letter: string;
  number_code: string;
  category_name: string;
  category_id?: string;
  description: string;
  isValid: boolean;
  error?: string;
}

export const AssetPrefixImportModal: React.FC<AssetPrefixImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedPrefixes, setParsedPrefixes] = useState<ParsedPrefix[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { prefixes: existingPrefixes, importPrefixes } = useAssetPrefixes();
  const { categories } = useCategories();

  const resetState = () => {
    setFile(null);
    setParsedPrefixes([]);
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
    const template = 'Prefix,Code,Category,Description\nE,1,Electrical,Electrical equipment prefix\nP,1,Plumbing,Plumbing items prefix';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-prefixes-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (
    content: string, 
    existingPrefixCombos: Set<string>,
    categoryMap: Map<string, string>
  ): ParsedPrefix[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const prefixes: ParsedPrefix[] = [];
    const seenCombosInFile = new Set<string>();
    
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
      
      const prefix_letter = (values[0] || '').toUpperCase();
      const number_code = values[1] || '';
      const category_name = values[2] || '';
      const description = values[3] || '';
      
      let isValid = true;
      let error: string | undefined;
      let category_id: string | undefined;
      
      // Validation: Prefix letter
      if (!prefix_letter) {
        isValid = false;
        error = 'Prefix required';
      } else if (!/^[A-Z]$/.test(prefix_letter)) {
        isValid = false;
        error = 'Invalid prefix (use A-Z)';
      }
      
      // Validation: Code
      if (isValid && !number_code) {
        isValid = false;
        error = 'Code required';
      } else if (isValid) {
        const codeNum = parseInt(number_code);
        if (isNaN(codeNum) || codeNum < 1 || codeNum > 999) {
          isValid = false;
          error = 'Code must be 1-999';
        }
      }
      
      // Validation: Unique combo
      const combo = `${prefix_letter}-${parseInt(number_code) || 0}`;
      if (isValid && existingPrefixCombos.has(combo)) {
        isValid = false;
        error = 'Already exists';
      } else if (isValid && seenCombosInFile.has(combo)) {
        isValid = false;
        error = 'Duplicate in file';
      }
      
      // Validation: Category (optional)
      if (isValid && category_name) {
        const foundCategoryId = categoryMap.get(category_name.toLowerCase());
        if (!foundCategoryId) {
          isValid = false;
          error = 'Category not found';
        } else {
          category_id = foundCategoryId;
        }
      }
      
      // Validation: Description required
      if (isValid && !description) {
        isValid = false;
        error = 'Description required';
      }
      
      seenCombosInFile.add(combo);
      prefixes.push({ prefix_letter, number_code, category_name, category_id, description, isValid, error });
    }
    
    return prefixes;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Build existing prefix combos set
      const existingCombos = new Set(
        (existingPrefixes || []).map(p => `${p.prefix_letter}-${parseInt(p.number_code)}`)
      );
      
      // Build category name to ID map (case-insensitive)
      const categoryMap = new Map<string, string>();
      (categories || []).forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
      });
      
      const parsed = parseCSV(content, existingCombos, categoryMap);
      setParsedPrefixes(parsed);
      setShowPreview(true);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    const validPrefixes = parsedPrefixes.filter(p => p.isValid);
    if (validPrefixes.length === 0) return;
    
    setIsImporting(true);
    try {
      await importPrefixes.mutateAsync(
        validPrefixes.map(p => ({
          prefix_letter: p.prefix_letter,
          number_code: p.number_code,
          category_id: p.category_id,
          description: p.description,
        }))
      );
      handleClose();
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedPrefixes.filter(p => p.isValid).length;
  const invalidCount = parsedPrefixes.filter(p => !p.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Asset Tag Prefixes
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple asset tag prefixes at once.
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
                Select a CSV file with columns: Prefix, Code, Category, Description
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
                    <th className="text-left p-2">Prefix</th>
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedPrefixes.map((prefix, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        {prefix.isValid ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">{prefix.error}</Badge>
                        )}
                      </td>
                      <td className="p-2 font-mono">{prefix.prefix_letter}</td>
                      <td className="p-2 font-mono">{prefix.number_code}</td>
                      <td className="p-2 text-muted-foreground">{prefix.category_name || '—'}</td>
                      <td className="p-2 text-muted-foreground truncate max-w-[150px]">{prefix.description}</td>
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
              Import {validCount} {validCount === 1 ? 'Prefix' : 'Prefixes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
