'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useProduct, useSelectedPlan, useOrderActions, nextStep, prevStep, usePriceOverrides } from '@/store/orderStore';
import { sampleProducts } from '@/lib/data';
import { formatCurrency } from '@/lib/format';
import { Plan } from '@/types';
import { WizardNavigation } from '@/components/wizard/WizardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductPlanFormData {
  selectedProductId: string;
  selectedPlanId: string;
  customPrice?: number;
}

export default function ProductPlanForm() {
  const [priceEditPlanId, setPriceEditPlanId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [isPriceValid, setIsPriceValid] = useState<boolean>(true);
  const router = useRouter();
  const currentProduct = useProduct();
  const currentPlan = useSelectedPlan();
  const priceOverrides = usePriceOverrides();
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

  // Sync form with store on hydration/changes so values reflect after reload
  // IMPORTANT: Do not override user's current selection; only initialize when form is empty
  React.useEffect(() => {
    if (currentProduct?.id && !watchedProductId) {
      setValue('selectedProductId', currentProduct.id, { shouldValidate: true });
    }
    if (currentPlan?.id && !watchedPlanId) {
      setValue('selectedPlanId', currentPlan.id, { shouldValidate: true });
    }
    // Keep price synced with store only when the same plan is selected
    if (
      currentPlan?.id &&
      watchedPlanId === currentPlan.id &&
      typeof currentPlan.price === 'number' &&
      currentPlan.price !== watchedCustomPrice
    ) {
      setValue('customPrice', currentPlan.price, { shouldValidate: true });
    }
  }, [currentProduct?.id, currentPlan?.id, currentPlan?.price, watchedProductId, watchedPlanId, watchedCustomPrice, setValue]);

  // Reset plan selection when product changes
  React.useEffect(() => {
    if (watchedProductId && watchedProductId !== currentProduct?.id) {
      setValue('selectedPlanId', '');
      setValue('customPrice', undefined);
    }
  }, [watchedProductId, currentProduct?.id, setValue]);

  // Update custom price when plan changes via UI selection
  // Prefer override if present; do not overwrite if store already has same plan with price
  React.useEffect(() => {
    if (!selectedPlan) return;
    // If the store's selected plan matches the newly selected id, prefer store price
    if (currentPlan?.id === selectedPlan.id && typeof currentPlan.price === 'number') {
      if (watchedCustomPrice !== currentPlan.price) {
        setValue('customPrice', currentPlan.price);
        setIsPriceValid(true);
      }
      return;
    }
    // Otherwise, default to override price if exists, else catalogue plan price
    const override = priceOverrides?.[selectedPlan.id];
    const nextPrice = typeof override === 'number' ? override : selectedPlan.price;
    if (watchedCustomPrice !== nextPrice) {
      setValue('customPrice', nextPrice);
      setIsPriceValid(true);
    }
  }, [selectedPlan, selectedPlan?.id, selectedPlan?.price, currentPlan?.id, currentPlan?.price, watchedCustomPrice, priceOverrides, setValue]);

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

  const handleSaveEditedPrice = () => {
    if (!priceEditPlanId || !selectedProduct) return;
    const plan = selectedProduct.plans.find(p => p.id === priceEditPlanId);
    // Allow digits, dot, and an optional leading minus for negative validation
    const raw = String(tempPrice).trim();
    const cleaned = raw.replace(/[^0-9.-]/g, '');
    // Normalize minus sign to be leading only, if present
    let normalized = cleaned;
    if (cleaned.includes('-')) {
      const isNegative = cleaned.trim().startsWith('-');
      normalized = (isNegative ? '-' : '') + cleaned.replace(/-/g, '').replace(/^-/, '');
    }
    const valueNum = parseFloat(normalized);
    const final = isNaN(valueNum) ? (plan?.price ?? 0) : valueNum;
    // Guard against negatives
    if (final < 0) {
      setIsPriceValid(false);
      return;
    }
    // Ensure the edited plan becomes the selected plan (RHF state)
    setValue('selectedPlanId', priceEditPlanId, { shouldValidate: true, shouldDirty: true });
    setValue('customPrice', final, { shouldValidate: true, shouldDirty: true });
    setIsPriceValid(true);

    // Persist immediately to global store so it survives navigation
    if (plan) {
      const updatedPlan: Plan = { ...plan, price: final };
      const newOverrides = { ...(priceOverrides || {}), [plan.id]: final };
      update({ product: selectedProduct, selectedPlan: updatedPlan, priceOverrides: newOverrides });
    }

    setPriceEditPlanId(null);
  };

  const isFormValid = Boolean(watchedProductId) && Boolean(watchedPlanId) && isPriceValid;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Hidden field to register customPrice with RHF */}
          <input type="hidden" {...register('customPrice' as const)} />
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
          onValueChange={(value) => setValue('selectedProductId', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
        >
          {sampleProducts.map((product) => (
            <div key={product.id} className="relative h-full">
              <RadioGroupItem 
                value={product.id} 
                id={product.id}
                className="sr-only"
              />
              <Label 
                htmlFor={product.id}
                className="cursor-pointer block h-full"
              >
                <Card className={`transition-all duration-200 h-full flex flex-col ${
                  watchedProductId === product.id 
                    ? 'ring-2 ring-black bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mx-auto">
                      <CardTitle className="text-lg text-center">{product.name}</CardTitle>
                    </div>
                    <Badge className={`bg-black mx-auto text-white transition-opacity duration-200 ${
                      watchedProductId === product.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      Selected
                    </Badge>
                    {product.description && (
                      <CardDescription className="text-gray-600">
                        {product.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
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
            onValueChange={(value) => setValue('selectedPlanId', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
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
                  className="cursor-pointer block"
                >
                  <Card className={`transition-all duration-200 ${
                    watchedPlanId === plan.id 
                      ? 'ring-2 ring-black bg-gray-100' 
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
                            {formatCurrency(
                              watchedPlanId === plan.id
                                ? (typeof watchedCustomPrice === 'number' ? watchedCustomPrice : (priceOverrides?.[plan.id] ?? plan.price))
                                : (priceOverrides?.[plan.id] ?? plan.price)
                            )}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid={`editPrice-${plan.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPriceEditPlanId(plan.id);
                      const current = (watchedPlanId === plan.id ? (watchedCustomPrice ?? plan.price) : plan.price);
                      setTempPrice(String(current));
                    }}
                  >
                    Edit price
                  </Button>
                </div>
              </div>
            ))}
          </RadioGroup>

          {errors.selectedPlanId && (
            <p className="text-sm text-red-600">Please select a plan</p>
          )}
        </div>
      )}


      {/* Summary */}
      {selectedProduct && selectedPlan && (
        <div className="bg-[#FEFAF3] border border-gray-200 rounded-lg p-4">
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

      {/* Price Edit Dialog */}
      <Dialog open={!!priceEditPlanId} onOpenChange={(open) => !open && setPriceEditPlanId(null)}>
        <DialogContent className="sm:max-w-md" data-testid="editPriceDialog">
          <DialogHeader>
            <DialogTitle>Edit monthly price</DialogTitle>
            <DialogDescription>
              Set a custom monthly price for this plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="priceInput">Monthly Price (USD)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="priceInput"
                data-testid="editPriceInput"
                type="text"
                inputMode="decimal"
                className="pl-7 w-full border rounded-md p-2"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveEditedPrice();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPriceEditPlanId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-testid="savePrice"
              onClick={handleSaveEditedPrice}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
