'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { addMonths } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useContract, useOrderActions, nextStep, prevStep } from '@/store/orderStore';
import { DURATION_OPTIONS } from '@/lib/data';
import { formatDate, formatDuration } from '@/lib/format';
import { Contract } from '@/types';
import { WizardNavigation } from '@/components/wizard/WizardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ContractFormData {
  startDate: Date | null;
  durationMonths: number;
  customDuration?: number;
}

export default function ContractForm() {
  const router = useRouter();
  const currentContract = useContract();
  const { update } = useOrderActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);

  // Start date defaults to null; user must select explicitly

  const { 
    control,
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors } 
  } = useForm<ContractFormData>({
    defaultValues: {
      startDate: currentContract.startDate || null,
      durationMonths: currentContract.durationMonths || 12,
      customDuration: currentContract.durationMonths === -1 ? undefined : currentContract.durationMonths
    },
    mode: 'onChange'
  });

  const watchedStartDate = watch('startDate');
  const watchedDuration = watch('durationMonths');
  const watchedCustomDuration = watch('customDuration');

  // Normalize start date to a Date instance (react-hook-form may return string/unknown in some cases)
  const startDateObj = React.useMemo(() => {
    if (!watchedStartDate) return null;
    const d = watchedStartDate instanceof Date
      ? watchedStartDate
      : new Date(watchedStartDate as unknown as string | number);
    // Guard invalid dates
    return isNaN(d.getTime()) ? null : d;
  }, [watchedStartDate]);

  // Calculate end date based on start date and duration
  const calculatedEndDate = React.useMemo(() => {
    if (!startDateObj) return null;
    const actualDuration = watchedDuration === -1 ? (watchedCustomDuration || 0) : watchedDuration;
    if (actualDuration <= 0) return null;
    return addMonths(startDateObj, actualDuration);
  }, [startDateObj, watchedDuration, watchedCustomDuration]);

  const onSubmit = async (data: ContractFormData) => {
    if (!data.startDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDuration = data.durationMonths === -1 ? (data.customDuration || 0) : data.durationMonths;
      
      if (finalDuration <= 0) {
        return;
      }

      const contractData: Contract = {
        startDate: data.startDate,
        durationMonths: finalDuration,
        endDate: addMonths(data.startDate, finalDuration)
      };

      // Update store with contract data
      update({ contract: contractData });
      
      // Move to next step
      nextStep();
      router.push('/step-4');
    } catch (error) {
      console.error('Error submitting contract form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    prevStep();
    router.push('/step-2');
  };

  const isFormValid = !!startDateObj && 
    ((watchedDuration !== -1 && watchedDuration > 0) || 
     (watchedDuration === -1 && (watchedCustomDuration || 0) > 0));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Start Date Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Start Date</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose when you want your contract to begin.
          </p>
        </div>

        <div className="max-w-sm">
          <Label htmlFor="startDate" className="text-sm font-medium">
            Start Date *
          </Label>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: 'Start date is required' }}
            render={({ field }) => (
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-testid="startDate"
                    aria-label="Pick a date"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !field.value && "text-muted-foreground",
                      errors.startDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? formatDate(field.value) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    data-slot="calendar"
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      field.onChange(date);
                      if (date) setIsStartDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
          )}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Duration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select how long you want your contract to last.
          </p>
        </div>

        <div className="max-w-sm">
          <Label htmlFor="duration" className="text-sm font-medium">
            Duration *
          </Label>
          <Select 
            value={watchedDuration?.toString()} 
            onValueChange={(value) => {
              const numValue = parseInt(value);
              setValue('durationMonths', numValue);
              if (numValue !== -1) {
                setValue('customDuration', undefined);
              }
            }}
          >
            <SelectTrigger data-testid="duration" data-slot="select-trigger" className={`mt-1 ${errors.durationMonths ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.durationMonths && (
            <p className="text-sm text-red-600 mt-1">{errors.durationMonths.message}</p>
          )}
        </div>

        {/* Custom Duration Input - Only show if "Custom duration" is selected */}
        {watchedDuration === -1 && (
          <div className="max-w-sm">
            <Label htmlFor="customDuration" className="text-sm font-medium">
              Custom Duration (Months) *
            </Label>
            <Input
              id="customDuration"
              type="number"
              min="1"
              max="100"
              {...register('customDuration', { 
                valueAsNumber: true,
                required: watchedDuration === -1 ? 'Custom duration is required' : false,
                min: { value: 1, message: 'Duration must be at least 1 month' },
                max: { value: 100, message: 'Duration cannot exceed 100 months' }
              })}
              placeholder="Enter number of months"
              className={`mt-1 ${errors.customDuration ? 'border-red-500' : ''}`}
            />
            {errors.customDuration && (
              <p className="text-sm text-red-600 mt-1">{errors.customDuration.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Contract Summary */}
      {startDateObj && isFormValid && (
        <Card className="bg-[#FEFAF3] border-gray-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">Contract Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-700 font-medium">Start Date:</span>
                <div className="text-gray-900 font-semibold">
                  {formatDate(startDateObj, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              
              <div>
                <span className="text-gray-700 font-medium">Duration:</span>
                <div className="text-gray-900 font-semibold">
                  {watchedDuration === -1 
                    ? formatDuration(watchedCustomDuration || 0)
                    : formatDuration(watchedDuration)
                  }
                </div>
              </div>
              
              {calculatedEndDate && (
                <>
                  <div>
                    <span className="text-gray-700 font-medium">End Date:</span>
                    <div className="text-gray-900 font-semibold" data-testid="endDate">
                      {formatDate(calculatedEndDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-700 font-medium">Total Days:</span>
                    <div className="text-gray-900 font-semibold">
                      {Math.ceil((calculatedEndDate.getTime() - startDateObj!.getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Validation Alert */}
      {!isFormValid && (watchedStartDate || watchedDuration) && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            {!watchedStartDate 
              ? 'Please select a start date.'
              : 'Please select a valid contract duration.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <WizardNavigation
        onNext={handleSubmit(onSubmit)}
        onPrevious={handlePrevious}
        nextLabel="Continue to Review"
        isNextDisabled={!isFormValid || isSubmitting}
        isLoading={isSubmitting}
        showPrevious={true}
        showNext={true}
        showSubmit={false}
      />
    </form>
  );
}
