
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { parseCSV, generateCSV, downloadCSV } from '@/utils/csvUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];

interface DepartmentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingDepartments: Department[];
}

interface ImportResult {
  imported: string[];
  skipped: { name: string; reason: string }[];
}

export const DepartmentImportModal: React.FC<DepartmentImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingDepartments,
}) => {
  const { userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleDownloadTemplate = () => {
    const templateData = [
      ['Department Name', 'Description'],
      ['Engineering', 'Engineering and maintenance team'],
      ['Operations', 'Day-to-day operations management'],
    ];
    const csv = generateCSV(templateData);
    downloadCSV(csv, 'departments-import-template.csv');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file || !userProfile?.tenant_id) return;

    setIsUploading(true);
    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);
      
      // Skip header row if it exists
      const dataRows = rows.slice(1);
      
      const result: ImportResult = {
        imported: [],
        skipped: []
      };

      const existingNames = new Set(
        existingDepartments.map(dept => dept.name.toLowerCase())
      );

      const departmentsToImport: { name: string; description: string }[] = [];

      // Validate and prepare data
      for (const row of dataRows) {
        const name = row[0]?.trim();
        const description = row[1]?.trim() || '';
        
        if (!name) {
          result.skipped.push({ name: row.join(','), reason: 'Empty department name' });
          continue;
        }

        if (existingNames.has(name.toLowerCase())) {
          result.skipped.push({ name, reason: 'Department already exists' });
          continue;
        }

        if (departmentsToImport.some(d => d.name.toLowerCase() === name.toLowerCase())) {
          result.skipped.push({ name, reason: 'Duplicate in import file' });
          continue;
        }

        departmentsToImport.push({ name, description });
      }

      // Import valid departments
      if (departmentsToImport.length > 0) {
        const departmentData = departmentsToImport.map(dept => ({
          name: dept.name,
          description: dept.description || null,
          tenant_id: userProfile.tenant_id,
        }));

        const { error } = await supabase
          .from('departments')
          .insert(departmentData);

        if (error) throw error;

        result.imported = departmentsToImport.map(d => d.name);
      }

      setImportResult(result);

      if (result.imported.length > 0) {
        toast({
          title: "Import completed",
          description: `${result.imported.length} department(s) imported successfully`,
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Departments</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with departments. First column: Department Name, Second column: Description (optional).
            </p>
          </div>

          {importResult && (
            <div className="space-y-3">
              {importResult.imported.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{importResult.imported.length} department(s) imported:</strong>
                    <div className="mt-1 max-h-20 overflow-y-auto text-xs">
                      {importResult.imported.join(', ')}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {importResult.skipped.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{importResult.skipped.length} department(s) skipped:</strong>
                    <div className="mt-1 max-h-20 overflow-y-auto text-xs">
                      {importResult.skipped.map((item, index) => (
                        <div key={index}>
                          {item.name} - {item.reason}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-start space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button 
                onClick={handleImport} 
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
