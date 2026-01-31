import React from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Building2, Briefcase, MapPin, UserCheck, AlertCircle } from 'lucide-react';

// Check if customer profile has all key fields completed
const isProfileComplete = (customer: Customer): boolean => {
  return !!(
    customer.email &&
    customer.phone &&
    customer.department?.name &&
    customer.job_title?.title_name &&
    customer.work_area?.name
  );
};

// Get list of missing fields for display
const getMissingFields = (customer: Customer): string[] => {
  const missing: string[] = [];
  if (!customer.email) missing.push('Email');
  if (!customer.phone) missing.push('Phone');
  if (!customer.department?.name) missing.push('Department');
  if (!customer.job_title?.title_name) missing.push('Job Title');
  if (!customer.work_area?.name) missing.push('Work Location');
  return missing;
};

interface CustomerProfileCardProps {
  customer: Customer;
  compact?: boolean;
}

export const CustomerProfileCard: React.FC<CustomerProfileCardProps> = ({ customer, compact = false }) => {
  const profileComplete = isProfileComplete(customer);
  const missingFields = getMissingFields(customer);

  if (compact) {
    return (
      <div className="space-y-2">
        {!profileComplete && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Profile incomplete. Missing: {missingFields.join(', ')}. Please contact your administrator to update your details.
            </AlertDescription>
          </Alert>
        )}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium">{customer.name}</span>
            {!customer.is_active && (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
            {profileComplete && (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400">Complete</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {customer.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {customer.email}
              </div>
            )}
            {(customer.phone || customer.phone_extension) && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.phone}
                {customer.phone_extension && ` ext. ${customer.phone_extension}`}
              </div>
            )}
            {customer.department?.name && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {customer.department.name}
              </div>
            )}
            {customer.job_title?.title_name && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {customer.job_title.title_name}
              </div>
            )}
            {customer.work_area?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {customer.work_area.name}
              </div>
            )}
            {customer.supervisor?.name && (
              <div className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Reports to: {customer.supervisor.name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          {customer.name}
          {!customer.is_active && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${customer.email}`} className="hover:underline">
              {customer.email}
            </a>
          </div>
        )}
        
        {(customer.phone || customer.phone_extension) && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>
              {customer.phone}
              {customer.phone_extension && ` ext. ${customer.phone_extension}`}
            </span>
          </div>
        )}
        
        {customer.department?.name && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{customer.department.name}</span>
          </div>
        )}
        
        {customer.job_title?.title_name && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{customer.job_title.title_name}</span>
          </div>
        )}
        
        {customer.work_area?.name && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{customer.work_area.name}</span>
          </div>
        )}
        
        {customer.supervisor?.name && (
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span>Reports to: {customer.supervisor.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
