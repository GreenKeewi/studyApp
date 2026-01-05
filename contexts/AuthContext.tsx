'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserSettings } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userSettings: UserSettings | null;
  loading: boolean;
  signInAnon: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        // Load user settings from Firestore
        const settingsDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (settingsDoc.exists()) {
          setUserSettings(settingsDoc.data() as UserSettings);
        } else {
          // Create default settings for new user
          const defaultSettings: UserSettings = {
            userId: firebaseUser.uid,
            educationLevel: 'high-school',
            subjects: [],
            defaultAIMode: 'balanced',
            theme: 'dark',
            fontSize: 'base',
            reducedMotion: false,
            dyslexicFont: false,
            confettiEnabled: true,
            voiceAutoPlay: false,
            voiceSpeed: 1.0,
            dueDateOffset: 3,
            dashboardLayout: ['assignments', 'streak', 'tests', 'weakTopics', 'motivation'],
            dashboardWidgets: {
              assignments: true,
              streak: true,
              tests: true,
              weakTopics: true,
              motivation: true,
            },
            studyReminders: true,
            onboardingCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), defaultSettings);
          setUserSettings(defaultSettings);
        }
      } else {
        setUserSettings(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAnon = async () => {
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase auth not initialized');
    
    try {
      await firebaseSignOut(auth);
      setUserSettings(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    if (!user || !db) return;

    try {
      const updatedSettings = {
        ...userSettings,
        ...settings,
        updatedAt: new Date(),
      } as UserSettings;

      await setDoc(doc(db, 'users', user.uid), updatedSettings);
      setUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userSettings,
        loading,
        signInAnon,
        signOut,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
