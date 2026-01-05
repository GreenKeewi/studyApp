'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import { Mic, Plus, Play, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lecture } from '@/types';
import { format } from 'date-fns';

export default function LecturesPage() {
  const { user, userSettings } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadLectures();
  }, [user]);

  const loadLectures = async () => {
    if (!user || !db) return;

    try {
      const lecturesRef = collection(db, 'lectures');
      const q = query(lecturesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        recordedAt: doc.data().recordedAt.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Lecture[];
      
      // Sort by recorded date descending
      data.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
      
      setLectures(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading lectures:', error);
      setLoading(false);
    }
  };

  const deleteLecture = async (lectureId: string) => {
    if (!db || !confirm('Are you sure you want to delete this lecture?')) return;

    try {
      await deleteDoc(doc(db, 'lectures', lectureId));
      await loadLectures();
    } catch (error) {
      console.error('Error deleting lecture:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <h1 className="text-3xl font-bold">Lectures</h1>
            <p className="text-dark-text-secondary mt-1">
              Record and organize your lecture audio
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Lecture
          </button>
        </div>

        {showAddForm && (
          <AddLectureForm
            onClose={() => setShowAddForm(false)}
            onSuccess={loadLectures}
          />
        )}

        {lectures.length > 0 ? (
          <div className="space-y-3">
            {lectures.map(lecture => (
              <div key={lecture.id} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mic className="text-brand-primary" size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{lecture.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-dark-text-secondary">
                          <span>{format(lecture.recordedAt, 'MMM d, yyyy')}</span>
                          <span>{formatDuration(lecture.duration)}</span>
                          {lecture.subjectId && (
                            <span className="px-2 py-1 bg-brand-primary/20 text-brand-accent rounded">
                              {lecture.subjectId}
                            </span>
                          )}
                        </div>

                        {lecture.summary && (
                          <p className="mt-3 text-dark-text-secondary line-clamp-2">
                            {lecture.summary}
                          </p>
                        )}

                        {lecture.keyPoints && lecture.keyPoints.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-1">Key Points:</div>
                            <ul className="text-sm text-dark-text-secondary space-y-1">
                              {lecture.keyPoints.slice(0, 3).map((point, i) => (
                                <li key={i}>• {point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {lecture.audioUrl && (
                          <button
                            onClick={() => window.open(lecture.audioUrl, '_blank')}
                            className="text-dark-text-tertiary hover:text-brand-primary"
                            title="Play audio"
                          >
                            <Play size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteLecture(lecture.id)}
                          className="text-dark-text-tertiary hover:text-red-500"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-dark-text-tertiary mb-4">
              <Mic size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No lectures yet</h3>
            <p className="text-dark-text-secondary mb-6">
              Record lectures to get AI-generated summaries, key points, and study notes
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Your First Lecture
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function AddLectureForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user, userSettings } = useAuth();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !title) return;

    setSaving(true);
    try {
      const newLecture: Omit<Lecture, 'id'> = {
        userId: user.uid,
        title,
        subjectId: subjectId || undefined,
        audioUrl: '', // Would be set after recording/upload
        duration: 0, // Would be calculated from audio
        notes,
        linkedToHubIds: [],
        recordedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'lectures'), newLecture);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding lecture:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Add New Lecture</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lecture title"
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subject (optional)</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="input"
          >
            <option value="">Select subject</option>
            {userSettings?.subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this lecture"
            className="input min-h-[100px]"
            rows={4}
          />
        </div>

        <div className="bg-dark-bg p-4 rounded-lg text-sm text-dark-text-secondary">
          <p>
            📝 <strong>Note:</strong> Audio recording and upload functionality requires additional setup.
            For now, you can create lecture entries and add notes manually.
          </p>
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
            disabled={saving || !title}
          >
            {saving ? 'Adding...' : 'Add Lecture'}
          </button>
        </div>
      </form>
    </div>
  );
}
