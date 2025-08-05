import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Edit, Trash, Search, Plus, FileText } from 'lucide-react';
import { useCompanies, useDeleteCompany } from '@/hooks/useCompanies';
import { AddressDisplay } from '@/components/addresses/AddressDisplay';
import { COMPANY_TYPES } from '@/types/company';
import type { CompanyDetails } from '@/types/company';
interface CompanyManagementTableProps {
  onEditCompany: (company: CompanyDetails) => void;
  onCreateCompany: () => void;
  onViewHistory: (company: CompanyDetails) => void;
}
export const CompanyManagementTable: React.FC<CompanyManagementTableProps> = ({
  onEditCompany,
  onCreateCompany,
  onViewHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const {
    data: companies = [],
    isLoading
  } = useCompanies();
  const deleteMutation = useDeleteCompany();

  // Filter companies based on search and type filter
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || company.type.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  // Paginate results
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  const handleDelete = (company: CompanyDetails) => {
    if (window.confirm(`Are you sure you want to delete "${company.company_name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(company.id);
    }
  };
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCurrentPage(1);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search companies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {COMPANY_TYPES.map(type => <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>)}
            </SelectContent>
          </Select>

          {(searchTerm || typeFilter !== 'all') && <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>}
        </div>

        <Button onClick={onCreateCompany}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-300">Company Name</TableHead>
              <TableHead className="bg-gray-300">Type</TableHead>
              <TableHead className="bg-gray-300">Contact Name</TableHead>
              <TableHead className="bg-gray-300">Email</TableHead>
              <TableHead className="bg-gray-300">Phone</TableHead>
              <TableHead className="text-center bg-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompanies.length === 0 ? <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm || typeFilter !== 'all' ? 'No companies match your filters' : 'No companies found'}
                </TableCell>
              </TableRow> : paginatedCompanies.map(company => <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    {company.company_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.type.map(type => <Badge key={type} variant="secondary" className="text-xs">
                          {type.replace('_', ' ')}
                        </Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>{company.contact_name || '-'}</TableCell>
                  <TableCell>{company.email || '-'}</TableCell>
                  <TableCell>{company.phone || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onViewHistory(company)} title="View History">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEditCompany(company)} title="Edit Company">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(company)} disabled={deleteMutation.isPending} title="Delete Company" className="text-red-600 hover:text-red-700">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
            
            {Array.from({
          length: totalPages
        }, (_, i) => i + 1).map(page => <PaginationItem key={page}>
                <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                  {page}
                </PaginationLink>
              </PaginationItem>)}
            
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>}
    </div>;
};