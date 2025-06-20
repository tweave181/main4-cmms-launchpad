
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV } from '@/utils/csvUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

interface JobTitleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingJobTitles: JobTitle[];
}

interface ImportResult {
  imported: string[];
  skipped: { title: string; reason: string }[];
}

export const JobTitleImportModal: React.FC<JobTitleImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingJobTitles,
}) => {
  const { userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

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

      const existingTitles = new Set(
        existingJobTitles.map(title => title.title_name.toLowerCase())
      );

      const tilesToImport: string[] = [];

      // Validate and prepare data
      for (const row of dataRows) {
        const titleName = row[0]?.trim();
        
        if (!titleName) {
          result.skipped.push({ title: row.join(','), reason: 'Empty title name' });
          continue;
        }

        if (existingTitles.has(titleName.toLowerCase())) {
          result.skipped.push({ title: titleName, reason: 'Title already exists' });
          continue;
        }

        if (tilesToImport.some(t => t.toLowerCase() === titleName.toLowerCase())) {
          result.skipped.push({ title: titleName, reason: 'Duplicate in import file' });
          continue;
        }

        tilesToImport.push(titleName);
      }

      // Import valid titles
      if (tilesToImport.length > 0) {
        const jobTitleData = tilesToImport.map(title => ({
          title_name: title,
          tenant_id: userProfile.tenant_id,
        }));

        const { error } = await supabase
          .from('job_titles')
          .insert(jobTitleData);

        if (error) throw error;

        result.imported = tilesToImport;
      }

      setImportResult(result);

      if (result.imported.length > 0) {
        toast({
          title: "Import completed",
          description: `${result.imported.length} job titles imported successfully`,
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
          <DialogTitle>Import Job Titles</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              Upload a CSV file with job titles. First column should contain title names.
            </p>
          </div>

          {importResult && (
            <div className="space-y-3">
              {importResult.imported.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{importResult.imported.length} titles imported:</strong>
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
                    <strong>{importResult.skipped.length} titles skipped:</strong>
                    <div className="mt-1 max-h-20 overflow-y-auto text-xs">
                      {importResult.skipped.map((item, index) => (
                        <div key={index}>
                          {item.title} - {item.reason}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
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
