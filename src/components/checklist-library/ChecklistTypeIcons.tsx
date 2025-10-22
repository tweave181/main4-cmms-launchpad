import React from 'react';
import { Shield, CheckSquare, ListTodo, Gauge } from 'lucide-react';
import type { ChecklistItemType } from '@/types/checklistTemplate';

export const getTypeIcon = (type: ChecklistItemType) => {
  switch (type) {
    case 'safety_note':
      return Shield;
    case 'checkbox':
      return CheckSquare;
    case 'to_do':
      return ListTodo;
    case 'reading':
      return Gauge;
  }
};

export const getTypeLabel = (type: ChecklistItemType) => {
  switch (type) {
    case 'safety_note':
      return 'Safety Note';
    case 'checkbox':
      return 'Checkbox';
    case 'to_do':
      return 'To Do Something';
    case 'reading':
      return 'Take a Reading';
  }
};

export const getTypeBadgeColor = (type: ChecklistItemType) => {
  switch (type) {
    case 'safety_note':
      return 'bg-destructive text-destructive-foreground';
    case 'checkbox':
      return 'bg-primary text-primary-foreground';
    case 'to_do':
      return 'bg-secondary text-secondary-foreground';
    case 'reading':
      return 'bg-accent text-accent-foreground';
  }
};

interface ChecklistTypeBadgeProps {
  type: ChecklistItemType;
}

export const ChecklistTypeBadge: React.FC<ChecklistTypeBadgeProps> = ({ type }) => {
  const Icon = getTypeIcon(type);
  const label = getTypeLabel(type);
  const colorClass = getTypeBadgeColor(type);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};
