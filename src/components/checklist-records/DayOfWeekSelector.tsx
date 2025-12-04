import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const WEEKENDS = ["saturday", "sunday"];

interface DayOfWeekSelectorProps {
  value: string[];
  onChange: (days: string[]) => void;
  disabled?: boolean;
}

export function DayOfWeekSelector({ value, onChange, disabled }: DayOfWeekSelectorProps) {
  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  const setPreset = (preset: "weekdays" | "all" | "weekends") => {
    switch (preset) {
      case "weekdays":
        onChange(WEEKDAYS);
        break;
      case "all":
        onChange(ALL_DAYS);
        break;
      case "weekends":
        onChange(WEEKENDS);
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {DAYS.map((day) => (
          <Button
            key={day.key}
            type="button"
            variant={value.includes(day.key) ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-10 h-10 p-0",
              value.includes(day.key) && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleDay(day.key)}
            disabled={disabled}
          >
            {day.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setPreset("weekdays")}
          disabled={disabled}
        >
          Mon-Fri
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setPreset("all")}
          disabled={disabled}
        >
          All Days
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setPreset("weekends")}
          disabled={disabled}
        >
          Weekends
        </Button>
      </div>
    </div>
  );
}

export function formatWorkingDays(days: string[]): string {
  if (!days || days.length === 0) return "Not specified";
  
  const sorted = DAYS.map(d => d.key).filter(d => days.includes(d));
  
  // Check for common patterns
  if (sorted.length === 7) return "Every Day";
  if (sorted.length === 5 && 
      sorted.every(d => WEEKDAYS.includes(d))) return "Mon-Fri";
  if (sorted.length === 2 && 
      sorted.every(d => WEEKENDS.includes(d))) return "Weekends Only";
  
  // Format individual days
  return sorted.map(d => DAYS.find(day => day.key === d)?.label).join(", ");
}
