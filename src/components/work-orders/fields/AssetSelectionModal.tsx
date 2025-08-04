import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface Asset {
  id: string;
  name: string;
  asset_tag?: string;
  department?: { name: string } | null;
  location?: { name: string } | null;
  category?: string;
}

interface AssetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}

export const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch assets with related data
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['work-order-assets', userProfile?.tenant_id, searchTerm, selectedDepartment, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_tag,
          category,
          departments:department_id (name),
          locations:location_id (name)
        `)
        .eq('status', 'active')
        .order('name');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,asset_tag.ilike.%${searchTerm}%`);
      }

      // Apply department filter
      if (selectedDepartment && selectedDepartment !== 'all') {
        query = query.eq('department_id', selectedDepartment);
      }

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(asset => ({
        ...asset,
        department: asset.departments,
        location: asset.locations,
      }));
    },
    enabled: !!userProfile?.tenant_id && isOpen,
  });

  // Fetch departments for filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-for-filter', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.tenant_id && isOpen,
  });

  // Fetch unique categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['asset-categories-for-filter', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('category')
        .not('category', 'is', null)
        .eq('status', 'active');

      if (error) throw error;
      
      // Get unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
      return uniqueCategories.sort();
    },
    enabled: !!userProfile?.tenant_id && isOpen,
  });

  const handleSelect = (asset: Asset) => {
    onSelect(asset);
    onClose();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedCategory('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Asset</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {assets.length} asset{assets.length !== 1 ? 's' : ''} found
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Results Table */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No assets found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.asset_tag || '-'}</TableCell>
                      <TableCell>{asset.department?.name || '-'}</TableCell>
                      <TableCell>{asset.location?.name || '-'}</TableCell>
                      <TableCell>{asset.category || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(asset)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="flex justify-start space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};