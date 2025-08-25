'use client';

import WizardLayout from '@/components/wizard/WizardLayout';
import CustomerForm from '@/components/steps/CustomerForm';

export default function Step1Page() {
  return (
    <WizardLayout currentStepId={1}>
      <CustomerForm />
    </WizardLayout>
  );
}
