
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

export const useAssets = () => {
  const { userProfile } = useAuth();

  const { data: assets, isLoading, refetch, error } = useQuery({
    queryKey: ['assets', userProfile?.tenant_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          if (
            error.status === 401 ||
            error.status === 403 ||
            error.status === 400 ||
            (typeof error.message === "string" &&
              (error.message.toLowerCase().includes("token") ||
                error.message.toLowerCase().includes("refresh") ||
                error.message.toLowerCase().includes("expired") ||
                error.message.toLowerCase().includes("session"))
            )
          ) {
            throw new Error("Session expired. Please sign in again.");
          }
          throw error;
        }
        return data as Asset[];
      } catch (err: any) {
        throw err;
      }
    },
    enabled: !!userProfile?.tenant_id,
    // Optionally: retry only specific errors
    retry: (failureCount, err: any) => {
      if (
        err?.message &&
        (
          err.message.includes("expired") ||
          err.message.includes("sign in") ||
          err.message.includes("401") ||
          err.message.includes("forbidden")
        )
      ) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message === "Session expired. Please sign in again."
            ? "Your session expired. Please sign in again."
            : error.message,
        variant: "destructive",
      });
    }
  };

  return {
    assets: assets || [],
    isLoading,
    refetch,
    deleteAsset,
    error,
  };
};

