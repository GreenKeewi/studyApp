'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, FontSize, AIMode } from '@/types';

interface SettingsContextType {
  theme: Theme;
  fontSize: FontSize;
  reducedMotion: boolean;
  dyslexicFont: boolean;
  defaultAIMode: AIMode;
  confettiEnabled: boolean;
  voiceAutoPlay: boolean;
  voiceSpeed: number;
  dueDateOffset: number;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setReducedMotion: (enabled: boolean) => void;
  setDyslexicFont: (enabled: boolean) => void;
  setDefaultAIMode: (mode: AIMode) => void;
  setConfettiEnabled: (enabled: boolean) => void;
  setVoiceAutoPlay: (enabled: boolean) => void;
  setVoiceSpeed: (speed: number) => void;
  setDueDateOffset: (days: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontSize, setFontSizeState] = useState<FontSize>('base');
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [dyslexicFont, setDyslexicFontState] = useState(false);
  const [defaultAIMode, setDefaultAIModeState] = useState<AIMode>('balanced');
  const [confettiEnabled, setConfettiEnabledState] = useState(true);
  const [voiceAutoPlay, setVoiceAutoPlayState] = useState(false);
  const [voiceSpeed, setVoiceSpeedState] = useState(1.0);
  const [dueDateOffset, setDueDateOffsetState] = useState(3);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('studyape-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.theme) setThemeState(settings.theme);
        if (settings.fontSize) setFontSizeState(settings.fontSize);
        if (settings.reducedMotion !== undefined) setReducedMotionState(settings.reducedMotion);
        if (settings.dyslexicFont !== undefined) setDyslexicFontState(settings.dyslexicFont);
        if (settings.defaultAIMode) setDefaultAIModeState(settings.defaultAIMode);
        if (settings.confettiEnabled !== undefined) setConfettiEnabledState(settings.confettiEnabled);
        if (settings.voiceAutoPlay !== undefined) setVoiceAutoPlayState(settings.voiceAutoPlay);
        if (settings.voiceSpeed) setVoiceSpeedState(settings.voiceSpeed);
        if (settings.dueDateOffset) setDueDateOffsetState(settings.dueDateOffset);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'dim');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.fontSize = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    }[fontSize];
  }, [fontSize]);

  // Apply dyslexic font
  useEffect(() => {
    if (dyslexicFont) {
      document.documentElement.classList.add('font-dyslexic');
    } else {
      document.documentElement.classList.remove('font-dyslexic');
    }
  }, [dyslexicFont]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      theme,
      fontSize,
      reducedMotion,
      dyslexicFont,
      defaultAIMode,
      confettiEnabled,
      voiceAutoPlay,
      voiceSpeed,
      dueDateOffset,
    };
    localStorage.setItem('studyape-settings', JSON.stringify(settings));
  }, [theme, fontSize, reducedMotion, dyslexicFont, defaultAIMode, confettiEnabled, voiceAutoPlay, voiceSpeed, dueDateOffset]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
  };

  const setDyslexicFont = (enabled: boolean) => {
    setDyslexicFontState(enabled);
  };

  const setDefaultAIMode = (mode: AIMode) => {
    setDefaultAIModeState(mode);
  };

  const setConfettiEnabled = (enabled: boolean) => {
    setConfettiEnabledState(enabled);
  };

  const setVoiceAutoPlay = (enabled: boolean) => {
    setVoiceAutoPlayState(enabled);
  };

  const setVoiceSpeed = (speed: number) => {
    setVoiceSpeedState(speed);
  };

  const setDueDateOffset = (days: number) => {
    setDueDateOffsetState(days);
  };

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
