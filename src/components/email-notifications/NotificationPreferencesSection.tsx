import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { Bell, Loader2 } from 'lucide-react';
import { useNotificationSettings, useUpdateNotificationSettings, useCreateNotificationSettings } from '@/hooks/useNotificationSettings';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationFormData {
  contract_reminders_enabled: boolean;
  contract_reminder_days: number[];
  toast_notifications_enabled: boolean;
  toast_duration: number;
  toast_position: string;
  system_notifications_enabled: boolean;
  maintenance_notifications_enabled: boolean;
  security_alerts_enabled: boolean;
  low_stock_alerts_enabled: boolean;
  low_stock_alert_days: number[];
  email_frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
}

export const NotificationPreferencesSection: React.FC = () => {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const createSettings = useCreateNotificationSettings();
  const [newReminderDay, setNewReminderDay] = React.useState<string>('');
  const [isTestingLowStock, setIsTestingLowStock] = React.useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, control, watch, setValue } = useForm<NotificationFormData>({
    defaultValues: {
      contract_reminders_enabled: settings?.contract_reminders_enabled ?? true,
      contract_reminder_days: settings?.contract_reminder_days ?? [7, 14, 30],
      toast_notifications_enabled: settings?.toast_notifications_enabled ?? true,
      toast_duration: settings?.toast_duration ?? 5000,
      toast_position: settings?.toast_position ?? 'bottom-right',
      system_notifications_enabled: settings?.system_notifications_enabled ?? true,
      maintenance_notifications_enabled: settings?.maintenance_notifications_enabled ?? true,
      security_alerts_enabled: settings?.security_alerts_enabled ?? true,
      low_stock_alerts_enabled: settings?.low_stock_alerts_enabled ?? true,
      low_stock_alert_days: settings?.low_stock_alert_days ?? [1, 2, 3, 4, 5],
      email_frequency: settings?.email_frequency ?? 'immediate',
    },
  });

  React.useEffect(() => {
    if (settings) {
      setValue('contract_reminders_enabled', settings.contract_reminders_enabled);
      setValue('contract_reminder_days', settings.contract_reminder_days);
      setValue('toast_notifications_enabled', settings.toast_notifications_enabled);
      setValue('toast_duration', settings.toast_duration);
      setValue('toast_position', settings.toast_position);
      setValue('system_notifications_enabled', settings.system_notifications_enabled);
      setValue('maintenance_notifications_enabled', settings.maintenance_notifications_enabled);
      setValue('security_alerts_enabled', settings.security_alerts_enabled);
      setValue('low_stock_alerts_enabled', settings.low_stock_alerts_enabled);
      setValue('low_stock_alert_days', settings.low_stock_alert_days ?? [1, 2, 3, 4, 5]);
      setValue('email_frequency', settings.email_frequency);
    }
  }, [settings, setValue]);

  const reminderDays = watch('contract_reminder_days');

  const addReminderDay = () => {
    const day = parseInt(newReminderDay);
    if (day > 0 && !reminderDays.includes(day)) {
      setValue('contract_reminder_days', [...reminderDays, day].sort((a, b) => a - b));
      setNewReminderDay('');
    }
  };

  const removeReminderDay = (day: number) => {
    setValue('contract_reminder_days', reminderDays.filter(d => d !== day));
  };

  const handleTestLowStockAlert = async () => {
    setIsTestingLowStock(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-low-stock');
      
      if (error) throw error;
      
      if (data.alerts_sent > 0) {
        toast({
          title: "Low Stock Check Complete",
          description: `${data.alerts_sent} alert(s) sent successfully.`,
        });
      } else {
        toast({
          title: "Low Stock Check Complete",
          description: data.message || "No alerts needed at this time.",
        });
      }
    } catch (error) {
      console.error('Error testing low stock alerts:', error);
      toast({
        title: "Test Failed",
        description: "Failed to run low stock check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingLowStock(false);
    }
  };

  const onSubmit = (data: NotificationFormData) => {
    if (settings?.id) {
      updateSettings.mutate({ id: settings.id, data });
    } else {
      createSettings.mutate({ data });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Configure global notification settings for your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Contract Reminders</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Contract Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders when contracts are approaching expiry
                  </p>
                </div>
                <Controller
                  control={control}
                  name="contract_reminders_enabled"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder Days Before Expiry</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {reminderDays.map((day) => (
                    <Badge key={day} variant="secondary" className="cursor-pointer" onClick={() => removeReminderDay(day)}>
                      {day} days ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Add days"
                    value={newReminderDay}
                    onChange={(e) => setNewReminderDay(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReminderDay())}
                  />
                  <Button type="button" onClick={addReminderDay} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Toast Notifications</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Toast Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show popup notifications in the application
                  </p>
                </div>
                <Controller
                  control={control}
                  name="toast_notifications_enabled"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toast_duration">Toast Duration (ms)</Label>
                  <Input
                    id="toast_duration"
                    type="number"
                    {...register('toast_duration', { valueAsNumber: true })}
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toast_position">Toast Position</Label>
                  <Controller
                    control={control}
                    name="toast_position"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">System Notifications</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>System Notifications</Label>
                  <Controller
                    control={control}
                    name="system_notifications_enabled"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Maintenance Notifications</Label>
                  <Controller
                    control={control}
                    name="maintenance_notifications_enabled"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Security Alerts</Label>
                  <Controller
                    control={control}
                    name="security_alerts_enabled"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Low Stock Alerts</Label>
                    <Controller
                      control={control}
                      name="low_stock_alerts_enabled"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                  <Controller
                    control={control}
                    name="low_stock_alert_days"
                    render={({ field }) => {
                      const lowStockEnabled = watch('low_stock_alerts_enabled');
                      const days = [
                        { label: 'Sun', value: 0 },
                        { label: 'Mon', value: 1 },
                        { label: 'Tue', value: 2 },
                        { label: 'Wed', value: 3 },
                        { label: 'Thu', value: 4 },
                        { label: 'Fri', value: 5 },
                        { label: 'Sat', value: 6 },
                      ];
                      
                      const toggleDay = (dayValue: number) => {
                        const currentDays = field.value || [];
                        if (currentDays.includes(dayValue)) {
                          field.onChange(currentDays.filter(d => d !== dayValue));
                        } else {
                          field.onChange([...currentDays, dayValue].sort());
                        }
                      };

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {days.map(day => (
                              <Button
                                key={day.value}
                                type="button"
                                variant={field.value?.includes(day.value) ? 'default' : 'outline'}
                                size="sm"
                                disabled={!lowStockEnabled}
                                onClick={() => toggleDay(day.value)}
                                className="w-12"
                              >
                                {day.label}
                              </Button>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={!lowStockEnabled || isTestingLowStock}
                            onClick={handleTestLowStockAlert}
                            className="mt-2"
                          >
                            {isTestingLowStock && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Test Low Stock Alerts
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Manually trigger low stock check (respects 24-hour alert cooldown)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications when inventory reaches reorder threshold
                          </p>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_frequency">Email Notification Frequency</Label>
              <Controller
                control={control}
                name="email_frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily_digest">Daily Digest</SelectItem>
                      <SelectItem value="weekly_digest">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled={updateSettings.isPending || createSettings.isPending}>
            {(updateSettings.isPending || createSettings.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
