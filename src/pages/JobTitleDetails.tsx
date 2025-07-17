
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Edit, Trash2, ArrowLeft, Users, Lock } from 'lucide-react';
import { JobTitleForm } from '@/components/job-titles/JobTitleForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useJobTitles } from '@/hooks/useJobTitles';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

const JobTitleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { formatDate } = useGlobalSettings();
  const { deleteJobTitle, checkJobTitleUsage } = useJobTitles();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInUse, setIsInUse] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const { data: jobTitle, isLoading, refetch } = useQuery({
    queryKey: ['jobTitle', id],
    queryFn: async () => {
      if (!id) throw new Error('Job title ID is required');
      
      const { data, error } = await supabase
        .from('job_titles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as JobTitle;
    },
    enabled: !!id,
  });

  // Check usage and get user count
  useQuery({
    queryKey: ['jobTitleUsage', id],
    queryFn: async () => {
      if (!id) return { isInUse: false, userCount: 0 };
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('job_title_id', id);

      if (error) throw error;
      
      const count = data?.length || 0;
      setUserCount(count);
      setIsInUse(count > 0);
      
      return { isInUse: count > 0, userCount: count };
    },
    enabled: !!id,
  });

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!id || !jobTitle) return;
    
    try {
      await deleteJobTitle(id);
      navigate('/job-titles');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
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

  if (!jobTitle) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Job Title Not Found</h2>
            <p className="text-gray-500 mb-4">The job title you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/job-titles')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Titles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/job-titles')}
                  className="rounded-2xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <span>Job Title Details</span>
                </CardTitle>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleEdit}
                  className="rounded-2xl"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                {isInUse ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          disabled
                          className="text-gray-400 cursor-not-allowed rounded-2xl"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cannot delete - job title is assigned to users</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 rounded-2xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Job Title Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">{jobTitle.title_name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Users with this title</p>
                    <p className="font-medium">{userCount} users</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge 
                      variant={isInUse ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {isInUse ? "In Use" : "Available"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white border rounded-xl p-6">
              <h4 className="font-semibold mb-3">Record Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{formatDate(jobTitle.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p>{formatDate(jobTitle.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <JobTitleForm
            jobTitle={jobTitle}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default JobTitleDetails;
