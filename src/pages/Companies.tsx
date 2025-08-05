import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { CompanyManagementTable } from '@/components/companies/CompanyManagementTable';
import { CompanyHistoryModal } from '@/components/companies/CompanyHistoryModal';
import type { CompanyDetails } from '@/types/company';
const Companies: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDetails | null>(null);
  const [historyCompany, setHistoryCompany] = useState<CompanyDetails | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const handleCreateCompany = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };
  const handleEditCompany = (company: CompanyDetails) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };
  const handleViewHistory = (company: CompanyDetails) => {
    setHistoryCompany(company);
    setIsHistoryModalOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  };
  const handleCloseHistory = () => {
    setIsHistoryModalOpen(false);
    setHistoryCompany(null);
  };
  return <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-primary" />
            <span>Company Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyManagementTable onCreateCompany={handleCreateCompany} onViewHistory={handleViewHistory} />
        </CardContent>
      </Card>

      {isFormOpen && <CompanyForm company={editingCompany} isOpen={isFormOpen} onClose={handleCloseForm} onSuccess={handleCloseForm} />}

      <CompanyHistoryModal company={historyCompany} isOpen={isHistoryModalOpen} onClose={handleCloseHistory} />
    </div>;
};
export default Companies;