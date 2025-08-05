import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, User, Mail, Phone, Calendar, Building } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { EditUserDialog } from './EditUserDialog';
import { UserRoleBadge } from './UserRoleBadge';
import { UserEmploymentBadge } from './UserEmploymentBadge';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'] & {
  departments?: { id: string; name: string } | null;
  job_titles?: { id: string; title_name: string } | null;
};

interface UserDetailModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  isUpdating: boolean;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onToggleStatus,
  isUpdating,
}) => {
  const { isAdmin } = useAuth();
  const { formatDate } = useGlobalSettings();

  const handleToggleStatus = () => {
    onToggleStatus(user.id, user.status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {user.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <EditUserDialog 
                user={user}
                trigger={
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                }
              />
              {isAdmin && (
                <Button 
                  onClick={handleToggleStatus} 
                  disabled={isUpdating}
                  variant={user.status === 'active' ? 'destructive' : 'default'}
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Role Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            <UserRoleBadge role={user.role} />
            <UserEmploymentBadge employmentStatus={user.employment_status || undefined} />
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">
                  {user.phone_number ? (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{user.phone_number}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-gray-600">
                  {user.departments?.name || 'No department'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Job Title</p>
                <p className="text-sm text-gray-600">
                  {user.job_titles?.title_name || 'No job title'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Employment Status</p>
                <UserEmploymentBadge employmentStatus={user.employment_status || undefined} />
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <UserRoleBadge role={user.role} />
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Activity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-gray-600">
                  {user.last_login 
                    ? formatDate(user.last_login)
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Joined</p>
                <p className="text-sm text-gray-600">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Record Information */}
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>Record Information</span>
              <span>Created At: {formatDate(user.created_at)}</span>
              <span>Last Updated: {formatDate(user.updated_at)}</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};