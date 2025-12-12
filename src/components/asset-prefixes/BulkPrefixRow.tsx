
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkPrefixRowData {
  id: string;
  category_id: string;
  category_name: string;
  prefix_letter: string;
  number_code: string;
  description: string;
  isDuplicate?: boolean;
}

interface BulkPrefixRowProps {
  row: BulkPrefixRowData;
  index: number;
  onUpdate: (id: string, field: keyof BulkPrefixRowData, value: string) => void;
  onRemove: (id: string) => void;
}

export const BulkPrefixRow: React.FC<BulkPrefixRowProps> = ({
  row,
  index,
  onUpdate,
  onRemove,
}) => {
  const handleLetterChange = (value: string) => {
    // Only allow single uppercase letter
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
    onUpdate(row.id, 'prefix_letter', letter);
  };

  const handleNumberChange = (value: string) => {
    // Only allow numbers 1-999
    const num = value.replace(/[^0-9]/g, '').slice(0, 3);
    onUpdate(row.id, 'number_code', num);
  };

  const preview = row.prefix_letter && row.number_code 
    ? `${row.prefix_letter}${row.number_code.padStart(3, '0')}/001`
    : '-';

  return (
    <tr className={cn(
      "border-b border-border/50 hover:bg-muted/30 transition-colors",
      row.isDuplicate && "bg-destructive/10"
    )}>
      <td className="p-3 text-center text-muted-foreground font-mono text-sm">
        {index + 1}
      </td>
      <td className="p-3">
        <span className="font-medium">{row.category_name}</span>
      </td>
      <td className="p-3">
        <Input
          value={row.prefix_letter}
          onChange={(e) => handleLetterChange(e.target.value)}
          placeholder="E"
          className={cn(
            "w-16 text-center font-mono uppercase",
            row.isDuplicate && "border-destructive"
          )}
          maxLength={1}
        />
      </td>
      <td className="p-3">
        <Input
          value={row.number_code}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="1"
          className={cn(
            "w-20 text-center font-mono",
            row.isDuplicate && "border-destructive"
          )}
          maxLength={3}
        />
      </td>
      <td className="p-3">
        <Input
          value={row.description}
          onChange={(e) => onUpdate(row.id, 'description', e.target.value)}
          placeholder="Description"
          className="w-full"
        />
      </td>
      <td className="p-3 text-center">
        <span className="font-mono text-sm text-muted-foreground">{preview}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {row.isDuplicate && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(row.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
