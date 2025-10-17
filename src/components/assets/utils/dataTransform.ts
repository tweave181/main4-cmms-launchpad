
import type { AssetFormData, AssetInsert } from '../types';
import type { UserProfile } from '@/contexts/auth/types';

export const transformFormDataToAsset = (
  data: AssetFormData, 
  userProfile: UserProfile,
  isEditing: boolean = false
): AssetInsert => {
  // Determine asset level from type
  const assetLevelMap: Record<'unit' | 'component' | 'consumable', 1 | 2 | 3> = {
    unit: 1,
    component: 2,
    consumable: 3
  };

  const assetData: AssetInsert = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    asset_tag: data.asset_tag?.trim() || null,
    serial_number: data.serial_number?.trim() || null,
    model: data.model?.trim() || null,
    manufacturer: null, // Remove free-text manufacturer field
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
    parent_asset_id: data.parent_asset_id || null,
    asset_type: data.asset_type,
    asset_level: assetLevelMap[data.asset_type],
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
