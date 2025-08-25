'use client';

import WizardLayout from '@/components/wizard/WizardLayout';
import ContractForm from '@/components/steps/ContractForm';

export default function Step3Page() {
  return (
    <WizardLayout currentStepId={3}>
      <ContractForm />
    </WizardLayout>
  );
}
