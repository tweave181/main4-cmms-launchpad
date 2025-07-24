# Form Dialog Pattern

This document outlines the standardized pattern for form dialogs that require confirmation before closing to prevent data loss.

## Components

### 1. FormDialog (form-dialog.tsx)
- Custom dialog component that disables the default "X" close button
- Handles ESC key and click-outside events by triggering confirmation
- Uses `onOpenChange={() => {}}` to disable default close behavior

### 2. ConfirmationDialog (confirmation-dialog.tsx)
- Reusable confirmation dialog component
- Shows "Are you sure you want to cancel? All unsaved changes will be lost."
- Has "Yes, Cancel" and "Go Back" buttons

### 3. useFormDialog Hook (useFormDialog.ts)
- Provides standardized state management for form dialogs
- Returns handlers for cancel, confirm, and go back actions

## Usage Pattern

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { FormDialog, FormDialogContent, FormDialogHeader, FormDialogTitle } from '@/components/ui/form-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useFormDialog } from '@/hooks/useFormDialog';

interface ExampleFormProps {
  isOpen: boolean;
  onClose: () => void;
  // other props...
}

export const ExampleForm: React.FC<ExampleFormProps> = ({
  isOpen,
  onClose,
  // other props...
}) => {
  const { showConfirmation, handleCancel, handleConfirmCancel, handleGoBack } = useFormDialog({
    onClose,
  });

  return (
    <>
      <FormDialog open={isOpen} onOpenChange={() => {}}>
        <FormDialogContent className="max-w-lg">
          <FormDialogHeader>
            <FormDialogTitle>Form Title</FormDialogTitle>
          </FormDialogHeader>
          
          <form>
            {/* Form content */}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </FormDialogContent>
      </FormDialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleGoBack}
        onConfirm={handleConfirmCancel}
        title="Are you sure you want to cancel?"
        description="All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </>
  );
};
```

## Key Features

1. **No X Button**: The FormDialog component removes the default close button
2. **ESC Key Handling**: ESC key triggers the confirmation dialog instead of directly closing
3. **Click Outside**: Clicking outside the modal triggers confirmation
4. **Consistent Messaging**: All confirmation dialogs use the same message
5. **Data Preservation**: Form data is preserved until explicit confirmation

## Migration Steps

1. Replace `Dialog` with `FormDialog`
2. Replace `DialogContent` with `FormDialogContent` 
3. Replace `DialogHeader` with `FormDialogHeader`
4. Replace `DialogTitle` with `FormDialogTitle`
5. Add `useFormDialog` hook
6. Update Cancel button to use `handleCancel`
7. Add `ConfirmationDialog` component
8. Set `onOpenChange={() => {}}` to disable default close behavior

## Completed Migrations

- ✅ JobTitleForm
- ✅ AssetForm  
- ✅ CreatePartModal + InventoryPartForm
- 🔄 Other modals (to be updated as needed)
