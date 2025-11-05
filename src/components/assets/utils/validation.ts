
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

interface AssetForValidation {
  id?: string;
  asset_type?: string;
  children?: unknown[];
}

export const validateAssetForEditing = (asset: unknown): asset is AssetForValidation & { id: string } => {
  const typedAsset = asset as AssetForValidation;
  
  if (!typedAsset || !typedAsset.id) {
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

export const validateAssetTypeChange = (asset: AssetForValidation, newType: string): boolean => {
  // Check if asset has children
  if (asset?.children && Array.isArray(asset.children) && asset.children.length > 0) {
    console.error('Cannot change asset type: asset has children:', asset);
    toast({
      title: "Cannot Change Type",
      description: `This asset has ${asset.children.length} child asset(s). Remove child assets before changing type.`,
      variant: "destructive",
    });
    return false;
  }

  // If changing from the current type, log the change
  if (asset?.asset_type !== newType) {
    console.log(`Asset type changing from ${asset.asset_type} to ${newType}`);
  }

  return true;
};
