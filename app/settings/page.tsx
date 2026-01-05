'use client';

import AppLayout from '@/components/navigation/AppLayout';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Theme, FontSize, AIMode } from '@/types';

export default function SettingsPage() {
  const {
    theme,
    fontSize,
    reducedMotion,
    dyslexicFont,
    defaultAIMode,
    confettiEnabled,
    voiceAutoPlay,
    voiceSpeed,
    dueDateOffset,
    setTheme,
    setFontSize,
    setReducedMotion,
    setDyslexicFont,
    setDefaultAIMode,
    setConfettiEnabled,
    setVoiceAutoPlay,
    setVoiceSpeed,
    setDueDateOffset,
  } = useSettings();

  const { updateUserSettings } = useAuth();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    updateUserSettings({ theme: newTheme });
  };

  const handleFontSizeChange = (newSize: FontSize) => {
    setFontSize(newSize);
    updateUserSettings({ fontSize: newSize });
  };

  const handleAIModeChange = (newMode: AIMode) => {
    setDefaultAIMode(newMode);
    updateUserSettings({ defaultAIMode: newMode });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-dark-text-secondary mt-1">
            Customize your StudyApe experience
          </p>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'dim'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      theme === t
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-dark-border hover:border-dark-text-tertiary'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <div className="flex gap-2">
                {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      fontSize === size
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-dark-border hover:border-dark-text-tertiary'
                    }`}
                  >
                    {size === 'sm' ? 'Small' : size === 'base' ? 'Default' : size === 'lg' ? 'Large' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexic Font */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dyslexia-friendly font</div>
                <div className="text-sm text-dark-text-secondary">Use OpenDyslexic font</div>
              </div>
              <button
                onClick={() => {
                  setDyslexicFont(!dyslexicFont);
                  updateUserSettings({ dyslexicFont: !dyslexicFont });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  dyslexicFont ? 'bg-brand-primary' : 'bg-dark-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    dyslexicFont ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Reduced motion</div>
                <div className="text-sm text-dark-text-secondary">Minimize animations</div>
              </div>
              <button
                onClick={() => {
                  setReducedMotion(!reducedMotion);
                  updateUserSettings({ reducedMotion: !reducedMotion });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  reducedMotion ? 'bg-brand-primary' : 'bg-dark-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    reducedMotion ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          
          <div className="space-y-4">
            {/* Default AI Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">Default Explanation Mode</label>
              <div className="space-y-2">
                {(['guided', 'balanced', 'direct'] as AIMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleAIModeChange(mode)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      defaultAIMode === mode
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-dark-border hover:border-dark-text-tertiary'
                    }`}
                  >
                    <div className="font-medium">
                      {mode === 'guided' ? 'Guided (Socratic)' : mode === 'balanced' ? 'Balanced' : 'Direct'}
                    </div>
                    <div className="text-sm text-dark-text-secondary">
                      {mode === 'guided' && 'Guide with questions'}
                      {mode === 'balanced' && 'Mix of guidance and explanations'}
                      {mode === 'direct' && 'Step-by-step solutions'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div>
              <label className="block text-sm font-medium mb-2">Voice Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => {
                  const speed = parseFloat(e.target.value);
                  setVoiceSpeed(speed);
                  updateUserSettings({ voiceSpeed: speed });
                }}
                className="w-full"
              />
              <div className="text-sm text-dark-text-secondary text-center mt-1">
                {voiceSpeed.toFixed(1)}x
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-play voice</div>
                <div className="text-sm text-dark-text-secondary">Automatically play AI explanations</div>
              </div>
              <button
                onClick={() => {
                  setVoiceAutoPlay(!voiceAutoPlay);
                  updateUserSettings({ voiceAutoPlay: !voiceAutoPlay });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  voiceAutoPlay ? 'bg-brand-primary' : 'bg-dark-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    voiceAutoPlay ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            {/* Due Date Warning */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Due date early warning (days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={dueDateOffset}
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  setDueDateOffset(days);
                  updateUserSettings({ dueDateOffset: days });
                }}
                className="input max-w-xs"
              />
              <div className="text-sm text-dark-text-secondary mt-1">
                Show assignments as urgent {dueDateOffset} days before due date
              </div>
            </div>

            {/* Confetti */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Celebration effects</div>
                <div className="text-sm text-dark-text-secondary">Show confetti for milestones</div>
              </div>
              <button
                onClick={() => {
                  setConfettiEnabled(!confettiEnabled);
                  updateUserSettings({ confettiEnabled: !confettiEnabled });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  confettiEnabled ? 'bg-brand-primary' : 'bg-dark-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    confettiEnabled ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
