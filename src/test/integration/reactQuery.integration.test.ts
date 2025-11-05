import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { showSuccessToast, showErrorToast, handleError } from '@/utils/errorHandling';
import {
  supabaseTest,
  setupTestUser,
  signInTestUser,
  cleanupTestUser,
  cleanupTestAssets,
  createTestAsset,
  getCurrentTenantId,
} from './setup';
import { mockToast } from '@/test/setup';

// Create a wrapper component for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('React Query Integration Tests', () => {
  beforeAll(async () => {
    await setupTestUser();
    await signInTestUser();
  });

  afterAll(async () => {
    await cleanupTestAssets();
    await cleanupTestUser();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Mutation Tests =============
  describe('Mutations', () => {
    it('should handle successful mutation', async () => {
      const tenantId = await getCurrentTenantId();

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: async (name: string) => {
              const { data, error } = await supabaseTest
                .from('assets')
                .insert({
                  name,
                  status: 'active' as const,
                  priority: 'medium' as const,
                  asset_type: 'unit',
                  tenant_id: tenantId!,
                })
                .select()
                .maybeSingle();

              if (error) throw error;
              return data;
            },
            onSuccess: () => {
              showSuccessToast('Asset created successfully');
            },
            onError: (error: unknown) => {
              showErrorToast(error, {
                title: 'Failed to create asset',
                context: 'Asset',
              });
            },
          }),
        { wrapper: createWrapper() }
      );

      result.current.mutate('Mutation Test Asset');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          description: 'Asset created successfully',
        })
      );

      // Cleanup
      if (result.current.data?.id) {
        await supabaseTest
          .from('assets')
          .delete()
          .eq('id', result.current.data.id);
      }
    });

    it('should handle mutation error', async () => {
      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: async () => {
              const tenantId = await getCurrentTenantId();
              // Try to insert without required field - empty name
              const { error } = await supabaseTest
                .from('assets')
                .insert({
                  name: '', // Empty name should fail validation
                  status: 'active' as const,
                  priority: 'medium' as const,
                  asset_type: 'unit',
                  tenant_id: tenantId!,
                });

              if (error) throw error;
            },
            onError: (error: unknown) => {
              showErrorToast(error, {
                title: 'Create Failed',
                context: 'Asset',
              });
            },
          }),
        { wrapper: createWrapper() }
      );

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Create Failed',
          variant: 'destructive',
        })
      );
    });

    it('should handle update mutation', async () => {
      const asset = await createTestAsset({ name: 'Original Name' });
      const tenantId = await getCurrentTenantId();

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: async (newName: string) => {
              const { data, error } = await supabaseTest
                .from('assets')
                .update({ name: newName })
                .eq('id', asset!.id)
                .eq('tenant_id', tenantId!)
                .select()
                .maybeSingle();

              if (error) throw error;
              return data;
            },
            onSuccess: () => {
              showSuccessToast('Asset updated successfully');
            },
            onError: (error: unknown) => {
              showErrorToast(error, { title: 'Update Failed' });
            },
          }),
        { wrapper: createWrapper() }
      );

      result.current.mutate('Updated Name');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Updated Name');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Asset updated successfully',
        })
      );

      // Cleanup
      if (asset?.id) {
        await supabaseTest.from('assets').delete().eq('id', asset.id);
      }
    });

    it('should handle delete mutation', async () => {
      const asset = await createTestAsset();
      const tenantId = await getCurrentTenantId();

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: async (assetId: string) => {
              const { error } = await supabaseTest
                .from('assets')
                .delete()
                .eq('id', assetId)
                .eq('tenant_id', tenantId!);

              if (error) throw error;
            },
            onSuccess: () => {
              showSuccessToast('Asset deleted successfully');
            },
            onError: (error: unknown) => {
              showErrorToast(error, { title: 'Delete Failed' });
            },
          }),
        { wrapper: createWrapper() }
      );

      result.current.mutate(asset!.id);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Asset deleted successfully',
        })
      );

      // Verify deletion
      const { data } = await supabaseTest
        .from('assets')
        .select()
        .eq('id', asset!.id)
        .maybeSingle();

      expect(data).toBeNull();
    });

    it('should handle multiple mutations in sequence', async () => {
      const tenantId = await getCurrentTenantId();

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: async (name: string) => {
              const { data, error } = await supabaseTest
                .from('assets')
                .insert({
                  name,
                  status: 'active' as const,
                  priority: 'medium' as const,
                  asset_type: 'unit',
                  tenant_id: tenantId!,
                })
                .select()
                .maybeSingle();

              if (error) throw error;
              return data;
            },
            onSuccess: () => {
              showSuccessToast('Asset created');
            },
          }),
        { wrapper: createWrapper() }
      );

      // First mutation
      result.current.mutate('Asset 1');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const asset1Id = result.current.data?.id;

      // Second mutation
      result.current.mutate('Asset 2');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const asset2Id = result.current.data?.id;

      expect(mockToast).toHaveBeenCalledTimes(2);

      // Cleanup
      if (asset1Id) await supabaseTest.from('assets').delete().eq('id', asset1Id);
      if (asset2Id) await supabaseTest.from('assets').delete().eq('id', asset2Id);
    });
  });

  // ============= Query Tests =============
  describe('Queries', () => {
    it('should handle successful query', async () => {
      const asset = await createTestAsset({ name: 'Query Test Asset' });
      const tenantId = await getCurrentTenantId();

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['asset', asset!.id],
            queryFn: async () => {
              const { data, error } = await supabaseTest
                .from('assets')
                .select()
                .eq('id', asset!.id)
                .eq('tenant_id', tenantId!)
                .maybeSingle();

              if (error) throw error;
              return data;
            },
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Query Test Asset');

      // Cleanup
      if (asset?.id) {
        await supabaseTest.from('assets').delete().eq('id', asset.id);
      }
    });

    it('should handle query with no results', async () => {
      const tenantId = await getCurrentTenantId();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['asset', nonExistentId],
            queryFn: async () => {
              const { data, error } = await supabaseTest
                .from('assets')
                .select()
                .eq('id', nonExistentId)
                .eq('tenant_id', tenantId!)
                .maybeSingle();

              if (error) throw error;
              return data;
            },
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('should handle query error', async () => {
      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['invalid-query'],
            queryFn: async () => {
              // Invalid table name
              const { error } = await supabaseTest
                .from('nonexistent_table' as any)
                .select();

              if (error) throw error;
            },
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should handle list query', async () => {
      const assets = await Promise.all([
        createTestAsset({ name: 'List Asset 1' }),
        createTestAsset({ name: 'List Asset 2' }),
        createTestAsset({ name: 'List Asset 3' }),
      ]);
      const tenantId = await getCurrentTenantId();

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['assets'],
            queryFn: async () => {
              const { data, error } = await supabaseTest
                .from('assets')
                .select()
                .eq('tenant_id', tenantId!)
                .order('created_at', { ascending: false });

              if (error) throw error;
              return data;
            },
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.length).toBeGreaterThanOrEqual(3);

      // Cleanup
      for (const asset of assets) {
        if (asset?.id) {
          await supabaseTest.from('assets').delete().eq('id', asset.id);
        }
      }
    });
  });

  // ============= Optimistic Updates =============
  describe('Optimistic Updates', () => {
    it('should handle optimistic update with rollback on error', async () => {
      const asset = await createTestAsset({ name: 'Optimistic Asset' });
      const queryClient = new QueryClient();

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: async (newName: string) => {
              // Simulate error
              throw new Error('Update failed');
            },
            onMutate: async (newName) => {
              // Optimistically update
              await queryClient.cancelQueries({ queryKey: ['asset', asset!.id] });
              const previousAsset = queryClient.getQueryData(['asset', asset!.id]);
              queryClient.setQueryData(['asset', asset!.id], { ...asset, name: newName });
              return { previousAsset };
            },
            onError: (error: unknown, variables, context) => {
              // Rollback on error
              if (context?.previousAsset) {
                queryClient.setQueryData(['asset', asset!.id], context.previousAsset);
              }
              showErrorToast(error, { title: 'Update Failed' });
            },
          }),
        { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
      );

      result.current.mutate('New Name');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Update Failed',
          variant: 'destructive',
        })
      );

      // Cleanup
      if (asset?.id) {
        await supabaseTest.from('assets').delete().eq('id', asset.id);
      }
    });
  });
});
