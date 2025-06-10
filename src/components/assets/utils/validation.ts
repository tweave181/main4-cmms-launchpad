
import { toast } from '@/components/ui/use-toast';
import type { AssetFormData } from '../types';
import type { UserProfile } from '@/contexts/auth/types';

export const validateUserProfile = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) {
    console.error('User profile is null or undefined');
    toast({
      title: "Error",
      description: "User profile not found. Please try logging in again.",
      variant: "destructive",
    });
    return false;
  }

  if (!userProfile.tenant_id) {
    console.error('User profile missing tenant_id:', userProfile);
    toast({
      title: "Error",
      description: "User tenant information is missing. Please contact support.",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

export const validateFormData = (data: AssetFormData): boolean => {
  if (!data.name || data.name.trim() === '') {
    console.error('Asset name is required but missing:', data);
    toast({
      title: "Error",
      description: "Asset name is required.",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

export const validateAssetForEditing = (asset: any): boolean => {
  if (!asset || !asset.id) {
    console.error('Cannot edit asset: asset or asset.id is missing:', asset);
    toast({
      title: "Error",
      description: "Cannot update asset: invalid asset data.",
      variant: "destructive",
    });
    return false;
  }

  return true;
};
