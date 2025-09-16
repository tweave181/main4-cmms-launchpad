import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useWorkOrders } from '@/hooks/useWorkOrders';

interface DebugInfo {
  latestFetched: string | null;
  generated: string | null;
  totalWorkOrders: number;
  statuses: string[];
  tenantId: string | null;
  error?: string;
}

export const WorkOrderDebugPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: workOrders = [] } = useWorkOrders();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const testGenerator = async () => {
    setIsGenerating(true);
    setDebugInfo(null);

    try {
      console.log('🧪 DEBUG: Starting work order number generation test');
      console.log('🧪 DEBUG: Current tenant ID:', userProfile?.tenant_id);

      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Query ALL work orders globally (not tenant-specific) to test global numbering
      const { data: existingWorkOrders, error: queryError } = await supabase
        .from('work_orders')
        .select('work_order_number, status, tenant_id')
        .order('work_order_number', { ascending: false });

      if (queryError) {
        console.error('🧪 DEBUG: Error querying existing work orders:', queryError);
        throw queryError;
      }

      console.log('🧪 DEBUG: Total work orders in DB (globally):', existingWorkOrders?.length || 0);
      
      // Find the latest work order number globally, handling both "WO-0001" and "WO0001" formats
      let latestWorkOrderNumber: string | null = null;
      if (existingWorkOrders && existingWorkOrders.length > 0) {
        const woNumbers = existingWorkOrders
          .map(wo => wo.work_order_number)
          .filter(num => num && /^WO-?[0-9]+$/.test(num)); // Handle both formats
        
        if (woNumbers.length > 0) {
          // Sort by numeric value to get the true latest, handling both formats
          latestWorkOrderNumber = woNumbers.sort((a, b) => {
            // Extract number from both "WO-0001" and "WO0001" formats
            const numA = a.startsWith('WO-') ? parseInt(a.substring(3)) : parseInt(a.substring(2));
            const numB = b.startsWith('WO-') ? parseInt(b.substring(3)) : parseInt(b.substring(2));
            return numB - numA;
          })[0];
        }
      }

      console.log('🧪 DEBUG: Latest work order number found:', latestWorkOrderNumber);

      if (latestWorkOrderNumber) {
        // Handle parsing suffix from both formats
        const suffix = latestWorkOrderNumber.startsWith('WO-') 
          ? latestWorkOrderNumber.substring(3) 
          : latestWorkOrderNumber.substring(2);
        console.log('🧪 DEBUG: Parsed numeric suffix:', suffix);
        
        try {
          const parsedSuffix = parseInt(suffix);
          console.log('🧪 DEBUG: Successfully parsed suffix as integer:', parsedSuffix);
        } catch (parseError) {
          console.error('🧪 DEBUG: Failed to parse suffix as integer:', parseError);
        }
      }

      // Test the generator function
      const { data: generatedNumber, error: generatorError } = await supabase
        .rpc('generate_work_order_number');

      if (generatorError) {
        console.error('🧪 DEBUG: Error calling generator function:', generatorError);
        throw generatorError;
      }

      console.log('🧪 DEBUG: Generated work order number:', generatedNumber);

      // Collect status information
      const statuses = existingWorkOrders?.map(wo => wo.status) || [];
      const uniqueStatuses = [...new Set(statuses)];

      setDebugInfo({
        latestFetched: latestWorkOrderNumber,
        generated: generatedNumber,
        totalWorkOrders: existingWorkOrders?.length || 0,
        statuses: uniqueStatuses,
        tenantId: userProfile.tenant_id,
      });

    } catch (error: any) {
      console.error('🧪 DEBUG: Test generator failed:', error);
      setDebugInfo({
        latestFetched: null,
        generated: null,
        totalWorkOrders: 0,
        statuses: [],
        tenantId: userProfile?.tenant_id || null,
        error: error.message || 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Get current page debug info
  const currentPageInfo = {
    totalWorkOrders: workOrders.length,
    statuses: [...new Set(workOrders.map(wo => wo.status))],
    tenantId: userProfile?.tenant_id || null,
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Work Order Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button
            onClick={testGenerator}
            disabled={isGenerating}
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Play className="h-3 w-3 mr-2" />
            {isGenerating ? 'Testing Generator...' : 'Test Number Generator'}
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Current Page Info:</span>
            <div className="ml-2 space-y-1 text-xs">
              <div>Tenant ID: <span className="font-mono">{currentPageInfo.tenantId}</span></div>
              <div>Work orders shown: {currentPageInfo.totalWorkOrders}</div>
              <div>Statuses: {currentPageInfo.statuses.map(status => (
                <Badge key={status} variant="outline" className="ml-1 text-xs">
                  {status}
                </Badge>
              ))}</div>
            </div>
          </div>

          {debugInfo && (
            <div>
              <span className="font-medium text-gray-700">Generator Test Results:</span>
              <div className="ml-2 space-y-1 text-xs">
                {debugInfo.error ? (
                  <div className="text-red-600">Error: {debugInfo.error}</div>
                ) : (
                  <>
                    <div>Latest fetched: <span className="font-mono">{debugInfo.latestFetched || 'NULL'}</span></div>
                    <div>Generated: <span className="font-mono">{debugInfo.generated}</span></div>
                    <div>Total in DB: {debugInfo.totalWorkOrders}</div>
                    <div>DB Statuses: {debugInfo.statuses.map(status => (
                      <Badge key={status} variant="outline" className="ml-1 text-xs">
                        {status}
                      </Badge>
                    ))}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};