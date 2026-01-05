'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EducationLevel, AIMode, Theme, FontSize } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUserSettings } = useAuth();
  
  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('high-school');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [aiMode, setAIMode] = useState<AIMode>('balanced');
  const [theme, setTheme] = useState<Theme>('dark');
  const [fontSize, setFontSize] = useState<FontSize>('base');

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const completeOnboarding = async () => {
    await updateUserSettings({
      educationLevel,
      subjects,
      defaultAIMode: aiMode,
      theme,
      fontSize,
      onboardingCompleted: true,
    });
    router.push('/dashboard');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true; // Education level always has a default
      case 2: return subjects.length > 0;
      case 3: return true; // AI mode always has a default
      case 4: return true; // Theme always has a default
      case 5: return true; // Font size always has a default
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-full h-1 mx-1 rounded-full transition-colors ${
                  s <= step ? 'bg-brand-primary' : 'bg-dark-border'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-dark-text-secondary text-sm">
            Step {step} of 5
          </p>
        </div>

        {/* Step content */}
        <div className="card p-8">
          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to StudyApe! 🎓</h1>
              <p className="text-dark-text-secondary mb-8">
                Let's personalize your learning experience
              </p>
              
              <h2 className="text-xl font-semibold mb-4">What's your education level?</h2>
              <div className="space-y-3">
                {(['middle-school', 'high-school', 'university'] as EducationLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setEducationLevel(level)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      educationLevel === level
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-dark-border hover:border-dark-text-tertiary'
                    }`}
                  >
                    <div className="font-semibold">
                      {level === 'middle-school' && 'Middle School'}
                      {level === 'high-school' && 'High School'}
                      {level === 'university' && 'University'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">What subjects are you studying?</h2>
              <p className="text-dark-text-secondary mb-6">
                Add the subjects you want help with
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  placeholder="e.g., Mathematics, Physics, History..."
                  className="input flex-1"
                />
                <button
                  onClick={addSubject}
                  className="btn btn-primary"
                  disabled={!newSubject.trim()}
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[100px]">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-primary/20 text-brand-accent rounded-lg"
                  >
                    <span>{subject}</span>
                    <button
                      onClick={() => removeSubject(subject)}
                      className="text-dark-text-tertiary hover:text-dark-text-primary"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose your AI explanation style</h2>
              <p className="text-dark-text-secondary mb-6">
                You can change this anytime
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setAIMode('guided')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    aiMode === 'guided'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-dark-border hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="font-semibold mb-1">Guided (Socratic)</div>
                  <div className="text-sm text-dark-text-secondary">
                    I'll guide you with questions to help you discover answers yourself
                  </div>
                </button>

                <button
                  onClick={() => setAIMode('balanced')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    aiMode === 'balanced'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-dark-border hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="font-semibold mb-1">Balanced (Recommended)</div>
                  <div className="text-sm text-dark-text-secondary">
                    I'll provide explanations and ask questions to check understanding
                  </div>
                </button>

                <button
                  onClick={() => setAIMode('direct')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    aiMode === 'direct'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-dark-border hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="font-semibold mb-1">Direct (Step-by-step)</div>
                  <div className="text-sm text-dark-text-secondary">
                    I'll provide complete step-by-step explanations
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose your theme</h2>
              <p className="text-dark-text-secondary mb-6">
                Pick a theme that's easy on your eyes
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    theme === 'light'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-dark-border hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="font-semibold">Light</div>
                  <div className="text-sm text-dark-text-secondary">
                    Bright and clean
                  </div>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    theme === 'dark'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-dark-border hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="font-semibold">Dark (Default)</div>
                  <div className="text-sm text-dark-text-secondary">
                    Easy on the eyes for long study sessions
                  </div>
                </button>

                <button
                  onClick={() => setTheme('dim')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    theme === 'dim'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-dark-border hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="font-semibold">Dim</div>
                  <div className="text-sm text-dark-text-secondary">
                    Low brightness for night study
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose your font size</h2>
              <p className="text-dark-text-secondary mb-6">
                Pick a size that's comfortable to read
              </p>
              
              <div className="space-y-3">
                {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      fontSize === size
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-dark-border hover:border-dark-text-tertiary'
                    }`}
                  >
                    <div
                      className={`font-semibold ${
                        size === 'sm' ? 'text-sm' :
                        size === 'base' ? 'text-base' :
                        size === 'lg' ? 'text-lg' :
                        'text-xl'
                      }`}
                    >
                      {size === 'sm' && 'Small'}
                      {size === 'base' && 'Default'}
                      {size === 'lg' && 'Large'}
                      {size === 'xl' && 'Extra Large'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="btn btn-secondary"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn btn-primary flex-1"
            >
              {step === 5 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
