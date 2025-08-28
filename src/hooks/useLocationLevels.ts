import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import type { LocationLevel, LocationLevelFormData, LocationLevelFilters } from "@/types/location";

export const useLocationLevels = (filters?: LocationLevelFilters) => {
  const { userProfile } = useAuth();
  
  return useQuery({
    queryKey: ["location-levels", userProfile?.tenant_id, filters],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error("No tenant ID found");
      }

      let query;
      
      if (filters?.includeUsage) {
        // Query with usage counts using RPC or manual aggregation
        const { data, error } = await supabase
          .from("location_levels")
          .select(`
            *,
            locations(count)
          `)
          .eq("tenant_id", userProfile.tenant_id);
          
        if (error) {
          console.error("Error fetching location levels with usage:", error);
          throw error;
        }

        // Transform the data to include usage_count
        const transformedData = await Promise.all(
          (data || []).map(async (level) => {
            const { count } = await supabase
              .from("locations")
              .select("*", { count: "exact", head: true })
              .eq("location_level_id", level.id);
            
            return {
              ...level,
              usage_count: count || 0
            };
          })
        );

        return transformedData as LocationLevel[];
      } else {
        // Regular query without usage counts
        query = supabase
          .from("location_levels")
          .select("*")
          .eq("tenant_id", userProfile.tenant_id);

        if (filters?.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }

        if (filters?.is_active !== undefined) {
          query = query.eq("is_active", filters.is_active);
        }

        query = query.order("name");

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching location levels:", error);
          throw error;
        }

        return data as LocationLevel[];
      }
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCreateLocationLevel = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LocationLevelFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error("No tenant ID found");
      }

      const { data: result, error } = await supabase
        .from("location_levels")
        .insert([
          {
            ...data,
            tenant_id: userProfile.tenant_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-levels"] });
      toast({
        title: "Success",
        description: "Location level created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating location level:", error);
      toast({
        title: "Error",
        description: "Failed to create location level",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLocationLevel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LocationLevelFormData> }) => {
      const { data: result, error } = await supabase
        .from("location_levels")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-levels"] });
      toast({
        title: "Success",
        description: "Location level updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating location level:", error);
      toast({
        title: "Error",
        description: "Failed to update location level",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLocationLevel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First check if the level is in use
      const { data: locations, error: checkError } = await supabase
        .from("locations")
        .select("id")
        .eq("location_level_id", id);

      if (checkError) throw checkError;

      if (locations && locations.length > 0) {
        throw new Error(`LEVEL_IN_USE:${locations.length}`);
      }

      // If not in use, perform hard delete
      const { error } = await supabase
        .from("location_levels")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-levels"] });
      toast({
        title: "Success",
        description: "Location level deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting location level:", error);
      
      if (error.message.startsWith("LEVEL_IN_USE:")) {
        const usageCount = error.message.split(":")[1];
        toast({
          title: "Cannot Delete",
          description: `This level is used by ${usageCount} locations. Deactivate it instead.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete location level",
          variant: "destructive",
        });
      }
    },
  });
};