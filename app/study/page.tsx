'use client';

import AppLayout from '@/components/navigation/AppLayout';
import { BookOpen, Plus } from 'lucide-react';

export default function StudyPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Study</h1>
            <p className="text-dark-text-secondary mt-1">
              Organize your learning by subject and topic
            </p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        <div className="card p-12 text-center">
          <div className="text-dark-text-tertiary mb-4">
            <BookOpen size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start organizing your studies</h3>
          <p className="text-dark-text-secondary mb-6">
            Create subjects and topics to access study notes, flashcards, tests, and more
          </p>
          <button className="btn btn-primary">
            Create Your First Subject
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
