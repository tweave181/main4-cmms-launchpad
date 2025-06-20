
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { useDeleteCompany } from '@/hooks/useCompanies';
import type { CompanyDetails } from '@/types/company';

interface CompanyListProps {
  companies: CompanyDetails[];
  onEditCompany: (company: CompanyDetails) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  onEditCompany,
}) => {
  const deleteMutation = useDeleteCompany();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      deleteMutation.mutate(id);
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No companies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="truncate">{company.company_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditCompany(company)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.contact_name && (
              <p className="text-sm text-gray-600">{company.contact_name}</p>
            )}
            
            {company.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span className="truncate">{company.email}</span>
              </div>
            )}
            
            {company.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{company.phone}</span>
              </div>
            )}
            
            {company.address && (
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{company.address}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {company.type.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(company.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
