import React, { useState, useEffect } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export type FrequencyPreset = 
  | 'daily'
  | 'weekly' 
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'four-weekly'
  | 'six-monthly'
  | 'two-yearly'
  | 'custom';

export interface FrequencyValue {
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months' | 'years';
}

interface FrequencyControlProps {
  value: FrequencyValue;
  onChange: (value: FrequencyValue) => void;
  error?: string;
}

const PRESET_MAPPINGS: Record<FrequencyPreset, FrequencyValue> = {
  'daily': { frequency_type: 'daily', frequency_value: 1 },
  'weekly': { frequency_type: 'weekly', frequency_value: 1 },
  'monthly': { frequency_type: 'monthly', frequency_value: 1 },
  'quarterly': { frequency_type: 'monthly', frequency_value: 3 },
  'yearly': { frequency_type: 'yearly', frequency_value: 1 },
  'four-weekly': { frequency_type: 'weekly', frequency_value: 4 },
  'six-monthly': { frequency_type: 'monthly', frequency_value: 6 },
  'two-yearly': { frequency_type: 'yearly', frequency_value: 2 },
  'custom': { frequency_type: 'custom', frequency_value: 1, frequency_unit: 'months' },
};

const PRESET_LABELS: Record<FrequencyPreset, string> = {
  'daily': 'Daily',
  'weekly': 'Weekly', 
  'monthly': 'Monthly',
  'quarterly': 'Quarterly',
  'yearly': 'Yearly',
  'four-weekly': 'Four Weekly',
  'six-monthly': 'Six Monthly',
  'two-yearly': 'Two Yearly',
  'custom': 'Custom...',
};

const FREQUENCY_SUMMARIES: Record<FrequencyPreset, string> = {
  'daily': 'Every day',
  'weekly': 'Every week', 
  'monthly': 'Every month',
  'quarterly': 'Every 3 months',
  'yearly': 'Every year',
  'four-weekly': 'Every 4 weeks',
  'six-monthly': 'Every 6 months',
  'two-yearly': 'Every 2 years',
  'custom': '',
};

// Function to detect preset from stored values
function detectPreset(value: FrequencyValue): FrequencyPreset {
  for (const [preset, mapping] of Object.entries(PRESET_MAPPINGS)) {
    if (
      mapping.frequency_type === value.frequency_type &&
      mapping.frequency_value === value.frequency_value &&
      (!mapping.frequency_unit || mapping.frequency_unit === value.frequency_unit)
    ) {
      return preset as FrequencyPreset;
    }
  }
  return 'custom';
}

function getCustomSummary(value: FrequencyValue): string {
  if (value.frequency_type === 'custom' && value.frequency_unit) {
    const unit = value.frequency_value === 1 
      ? value.frequency_unit.slice(0, -1) // Remove 's' for singular
      : value.frequency_unit;
    return `Every ${value.frequency_value} ${unit}`;
  }
  return '';
}

export const FrequencyControl: React.FC<FrequencyControlProps> = ({
  value,
  onChange,
  error,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<FrequencyPreset>('monthly');
  const [customBase, setCustomBase] = useState<'days' | 'weeks' | 'months' | 'years'>('months');
  const [customValue, setCustomValue] = useState<number>(1);

  // Initialize state from props
  useEffect(() => {
    const preset = detectPreset(value);
    setSelectedPreset(preset);
    
    if (preset === 'custom') {
      setCustomValue(value.frequency_value);
      setCustomBase(value.frequency_unit || 'months');
    }
  }, [value]);

  const handlePresetChange = (preset: FrequencyPreset) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') {
      const customFreq: FrequencyValue = {
        frequency_type: 'custom',
        frequency_value: customValue,
        frequency_unit: customBase,
      };
      onChange(customFreq);
    } else {
      onChange(PRESET_MAPPINGS[preset]);
    }
  };

  const handleCustomValueChange = (newValue: number) => {
    setCustomValue(newValue);
    if (selectedPreset === 'custom') {
      onChange({
        frequency_type: 'custom',
        frequency_value: newValue,
        frequency_unit: customBase,
      });
    }
  };

  const handleCustomBaseChange = (newBase: 'days' | 'weeks' | 'months' | 'years') => {
    setCustomBase(newBase);
    if (selectedPreset === 'custom') {
      onChange({
        frequency_type: 'custom',
        frequency_value: customValue,
        frequency_unit: newBase,
      });
    }
  };

  const getSummaryText = () => {
    if (selectedPreset === 'custom') {
      return getCustomSummary(value);
    }
    return FREQUENCY_SUMMARIES[selectedPreset];
  };

  return (
    <FormItem>
      <FormLabel>Frequency *</FormLabel>
      <FormControl>
        <div className="space-y-3">
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{PRESET_LABELS.daily}</SelectItem>
              <SelectItem value="weekly">{PRESET_LABELS.weekly}</SelectItem>
              <SelectItem value="monthly">{PRESET_LABELS.monthly}</SelectItem>
              <SelectItem value="quarterly">{PRESET_LABELS.quarterly}</SelectItem>
              <SelectItem value="yearly">{PRESET_LABELS.yearly}</SelectItem>
              <SelectItem value="four-weekly">{PRESET_LABELS['four-weekly']}</SelectItem>
              <SelectItem value="six-monthly">{PRESET_LABELS['six-monthly']}</SelectItem>
              <SelectItem value="two-yearly">{PRESET_LABELS['two-yearly']}</SelectItem>
              <SelectItem value="custom">{PRESET_LABELS.custom}</SelectItem>
            </SelectContent>
          </Select>

          {selectedPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={customValue}
                onChange={(e) => handleCustomValueChange(parseInt(e.target.value) || 1)}
              />
              <Select value={customBase} onValueChange={handleCustomBaseChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {getSummaryText() && (
            <p className="text-sm text-muted-foreground">
              {getSummaryText()}
            </p>
          )}
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};