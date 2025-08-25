'use client';

import WizardLayout from '@/components/wizard/WizardLayout';
import ReviewFinalize from '@/components/steps/ReviewFinalize';

export default function Step4Page() {
  return (
    <WizardLayout currentStepId={4}>
      <ReviewFinalize />
    </WizardLayout>
  );
}
