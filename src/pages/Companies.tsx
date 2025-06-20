
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { CompanyList } from '@/components/companies/CompanyList';
import { useCompanies } from '@/hooks/useCompanies';
import type { CompanyDetails } from '@/types/company';

const Companies: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDetails | null>(null);

  const { data: companies = [], isLoading } = useCompanies();

  const handleCreateCompany = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: CompanyDetails) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-primary" />
              <span>Company Management</span>
            </CardTitle>
            <Button onClick={handleCreateCompany} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CompanyList
            companies={companies}
            onEditCompany={handleEditCompany}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <CompanyForm
          company={editingCompany}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCompany(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingCompany(null);
          }}
        />
      )}
    </div>
  );
};

export default Companies;
