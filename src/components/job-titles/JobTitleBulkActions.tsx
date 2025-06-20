
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Download, Upload } from 'lucide-react';
import { generateCSV, downloadCSV } from '@/utils/csvUtils';
import { useJobTitles } from '@/hooks/useJobTitles';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

interface JobTitleBulkActionsProps {
  selectedJobTitles: JobTitle[];
  allJobTitles: JobTitle[];
  onBulkEdit: () => void;
  onBulkDelete: () => void;
  onImport: () => void;
  onSelectionChange: (jobTitleIds: string[]) => void;
}

export const JobTitleBulkActions: React.FC<JobTitleBulkActionsProps> = ({
  selectedJobTitles,
  allJobTitles,
  onBulkEdit,
  onBulkDelete,
  onImport,
  onSelectionChange,
}) => {
  const { checkJobTitleUsage } = useJobTitles();

  const handleBulkAction = async (action: string) => {
    if (action === 'delete') {
      // Check if any selected titles are in use
      const inUseChecks = await Promise.all(
        selectedJobTitles.map(async (jobTitle) => {
          const isInUse = await checkJobTitleUsage(jobTitle.id);
          return { jobTitle, isInUse };
        })
      );

      const titlesInUse = inUseChecks.filter(check => check.isInUse);
      
      if (titlesInUse.length > 0) {
        toast({
          title: "Cannot Delete",
          description: `${titlesInUse.length} selected job titles are assigned to users and cannot be deleted.`,
          variant: "destructive",
        });
        return;
      }

      onBulkDelete();
    } else if (action === 'edit') {
      onBulkEdit();
    }
  };

  const handleExportCSV = () => {
    const csvData = [
      ['title_name'], // Header
      ...allJobTitles.map(jobTitle => [jobTitle.title_name])
    ];
    
    const csvContent = generateCSV(csvData);
    const filename = `job-titles-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Export completed",
      description: `${allJobTitles.length} job titles exported to ${filename}`,
    });
  };

  const handleSelectAll = () => {
    if (selectedJobTitles.length === allJobTitles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allJobTitles.map(jt => jt.id));
    }
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Select All / Deselect All */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectAll}
      >
        {selectedJobTitles.length === allJobTitles.length ? 'Deselect All' : 'Select All'}
      </Button>

      {/* Bulk Actions Dropdown */}
      {selectedJobTitles.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedJobTitles.length} selected
          </span>
          <Select onValueChange={handleBulkAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Bulk Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="edit">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Selected
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Import/Export Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
