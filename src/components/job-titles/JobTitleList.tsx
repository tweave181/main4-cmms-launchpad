
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Lock, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useJobTitles } from '@/hooks/useJobTitles';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

interface JobTitleListProps {
  jobTitles: JobTitle[];
  onJobTitleClick: (jobTitle: JobTitle) => void;
  selectedJobTitles: string[];
  onSelectionChange: (jobTitleIds: string[]) => void;
}

export const JobTitleList: React.FC<JobTitleListProps> = ({
  jobTitles,
  onJobTitleClick,
  selectedJobTitles,
  onSelectionChange,
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

  const handleCheckboxChange = (jobTitleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedJobTitles, jobTitleId]);
    } else {
      onSelectionChange(selectedJobTitles.filter(id => id !== jobTitleId));
    }
  };

  const handleRowClick = (jobTitle: JobTitle, e: React.MouseEvent) => {
    // Don't trigger row click if checkbox was clicked
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onJobTitleClick(jobTitle);
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {jobTitles.map((jobTitle) => {
          const isInUse = usageStatus[jobTitle.id];
          const isSelected = selectedJobTitles.includes(jobTitle.id);
          
          return (
            <Card 
              key={jobTitle.id} 
              className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={(e) => handleRowClick(jobTitle, e)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(jobTitle.id, checked as boolean)
                    }
                  />
                  
                  <Briefcase className="h-6 w-6 text-primary flex-shrink-0" />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{jobTitle.title_name}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
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
                    
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
