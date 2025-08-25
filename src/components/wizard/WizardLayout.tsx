'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStep, goToStep } from '@/store/orderStore';
import { wizardSteps } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from "next/link";

interface WizardLayoutProps {
  children: React.ReactNode;
  currentStepId: number;
}

export default function WizardLayout({ children, currentStepId }: WizardLayoutProps) {
  const router = useRouter();
  const currentStep = useCurrentStep();

  const handleStepClick = (stepId: number) => {
    // Allow navigation only to current or completed steps
    if (stepId <= currentStep) {
      goToStep(stepId);
      const targetStep = wizardSteps.find(s => s.id === stepId);
      if (targetStep) {
        router.push(`${targetStep.path}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Builder</h1>
          </Link>
          <p className="text-lg text-gray-600">Create your order step by step</p>
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-1 sm:space-x-4 mb-6">
            {wizardSteps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const isCompleted = step.id < currentStep;
              const isAccessible = step.id <= currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    {/* Step Circle */}
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={!isAccessible}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg scale-110'
                          : isCompleted
                          ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                          : isAccessible
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      {isCompleted ? '✓' : step.id}
                    </button>
                    
                    {/* Step Label - Hidden on mobile */}
                    <div className="hidden sm:block mt-2 text-center">
                      <div className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 max-w-[140px]">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Step Connector */}
                  {index < wizardSteps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2 sm:mx-4 transition-colors duration-200',
                      step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Step Title */}
          <div className="sm:hidden text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Step {currentStepId}: {wizardSteps.find(s => s.id === currentStepId)?.title}
            </h2>
            <p className="text-sm text-gray-600">
              {wizardSteps.find(s => s.id === currentStepId)?.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {wizardSteps.find(s => s.id === currentStepId)?.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {wizardSteps.find(s => s.id === currentStepId)?.description}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:flex">
                  Step {currentStepId} of {wizardSteps.length}
                </Badge>
              </div>
            </div>
            
            {children}
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStepId / wizardSteps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStepId / wizardSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wizard Navigation Buttons Component
interface WizardNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  submitLabel?: string;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
  isSubmitDisabled?: boolean;
  isLoading?: boolean;
  showNext?: boolean;
  showPrevious?: boolean;
  showSubmit?: boolean;
}

export function WizardNavigation({
  onNext,
  onPrevious,
  onSubmit,
  nextLabel = 'Next Step',
  prevLabel = 'Previous',
  submitLabel = 'Submit',
  isNextDisabled = false,
  isPrevDisabled = false,
  isSubmitDisabled = false,
  isLoading = false,
  showNext = true,
  showPrevious = true,
  showSubmit = false
}: WizardNavigationProps) {
  const currentStep = useCurrentStep();

  return (
    <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
      <div>
        {showPrevious && currentStep > 1 && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isPrevDisabled || isLoading}
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              'border border-gray-300 text-gray-700 hover:bg-gray-50',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            ← {prevLabel}
          </button>
        )}
      </div>

      <div className="flex space-x-3">
        {showNext && currentStep < wizardSteps.length && (
          <button
            type="button"
            data-testid="wizardNext"
            onClick={onNext}
            disabled={isNextDisabled || isLoading}
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              'bg-blue-600 text-white hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Loading...' : `${nextLabel} →`}
          </button>
        )}

        {showSubmit && (
          <button
            type="submit"
            data-testid="wizardSubmit"
            onClick={onSubmit}
            disabled={isSubmitDisabled || isLoading}
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              'bg-green-600 text-white hover:bg-green-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Processing...' : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
