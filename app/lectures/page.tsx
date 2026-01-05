'use client';

import AppLayout from '@/components/navigation/AppLayout';
import { Mic, Plus } from 'lucide-react';

export default function LecturesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lectures</h1>
            <p className="text-dark-text-secondary mt-1">
              Record and organize your lecture audio
            </p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Record Lecture
          </button>
        </div>

        <div className="card p-12 text-center">
          <div className="text-dark-text-tertiary mb-4">
            <Mic size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No lectures yet</h3>
          <p className="text-dark-text-secondary mb-6">
            Record lectures to get AI-generated summaries, key points, and study notes
          </p>
          <button className="btn btn-primary">
            Record Your First Lecture
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
