
import React from 'react';
import { WorkflowStep } from '../types';

interface ProgressBarProps {
  currentStep: WorkflowStep;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    WorkflowStep.CHECK_IN,
    WorkflowStep.OTP_START,
    WorkflowStep.SETUP,
    WorkflowStep.OTP_COMPLETE
  ];

  const getStepIndex = (step: WorkflowStep) => steps.indexOf(step);
  const currentIndex = getStepIndex(currentStep);

  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center justify-between mb-8 w-full">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center flex-1">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                idx <= currentIndex 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-200 text-slate-400'
              }`}
            >
              {idx + 1}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div 
              className={`flex-1 h-0.5 transition-all duration-500 ${
                idx < currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;
