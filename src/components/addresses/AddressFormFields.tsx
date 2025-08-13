import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, User, Phone, Mail, Globe, Tag, FileText } from 'lucide-react';
import type { AddressFormData } from '@/types/address';

interface AddressFormFieldsProps {
  control: Control<AddressFormData>;
  disabled?: boolean;
}

export const AddressFormFields: React.FC<AddressFormFieldsProps> = ({ 
  control, 
  disabled = false 
}) => {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Company Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter company name" 
                    disabled={disabled}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter contact person name" 
                    disabled={disabled}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter phone number" 
                    disabled={disabled}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Enter email address" 
                    disabled={disabled}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter website URL" 
                    disabled={disabled}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Address Information</h3>
        </div>

        {disabled ? (
          // View mode - display as label: value pairs in a compact layout
          <div className="space-y-1">
            <FormField
              control={control}
              name="address_line_1"
              render={({ field }) => (
                field.value && (
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Address:</span>
                    <span className="text-sm">{field.value}</span>
                  </div>
                )
              )}
            />

            <FormField
              control={control}
              name="address_line_2"
              render={({ field }) => (
                field.value && (
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]"></span>
                    <span className="text-sm">{field.value}</span>
                  </div>
                )
              )}
            />

            <FormField
              control={control}
              name="address_line_3"
              render={({ field }) => (
                field.value && (
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]"></span>
                    <span className="text-sm">{field.value}</span>
                  </div>
                )
              )}
            />

            <FormField
              control={control}
              name="town_or_city"
              render={({ field }) => (
                field.value && (
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Town/City:</span>
                    <span className="text-sm">{field.value}</span>
                  </div>
                )
              )}
            />

            <FormField
              control={control}
              name="county_or_state"
              render={({ field }) => (
                field.value && (
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]">County/State:</span>
                    <span className="text-sm">{field.value}</span>
                  </div>
                )
              )}
            />

            <FormField
              control={control}
              name="postcode"
              render={({ field }) => (
                field.value && (
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Postcode:</span>
                    <span className="text-sm">{field.value}</span>
                  </div>
                )
              )}
            />
          </div>
        ) : (
          // Edit mode - display as form fields
          <>
            <FormField
              control={control}
              name="address_line_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter address line 1" 
                      disabled={disabled}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address_line_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter address line 2 (optional)" 
                      disabled={disabled}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address_line_3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 3</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter address line 3 (optional)" 
                      disabled={disabled}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="town_or_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town/City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter town or city" 
                        disabled={disabled}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="county_or_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County/State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter county or state" 
                        disabled={disabled}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter postcode" 
                      disabled={disabled}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>

      <Separator />

      {/* Type Classification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Type Classification</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="is_contact"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Contact</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="is_supplier"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Supplier</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="is_manufacturer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Manufacturer</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="is_contractor"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Contractor</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="is_other"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Other</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Notes</h3>
        </div>

        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional notes or comments"
                  className="min-h-20"
                  disabled={disabled}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};