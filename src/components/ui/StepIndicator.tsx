"use client";
import { ComponentType } from "react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {steps.map((step) => {
        const Icon = step.icon;
        const isActive = currentStep >= step.id;
        
        return (
          <div
            key={step.id}
            className={`text-center p-4 rounded-lg border ${
              isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <Icon className={`w-8 h-8 mx-auto mb-2 ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div className="font-medium text-sm">{step.title}</div>
            <div className="text-xs text-gray-500">{step.description}</div>
          </div>
        );
      })}
    </div>
  );
}
