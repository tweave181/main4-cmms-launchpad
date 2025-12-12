import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { useUserSystemAdminStatus, useAssignSystemAdminRole, useRemoveSystemAdminRole } from '@/hooks/useSystemAdminRole';
import { useAuth } from '@/contexts/auth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SystemAdminRoleToggleProps {
  userId: string;
  userName: string;
}

export const SystemAdminRoleToggle: React.FC<SystemAdminRoleToggleProps> = ({
  userId,
  userName,
}) => {
  const { user } = useAuth();
  const { data: isTargetSystemAdmin, isLoading } = useUserSystemAdminStatus(userId);
  const assignRole = useAssignSystemAdminRole();
  const removeRole = useRemoveSystemAdminRole();

  const isCurrentUser = user?.id === userId;
  const isUpdating = assignRole.isPending || removeRole.isPending;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      assignRole.mutate(userId);
    } else {
      removeRole.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-8 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Crown className={`h-4 w-4 ${isTargetSystemAdmin ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <Switch
              checked={isTargetSystemAdmin || false}
              onCheckedChange={handleToggle}
              disabled={isUpdating || isCurrentUser}
              className="data-[state=checked]:bg-amber-500"
            />
            {isTargetSystemAdmin && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                System Admin
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isCurrentUser 
            ? "You cannot remove your own system admin role"
            : isTargetSystemAdmin 
              ? `Remove system admin role from ${userName}`
              : `Grant system admin role to ${userName}`
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
