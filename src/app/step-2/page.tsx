'use client';

import WizardLayout from '@/components/wizard/WizardLayout';
import ProductPlanForm from '@/components/steps/ProductPlanForm';

export default function Step2Page() {
  return (
    <WizardLayout currentStepId={2}>
      <ProductPlanForm />
    </WizardLayout>
  );
}
