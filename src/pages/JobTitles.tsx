
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { JobTitleList } from '@/components/job-titles/JobTitleList';
import { JobTitleForm } from '@/components/job-titles/JobTitleForm';
import { JobTitleAuditLog } from '@/components/job-titles/JobTitleAuditLog';
import { JobTitleSearchAndFilters } from '@/components/job-titles/JobTitleSearchAndFilters';
import { useJobTitles } from '@/hooks/useJobTitles';
import { useJobTitleFilters } from '@/hooks/useJobTitleFilters';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

const JobTitles: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  
  const { jobTitles, isLoading, refetch, deleteJobTitle } = useJobTitles();
  
  const {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    filteredAndSortedJobTitles,
  } = useJobTitleFilters(jobTitles);

  const handleCreateJobTitle = () => {
    setEditingJobTitle(null);
    setIsFormOpen(true);
  };

  const handleEditJobTitle = (jobTitle: JobTitle) => {
    setEditingJobTitle(jobTitle);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingJobTitle(null);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Job Titles */}
        <div className="lg:col-span-2">
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
              
              {filteredAndSortedJobTitles.length === 0 && searchTerm ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No job titles found matching "{searchTerm}"</p>
                </div>
              ) : (
                <JobTitleList
                  jobTitles={filteredAndSortedJobTitles}
                  onEditJobTitle={handleEditJobTitle}
                  onDeleteJobTitle={deleteJobTitle}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Audit Log */}
        <div className="lg:col-span-1">
          <JobTitleAuditLog />
        </div>
      </div>

      {isFormOpen && (
        <JobTitleForm
          jobTitle={editingJobTitle}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingJobTitle(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default JobTitles;
