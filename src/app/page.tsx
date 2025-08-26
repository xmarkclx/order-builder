'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  const handleStartOrder = () => {
    router.push('/step-1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-amber-200">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Order Builder
          </CardTitle>
          <p className="text-lg text-gray-600 leading-relaxed">
            Create orders quickly and confidently with our step-by-step guided process.
            Select products, configure pricing, set contract terms, and finalize your order.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 text-black rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                1
              </div>
              <div>
                <div className="font-medium text-gray-900">Customer Information</div>
                <div className="text-gray-500">Enter customer details and address</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 text-black rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                2
              </div>
              <div>
                <div className="font-medium text-gray-900">Product & Plan</div>
                <div className="text-gray-500">Select product and pricing plan</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 text-black rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                3
              </div>
              <div>
                <div className="font-medium text-gray-900">Contract Details</div>
                <div className="text-gray-500">Set contract dates and duration</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 text-black rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                4
              </div>
              <div>
                <div className="font-medium text-gray-900">Review & Finalize</div>
                <div className="text-gray-500">Review order and configure add-ons</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleStartOrder}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Start Building Your Order →
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Your progress will be automatically saved as you complete each step, so you don&apos;t have to worry about prefilling each step again.
            </p>
            <p className="text-xs text-gray-500">
              Enjoy your order!
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
