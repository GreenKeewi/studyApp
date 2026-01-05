'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import AppLayout from '@/components/navigation/AppLayout';
import { Upload, Camera, FileText, ChevronRight, Check } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Assignment, Question, SolutionStep, AIMode } from '@/types';
import { useDropzone } from 'react-dropzone';
import { extractQuestionsFromImage, generateStepBySolution } from '@/lib/ai';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { defaultAIMode } = useSettings();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [params.id, user]);

  const loadAssignment = async () => {
    if (!user || !db || !params.id) return;

    try {
      const docRef = doc(db, 'assignments', params.id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAssignment({
          id: docSnap.id,
          ...data,
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Assignment);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading assignment:', error);
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!db || !storage || !assignment || acceptedFiles.length === 0) return;

    setUploadingFile(true);
    try {
      const file = acceptedFiles[0];
      const fileRef = ref(storage, `assignments/${user?.uid}/${assignment.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Extract questions if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (!db) return; // Add check here
          
          const base64 = e.target?.result as string;
          const base64Data = base64.split(',')[1];
          
          try {
            const extractedQuestions = await extractQuestionsFromImage(base64Data);
            
            // Create questions from extracted text
            const newQuestions: Question[] = extractedQuestions.map((q, i) => ({
              id: `q-${Date.now()}-${i}`,
              assignmentId: assignment.id,
              content: q,
              imageUrl: fileUrl,
              completed: false,
              createdAt: new Date(),
            }));

            // Update assignment with new questions
            await updateDoc(doc(db, 'assignments', assignment.id), {
              questions: arrayUnion(...newQuestions),
              updatedAt: new Date(),
            });

            await loadAssignment();
          } catch (error) {
            console.error('Error extracting questions:', error);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!assignment) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Assignment not found</h2>
          <button onClick={() => router.push('/homework')} className="btn btn-primary">
            Back to Homework
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
            onClick={() => router.push('/homework')}
            className="text-dark-text-secondary hover:text-dark-text-primary mb-4"
          >
            ← Back to Homework
          </button>
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-dark-text-secondary mt-1">
            {assignment.subjectId}
          </p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`card p-8 border-2 border-dashed cursor-pointer transition-all ${
            isDragActive ? 'border-brand-primary bg-brand-primary/10' : 'border-dark-border'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <Upload size={32} className="text-brand-primary" />
              <Camera size={32} className="text-brand-primary" />
              <FileText size={32} className="text-brand-primary" />
            </div>
            {uploadingFile ? (
              <p className="text-lg">Processing...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop your file here' : 'Upload questions or take a photo'}
                </p>
                <p className="text-sm text-dark-text-secondary">
                  Supports images and PDFs
                </p>
              </>
            )}
          </div>
        </div>

        {/* Questions List */}
        {assignment.questions && assignment.questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            {assignment.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                assignmentId={assignment.id}
                onUpdate={loadAssignment}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function QuestionCard({
  question,
  index,
  assignmentId,
  onUpdate,
}: {
  question: Question;
  index: number;
  assignmentId: string;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatingStep, setGeneratingStep] = useState(false);
  const { defaultAIMode } = useSettings();

  const generateNextStep = async () => {
    if (!db) return;

    setGeneratingStep(true);
    try {
      const previousSteps = question.steps?.slice(0, currentStep).map(s => s.explanation) || [];
      const stepExplanation = await generateStepBySolution(
        question.content,
        defaultAIMode,
        previousSteps
      );

      const newStep: SolutionStep = {
        id: `step-${Date.now()}`,
        questionId: question.id,
        stepNumber: currentStep + 1,
        explanation: stepExplanation,
        confirmed: false,
        aiMode: defaultAIMode,
        createdAt: new Date(),
      };

      // Update question with new step
      const updatedSteps = [...(question.steps || []), newStep];
      await updateDoc(doc(db, 'assignments', assignmentId), {
        [`questions.${index}.steps`]: updatedSteps,
        updatedAt: new Date(),
      });

      onUpdate();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error generating step:', error);
    } finally {
      setGeneratingStep(false);
    }
  };

  const confirmStep = async () => {
    if (!db || !question.steps) return;

    try {
      const updatedSteps = [...question.steps];
      updatedSteps[currentStep] = {
        ...updatedSteps[currentStep],
        confirmed: true,
      };

      await updateDoc(doc(db, 'assignments', assignmentId), {
        [`questions.${index}.steps`]: updatedSteps,
        updatedAt: new Date(),
      });

      onUpdate();
      if (currentStep < updatedSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error confirming step:', error);
    }
  };

  return (
    <div className="card p-4">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Question {index + 1}</span>
            {question.completed && (
              <Check size={16} className="text-green-500" />
            )}
          </div>
          <p className="text-dark-text-secondary mt-1">{question.content}</p>
        </div>
        <ChevronRight
          className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          size={20}
        />
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-dark-border space-y-4">
          {question.imageUrl && (
            <div>
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Solution Steps */}
          {question.steps && question.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Solution Steps:</h4>
              {question.steps.map((step, stepIndex) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg ${
                    stepIndex === currentStep
                      ? 'bg-brand-primary/10 border border-brand-primary'
                      : 'bg-dark-bg'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-2">Step {step.stepNumber}</div>
                      <p className="text-dark-text-secondary">{step.explanation}</p>
                    </div>
                    {step.confirmed && (
                      <Check size={20} className="text-green-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  {stepIndex === currentStep && !step.confirmed && (
                    <button
                      onClick={confirmStep}
                      className="btn btn-primary mt-4"
                    >
                      I understand, continue
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Generate Next Step Button */}
          {(!question.steps || currentStep === question.steps.length) && (
            <button
              onClick={generateNextStep}
              disabled={generatingStep}
              className="btn btn-primary w-full"
            >
              {generatingStep
                ? 'Generating...'
                : question.steps && question.steps.length > 0
                ? 'Next Step'
                : 'Start Solving'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
