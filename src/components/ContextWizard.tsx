// src/components/ContextWizard.tsx
import React, { useState } from 'react';
import { Task } from '../App';

export type ContextWizardProps = {
  tasks: Task[];
  onClose: () => void;
  generalTasks: string[];
};

const ContextWizard: React.FC<ContextWizardProps> = ({ tasks, onClose, generalTasks }) => {
  const [step, setStep] = useState(0);
  const choices = tasks.length > 0
    ? tasks
    : generalTasks.map((t, i) => ({
        id: `g${i}`,
        title: t,
        dueDate: null,
        status: 'pending' as const,
      }));
  const suggestion = choices[0];

  return (
    <div className="wizard-overlay">
      <div className="wizard-card">
        {step === 0 && (
          <>
            <h2>How much time do you have?</h2>
            {[5, 10, 20, 30].map(n => (
              <button key={n} onClick={() => setStep(1)}>{n} min</button>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <h2>Energy level?</h2>
            {['High','Medium','Low'].map(l => (
              <button key={l} onClick={() => setStep(2)}>{l}</button>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <h2>What’s blocking you?</h2>
            {['Too many choices','Decision fatigue','Quick win','Other'].map(b => (
              <button key={b} onClick={() => setStep(3)}>{b}</button>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <h2>How about:</h2>
            <p><strong>{suggestion.title}</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={onClose}>Do it</button>
              <button onClick={onClose}>Not now</button>
            </div>
          </>
        )}
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}>Back</button>
        )}
      </div>
    </div>
  );
};

export default ContextWizard