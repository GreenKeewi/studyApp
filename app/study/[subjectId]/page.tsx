'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subject, Topic } from '@/types';
import Link from 'next/link';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadSubjectAndTopics();
  }, [params.subjectId, user]);

  const loadSubjectAndTopics = async () => {
    if (!user || !db || !params.subjectId) return;

    try {
      // Load subject
      const subjectDoc = await getDoc(doc(db, 'subjects', params.subjectId as string));
      if (subjectDoc.exists()) {
        setSubject({
          id: subjectDoc.id,
          ...subjectDoc.data(),
          createdAt: subjectDoc.data().createdAt.toDate(),
          updatedAt: subjectDoc.data().updatedAt.toDate(),
        } as Subject);
      }

      // Load topics
      const topicsRef = collection(db, 'topics');
      const q = query(
        topicsRef,
        where('userId', '==', user.uid),
        where('subjectId', '==', params.subjectId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Topic[];
      
      setTopics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!db || !confirm('Are you sure you want to delete this topic?')) return;

    try {
      await deleteDoc(doc(db, 'topics', topicId));
      await loadSubjectAndTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
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

  if (!subject) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
          <button onClick={() => router.push('/study')} className="btn btn-primary">
            Back to Study
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.push('/study')}
            className="text-dark-text-secondary hover:text-dark-text-primary mb-4"
          >
            ← Back to Study
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-brand-primary/20 flex items-center justify-center text-3xl">
              {subject.icon || '📚'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{subject.name}</h1>
              <p className="text-dark-text-secondary mt-1">
                {topics.length} topic{topics.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Topic
          </button>
        </div>

        {showAddForm && (
          <AddTopicForm
            subjectId={subject.id}
            onClose={() => setShowAddForm(false)}
            onSuccess={loadSubjectAndTopics}
          />
        )}

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(topic => (
              <Link
                key={topic.id}
                href={`/study/${subject.id}/${topic.id}`}
                className="card p-6 hover:border-brand-primary transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-primary transition-colors">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-dark-text-secondary line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteTopic(topic.id);
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
            <h3 className="text-xl font-semibold mb-2">No topics yet</h3>
            <p className="text-dark-text-secondary mb-6">
              Add topics to organize your study materials
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Your First Topic
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function AddTopicForm({
  subjectId,
  onClose,
  onSuccess,
}: {
  subjectId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !name) return;

    setSaving(true);
    try {
      const newTopic: Omit<Topic, 'id'> = {
        userId: user.uid,
        subjectId,
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'topics'), newTopic);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding topic:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Add New Topic</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Topic Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Calculus, Organic Chemistry"
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this topic covers"
            className="input min-h-[80px]"
            rows={3}
          />
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
            {saving ? 'Adding...' : 'Add Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}
