'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import { FileText, Brain, CreditCard, TestTube, Gamepad2, Upload } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subject, Topic, StudyHub, Flashcard } from '@/types';
import { generateStudyNotes, generateFlashcards, generatePracticeQuestions } from '@/lib/ai';

export default function StudyHubPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [studyHub, setStudyHub] = useState<StudyHub | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'study' | 'flashcards' | 'test' | 'games'>('notes');

  useEffect(() => {
    loadData();
  }, [params.subjectId, params.topicId, user]);

  const loadData = async () => {
    if (!user || !db || !params.subjectId || !params.topicId) return;

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

      // Load topic
      const topicDoc = await getDoc(doc(db, 'topics', params.topicId as string));
      if (topicDoc.exists()) {
        setTopic({
          id: topicDoc.id,
          ...topicDoc.data(),
          createdAt: topicDoc.data().createdAt.toDate(),
          updatedAt: topicDoc.data().updatedAt.toDate(),
        } as Topic);
      }

      // Load or create study hub
      const hubsRef = collection(db, 'studyHubs');
      const q = query(
        hubsRef,
        where('userId', '==', user.uid),
        where('topicId', '==', params.topicId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const hubData = snapshot.docs[0].data();
        setStudyHub({
          id: snapshot.docs[0].id,
          ...hubData,
          createdAt: hubData.createdAt.toDate(),
          updatedAt: hubData.updatedAt.toDate(),
        } as StudyHub);
      } else {
        // Create new study hub
        const newHub: Omit<StudyHub, 'id'> = {
          userId: user.uid,
          topicId: params.topicId as string,
          linkedMaterialIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const hubDocRef = doc(collection(db, 'studyHubs'));
        await setDoc(hubDocRef, newHub);
        setStudyHub({ ...newHub, id: hubDocRef.id } as StudyHub);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
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

  if (!subject || !topic) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
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
        {/* Header */}
        <div>
          <button
            onClick={() => router.push(`/study/${subject.id}`)}
            className="text-dark-text-secondary hover:text-dark-text-primary mb-4"
          >
            ← Back to {subject.name}
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-brand-primary/20 flex items-center justify-center text-3xl">
              {subject.icon || '📚'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{topic.name}</h1>
              <p className="text-dark-text-secondary mt-1">{subject.name}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <TabButton
            icon={<FileText size={20} />}
            label="Study Notes"
            active={activeTab === 'notes'}
            onClick={() => setActiveTab('notes')}
          />
          <TabButton
            icon={<Brain size={20} />}
            label="Smart Study"
            active={activeTab === 'study'}
            onClick={() => setActiveTab('study')}
          />
          <TabButton
            icon={<CreditCard size={20} />}
            label="Flashcards"
            active={activeTab === 'flashcards'}
            onClick={() => setActiveTab('flashcards')}
          />
          <TabButton
            icon={<TestTube size={20} />}
            label="Test Mode"
            active={activeTab === 'test'}
            onClick={() => setActiveTab('test')}
          />
          <TabButton
            icon={<Gamepad2 size={20} />}
            label="Games"
            active={activeTab === 'games'}
            onClick={() => setActiveTab('games')}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'notes' && <StudyNotesTab topic={topic} studyHub={studyHub} />}
        {activeTab === 'study' && <SmartStudyTab topic={topic} />}
        {activeTab === 'flashcards' && <FlashcardsTab topic={topic} />}
        {activeTab === 'test' && <TestModeTab topic={topic} />}
        {activeTab === 'games' && <GamesTab topic={topic} />}
      </div>
    </AppLayout>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
        active
          ? 'bg-brand-primary text-white'
          : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-border'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StudyNotesTab({ topic, studyHub }: { topic: Topic; studyHub: StudyHub | null }) {
  const [notes, setNotes] = useState(studyHub?.notes || '');
  const [generating, setGenerating] = useState(false);

  const generateNotes = async () => {
    setGenerating(true);
    try {
      const generatedNotes = await generateStudyNotes(topic.name);
      setNotes(generatedNotes);
      
      // Save notes to Firestore
      if (studyHub && db) {
        await setDoc(doc(db, 'studyHubs', studyHub.id), {
          ...studyHub,
          notes: generatedNotes,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Study Notes</h2>
        <button
          onClick={generateNotes}
          disabled={generating}
          className="btn btn-primary"
        >
          {generating ? 'Generating...' : notes ? 'Regenerate Notes' : 'Generate Notes'}
        </button>
      </div>

      {notes ? (
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{notes}</div>
        </div>
      ) : (
        <div className="text-center py-12 text-dark-text-secondary">
          <FileText size={48} className="mx-auto mb-4" />
          <p>No study notes yet. Click "Generate Notes" to create AI-powered study notes.</p>
        </div>
      )}
    </div>
  );
}

function SmartStudyTab({ topic }: { topic: Topic }) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const newQuestions = await generatePracticeQuestions(topic.name, 'medium', 1);
      setQuestions([...questions, ...newQuestions]);
      setUserAnswer('');
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
    } else {
      loadQuestion();
    }
  };

  useEffect(() => {
    if (questions.length === 0) {
      loadQuestion();
    }
  }, []);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-6">Smart Study</h2>

      {loading && questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-dark-text-secondary">Generating question...</p>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-dark-bg p-6 rounded-lg">
            <div className="text-sm text-dark-text-secondary mb-2">
              Question {currentQuestionIndex + 1}
            </div>
            <p className="text-lg">{questions[currentQuestionIndex]}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Answer</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="input min-h-[120px]"
              rows={5}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={nextQuestion}
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Loading...' : 'Next Question'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FlashcardsTab({ topic }: { topic: Topic }) {
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([]);
  const [generating, setGenerating] = useState(false);

  const generateCards = async () => {
    setGenerating(true);
    try {
      const cards = await generateFlashcards(topic.name);
      setFlashcards(cards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Flashcards</h2>
        <button
          onClick={generateCards}
          disabled={generating}
          className="btn btn-primary"
        >
          {generating ? 'Generating...' : flashcards.length > 0 ? 'Generate More' : 'Generate Flashcards'}
        </button>
      </div>

      {flashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flashcards.map((card, index) => (
            <div key={index} className="bg-dark-bg p-6 rounded-lg">
              <div className="font-semibold mb-2 text-brand-primary">Q:</div>
              <p className="mb-4">{card.front}</p>
              <div className="font-semibold mb-2 text-brand-accent">A:</div>
              <p className="text-dark-text-secondary">{card.back}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-dark-text-secondary">
          <CreditCard size={48} className="mx-auto mb-4" />
          <p>No flashcards yet. Click "Generate Flashcards" to create AI-powered flashcards.</p>
        </div>
      )}
    </div>
  );
}

function TestModeTab({ topic }: { topic: Topic }) {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Test Mode</h2>
      <p className="text-dark-text-secondary">
        Test mode coming soon! Configure timed tests with various difficulty levels.
      </p>
    </div>
  );
}

function GamesTab({ topic }: { topic: Topic }) {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Learning Games</h2>
      <p className="text-dark-text-secondary">
        Puzzle-based learning games coming soon!
      </p>
    </div>
  );
}
