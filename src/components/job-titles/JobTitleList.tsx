
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Edit, Trash2, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useJobTitles } from '@/hooks/useJobTitles';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

interface JobTitleListProps {
  jobTitles: JobTitle[];
  onEditJobTitle: (jobTitle: JobTitle) => void;
  onDeleteJobTitle: (jobTitleId: string) => void;
}

export const JobTitleList: React.FC<JobTitleListProps> = ({
  jobTitles,
  onEditJobTitle,
  onDeleteJobTitle,
}) => {
  const { checkJobTitleUsage } = useJobTitles();
  const [usageStatus, setUsageStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkUsageForAllTitles = async () => {
      const statusMap: Record<string, boolean> = {};
      
      for (const jobTitle of jobTitles) {
        try {
          const isInUse = await checkJobTitleUsage(jobTitle.id);
          statusMap[jobTitle.id] = isInUse;
        } catch (error) {
          console.error('Error checking usage for job title:', jobTitle.id, error);
          statusMap[jobTitle.id] = true; // Assume in use if check fails
        }
      }
      
      setUsageStatus(statusMap);
    };

    if (jobTitles.length > 0) {
      checkUsageForAllTitles();
    }
  }, [jobTitles, checkJobTitleUsage]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobTitles.map((jobTitle) => {
          const isInUse = usageStatus[jobTitle.id];
          
          return (
            <Card key={jobTitle.id} className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{jobTitle.title_name}</h3>
                  </div>
                  {isInUse && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Lock className="h-4 w-4 text-yellow-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This job title is assigned to users</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditJobTitle(jobTitle)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {isInUse ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-gray-400 cursor-not-allowed"
                          >
                            <Lock className="h-4 w-4 mr-1" />
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
                      size="sm"
                      onClick={() => onDeleteJobTitle(jobTitle.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
