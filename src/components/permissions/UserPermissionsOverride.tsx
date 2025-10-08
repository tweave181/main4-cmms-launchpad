import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Minus } from 'lucide-react';
import { usePermissions, useUserPermissionOverrides } from '@/hooks/usePermissions';
import { useUpdateUserPermissionOverrides } from '@/hooks/mutations/useUpdateUserPermissionOverrides';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserPermissionsOverrideProps {
  userId: string;
  userName: string;
  trigger?: React.ReactNode;
}

export const UserPermissionsOverride: React.FC<UserPermissionsOverrideProps> = ({
  userId,
  userName,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const { data: allPermissions } = usePermissions();
  const { data: userOverrides } = useUserPermissionOverrides(userId);
  const updateOverride = useUpdateUserPermissionOverrides();

  const overrideMap = React.useMemo(() => {
    if (!userOverrides) return new Map();
    return new Map(
      userOverrides.map((o: any) => [o.permission_id, o.granted])
    );
  }, [userOverrides]);

  const groupedPermissions = React.useMemo(() => {
    if (!allPermissions) return {};
    return allPermissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {} as Record<string, typeof allPermissions>);
  }, [allPermissions]);

  const handleToggleOverride = (permissionId: string, currentState: boolean | undefined) => {
    // If no override exists, grant it
    // If override exists and is granted, revoke it
    // If override exists and is revoked, grant it
    const newState = currentState === undefined ? true : !currentState;
    
    updateOverride.mutate({
      userId,
      permissionId,
      granted: newState,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Permission Overrides
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Permission Overrides for {userName}</DialogTitle>
          <DialogDescription>
            Grant or revoke specific permissions for this user. These override their role-based permissions.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, permissions]) => (
              <div key={resource} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm capitalize">
                    {resource.replace(/_/g, ' ')}
                  </Badge>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {permissions.map(perm => {
                    const overrideState = overrideMap.get(perm.id);
                    const hasOverride = overrideState !== undefined;
                    
                    return (
                      <div
                        key={perm.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          hasOverride
                            ? overrideState
                              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                            : 'bg-card'
                        }`}
                      >
                        <label
                          htmlFor={perm.id}
                          className="text-sm font-medium capitalize cursor-pointer"
                        >
                          {perm.action.replace(/_/g, ' ')}
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleOverride(perm.id, overrideState)}
                          className="h-8 w-8 p-0"
                        >
                          {hasOverride ? (
                            overrideState ? (
                              <Minus className="h-4 w-4 text-red-500" />
                            ) : (
                              <Plus className="h-4 w-4 text-green-500" />
                            )
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
