'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useProduct, useSelectedPlan, useOrderActions, nextStep, prevStep } from '@/store/orderStore';
import { sampleProducts } from '@/lib/data';
import { formatCurrency, formatCurrencyInput } from '@/lib/format';
import { Product, Plan } from '@/types';
import { WizardNavigation } from '@/components/wizard/WizardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductPlanFormData {
  selectedProductId: string;
  selectedPlanId: string;
  customPrice?: number;
}

export default function ProductPlanForm() {
  const router = useRouter();
  const currentProduct = useProduct();
  const currentPlan = useSelectedPlan();
  const { update } = useOrderActions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm<ProductPlanFormData>({
    defaultValues: {
      selectedProductId: currentProduct?.id || '',
      selectedPlanId: currentPlan?.id || '',
      customPrice: currentPlan?.price || undefined
    },
    mode: 'onChange'
  });

  const watchedProductId = watch('selectedProductId');
  const watchedPlanId = watch('selectedPlanId');
  const watchedCustomPrice = watch('customPrice');

  const selectedProduct = sampleProducts.find(p => p.id === watchedProductId);
  const selectedPlan = selectedProduct?.plans.find(p => p.id === watchedPlanId);

  // Reset plan selection when product changes
  React.useEffect(() => {
    if (watchedProductId && watchedProductId !== currentProduct?.id) {
      setValue('selectedPlanId', '');
      setValue('customPrice', undefined);
    }
  }, [watchedProductId, currentProduct?.id, setValue]);

  // Update custom price when plan changes
  React.useEffect(() => {
    if (selectedPlan) {
      setValue('customPrice', selectedPlan.price);
    }
  }, [selectedPlan, setValue]);

  const onSubmit = async (data: ProductPlanFormData) => {
    if (!selectedProduct || !selectedPlan) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create updated plan with custom price if different
      const finalPlan: Plan = {
        ...selectedPlan,
        price: data.customPrice || selectedPlan.price
      };

      // Update store with product and plan selection
      update({ 
        product: selectedProduct,
        selectedPlan: finalPlan
      });
      
      // Move to next step
      nextStep();
      router.push('/step-3');
    } catch (error) {
      console.error('Error submitting product plan form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    prevStep();
    router.push('/step-1');
  };

  const isFormValid = watchedProductId && watchedPlanId && (watchedCustomPrice || 0) >= 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Product Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose the product that best fits your needs.
          </p>
        </div>

        <RadioGroup
          value={watchedProductId}
          onValueChange={(value) => setValue('selectedProductId', value)}
          className="space-y-4"
        >
          {sampleProducts.map((product) => (
            <div key={product.id} className="relative">
              <RadioGroupItem 
                value={product.id} 
                id={product.id}
                className="sr-only"
              />
              <Label 
                htmlFor={product.id}
                className="cursor-pointer"
              >
                <Card className={`transition-all duration-200 ${
                  watchedProductId === product.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {watchedProductId === product.id && (
                        <Badge className="bg-blue-600 text-white">Selected</Badge>
                      )}
                    </div>
                    {product.description && (
                      <CardDescription className="text-gray-600">
                        {product.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      {product.plans.length} pricing plan{product.plans.length !== 1 ? 's' : ''} available
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {errors.selectedProductId && (
          <p className="text-sm text-red-600">Please select a product</p>
        )}
      </div>

      {/* Plan Selection - Only show if product is selected */}
      {selectedProduct && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Plan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose the pricing plan for {selectedProduct.name}.
            </p>
          </div>

          <RadioGroup
            value={watchedPlanId}
            onValueChange={(value) => setValue('selectedPlanId', value)}
            className="space-y-3"
          >
            {selectedProduct.plans.map((plan) => (
              <div key={plan.id} className="relative">
                <RadioGroupItem 
                  value={plan.id} 
                  id={plan.id}
                  className="sr-only"
                />
                <Label 
                  htmlFor={plan.id}
                  className="cursor-pointer"
                >
                  <Card className={`transition-all duration-200 ${
                    watchedPlanId === plan.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{plan.name}</div>
                          <div className="text-sm text-gray-500">
                            Monthly subscription
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(plan.price)}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {errors.selectedPlanId && (
            <p className="text-sm text-red-600">Please select a plan</p>
          )}
        </div>
      )}

      {/* Custom Price Input - Only show if plan is selected */}
      {selectedPlan && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Adjust Pricing</h3>
            <p className="text-sm text-gray-600 mb-4">
              You can modify the price if needed.
            </p>
          </div>

          <div className="max-w-sm">
            <Label htmlFor="customPrice" className="text-sm font-medium">
              Monthly Price (USD)
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                id="customPrice"
                type="number"
                min="0"
                step="0.01"
                {...register('customPrice', { 
                  valueAsNumber: true,
                  min: 0
                })}
                placeholder="0.00"
                className={`pl-7 ${errors.customPrice ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.customPrice && (
              <p className="text-sm text-red-600 mt-1">{errors.customPrice.message}</p>
            )}
            
            {selectedPlan && watchedCustomPrice !== selectedPlan.price && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Original price: </span>
                <span className="line-through text-gray-400">
                  {formatCurrency(selectedPlan.price)}
                </span>
                <span className="ml-2 text-green-600 font-medium">
                  Modified to: {formatCurrency(watchedCustomPrice || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedProduct && selectedPlan && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Selection Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Price:</span>
              <span className="font-bold text-lg">
                {formatCurrency(watchedCustomPrice || selectedPlan.price)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Validation Alert */}
      {!isFormValid && (watchedProductId || watchedPlanId) && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            Please select both a product and a plan to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <WizardNavigation
        onNext={handleSubmit(onSubmit)}
        onPrevious={handlePrevious}
        nextLabel="Continue to Contract Details"
        isNextDisabled={!isFormValid || isSubmitting}
        isLoading={isSubmitting}
        showPrevious={true}
        showNext={true}
        showSubmit={false}
      />
    </form>
  );
}
