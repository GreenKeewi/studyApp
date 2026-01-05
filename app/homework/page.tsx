'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import { Plus, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Assignment, Priority } from '@/types';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import Link from 'next/link';

export default function HomeworkPage() {
  const { user, userSettings } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if (!user || !db) return;

    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('userId', '==', user.uid),
        orderBy('dueDate', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Assignment[];
      
      setAssignments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setLoading(false);
    }
  };

  const toggleComplete = async (assignment: Assignment) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'assignments', assignment.id), {
        completed: !assignment.completed,
        updatedAt: new Date(),
      });
      await loadAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'assignments', assignmentId));
      await loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const getDueDateLabel = (dueDate: Date) => {
    if (isPast(dueDate) && !isToday(dueDate)) return 'Overdue';
    if (isToday(dueDate)) return 'Due today';
    if (isTomorrow(dueDate)) return 'Due tomorrow';
    return `Due ${format(dueDate, 'MMM d')}`;
  };

  const getDueDateColor = (dueDate: Date) => {
    const offset = userSettings?.dueDateOffset || 3;
    const warningDate = addDays(new Date(), offset);
    
    if (isPast(dueDate) && !isToday(dueDate)) return 'text-red-500';
    if (isToday(dueDate)) return 'text-orange-500';
    if (dueDate <= warningDate) return 'text-yellow-500';
    return 'text-dark-text-secondary';
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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

  const activeAssignments = assignments.filter(a => !a.completed);
  const completedAssignments = assignments.filter(a => a.completed);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Homework</h1>
            <p className="text-dark-text-secondary mt-1">
              {activeAssignments.length} active assignment{activeAssignments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Assignment
          </button>
        </div>

        {/* Add Assignment Form */}
        {showAddForm && (
          <AddAssignmentForm
            onClose={() => setShowAddForm(false)}
            onSuccess={loadAssignments}
          />
        )}

        {/* Active Assignments */}
        {activeAssignments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Active Assignments</h2>
            {activeAssignments.map(assignment => (
              <div key={assignment.id} className="card p-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(assignment)}
                    className="mt-1 text-dark-text-tertiary hover:text-brand-primary transition-colors"
                  >
                    <div className="w-5 h-5 border-2 border-current rounded-full" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link 
                          href={`/homework/${assignment.id}`}
                          className="text-lg font-semibold hover:text-brand-primary transition-colors"
                        >
                          {assignment.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-sm ${getDueDateColor(assignment.dueDate)}`}>
                            <Calendar size={14} className="inline mr-1" />
                            {getDueDateLabel(assignment.dueDate)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-dark-text-tertiary hover:text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {activeAssignments.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-dark-text-tertiary mb-4">
              <CheckCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No active assignments</h3>
            <p className="text-dark-text-secondary mb-6">
              Add your first assignment to get started
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Assignment
            </button>
          </div>
        )}

        {/* Completed Assignments */}
        {completedAssignments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Completed</h2>
            {completedAssignments.map(assignment => (
              <div key={assignment.id} className="card p-4 opacity-60">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(assignment)}
                    className="mt-1 text-brand-primary"
                  >
                    <CheckCircle size={20} />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold line-through">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-dark-text-secondary mt-1">
                          Completed
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-dark-text-tertiary hover:text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function AddAssignmentForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user, userSettings } = useAuth();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !title || !dueDate) return;

    setSaving(true);
    try {
      const newAssignment: Omit<Assignment, 'id'> = {
        userId: user.uid,
        title,
        subjectId: subjectId || userSettings?.subjects[0] || 'General',
        dueDate: new Date(dueDate),
        priority,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'assignments'), newAssignment);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding assignment:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Add New Assignment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
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
          <label className="block text-sm font-medium mb-2">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  priority === p
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-dark-border hover:border-dark-text-tertiary'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
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
            disabled={saving || !title || !dueDate}
          >
            {saving ? 'Adding...' : 'Add Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
