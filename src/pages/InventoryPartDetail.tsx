import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, Trash2, Package, MapPin, Save, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import { usePartWithSupplier } from '@/hooks/queries/usePartWithSupplier';
import { PartSupplierCard } from '@/components/inventory/PartSupplierCard';
import { PartLinkedAssetsCard } from '@/components/inventory/PartLinkedAssetsCard';
import { useInventoryParts } from '@/pages/inventory/hooks/useInventoryParts';
import { SparePartsCategorySelector } from '@/components/inventory/SparePartsCategorySelector';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useInventoryPartForm } from '@/pages/inventory/components/useInventoryPartForm';
import { InventoryPartBasicFields } from '@/pages/inventory/components/InventoryPartBasicFields';
import { InventoryPartQuantityFields } from '@/pages/inventory/components/InventoryPartQuantityFields';
import { InventoryPartLocationFields } from '@/pages/inventory/components/InventoryPartLocationFields';
import type { FormData } from '@/pages/inventory/components/useInventoryPartForm';

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

const InventoryPartDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useGlobalSettings();
  const isAdmin = userProfile?.role === 'admin';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Determine if we're in edit mode based on URL path
  const isEditMode = location.pathname.includes('/edit');
  const [mode, setMode] = useState<'view' | 'edit'>(isEditMode ? 'edit' : 'view');

  // Use the enhanced hook that includes supplier data
  const { data: part, isLoading } = usePartWithSupplier(id || '');
  const { updatePart } = useInventoryParts();

  // Form state for editing all fields
  const { form, handleSubmit: handleFormSubmit } = useInventoryPartForm({
    initialData: part ? {
      name: part.name,
      sku: part.sku || '',
      description: part.description || '',
      inventory_type: part.inventory_type || 'spare_parts',
      unit_of_measure: part.unit_of_measure || 'pieces',
      unit_cost: part.unit_cost || 0,
      quantity_in_stock: part.quantity_in_stock,
      reorder_threshold: part.reorder_threshold || 0,
      storage_locations: part.storage_locations,
      linked_asset_type: part.linked_asset_type || '',
      spare_parts_category_id: part.spare_parts_category_id || '',
    } : undefined,
    onSubmit: async (data) => {
      // This will be called by handleSave
    }
  });

  // Watch form fields for validation warnings (must be after form declaration)
  const quantityInStock = form.watch('quantity_in_stock');
  const reorderThreshold = form.watch('reorder_threshold');
  const showLowStockWarning = mode === 'edit' && quantityInStock < reorderThreshold;

  // Update form when part data changes
  useEffect(() => {
    if (part) {
      form.reset({
        name: part.name,
        sku: part.sku || '',
        description: part.description || '',
        inventory_type: part.inventory_type || 'spare_parts',
        unit_of_measure: part.unit_of_measure || 'pieces',
        unit_cost: part.unit_cost || 0,
        quantity_in_stock: part.quantity_in_stock,
        reorder_threshold: part.reorder_threshold || 0,
        storage_locations: Array.isArray(part.storage_locations) 
          ? part.storage_locations.join(', ') 
          : part.storage_locations || '',
        linked_asset_type: part.linked_asset_type || '',
        spare_parts_category_id: part.spare_parts_category_id || '',
      });
    }
  }, [part, form]);
  
  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Partial<Database['public']['Tables']['inventory_parts']['Update']> }) => {
      if (!id) throw new Error('Part ID is required');
      
      const { data, error } = await supabase
        .from('inventory_parts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-part-supplier', id] });
      toast({
        title: 'Success',
        description: 'Part updated successfully',
      });
      setMode('view');
      navigate(`/inventory/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= threshold) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const handleDelete = async () => {
    if (!part) return;

    try {
      const { error } = await supabase
        .from('inventory_parts')
        .delete()
        .eq('id', part.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Inventory part deleted successfully',
      });

      navigate('/inventory');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory part',
        variant: 'destructive',
      });
    }
  };

  const handleSupplierChange = (supplierId: string | null) => {
    updatePartMutation.mutate({
      updates: { supplier_id: supplierId }
    });
  };

  const handleEditClick = () => {
    setMode('edit');
    navigate(`/inventory/${id}/edit`);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (part) {
      form.reset({
        spare_parts_category_id: part.spare_parts_category_id || null,
      });
    }
    setMode('view');
    navigate(`/inventory/${id}`);
  };

  const handleSave = async () => {
    const values = form.getValues();
    const previousStock = part?.quantity_in_stock || 0;
    
    const { error } = await supabase
      .from('inventory_parts')
      .update({
        name: values.name,
        sku: values.sku || null,
        description: values.description || null,
        unit_of_measure: values.unit_of_measure || null,
        unit_cost: values.unit_cost || null,
        quantity_in_stock: values.quantity_in_stock,
        reorder_threshold: values.reorder_threshold || null,
        storage_locations: values.storage_locations 
          ? values.storage_locations.split(',').map(loc => loc.trim()).filter(Boolean)
          : null,
        spare_parts_category_id: values.spare_parts_category_id || null,
      })
      .eq('id', id!);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update part',
        variant: 'destructive',
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
    await queryClient.invalidateQueries({ queryKey: ['inventory-part-supplier', id] });
    
    // Check if we should trigger low stock alert
    const currentStock = values.quantity_in_stock;
    const reorderThreshold = values.reorder_threshold || 0;

    if (
      currentStock <= reorderThreshold &&
      previousStock > reorderThreshold &&
      part &&
      userProfile?.tenant_id
    ) {
      const { areLowStockAlertsEnabled, triggerLowStockAlert } = await import('@/utils/notificationHelpers');
      
      const alertsEnabled = await areLowStockAlertsEnabled(userProfile.tenant_id);
      
      if (alertsEnabled) {
        console.log('Triggering low stock alert for part:', part.name);
        
        try {
          await triggerLowStockAlert({
            partId: part.id,
            partName: values.name,
            sku: values.sku || part.sku,
            currentStock: currentStock,
            reorderThreshold: reorderThreshold,
            unitOfMeasure: values.unit_of_measure || 'pieces',
            category: part.spare_parts_category?.name,
            supplierName: part.supplier?.company_name,
            tenantId: userProfile.tenant_id,
          });
        } catch (error) {
          console.error('Failed to send low stock alert:', error);
          // Don't throw - we don't want to fail the update if email fails
        }
      }
    }
    
    toast({
      title: 'Success',
      description: 'Part updated successfully',
    });
    setMode('view');
    navigate(`/inventory/${id}`, { state: location.state });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading part details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Part not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stockStatus = getStockStatus(part.quantity_in_stock, part.reorder_threshold);

  return (
    <>
      <div className="max-w-5xl mx-auto px-6">
        <div className="space-y-6">
          {/* Header */}
          <Card className="rounded-2xl shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                    className="p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
                    <Package className="h-6 w-6 text-primary" />
                    <span>{part.name}</span>
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {mode === 'view' ? (
                    <Button variant="outline" onClick={handleEditClick} data-testid="edit-part-btn">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={updatePartMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                  {isAdmin && mode === 'view' && (
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Basic Information</h3>
                  {mode === 'edit' ? (
                    <Form {...form}>
                      <InventoryPartBasicFields control={form.control} />
                    </Form>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">SKU:</span>
                        <span>{part.sku}</span>
                      </div>
                      {part.description && (
                        <div>
                          <span className="text-sm text-muted-foreground">Description:</span>
                          <p className="text-sm mt-1">{part.description}</p>
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Stock Status:</span>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Stock Information</h3>
                    {mode === 'edit' ? (
                      <>
                        <Form {...form}>
                          <InventoryPartQuantityFields control={form.control} />
                        </Form>
                        {showLowStockWarning && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Warning: Current stock ({quantityInStock}) is below reorder threshold ({reorderThreshold})
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Stock:</span>
                          <span className="font-medium">{part.quantity_in_stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reorder Threshold:</span>
                          <span>{part.reorder_threshold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Unit of Measure:</span>
                          <span>{part.unit_of_measure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Unit Cost:</span>
                          <span>{part.unit_cost ? formatCurrency(part.unit_cost) : '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Details</h3>
                    <div className="space-y-2">
                      {mode === 'edit' ? (
                        <Form {...form}>
                          <SparePartsCategorySelector
                            control={form.control}
                            name="spare_parts_category_id"
                            label="Category"
                            placeholder="Select a category"
                          />
                        </Form>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Category:</span>
                          <span>{part.spare_parts_category?.name || 'Uncategorized'}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Inventory Type:</span>
                        <span>
                          {(part as any).inventory_type === 'spare_parts' && 'Spare Parts'}
                          {(part as any).inventory_type === 'consumables' && 'Consumables'}
                          {(part as any).inventory_type === 'tools' && 'Tools'}
                          {(part as any).inventory_type === 'supplies' && 'Supplies'}
                          {(part as any).inventory_type === 'materials' && 'Materials'}
                        </span>
                      </div>
                      {part.linked_asset_type && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Asset Type:</span>
                          <span>{part.linked_asset_type}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span>{format(new Date(part.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {part.storage_locations && part.storage_locations.length > 0 || mode === 'edit' ? (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Storage Locations
                      </h3>
                      {mode === 'edit' ? (
                        <Form {...form}>
                          <InventoryPartLocationFields control={form.control} />
                        </Form>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {part.storage_locations?.map((location, index) => (
                            <Badge key={index} variant="outline">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
          
          {/* Supplier Card */}
          <PartSupplierCard 
            supplier={part.supplier}
            isEditing={mode === 'edit'}
            onSupplierChange={handleSupplierChange}
          />
          
          {/* Linked Assets Card */}
          <PartLinkedAssetsCard partId={part.id} />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Inventory Part"
        description={`Are you sure you want to delete "${part.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};

export default InventoryPartDetail;