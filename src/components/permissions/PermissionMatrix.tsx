import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Save } from "lucide-react";
import { usePermissions, useRolePermissions } from "@/hooks/usePermissions";
import { useUpdateRolePermissions } from "@/hooks/mutations/useUpdateRolePermissions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type AppRole = Database["public"]["Enums"]["app_role"];
const ROLES: Array<{
  value: AppRole;
  label: string;
  color: string;
}> = [
  {
    value: "system_admin",
    label: "System Admin",
    color: "bg-red-500",
  },
  {
    value: "admin",
    label: "Admin",
    color: "bg-blue-500",
  },
  {
    value: "manager",
    label: "Manager",
    color: "bg-purple-500",
  },
  {
    value: "technician",
    label: "Technician",
    color: "bg-green-500",
  },
  {
    value: "contractor",
    label: "Contractor",
    color: "bg-orange-500",
  },
];
export const PermissionMatrix: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const { data: allPermissions, isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions, isLoading: rolePermsLoading } = useRolePermissions(selectedRole);
  const updateRolePermissions = useUpdateRolePermissions();

  // Initialize selected permissions when role data loads
  React.useEffect(() => {
    if (rolePermissions) {
      const permIds = new Set(rolePermissions.map((rp: any) => rp.permission_id));
      setSelectedPermissions(permIds);
    }
  }, [rolePermissions]);

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};
    return allPermissions.reduce(
      (acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        acc[perm.resource].push(perm);
        return acc;
      },
      {} as Record<string, typeof allPermissions>,
    );
  }, [allPermissions]);
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };
  const handleSave = () => {
    updateRolePermissions.mutate({
      role: selectedRole,
      permissionIds: Array.from(selectedPermissions),
    });
  };
  const hasChanges = useMemo(() => {
    if (!rolePermissions) return false;
    const currentIds = new Set(rolePermissions.map((rp: any) => rp.permission_id));
    if (currentIds.size !== selectedPermissions.size) return true;
    for (const id of selectedPermissions) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [rolePermissions, selectedPermissions]);
  if (permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Matrix
            </CardTitle>
            <CardDescription>Configure permissions for each role</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${role.color}`} />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={!hasChanges || updateRolePermissions.isPending} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {updateRolePermissions.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, permissions]) => (
            <div key={resource} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm capitalize bg-orange-100">
                  {resource.replace(/_/g, " ")}
                </Badge>
                <div className="h-px w-32 bg-border" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={perm.id}
                      checked={selectedPermissions.has(perm.id)}
                      onCheckedChange={() => handlePermissionToggle(perm.id)}
                      disabled={rolePermsLoading}
                    />
                    <label htmlFor={perm.id} className="text-sm font-medium leading-none cursor-pointer capitalize">
                      {perm.action.replace(/_/g, " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
