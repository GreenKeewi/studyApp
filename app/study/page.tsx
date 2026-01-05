'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subject } from '@/types';
import Link from 'next/link';

export default function StudyPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [user]);

  const loadSubjects = async () => {
    if (!user || !db) return;

    try {
      const subjectsRef = collection(db, 'subjects');
      const q = query(subjectsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Subject[];
      
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setLoading(false);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (!db || !confirm('Are you sure you want to delete this subject?')) return;

    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      await loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Study</h1>
            <p className="text-dark-text-secondary mt-1">
              Organize your learning by subject and topic
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        {showAddForm && (
          <AddSubjectForm
            onClose={() => setShowAddForm(false)}
            onSuccess={loadSubjects}
          />
        )}

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <Link
                key={subject.id}
                href={`/study/${subject.id}`}
                className="card p-6 hover:border-brand-primary transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg bg-brand-primary/20 flex items-center justify-center text-2xl">
                        {subject.icon || '📚'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-brand-primary transition-colors">
                          {subject.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteSubject(subject.id);
                    }}
                    className="text-dark-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-dark-text-tertiary mb-4">
              <BookOpen size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start organizing your studies</h3>
            <p className="text-dark-text-secondary mb-6">
              Create subjects and topics to access study notes, flashcards, tests, and more
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Create Your First Subject
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function AddSubjectForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [saving, setSaving] = useState(false);

  const commonIcons = ['📚', '🔢', '🧪', '🌍', '💻', '🎨', '🎵', '⚽', '📖', '✍️'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !name) return;

    setSaving(true);
    try {
      const newSubject: Omit<Subject, 'id'> = {
        userId: user.uid,
        name,
        icon,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'subjects'), newSubject);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding subject:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Add New Subject</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Subject Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mathematics, Physics, History"
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {commonIcons.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`w-12 h-12 rounded-lg border-2 text-2xl transition-all ${
                  icon === emoji
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-dark-border hover:border-dark-text-tertiary'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={saving || !name}
          >
            {saving ? 'Adding...' : 'Add Subject'}
          </button>
        </div>
      </form>
    </div>
  );
}
