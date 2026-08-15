import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  useEquipmentCategories,
  type EquipmentCategory,
} from '@/hooks/useEquipmentCategories';

interface EquipmentCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: EquipmentCategory | null;
}

export const EquipmentCategoryForm: React.FC<EquipmentCategoryFormProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { categories, createCategory, updateCategory, suggestNumberCode } =
    useEquipmentCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prefixLetter, setPrefixLetter] = useState('E');
  const [numberCode, setNumberCode] = useState('1');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  const isEditing = !!category;
  const hasAssets = (category?.asset_count || 0) > 0;

  useEffect(() => {
    if (!isOpen) return;
    if (category) {
      setName(category.category_name);
      setDescription(category.description || '');
      setPrefixLetter(category.prefix_letter);
      setNumberCode(String(category.number_code));
      setActive(category.status === 'active');
    } else {
      setName('');
      setDescription('');
      setPrefixLetter('E');
      setNumberCode(String(suggestNumberCode('E') ?? 1));
      setActive(true);
    }
    setError('');
  }, [isOpen, category]);

  const handleLetterChange = (value: string) => {
    const letter = value.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase();
    setPrefixLetter(letter);
    if (!isEditing && letter) {
      setNumberCode(String(suggestNumberCode(letter) ?? 1));
    }
  };

  const displayPrefix = prefixLetter && numberCode ? `${prefixLetter}${parseInt(numberCode) || ''}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = parseInt(numberCode);

    if (!name.trim()) return setError('Category name is required');
    if (!/^[A-Z]$/.test(prefixLetter)) return setError('Prefix letter must be a single letter A-Z');
    if (!code || code < 1 || code > 999) return setError('Number code must be between 1 and 999');

    const clash = categories.find(
      (c) =>
        c.id !== category?.id &&
        c.prefix_letter === prefixLetter &&
        c.number_code === code
    );
    if (clash) return setError(`Prefix ${displayPrefix} is already used by "${clash.category_name}"`);

    const nameClash = categories.find(
      (c) => c.id !== category?.id && c.category_name.toLowerCase() === name.trim().toLowerCase()
    );
    if (nameClash) return setError('A category with this name already exists');

    const payload = {
      category_name: name,
      description,
      prefix_letter: prefixLetter,
      number_code: code,
      status: active ? ('active' as const) : ('inactive' as const),
    };

    try {
      if (isEditing) {
        await updateCategory.mutateAsync({ id: category!.id, ...payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Equipment Category' : 'Add Equipment Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isEditing && hasAssets && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {category?.asset_count} asset(s) already use prefix {category?.display_prefix}.
                Changing the prefix will not renumber existing asset tags.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="ec-name">Category Name</Label>
            <Input
              id="ec-name"
              value={name}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Air Handling Units"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ec-letter">Prefix Letter</Label>
              <Input
                id="ec-letter"
                value={prefixLetter}
                autoComplete="off"
                onChange={(e) => handleLetterChange(e.target.value)}
                maxLength={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ec-code">Number Code</Label>
              <Input
                id="ec-code"
                type="number"
                min={1}
                max={999}
                value={numberCode}
                onChange={(e) => setNumberCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Preview</Label>
              <div className="h-10 flex items-center rounded-md border bg-muted px-3 font-mono text-sm">
                {displayPrefix ? `${displayPrefix}/001` : '—'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ec-desc">Description</Label>
            <Textarea
              id="ec-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="ec-active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Inactive categories cannot be used for new assets.
              </p>
            </div>
            <Switch id="ec-active" checked={active} onCheckedChange={setActive} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
              {isEditing ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
