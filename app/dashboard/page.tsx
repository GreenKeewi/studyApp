'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import { Calendar, Flame, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Assignment, Streak, WeakSkill, Test } from '@/types';
import { format, isAfter, isBefore, addDays } from 'date-fns';

export default function DashboardPage() {
  const { user, userSettings } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !db) return;

      try {
        // Load upcoming assignments
        const assignmentsRef = collection(db, 'assignments');
        const assignmentsQuery = query(
          assignmentsRef,
          where('userId', '==', user.uid),
          where('completed', '==', false),
          orderBy('dueDate', 'asc'),
          limit(5)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        const assignmentsData = assignmentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Assignment[];
        setAssignments(assignmentsData);

        // Load streak
        const streakSnap = await getDocs(
          query(collection(db, 'streaks'), where('userId', '==', user.uid))
        );
        if (!streakSnap.empty) {
          const streakData = streakSnap.docs[0].data();
          setStreak({
            ...streakData,
            lastStudyDate: streakData.lastStudyDate.toDate(),
            updatedAt: streakData.updatedAt.toDate(),
          } as Streak);
        } else {
          // Initialize streak
          setStreak({
            userId: user.uid,
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: new Date(),
            multiplier: 1,
            updatedAt: new Date(),
          });
        }

        // Load upcoming tests
        const testsRef = collection(db, 'tests');
        const testsQuery = query(
          testsRef,
          where('userId', '==', user.uid),
          where('completed', '==', false),
          limit(3)
        );
        const testsSnap = await getDocs(testsQuery);
        const testsData = testsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          startedAt: doc.data().startedAt?.toDate(),
          completedAt: doc.data().completedAt?.toDate(),
        })) as Test[];
        setUpcomingTests(testsData);

        // Load weak topics
        const weakSkillsRef = collection(db, 'weakSkills');
        const weakSkillsQuery = query(
          weakSkillsRef,
          where('userId', '==', user.uid),
          orderBy('improvementScore', 'asc'),
          limit(5)
        );
        const weakSkillsSnap = await getDocs(weakSkillsQuery);
        const weakSkillsData = weakSkillsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          detectedAt: doc.data().detectedAt.toDate(),
          lastPracticedAt: doc.data().lastPracticedAt?.toDate(),
        })) as WeakSkill[];
        setWeakTopics(weakSkillsData);

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getMotivationMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to learn something new?";
    if (hour < 18) return "Good afternoon! Keep up the great work!";
    return "Good evening! Time for some focused studying.";
  };

  const getDueDateColor = (dueDate: Date) => {
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const offset = userSettings?.dueDateOffset || 3;

    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= offset) return 'text-orange-500';
    return 'text-dark-text-secondary';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-text-secondary mt-1">{getMotivationMessage()}</p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Upcoming Assignments Widget */}
          {userSettings?.dashboardWidgets?.assignments !== false && (
            <div className="card p-6 col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-brand-primary" size={20} />
                <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
              </div>
              
              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-dark-text-secondary text-sm">No upcoming assignments</p>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.title}</p>
                        <p className={`text-sm ${getDueDateColor(assignment.dueDate)}`}>
                          Due {format(assignment.dueDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        assignment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        assignment.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {assignment.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Study Streak Widget */}
          {userSettings?.dashboardWidgets?.streak !== false && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-orange-500" size={20} />
                <h2 className="text-xl font-semibold">Study Streak</h2>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  {streak?.currentStreak || 0}
                </div>
                <p className="text-dark-text-secondary">
                  {streak?.currentStreak === 1 ? 'day' : 'days'} streak
                </p>
                <p className="text-sm text-dark-text-tertiary mt-2">
                  Longest: {streak?.longestStreak || 0} days
                </p>
              </div>
            </div>
          )}

          {/* Upcoming Tests Widget */}
          {userSettings?.dashboardWidgets?.tests !== false && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-brand-primary" size={20} />
                <h2 className="text-xl font-semibold">Upcoming Tests</h2>
              </div>
              
              <div className="space-y-3">
                {upcomingTests.length === 0 ? (
                  <p className="text-dark-text-secondary text-sm">No upcoming tests</p>
                ) : (
                  upcomingTests.map((test) => (
                    <div key={test.id}>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-dark-text-secondary">
                        {test.questionCount} questions · {test.difficulty}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Weak Topics Widget */}
          {userSettings?.dashboardWidgets?.weakTopics !== false && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-brand-primary" size={20} />
                <h2 className="text-xl font-semibold">Areas to Improve</h2>
              </div>
              
              <div className="space-y-3">
                {weakTopics.length === 0 ? (
                  <p className="text-dark-text-secondary text-sm">No weak areas detected yet</p>
                ) : (
                  weakTopics.map((skill) => (
                    <div key={skill.id}>
                      <p className="font-medium">{skill.skill}</p>
                      <div className="w-full bg-dark-border rounded-full h-2 mt-1">
                        <div
                          className="bg-brand-primary h-2 rounded-full transition-all"
                          style={{ width: `${skill.improvementScore}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Motivation Message Widget */}
          {userSettings?.dashboardWidgets?.motivation !== false && (
            <div className="card p-6 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-brand-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-brand-primary" size={20} />
                <h2 className="text-xl font-semibold">Daily Motivation</h2>
              </div>
              
              <p className="text-dark-text-primary italic">
                "The expert in anything was once a beginner."
              </p>
              <p className="text-sm text-dark-text-secondary mt-2">
                Keep pushing forward, every study session counts!
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
