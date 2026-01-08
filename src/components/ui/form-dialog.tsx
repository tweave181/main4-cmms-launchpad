import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from './confirmation-dialog';

const FormDialog = DialogPrimitive.Root;

const FormDialogTrigger = DialogPrimitive.Trigger;

const FormDialogPortal = DialogPrimitive.Portal;

const FormDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
FormDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface FormDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  onCancel?: () => void;
  confirmClose?: boolean;
}

const FormDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  FormDialogContentProps
>(({ className, children, onCancel, confirmClose = true, ...props }, ref) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCancel = () => {
    if (confirmClose) {
      setShowConfirmation(true);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      <FormDialogPortal>
        <FormDialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          style={{ backgroundColor: 'hsl(0, 0%, 100%)' }}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </FormDialogPortal>
      
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmCancel}
        title="Are you sure you want to cancel?"
        description="All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
      />
    </>
  );
});
FormDialogContent.displayName = DialogPrimitive.Content.displayName;

const FormDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
FormDialogHeader.displayName = "FormDialogHeader";

const FormDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
FormDialogFooter.displayName = "FormDialogFooter";

const FormDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
FormDialogTitle.displayName = DialogPrimitive.Title.displayName;

const FormDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  FormDialog,
  FormDialogPortal,
  FormDialogOverlay,
  FormDialogTrigger,
  FormDialogContent,
  FormDialogHeader,
  FormDialogFooter,
  FormDialogTitle,
  FormDialogDescription,
};