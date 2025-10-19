import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventoryParts } from '@/pages/inventory/hooks/useInventoryParts';
import { useAddAssetSparePart } from '@/hooks/queries/useAssetSpareParts';
import { useToast } from '@/hooks/use-toast';

interface AddAssetConsumableModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  onPartAdded: () => void;
}

export const AddAssetConsumableModal: React.FC<AddAssetConsumableModalProps> = ({
  isOpen,
  onClose,
  assetId,
  onPartAdded
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [quantityRequired, setQuantityRequired] = useState(1);
  const [partPickerOpen, setPartPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { parts } = useInventoryParts('consumables');
  const addPartMutation = useAddAssetSparePart();

  const selectedPart = parts?.find(p => p.id === selectedPartId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPartId || quantityRequired < 1) {
      toast({
        title: "Validation Error",
        description: "Please select a consumable and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addPartMutation.mutateAsync({
        assetId,
        partId: selectedPartId,
        quantityRequired
      });
      
      toast({
        title: "Success",
        description: selectedPart 
          ? `${selectedPart.name} added to asset consumables`
          : "Consumable added successfully"
      });
      
      onPartAdded();
      handleClose();
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        toast({
          title: "Consumable Already Linked",
          description: "This consumable is already linked to the asset. The quantity has been updated instead.",
        });
        onPartAdded();
        handleClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to add consumable. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPartId('');
    setQuantityRequired(1);
    setPartPickerOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Consumable</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part-picker">Consumable</Label>
            <Popover open={partPickerOpen} onOpenChange={setPartPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={partPickerOpen}
                  className="w-full justify-between"
                >
                  {selectedPart ? (
                    <span className="truncate">
                      {selectedPart.name} ({selectedPart.sku})
                    </span>
                  ) : (
                    "Search and select a consumable..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search consumables by name or SKU..." />
                  <CommandList>
                    <CommandEmpty>No consumables found.</CommandEmpty>
                    <CommandGroup>
                      {parts?.map((part) => (
                        <CommandItem
                          key={part.id}
                          value={`${part.name} ${part.sku}`}
                          onSelect={() => {
                            setSelectedPartId(part.id);
                            setPartPickerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPartId === part.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{part.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {part.sku} • Stock: {part.quantity_in_stock}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Required</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="Enter quantity required"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedPartId || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Consumable'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
