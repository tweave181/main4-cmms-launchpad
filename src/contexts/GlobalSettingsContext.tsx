import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProgramSettings } from '@/hooks/useProgramSettings';
import type { ProgramSettings } from '@/hooks/useProgramSettings';

// Default settings as fallbacks
const DEFAULT_SETTINGS = {
  currency: '$',
  language: 'English',
  date_format: 'MM/DD/YYYY',
  timezone: 'America/New_York',
  country: 'US',
} as const;

// Currency formatting utility
export const formatCurrency = (
  amount: number | string | null | undefined,
  currencySymbol: string = DEFAULT_SETTINGS.currency
): string => {
  if (amount === null || amount === undefined || amount === '') return '';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '';

  // Use Intl.NumberFormat for proper currency formatting
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currencySymbol}${formatter.format(numericAmount)}`;
};

// Date formatting utility
export const formatDate = (
  date: string | Date | null | undefined,
  dateFormat: string = DEFAULT_SETTINGS.date_format
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();

  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return `${month}/${day}/${year}`; // Default to MM/DD/YYYY
  }
};

// Translation key system stub for future i18n
export const translate = (key: string, language: string = DEFAULT_SETTINGS.language): string => {
  // This is a stub for future internationalization
  // For now, it just returns the key as-is
  // In the future, this would look up translations based on the language
  const translations: Record<string, Record<string, string>> = {
    English: {
      // English translations (default)
    },
    Spanish: {
      'dashboard': 'Panel de Control',
      'work_orders': 'Órdenes de Trabajo',
      'assets': 'Activos',
      'maintenance': 'Mantenimiento',
      'inventory': 'Inventario',
      'reports': 'Informes',
    },
    French: {
      'dashboard': 'Tableau de Bord',
      'work_orders': 'Bons de Travail',
      'assets': 'Actifs',
      'maintenance': 'Maintenance',
      'inventory': 'Inventaire',
      'reports': 'Rapports',
    }
  };

  return translations[language]?.[key] || key;
};

interface GlobalSettingsContextType {
  settings: ProgramSettings | null;
  isLoading: boolean;
  error: any;
  // Formatting utilities
  formatCurrency: (amount: number | string | null | undefined) => string;
  formatDate: (date: string | Date | null | undefined) => string;
  formatDateTime: (date: string | Date | null | undefined) => string;
  translate: (key: string) => string;
  // Current settings values with fallbacks
  currency: string;
  dateFormat: string;
  language: string;
  timezone: string;
  country: string;
  organizationName: string;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettingsContext);
  if (context === undefined) {
    throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider');
  }
  return context;
};

interface GlobalSettingsProviderProps {
  children: React.ReactNode;
}

export const GlobalSettingsProvider: React.FC<GlobalSettingsProviderProps> = ({ children }) => {
  const { data: settings, isLoading, error } = useProgramSettings();

  // Get current values with fallbacks
  const currency = settings?.currency || DEFAULT_SETTINGS.currency;
  const dateFormat = settings?.date_format || DEFAULT_SETTINGS.date_format;
  const language = settings?.language || DEFAULT_SETTINGS.language;
  const timezone = settings?.timezone || DEFAULT_SETTINGS.timezone;
  const country = settings?.country || DEFAULT_SETTINGS.country;
  const organizationName = settings?.organization_name || 'CMMS Pro';

// Create bound formatting functions with current settings
const boundFormatCurrency = (amount: number | string | null | undefined) =>
  formatCurrency(amount, currency);

const boundFormatDate = (date: string | Date | null | undefined) =>
  formatDate(date, dateFormat);

const boundFormatDateTime = (date: string | Date | null | undefined) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: timezone || 'UTC'
    });
    return fmt.format(dateObj).replace(',', '');
  } catch {
    // Fallback without timezone
    const dd = dateObj.getDate().toString().padStart(2, '0');
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const hh = dateObj.getHours().toString().padStart(2, '0');
    const min = dateObj.getMinutes().toString().padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
};

const boundTranslate = (key: string) =>
  translate(key, language);

const value: GlobalSettingsContextType = {
  settings,
  isLoading,
  error,
  formatCurrency: boundFormatCurrency,
  formatDate: boundFormatDate,
  formatDateTime: boundFormatDateTime,
  translate: boundTranslate,
  currency,
  dateFormat,
  language,
  timezone,
  country,
  organizationName,
};

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};