
import type { AssetFormData, AssetInsert } from '../types';
import type { UserProfile } from '@/contexts/auth/types';

export const transformFormDataToAsset = (
  data: AssetFormData, 
  userProfile: UserProfile,
  isEditing: boolean = false
): AssetInsert => {
  const assetData: AssetInsert = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    asset_tag: data.asset_tag?.trim() || null,
    serial_number: data.serial_number?.trim() || null,
    model: data.model?.trim() || null,
    manufacturer: data.manufacturer?.trim() || null,
    manufacturer_company_id: data.manufacturer_company_id || null,
    category: data.category?.trim() || null,
    location_id: data.location_id?.trim() || null,
    department_id: data.department_id?.trim() || null,
    purchase_date: data.purchase_date?.trim() || null,
    purchase_cost: data.purchase_cost && data.purchase_cost.trim() ? parseFloat(data.purchase_cost) : null,
    warranty_expiry: data.warranty_expiry?.trim() || null,
    status: data.status || 'active',
    priority: data.priority || 'medium',
    notes: data.notes?.trim() || null,
    service_contract_id: data.service_contract_id?.trim() || null,
    tenant_id: userProfile.tenant_id,
  };

  // Add appropriate user tracking fields
  if (userProfile.id) {
    if (isEditing) {
      assetData.updated_by = userProfile.id;
    } else {
      assetData.created_by = userProfile.id;
    }
  }

  return assetData;
};
