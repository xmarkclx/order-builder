'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Check } from 'lucide-react';
import { 
  useCustomer, 
  useProduct, 
  useSelectedPlan, 
  useContract, 
  useAddOns, 
  useTotal,
  useOrderActions, 
  prevStep,
  toggleAddOn,
  setAddOnQuantity
} from '@/store/orderStore';
import { formatCurrency, formatDate, formatDateRange, formatCustomerName, formatPerUnit } from '@/lib/format';
import { calculateOrderBreakdown } from '@/lib/calculations';
import { WizardNavigation } from '@/components/wizard/WizardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { saveOrder } from '@/lib/ordersStorage';

export default function ReviewFinalize() {
  const router = useRouter();
  const customer = useCustomer();
  const product = useProduct();
  const selectedPlan = useSelectedPlan();
  const contract = useContract();
  const addOns = useAddOns();
  const total = useTotal();
  const { reset, calculateTotal } = useOrderActions();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  type FinalOrder = {
    customer: typeof customer;
    product: typeof product;
    selectedPlan: typeof selectedPlan;
    contract: typeof contract;
    addOns: typeof addOns;
    total: typeof total;
    breakdown: typeof breakdown;
  };

  // Calculate order breakdown
  const breakdown = React.useMemo(() => {
    const order = {
      customer,
      product,
      selectedPlan,
      contract,
      addOns,
      total
    };
    return calculateOrderBreakdown(order);
  }, [customer, product, selectedPlan, contract, addOns, total]);

  const handlePrevious = () => {
    prevStep();
    router.push('/step-3');
  };

  const handleAddOnToggle = (addOnId: string, checked: boolean) => {
    toggleAddOn(addOnId);
    setTimeout(() => calculateTotal(), 0);
  };

  const handleQuantityChange = (addOnId: string, newQuantity: number) => {
    setAddOnQuantity(addOnId, Math.max(0, newQuantity));
    setTimeout(() => calculateTotal(), 0);
  };

  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);
    try {
      // Compose order payload to save
      const orderToSave = {
        customer,
        product,
        selectedPlan,
        contract,
        addOns,
        total,
        breakdown,
      };

      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Persist order
      saveOrder<FinalOrder>(orderToSave);

      // Clear the form state after successful finalization
      reset();

      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error finalizing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    reset();
    router.push('/');
  };

  const handleCloseDialog = () => {
    // Close dialog and navigate home without resetting current state
    setShowSuccessDialog(false);
    router.push('/');
  };

  const includedAddOns = addOns.filter(addon => addon.included);
  const availableAddOns = addOns.filter(addon => !addon.included);

  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Customer & Contract Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <div className="text-lg font-semibold">
                  {customer.name}
                </div>
              </div>
              
              {customer.prePopulated && customer.companyAddress && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Company Address</Label>
                  <div className="text-sm text-gray-900">
                    <div>{customer.companyAddress.line1}</div>
                    {customer.companyAddress.line2 && (
                      <div>{customer.companyAddress.line2}</div>
                    )}
                    <div>
                      {customer.companyAddress.city}, {customer.companyAddress.state} {customer.companyAddress.zip}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Duration</Label>
                <div className="font-semibold">
                  {contract.durationMonths} months
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Contract Period</Label>
                <div className="font-semibold">
                  {formatDateRange(contract.startDate, contract.endDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product & Plan Info */}
        <div className="space-y-6">
          {/* Product & Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product & Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Product</Label>
                <div className="font-semibold">{product?.name}</div>
                {product?.description && (
                  <div className="text-sm text-gray-600">{product.description}</div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Plan</Label>
                <div className="font-semibold">{selectedPlan?.name}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Monthly Price</Label>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(selectedPlan?.price || 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add-ons Management */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Add-ons</h3>
          <p className="text-gray-600">
            Customize your order with additional features and services.
          </p>
        </div>

        {/* Included Add-ons */}
        {includedAddOns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">
                <Check className="inline h-5 w-5 mr-2" />
                Included Add-ons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {includedAddOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={addon.included}
                      onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{addon.name}</div>
                      <div className="text-sm text-gray-600">{addon.description}</div>
                      <div className="text-sm font-medium text-green-600">
                        {formatPerUnit(addon.price, addon.id.includes('gb') ? 'GB' : 
                                    addon.id.includes('api') ? 'call' :
                                    addon.id.includes('hour') ? 'hour' : 'unit')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(addon.id, addon.quantity - 1)}
                        disabled={addon.quantity <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={addon.quantity}
                        onChange={(e) => handleQuantityChange(addon.id, parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(addon.id, addon.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right w-24">
                      <div className="font-bold">
                        {formatCurrency(addon.price * addon.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Available Add-ons */}
        {availableAddOns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Add-ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableAddOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={addon.included}
                      onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked as boolean)}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{addon.name}</div>
                      <div className="text-sm text-gray-600">{addon.description}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-600">
                    {formatPerUnit(addon.price, addon.id.includes('gb') ? 'GB' : 
                                addon.id.includes('api') ? 'call' :
                                addon.id.includes('hour') ? 'hour' : 'unit')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Total Summary */}
      <Card className="bg-gray-50 border-gray-300">
        <CardHeader>
          <CardTitle className="text-xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Plan ({selectedPlan?.name}):</span>
              <span data-testid="basePlanAmount">{formatCurrency(breakdown.planTotal)}</span>
            </div>
            
            {includedAddOns.map((addon) => (
              <div key={addon.id} className="flex justify-between text-sm text-gray-600">
                <span>{addon.name} ({addon.quantity} × {formatCurrency(addon.price)}):</span>
                <span>{formatCurrency(addon.price * addon.quantity)}</span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Monthly:</span>
              <span data-testid="totalMonthly">{formatCurrency(breakdown.total)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Contract Total ({contract.durationMonths} months):</span>
              <span data-testid="contractTotal">{formatCurrency(breakdown.total * contract.durationMonths)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <WizardNavigation
        onPrevious={handlePrevious}
        onSubmit={handleFinalizeOrder}
        submitLabel="Finalize Order"
        isSubmitDisabled={isSubmitting}
        isLoading={isSubmitting}
        showPrevious={true}
        showNext={false}
        showSubmit={true}
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              <Check className="inline h-6 w-6 mr-2" />
              Order Finalized!
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              Your order has been successfully processed. The total amount is{' '}
              <span className="font-bold">{formatCurrency(breakdown.total * contract.durationMonths)}</span>{' '}
              for the {contract.durationMonths}-month contract.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col sm:space-y-2">
            <Button onClick={handleNewOrder} className="w-full">
              Start New Order
            </Button>
            <Button variant="outline" onClick={handleCloseDialog} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
