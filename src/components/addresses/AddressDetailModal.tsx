import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, MapPin } from 'lucide-react';
import type { Address } from '@/types/address';

interface AddressDetailModalProps {
  address: Address | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
}

export const AddressDetailModal: React.FC<AddressDetailModalProps> = ({
  address,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!address) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Address Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address Line 1</label>
                  <div className="text-base">{address.address_line_1}</div>
                </div>

                {address.address_line_2 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address Line 2</label>
                    <div className="text-base">{address.address_line_2}</div>
                  </div>
                )}

                {address.address_line_3 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address Line 3</label>
                    <div className="text-base">{address.address_line_3}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Town/City</label>
                    <div className="text-base">{address.town_or_city || '-'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">County/State</label>
                    <div className="text-base">{address.county_or_state || '-'}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Postcode</label>
                  <div className="text-base">{address.postcode || '-'}</div>
                </div>

                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Created:</span>
                      <div>{new Date(address.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>
                      <div>{new Date(address.updated_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(address)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(address)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};