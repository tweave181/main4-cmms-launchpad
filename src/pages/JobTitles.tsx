
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, History } from 'lucide-react';
import { JobTitleList } from '@/components/job-titles/JobTitleList';
import { JobTitleForm } from '@/components/job-titles/JobTitleForm';
import { JobTitleAuditLogModal } from '@/components/job-titles/JobTitleAuditLogModal';
import { JobTitleSearchAndFilters } from '@/components/job-titles/JobTitleSearchAndFilters';
import { JobTitleBulkActions } from '@/components/job-titles/JobTitleBulkActions';
import { JobTitleImportModal } from '@/components/job-titles/JobTitleImportModal';
import { JobTitleBulkEditModal } from '@/components/job-titles/JobTitleBulkEditModal';
import { useJobTitles } from '@/hooks/useJobTitles';
import { useJobTitleFilters } from '@/hooks/useJobTitleFilters';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

const JobTitles: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [selectedJobTitleIds, setSelectedJobTitleIds] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const { jobTitles, isLoading, refetch, deleteJobTitle } = useJobTitles();
  
  const {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    filteredAndSortedJobTitles,
  } = useJobTitleFilters(jobTitles);

  const selectedJobTitles = jobTitles.filter(jt => selectedJobTitleIds.includes(jt.id));

  const handleCreateJobTitle = () => {
    setIsFormOpen(true);
  };

  const handleJobTitleClick = (jobTitle: JobTitle) => {
    navigate(`/job-titles/${jobTitle.id}`);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedJobTitles.length} job titles?`)) {
      return;
    }

    try {
      for (const jobTitle of selectedJobTitles) {
        await deleteJobTitle(jobTitle.id);
      }
      
      setSelectedJobTitleIds([]);
      toast({
        title: "Success",
        description: `${selectedJobTitles.length} job titles deleted successfully`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
    refetch();
  };

  const handleBulkEditSuccess = () => {
    setIsBulkEditModalOpen(false);
    setSelectedJobTitleIds([]);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <Briefcase className="h-6 w-6 text-primary" />
              <span>Job Titles</span>
            </CardTitle>
            <Button onClick={handleCreateJobTitle} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Job Title
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <JobTitleSearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          <JobTitleBulkActions
            selectedJobTitles={selectedJobTitles}
            allJobTitles={filteredAndSortedJobTitles}
            onBulkEdit={() => setIsBulkEditModalOpen(true)}
            onBulkDelete={handleBulkDelete}
            onImport={() => setIsImportModalOpen(true)}
            onSelectionChange={setSelectedJobTitleIds}
          />
          
          {filteredAndSortedJobTitles.length === 0 && searchTerm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No job titles found matching "{searchTerm}"</p>
            </div>
          ) : (
            <JobTitleList
              jobTitles={filteredAndSortedJobTitles}
              onJobTitleClick={handleJobTitleClick}
              selectedJobTitles={selectedJobTitleIds}
              onSelectionChange={setSelectedJobTitleIds}
            />
          )}

          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsAuditLogModalOpen(true)}
              className="w-full rounded-2xl"
            >
              <History className="w-4 h-4 mr-2" />
              Click to see the recent Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {isFormOpen && (
        <JobTitleForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      <JobTitleAuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
      />

      <JobTitleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
        existingJobTitles={jobTitles}
      />

      <JobTitleBulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onSuccess={handleBulkEditSuccess}
        selectedJobTitles={selectedJobTitles}
      />
    </div>
  );
};

export default JobTitles;
