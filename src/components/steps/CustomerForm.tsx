'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCustomer, useOrderActions, nextStep } from '@/store/orderStore';
import { US_STATES } from '@/lib/data';
import { Customer } from '@/types';
import { WizardNavigation } from '@/components/wizard/WizardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CustomerForm() {
  const router = useRouter();
  const customer = useCustomer();
  const { update } = useOrderActions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm<Customer>({
    defaultValues: customer,
    mode: 'onChange'
  });

  const prePopulated = watch('prePopulated');

  const onSubmit = async (data: Customer) => {
    setIsSubmitting(true);
    try {
      // Update store with customer data
      update({ customer: data });
      
      // Move to next step
      nextStep();
      router.push('/step-2');
    } catch (error) {
      console.error('Error submitting customer form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrePopulatedChange = (checked: boolean) => {
    setValue('prePopulated', checked);
    if (!checked) {
      setValue('companyAddress', undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name *
          </Label>
          <Input
            id="name"
            data-testid="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter company or contact name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Pre-populate Address Checkbox */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="prePopulated"
            data-testid="useCompanyAddress"
            checked={prePopulated}
            onCheckedChange={handlePrePopulatedChange}
          />
          <Label htmlFor="prePopulated" className="text-sm font-medium">
            Pre-populate customer information
          </Label>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Pre-fill checkout details on behalf of your customer.
        </p>
      </div>

      {/* Address Fields - Only shown when prePopulated is true */}
      {prePopulated && (
        <div className="space-y-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Company Address</h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1" className="text-sm font-medium">
                Address Line 1 *
              </Label>
              <Input
                id="addressLine1"
                {...register('companyAddress.line1', { required: prePopulated ? 'Address line 1 is required' : false })}
                placeholder="Enter street address"
                className={errors.companyAddress?.line1 ? 'border-red-500' : ''}
              />
              {errors.companyAddress?.line1 && (
                <p className="text-sm text-red-600">{errors.companyAddress.line1.message}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="addressLine2" className="text-sm font-medium">
                Address Line 2 (Optional)
              </Label>
              <Input
                id="addressLine2"
                {...register('companyAddress.line2')}
                placeholder="Apartment, suite, etc."
              />
              {errors.companyAddress?.line2 && (
                <p className="text-sm text-red-600">{errors.companyAddress.line2.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City *
                </Label>
                <Input
                  id="city"
                  {...register('companyAddress.city', { required: prePopulated ? 'City is required' : false })}
                  placeholder="Enter city"
                  className={errors.companyAddress?.city ? 'border-red-500' : ''}
                />
                {errors.companyAddress?.city && (
                  <p className="text-sm text-red-600">{errors.companyAddress.city.message}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  State *
                </Label>
                {/* Hidden input registered for validation */}
                <input type="hidden" {...register('companyAddress.state', { required: prePopulated ? 'State is required' : false })} />
                <Select 
                  onValueChange={(value) => setValue('companyAddress.state', value)}
                  defaultValue={customer.companyAddress?.state}
                >
                  <SelectTrigger className={errors.companyAddress?.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyAddress?.state && (
                  <p className="text-sm text-red-600">{errors.companyAddress.state.message}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zip" className="text-sm font-medium">
                  ZIP Code *
                </Label>
                <Input
                  id="zip"
                  {...register('companyAddress.zip', { required: prePopulated ? 'ZIP is required' : false })}
                  placeholder="12345"
                  className={errors.companyAddress?.zip ? 'border-red-500' : ''}
                />
                {errors.companyAddress?.zip && (
                  <p className="text-sm text-red-600">{errors.companyAddress.zip.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Validation Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            Please correct the errors above before proceeding to the next step.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <WizardNavigation
        onNext={handleSubmit(onSubmit)}
        nextLabel="Continue to Product Selection"
        isNextDisabled={isSubmitting}
        isLoading={isSubmitting}
        showPrevious={false}
        showNext={true}
        showSubmit={false}
      />
    </form>
  );
}
