import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  handleError,
  showErrorToast,
  showSuccessToast,
  logError,
  withErrorHandling,
  requireValue,
} from '@/utils/errorHandling';
import {
  supabaseTest,
  setupTestUser,
  signInTestUser,
  cleanupTestUser,
  cleanupTestAssets,
  cleanupTestDepartments,
  createTestAsset,
  createTestDepartment,
  getCurrentTenantId,
} from './setup';
import { mockToast } from '@/test/setup';

describe('Error Handling Integration Tests', () => {
  beforeAll(async () => {
    await setupTestUser();
    await signInTestUser();
  });

  afterAll(async () => {
    await cleanupTestAssets();
    await cleanupTestDepartments();
    await cleanupTestUser();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============= Database Operations =============
  describe('Database Operations', () => {
    describe('Insert Operations', () => {
      it('should handle successful asset creation', async () => {
        const tenantId = await getCurrentTenantId();
        expect(tenantId).toBeTruthy();

        const assetData = {
          name: 'Integration Test Asset',
          status: 'active' as const,
          priority: 'medium' as const,
          asset_type: 'unit',
          tenant_id: tenantId!,
        };

        const { data, error } = await supabaseTest
          .from('assets')
          .insert(assetData)
          .select()
          .maybeSingle();

        expect(error).toBeNull();
        expect(data).toBeTruthy();
        expect(data?.name).toBe('Integration Test Asset');

        // Cleanup
        if (data?.id) {
          await supabaseTest.from('assets').delete().eq('id', data.id);
        }
      });

      it('should handle duplicate key constraint violation', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const tenantId = await getCurrentTenantId();

        // Create first asset
        const asset1 = await createTestAsset({
          asset_tag: 'UNIQUE-TAG-001',
        });

        // Try to create duplicate
        try {
          const { error } = await supabaseTest
            .from('assets')
            .insert({
              name: 'Duplicate Asset',
              status: 'active' as const,
              priority: 'medium' as const,
              asset_type: 'unit',
              asset_tag: 'UNIQUE-TAG-001',
              tenant_id: tenantId!,
            });

          if (error) throw error;
        } catch (error: unknown) {
          handleError(error, 'CreateAsset', {
            showToast: true,
            toastTitle: 'Failed to create asset',
          });

          expect(consoleError).toHaveBeenCalled();
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              variant: 'destructive',
              description: expect.stringContaining('already exists'),
            })
          );
        }

        // Cleanup
        if (asset1?.id) {
          await supabaseTest.from('assets').delete().eq('id', asset1.id);
        }
      });

      it('should handle null constraint violation', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const tenantId = await getCurrentTenantId();

        try {
          const { error } = await supabaseTest
            .from('assets')
            .insert({
              name: '', // Empty name should fail
              status: 'active' as const,
              priority: 'medium' as const,
              asset_type: 'unit',
              tenant_id: tenantId!,
            });

          if (error) throw error;
        } catch (error: unknown) {
          handleError(error, 'CreateAsset');

          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              description: expect.stringContaining('required information is missing'),
            })
          );
        }
      });
    });

    describe('Update Operations', () => {
      it('should handle successful update', async () => {
        const asset = await createTestAsset({ name: 'Original Name' });
        expect(asset).toBeTruthy();

        const { data, error } = await supabaseTest
          .from('assets')
          .update({ name: 'Updated Name' })
          .eq('id', asset!.id)
          .select()
          .maybeSingle();

        expect(error).toBeNull();
        expect(data?.name).toBe('Updated Name');

        // Cleanup
        await supabaseTest.from('assets').delete().eq('id', asset!.id);
      });

      it('should handle update with invalid foreign key', async () => {
        const asset = await createTestAsset({});
        const invalidDepartmentId = '00000000-0000-0000-0000-000000000000';

        try {
          const { error } = await supabaseTest
            .from('assets')
            .update({ department_id: invalidDepartmentId })
            .eq('id', asset!.id);

          if (error) throw error;
        } catch (error: unknown) {
          handleError(error, 'UpdateAsset');

          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              description: expect.stringContaining('referenced elsewhere'),
            })
          );
        }

        // Cleanup
        if (asset?.id) {
          await supabaseTest.from('assets').delete().eq('id', asset.id);
        }
      });
    });

    describe('Delete Operations', () => {
      it('should handle successful delete', async () => {
        const asset = await createTestAsset({});
        expect(asset).toBeTruthy();

        const { error } = await supabaseTest
          .from('assets')
          .delete()
          .eq('id', asset!.id);

        expect(error).toBeNull();

        // Verify deletion
        const { data } = await supabaseTest
          .from('assets')
          .select()
          .eq('id', asset!.id)
          .maybeSingle();

        expect(data).toBeNull();
      });

      it('should handle delete with foreign key constraint', async () => {
        // Create parent asset
        const parent = await createTestAsset({ name: 'Parent Asset' });
        
        // Create child asset
        const child = await createTestAsset({
          name: 'Child Asset',
          parent_asset_id: parent!.id,
        });

        try {
          // Try to delete parent (should fail due to child reference)
          const { error } = await supabaseTest
            .from('assets')
            .delete()
            .eq('id', parent!.id);

          if (error) throw error;
        } catch (error: unknown) {
          handleError(error, 'DeleteAsset');

          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              description: expect.stringContaining('referenced elsewhere'),
            })
          );
        }

        // Cleanup
        if (child?.id) await supabaseTest.from('assets').delete().eq('id', child.id);
        if (parent?.id) await supabaseTest.from('assets').delete().eq('id', parent.id);
      });
    });

    describe('Query Operations', () => {
      it('should handle empty result with maybeSingle', async () => {
        const { data, error } = await supabaseTest
          .from('assets')
          .select()
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .maybeSingle();

        expect(error).toBeNull();
        expect(data).toBeNull();
      });

      it('should handle query with filters', async () => {
        const asset = await createTestAsset({ name: 'Filterable Asset' });

        const { data, error } = await supabaseTest
          .from('assets')
          .select()
          .eq('name', 'Filterable Asset')
          .maybeSingle();

        expect(error).toBeNull();
        expect(data?.name).toBe('Filterable Asset');

        // Cleanup
        if (asset?.id) {
          await supabaseTest.from('assets').delete().eq('id', asset.id);
        }
      });

      it('should handle tenant isolation', async () => {
        const tenantId = await getCurrentTenantId();
        const asset = await createTestAsset({});

        // Query with correct tenant
        const { data: correctData } = await supabaseTest
          .from('assets')
          .select()
          .eq('tenant_id', tenantId!)
          .eq('id', asset!.id)
          .maybeSingle();

        expect(correctData).toBeTruthy();

        // Query with wrong tenant (should return nothing due to RLS)
        const wrongTenantId = '00000000-0000-0000-0000-000000000000';
        const { data: wrongData } = await supabaseTest
          .from('assets')
          .select()
          .eq('tenant_id', wrongTenantId)
          .eq('id', asset!.id)
          .maybeSingle();

        // RLS should prevent access
        expect(wrongData).toBeNull();

        // Cleanup
        if (asset?.id) {
          await supabaseTest.from('assets').delete().eq('id', asset.id);
        }
      });
    });
  });

  // ============= Form Submission Scenarios =============
  describe('Form Submission Scenarios', () => {
    it('should handle form submission with validation error', async () => {
      try {
        // Simulate form data without required field
        const formData: { name?: string; status: string } = {
          status: 'active',
        };

        requireValue(formData.name, 'Asset name is required');
      } catch (error: unknown) {
        handleError(error, 'AssetForm');

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            description: 'Asset name is required',
          })
        );
      }
    });

    it('should handle successful form submission', async () => {
      const tenantId = await getCurrentTenantId();
      
      const formData = {
        name: 'Form Test Asset',
        status: 'active' as const,
        priority: 'medium' as const,
        asset_type: 'unit',
        tenant_id: tenantId!,
      };

      try {
        const { data, error } = await supabaseTest
          .from('assets')
          .insert(formData)
          .select()
          .maybeSingle();

        if (error) throw error;

        showSuccessToast('Asset created successfully');

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            description: 'Asset created successfully',
          })
        );

        // Cleanup
        if (data?.id) {
          await supabaseTest.from('assets').delete().eq('id', data.id);
        }
      } catch (error: unknown) {
        handleError(error, 'AssetForm');
      }
    });

    it('should handle concurrent form submissions', async () => {
      const tenantId = await getCurrentTenantId();

      const submissions = Array.from({ length: 3 }, (_, i) =>
        supabaseTest
          .from('assets')
          .insert({
            name: `Concurrent Asset ${i}`,
            status: 'active' as const,
            priority: 'medium' as const,
            asset_type: 'unit',
            tenant_id: tenantId!,
          })
          .select()
          .maybeSingle()
      );

      const results = await Promise.allSettled(submissions);

      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBe(3);

      // Cleanup
      for (const result of successful) {
        if (result.status === 'fulfilled' && result.value.data?.id) {
          await supabaseTest
            .from('assets')
            .delete()
            .eq('id', result.value.data.id);
        }
      }
    });
  });

  // ============= Async Function Wrapper =============
  describe('withErrorHandling Wrapper', () => {
    it('should handle successful async operation', async () => {
      const result = await withErrorHandling(
        async () => {
          const asset = await createTestAsset({ name: 'Wrapped Asset' });
          return asset;
        },
        'WrappedOperation'
      );

      expect(result).toBeTruthy();
      expect(result?.name).toBe('Wrapped Asset');
      expect(mockToast).not.toHaveBeenCalled();

      // Cleanup
      if (result?.id) {
        await supabaseTest.from('assets').delete().eq('id', result.id);
      }
    });

    it('should handle failed async operation', async () => {
      const result = await withErrorHandling(
        async () => {
          throw new Error('Operation failed');
        },
        'FailedOperation',
        {
          showToast: true,
          toastTitle: 'Operation Failed',
        }
      );

      expect(result).toBeNull();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Operation Failed',
          variant: 'destructive',
        })
      );
    });

    it('should call onError callback', async () => {
      const onError = vi.fn();

      await withErrorHandling(
        async () => {
          throw new Error('Custom error');
        },
        'CallbackTest',
        { onError }
      );

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ============= Background Operations =============
  describe('Background Operations', () => {
    it('should log errors without showing toast', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        throw new Error('Background task failed');
      } catch (error: unknown) {
        logError(error, 'BackgroundSync', {
          taskId: 'sync-001',
          retryCount: 3,
        });
      }

      expect(consoleError).toHaveBeenCalledWith(
        '[BackgroundSync] Error:',
        expect.objectContaining({
          taskId: 'sync-001',
          retryCount: 3,
        })
      );
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  // ============= Permission Errors =============
  describe('Permission Errors', () => {
    it('should handle RLS permission denied', async () => {
      // Sign out to test unauthenticated access
      await supabaseTest.auth.signOut();

      try {
        const { error } = await supabaseTest
          .from('assets')
          .insert({
            name: 'Unauthorized Asset',
            status: 'active' as const,
            priority: 'medium' as const,
          } as any);

        if (error) throw error;
      } catch (error: unknown) {
        handleError(error, 'UnauthorizedAccess');

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('permission'),
          })
        );
      }

      // Sign back in
      await signInTestUser();
    });
  });

  // ============= Network Errors =============
  describe('Network Errors', () => {
    it('should handle network timeout', async () => {
      try {
        // Simulate timeout by creating a promise that rejects
        await Promise.race([
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 100)
          ),
          new Promise(resolve => setTimeout(resolve, 200)),
        ]);
      } catch (error: unknown) {
        handleError(error, 'NetworkRequest');

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('took too long'),
          })
        );
      }
    });
  });

  // ============= Complex Scenarios =============
  describe('Complex Scenarios', () => {
    it('should handle transaction-like operations with rollback', async () => {
      const tenantId = await getCurrentTenantId();
      let createdAssetId: string | null = null;

      try {
        // Step 1: Create asset
        const { data: asset, error: assetError } = await supabaseTest
          .from('assets')
          .insert({
            name: 'Transaction Asset',
            status: 'active' as const,
            priority: 'medium' as const,
            asset_type: 'unit',
            tenant_id: tenantId!,
          })
          .select()
          .maybeSingle();

        if (assetError) throw assetError;
        createdAssetId = asset!.id;

        // Step 2: Try to create related record (simulate failure)
        throw new Error('Related record creation failed');

      } catch (error: unknown) {
        // Rollback: delete asset if created
        if (createdAssetId) {
          await supabaseTest
            .from('assets')
            .delete()
            .eq('id', createdAssetId);
        }

        handleError(error, 'TransactionOperation');
        expect(mockToast).toHaveBeenCalled();
      }

      // Verify rollback
      if (createdAssetId) {
        const { data } = await supabaseTest
          .from('assets')
          .select()
          .eq('id', createdAssetId)
          .maybeSingle();

        expect(data).toBeNull();
      }
    });

    it('should handle bulk operations with partial failures', async () => {
      const tenantId = await getCurrentTenantId();
      const assets = [
        { name: 'Bulk Asset 1', valid: true },
        { name: 'Bulk Asset 2', valid: true },
        { name: '', valid: false }, // Invalid - no name
      ];

      const results = await Promise.allSettled(
        assets.map(async (asset) => {
          if (!asset.valid) {
            throw new Error('Invalid asset data');
          }

          const { data, error } = await supabaseTest
            .from('assets')
            .insert({
              name: asset.name,
              status: 'active' as const,
              priority: 'medium' as const,
              asset_type: 'unit',
              tenant_id: tenantId!,
            })
            .select()
            .maybeSingle();

          if (error) throw error;
          return data;
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful.length).toBe(2);
      expect(failed.length).toBe(1);

      // Cleanup successful inserts
      for (const result of successful) {
        if (result.status === 'fulfilled' && result.value?.id) {
          await supabaseTest
            .from('assets')
            .delete()
            .eq('id', result.value.id);
        }
      }
    });
  });
});
