
'use client';

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
  setAddOnQuantity,
  usePriceOverrides
} from '@/store/orderStore';
import { formatCurrency, formatPerUnit, formatDateRange } from '@/lib/format';
import { calculateOrderBreakdown } from '@/lib/calculations';
import { WizardNavigation } from '@/components/wizard/WizardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
//
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { saveOrder } from '@/lib/ordersStorage';
import { sampleProducts } from '@/lib/data';

function ConfettiOverlay({ show }: { show: boolean }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!show || !mounted) return null;
  const pieces = Array.from({ length: 100 });
  const node = (
    <>
      <div className="confetti-overlay pointer-events-none fixed inset-0 overflow-hidden z-[9999]">
        {pieces.map((_, i) => {
          const left = Math.random() * 100;
          const delay = i < 12 ? 0 : Math.random() * 0.2;
          const duration = 1.2 + Math.random() * 0.6;
          const size = 6 + Math.random() * 8;
          const hue = Math.floor(Math.random() * 360);
          const rotate = Math.random() * 360;
          const style: React.CSSProperties = {
            left: `${left}vw`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size * 0.6}px`,
            backgroundColor: `hsl(${hue} 90% 60%)`,
            transform: `rotate(${rotate}deg)`
          };
          return <span key={i} className="confetti-piece" style={style} />;
        })}
      </div>
      <style jsx global>{`
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -110%, 0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(720deg);
            opacity: 0.9;
          }
        }
        .confetti-overlay { }
        .confetti-piece {
          position: absolute;
          top: -5vh;
          border-radius: 2px;
          display: inline-block;
          animation-name: confettiFall;
          animation-timing-function: ease-in;
          will-change: transform, opacity;
        }
      `}</style>
    </>
  );
  return createPortal(node, document.body);
}

export default function ReviewFinalize() {
  const router = useRouter();
  const customer = useCustomer();
  const product = useProduct();
  const selectedPlan = useSelectedPlan();
  const contract = useContract();
  const addOns = useAddOns();
  const total = useTotal();
  const { reset, calculateTotal, update } = useOrderActions();
  const priceOverrides = usePriceOverrides();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Local state for price editing
  const [priceEditPlanId, setPriceEditPlanId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [isPriceValid, setIsPriceValid] = useState<boolean>(true);

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

  // Local helpers for selectors
  const productOptions = sampleProducts;
  const selectedProductFromCatalogue = useMemo(
    () => product ? productOptions.find(p => p.id === product.id) : undefined,
    [product, productOptions]
  );
  const availablePlans = selectedProductFromCatalogue?.plans || [];

  const handlePrevious = () => {
    prevStep();
    router.push('/step-3');
  };

  const handleAddOnToggle = (addOnId: string, checked: boolean) => {
    // If turning ON and quantity is 0, bump to 1
    if (checked) {
      const current = addOns.find(a => a.id === addOnId);
      if ((current?.quantity ?? 0) < 1) {
        setAddOnQuantity(addOnId, 1);
      }
    }
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

      // Show success dialog and confetti briefly before navigating
      console.debug('[Finalize] showing success + confetti');
      setShowSuccessDialog(true);
      setShowConfetti(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowConfetti(false);
      setShowSuccessDialog(false);
      console.debug('[Finalize] navigating to /recent-orders');
      router.push('/recent-orders');
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
    // Confirm and go to recent orders
    setShowSuccessDialog(false);
    router.push('/recent-orders');
  };

  const includedAddOns = addOns.filter(addon => addon.included);

  return (
    <div className="space-y-8">
      <ConfettiOverlay show={showConfetti} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product/Plan selectors and Add-ons */}
        <div className="space-y-6">
          {/* Product Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="productSelect" className="text-sm font-medium text-gray-600">Product</Label>
              <select
                id="productSelect"
                className="w-full border rounded-md p-2"
                value={product?.id || ''}
                onChange={(e) => {
                  const newProd = productOptions.find(p => p.id === e.target.value);
                  if (newProd) {
                    // Update product and clear selected plan
                    update({ product: newProd, selectedPlan: null });
                  }
                }}
              >
                <option value="" disabled>Select a product</option>
                {productOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Plan Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Plan</Label>
              </div>
              <RadioGroup
                value={selectedPlan?.id || ''}
                onValueChange={(value) => {
                  const plan = availablePlans.find(p => p.id === value);
                  if (plan) {
                    const overridden = priceOverrides?.[plan.id];
                    update({ selectedPlan: overridden != null ? { ...plan, price: overridden } : plan });
                  }
                }}
                className="space-y-3"
              >
                {availablePlans.map((plan) => (
                  <div key={plan.id} className="relative">
                    <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} className="sr-only" />
                    <Label htmlFor={`plan-${plan.id}`} className="cursor-pointer block">
                      <Card className={`transition-all duration-200 ${selectedPlan?.id === plan.id ? 'ring-2 ring-black bg-gray-100' : 'hover:bg-gray-50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{plan.name}</div>
                              <div className="text-sm text-gray-500">Monthly subscription</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">{
                                formatCurrency(
                                  selectedPlan?.id === plan.id
                                    ? (typeof selectedPlan.price === 'number' ? selectedPlan.price : (priceOverrides?.[plan.id] ?? plan.price))
                                    : (priceOverrides?.[plan.id] ?? plan.price)
                                )
                              }</div>
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
                          const currentPrice = (selectedPlan?.id === plan.id)
                            ? selectedPlan.price
                            : (priceOverrides?.[plan.id] ?? plan.price);
                          setTempPrice(String(currentPrice));
                          setIsPriceValid(true);
                        }}
                      >
                        Edit price
                      </Button>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Add-ons Management */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add-ons</h3>
              <p className="text-gray-600">
                Customize your order with additional features and services.
              </p>
            </div>

            {addOns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addOns.map((addon) => (
                    <div
                      key={addon.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAddOnToggle(addon.id, !addon.included)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAddOnToggle(addon.id, !addon.included);
                        }
                      }}
                      className={`group p-3 border border-gray-200 rounded-lg transition-all duration-150 cursor-pointer hover:shadow-sm ${addon.included ? 'bg-[#FEFAF3] ring-2 ring-black' : ''} flex flex-col justify-between`}
                    >
                      <div className="flex items-stretch justify-between min-h-28">
                        <div className="flex items-start">
                          <Checkbox
                            checked={addon.included}
                            onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            disabled={false}
                            className="mr-4 mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{addon.name}</div>
                            <div className="text-sm text-gray-600">{addon.description}</div>
                            <div className="text-sm font-medium text-gray-600">
                              {formatPerUnit(
                                addon.price,
                                addon.id.includes('gb') ? 'GB' :
                                addon.id.includes('api') ? 'call' :
                                addon.id.includes('hour') ? 'hour' : 'unit'
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-end items-end gap-2">
                          <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleQuantityChange(addon.id, addon.quantity - 1); }}
                            disabled={!addon.included || addon.quantity <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={addon.quantity}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleQuantityChange(addon.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                            disabled={!addon.included}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleQuantityChange(addon.id, addon.quantity + 1); }}
                            disabled={!addon.included}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          </div>
                          <div className="text-right w-24">
                            <div className="font-bold">
                              {formatCurrency(addon.included ? addon.price * addon.quantity : 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Summary Tables */}
        <div className="space-y-6">
          <Card className="bg-[#FEFAF3] border-gray-300">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Deal Parties */}
              <div>
                <h4 className="font-semibold mb-2">Deal Parties</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-600">Customer</td>
                      <td className="py-1 text-right font-medium">{customer.name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Included Add-ons Summary Lines (for tests) */}
              {includedAddOns.length > 0 && (
                <div className="space-y-1">
                  {includedAddOns.map((addon) => (
                    <div key={`summaryline-${addon.id}`} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {`${addon.name} (${addon.quantity} × ${formatCurrency(addon.price)}):`}
                      </span>
                      <span>{formatCurrency(addon.price * addon.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Order */}
              <div>
                <h4 className="font-semibold mb-2">Order</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-600">Product</td>
                      <td className="py-1 text-right font-medium">{product?.name || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Plan</td>
                      <td className="py-1 text-right font-medium">{selectedPlan?.name || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Add Ons */}
              <div>
                <h4 className="font-semibold mb-2">Add Ons</h4>
                <table className="w-full text-sm">
                  <tbody>
                    {includedAddOns.length === 0 && (
                      <tr>
                        <td className="py-1 text-gray-600">None</td>
                        <td className="py-1 text-right font-medium">{formatCurrency(0)}</td>
                      </tr>
                    )}
                    {includedAddOns.map((addon) => (
                      <tr key={addon.id}>
                        <td className="py-1 text-gray-600">{addon.name}</td>
                        <td className="py-1 text-right font-medium">
                          {addon.quantity} × {formatCurrency(addon.price)} = {formatCurrency(addon.price * addon.quantity)}
                        </td>
                      </tr>
                    ))}
                    
                  </tbody>
                </table>
              </div>

              {/* Monthly Totals (for tests) */}
              <div>
                <h4 className="font-semibold mb-2">Monthly Totals</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-600">Base Plan</td>
                      <td className="py-1 text-right font-medium" data-testid="basePlanAmount">{formatCurrency(breakdown.planTotal)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Total Monthly</td>
                      <td className="py-1 text-right font-medium" data-testid="totalMonthly">{
                        formatCurrency(
                          breakdown.planTotal + includedAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0)
                        )
                      }</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Contract Total</td>
                      <td className="py-1 text-right font-bold" data-testid="contractTotal">{
                        formatCurrency(
                          (breakdown.planTotal + includedAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0)) * (contract.durationMonths || 0)
                        )
                      }</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deal Setup */}
              <div>
                <h4 className="font-semibold mb-2">Deal Setup</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-600">Contract term</td>
                      <td className="py-1 text-right font-medium">{formatDateRange(contract.startDate, contract.endDate)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Payment Terms</td>
                      <td className="py-1 text-right font-medium">Net 30</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Billing Schedule</td>
                      <td className="py-1 text-right font-medium">Monthly</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width Totals section */}
      <div>
        <Card className="border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg">Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {/* Plan */}
                <tr>
                  <td className="py-1 text-gray-600">Plan{selectedPlan ? ` — ${selectedPlan.name}` : ''}</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(breakdown.planTotal)}</td>
                </tr>

                <tr>
                  <td className="pt-2 font-semibold">
                    Add Ons
                  </td>
                </tr>

                {/* Add-ons itemized */}
                {includedAddOns.map((addon) => (
                  <tr key={`bottom-${addon.id}`}>
                    <td className="py-1 text-gray-600">{addon.name} ({addon.quantity} × {formatCurrency(addon.price)})</td>
                    <td className="py-1 text-right font-medium">{formatCurrency(addon.price * addon.quantity)}</td>
                  </tr>
                ))}

                {/* Subtotal/Tax/Total */}
                <tr>
                  <td className="pt-2 font-semibold">Subtotal</td>
                  <td className="pt-2 text-right font-semibold">{formatCurrency(breakdown.subtotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Tax</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(breakdown.tax)}</td>
                </tr>
                <tr>
                  <td className="pt-2 font-bold">Total (USD)</td>
                  <td className="pt-2 text-right font-bold" data-testid="bottomTotal">{formatCurrency(breakdown.total)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

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

      {/* Edit Price Dialog */}
      <Dialog open={!!priceEditPlanId} onOpenChange={(open) => { if (!open) setPriceEditPlanId(null); }}>
        <DialogContent className="sm:max-w-md" data-testid="editPriceDialog">
          <DialogHeader>
            <DialogTitle>Edit monthly price</DialogTitle>
            <DialogDescription>
              Set a custom monthly price for this plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="priceInput">Monthly Price (USD)</Label>
            <Input
              id="priceInput"
              data-testid="editPriceInput"
              type="text"
              inputMode="decimal"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const raw = String(tempPrice).trim();
                  const cleaned = raw.replace(/[^0-9.-]/g, '');
                  let normalized = cleaned;
                  if (cleaned.includes('-')) {
                    const isNegative = cleaned.trim().startsWith('-');
                    normalized = (isNegative ? '-' : '') + cleaned.replace(/-/g, '').replace(/^-/, '');
                  }
                  const valueNum = parseFloat(normalized);
                  const final = isNaN(valueNum) ? 0 : valueNum;
                  if (final < 0) { setIsPriceValid(false); return; }
                  const planId = priceEditPlanId!;
                  const cataloguePlan = availablePlans.find(p => p.id === planId);
                  const updatedOverrides = { ...(priceOverrides || {}), [planId]: final } as Record<string, number>;
                  const updatedPlan = cataloguePlan ? { ...cataloguePlan, price: final } : (selectedPlan ? { ...selectedPlan, price: final } : undefined);
                  if (updatedPlan) {
                    update({ selectedPlan: updatedPlan, priceOverrides: updatedOverrides });
                  } else {
                    update({ priceOverrides: updatedOverrides });
                  }
                  setIsPriceValid(true);
                  setPriceEditPlanId(null);
                }
              }}
            />
            {!isPriceValid && (
              <p className="text-sm text-red-600">Price cannot be negative.</p>
            )}
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
              onClick={() => {
                const raw = String(tempPrice).trim();
                const cleaned = raw.replace(/[^0-9.-]/g, '');
                let normalized = cleaned;
                if (cleaned.includes('-')) {
                  const isNegative = cleaned.trim().startsWith('-');
                  normalized = (isNegative ? '-' : '') + cleaned.replace(/-/g, '').replace(/^-/, '');
                }
                const valueNum = parseFloat(normalized);
                const final = isNaN(valueNum) ? 0 : valueNum;
                if (final < 0) { setIsPriceValid(false); return; }
                const planId = priceEditPlanId!;
                const cataloguePlan = availablePlans.find(p => p.id === planId);
                const updatedOverrides = { ...(priceOverrides || {}), [planId]: final } as Record<string, number>;
                const updatedPlan = cataloguePlan ? { ...cataloguePlan, price: final } : (selectedPlan ? { ...selectedPlan, price: final } : undefined);
                if (updatedPlan) {
                  update({ selectedPlan: updatedPlan, priceOverrides: updatedOverrides });
                } else {
                  update({ priceOverrides: updatedOverrides });
                }
                setIsPriceValid(true);
                setPriceEditPlanId(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              <Check className="inline h-6 w-6 mr-2" />
              Order Finalized!
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              Your order has been successfully processed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col sm:space-y-2">
            {/* <Button onClick={handleNewOrder} className="w-full">
              Start New Order
            </Button>
            <Button variant="outline" onClick={handleCloseDialog} className="w-full">
              OK
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
