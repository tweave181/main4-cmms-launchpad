import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2 } from 'lucide-react';
import { useValidateInvitation } from '@/hooks/useTenantInvitations';
import { useDebounce } from '@/hooks/useDebounce';

interface InvitationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

const InvitationCodeInput: React.FC<InvitationCodeInputProps> = ({
  value,
  onChange,
  onValidationChange,
}) => {
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const debouncedValue = useDebounce(value, 500);
  const validateMutation = useValidateInvitation();

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 5) {
      setIsValid(null);
      setValidationMessage('');
      onValidationChange(false);
      return;
    }

    validateMutation.mutate(debouncedValue, {
      onSuccess: (result) => {
        setIsValid(result.valid);
        setValidationMessage(result.valid ? 'Valid invitation code' : result.error || 'Invalid code');
        onValidationChange(result.valid);
      },
      onError: () => {
        setIsValid(false);
        setValidationMessage('Error validating code');
        onValidationChange(false);
      },
    });
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="invitationCode">Invitation Code</Label>
      <div className="relative">
        <Input
          id="invitationCode"
          placeholder="TENANT-XXXX-XXXX"
          value={value}
          onChange={handleChange}
          className={`pr-10 font-mono ${
            isValid === true ? 'border-green-500 focus-visible:ring-green-500' :
            isValid === false ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
          required
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validateMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!validateMutation.isPending && isValid === true && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {!validateMutation.isPending && isValid === false && (
            <X className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>
      {validationMessage && (
        <p className={`text-sm ${isValid ? 'text-green-600' : 'text-destructive'}`}>
          {validationMessage}
        </p>
      )}
    </div>
  );
};

export default InvitationCodeInput;
