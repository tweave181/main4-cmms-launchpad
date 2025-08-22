import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Package, MapPin, Save, X } from 'lucide-react';
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

type InventoryPart = Database['public']['Tables']['inventory_parts']['Row'];

const InventoryPartDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userProfile?.role === 'admin';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Determine if we're in edit mode based on URL path
  const isEditMode = location.pathname.includes('/edit');
  const [mode, setMode] = useState<'view' | 'edit'>(isEditMode ? 'edit' : 'view');

  // Use the enhanced hook that includes supplier data
  const { data: part, isLoading } = usePartWithSupplier(id || '');
  const { updatePart } = useInventoryParts();
  
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
    setMode('view');
    navigate(`/inventory/${id}`);
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
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
                        <Button onClick={() => setMode('view')}>
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
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">SKU: {part.sku}</p>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </div>
                  </div>

                  {part.description && (
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">{part.description}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Stock Information</h3>
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
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Category:</span>
                          <span>{part.category || 'Uncategorized'}</span>
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

                  {part.storage_locations && part.storage_locations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Storage Locations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {part.storage_locations.map((location, index) => (
                            <Badge key={index} variant="outline">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column with supplier and linked assets */}
          <div className="space-y-6">
            <PartSupplierCard 
              supplier={part.supplier}
              isEditing={mode === 'edit'}
              onSupplierChange={handleSupplierChange}
            />
            
            <PartLinkedAssetsCard partId={part.id} />
          </div>
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