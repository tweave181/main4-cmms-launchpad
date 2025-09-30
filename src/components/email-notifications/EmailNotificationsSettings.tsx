import React from 'react';
import { EmailConfigurationSection } from './EmailConfigurationSection';
import { NotificationPreferencesSection } from './NotificationPreferencesSection';
import { EmailTemplatesSection } from './EmailTemplatesSection';

export const EmailNotificationsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <EmailConfigurationSection />
      <NotificationPreferencesSection />
      <EmailTemplatesSection />
    </div>
  );
};
