
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Edit, Trash2 } from 'lucide-react';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobTitles.map((jobTitle) => (
        <Card key={jobTitle.id} className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{jobTitle.title_name}</h3>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteJobTitle(jobTitle.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
