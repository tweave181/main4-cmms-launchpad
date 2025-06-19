
import React from 'react';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface GeneratedTagDisplayProps {
  generatedTag: string;
  nextSequence: string;
  isGenerating: boolean;
}

export const GeneratedTagDisplay: React.FC<GeneratedTagDisplayProps> = ({
  generatedTag,
  nextSequence,
  isGenerating,
}) => {
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-gray-600">Generating next available tag...</span>
      </div>
    );
  }

  if (!generatedTag) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <Label className="text-sm text-blue-800 font-medium">Generated Asset Tag:</Label>
      <div className="text-xl font-mono font-bold text-blue-900 mt-1">
        {generatedTag}
      </div>
      <div className="text-xs text-blue-600 mt-1">
        Next available sequence: {nextSequence}
      </div>
    </div>
  );
};
