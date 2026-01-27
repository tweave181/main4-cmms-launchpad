import React, { useState } from 'react';
import { useWorkRequests } from '@/hooks/useWorkRequests';
import { WorkRequestFilters } from '@/components/work-requests/WorkRequestFilters';
import { WorkRequestReviewCard } from '@/components/work-requests/WorkRequestReviewCard';
import { WorkRequestFilters as FilterType } from '@/types/workRequest';
import { Loader2, ClipboardCheck, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WorkRequestsReview: React.FC = () => {
  const [filters, setFilters] = useState<FilterType>({ status: 'pending' });
  const { data: requests = [], isLoading } = useWorkRequests(filters);
  
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Work Requests Review</h1>
            {pendingCount > 0 && filters.status !== 'pending' && (
              <Badge variant="destructive">{pendingCount} pending</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Review and process work requests submitted by users.
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <WorkRequestFilters filters={filters} onFiltersChange={setFilters} />
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No requests found</h3>
            <p className="text-muted-foreground text-center">
              {filters.status === 'pending' 
                ? 'There are no pending work requests to review.'
                : 'No work requests match the current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <WorkRequestReviewCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkRequestsReview;
