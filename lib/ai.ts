import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIMode } from '@/types';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo-key';
const genAI = new GoogleGenerativeAI(apiKey);

// Allow overriding model choices via env to stay compatible with API revisions
const TEXT_MODEL = process.env.NEXT_PUBLIC_GEMINI_TEXT_MODEL || 'gemini-1.5-flash';
const MULTIMODAL_MODEL = process.env.NEXT_PUBLIC_GEMINI_MULTIMODAL_MODEL || 'gemini-1.5-pro';

// Get the appropriate model based on AI mode
export function getAIModel(mode: AIMode = 'balanced') {
  // gemini-1.5-* models support generateContent for text
  return genAI.getGenerativeModel({ model: TEXT_MODEL });
}

export function getMultimodalAIModel() {
  // 1.5 Pro handles images + text in one prompt
  return genAI.getGenerativeModel({ model: MULTIMODAL_MODEL });
}

// System prompts for different AI modes
export const systemPrompts = {
  guided: `You are a Socratic tutor. Your goal is to help students learn by asking questions and guiding them to discover answers themselves. Never give direct answers. Instead:
- Ask probing questions
- Guide students through reasoning
- Help them identify their misconceptions
- Encourage critical thinking
- Provide hints when they're stuck, but never full solutions
- Be patient and supportive`,

  balanced: `You are a helpful study assistant. Your goal is to help students understand concepts while providing clear explanations. You should:
- Explain concepts step-by-step
- Provide examples when helpful
- Ask occasional questions to check understanding
- Point out common mistakes
- Give hints before full solutions
- Balance guidance with direct help`,

  direct: `You are a clear and direct tutor. Your goal is to help students understand through detailed step-by-step explanations. You should:
- Provide complete step-by-step solutions
- Explain each step clearly
- Show all work and reasoning
- Highlight important concepts
- Point out common mistakes
- Be thorough and precise`,
};

// Generate AI response with context
export async function generateAIResponse(
  prompt: string,
  mode: AIMode = 'balanced',
  context?: string
): Promise<string> {
  try {
    const model = getAIModel(mode);
    const systemPrompt = systemPrompts[mode];
    
    const fullPrompt = context
      ? `${systemPrompt}\n\nContext: ${context}\n\nUser: ${prompt}`
      : `${systemPrompt}\n\nUser: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Extract questions from image
export async function extractQuestionsFromImage(
  imageData: string
): Promise<string[]> {
  try {
    const model = getMultimodalAIModel();
    
    const prompt = `Extract all questions from this image. For each question:
1. Number the questions
2. Include all parts (a, b, c, etc.)
3. Preserve mathematical notation
4. Include any context or given information

Format each question clearly and return as a numbered list.`;

    const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/jpeg' } }]);
    const response = await result.response;
    const text = response.text();
    
    // Split by question numbers and filter empty strings
    const questions = text
      .split(/\d+\./)
      .filter(q => q.trim().length > 0)
      .map(q => q.trim());
    
    return questions;
  } catch (error) {
    console.error('Error extracting questions:', error);
    throw new Error('Failed to extract questions from image');
  }
}

// Generate step-by-step solution
export async function generateStepBySolution(
  question: string,
  mode: AIMode,
  previousSteps?: string[]
): Promise<string> {
  try {
    const model = getAIModel(mode);
    const systemPrompt = systemPrompts[mode];
    
    let prompt = `${systemPrompt}\n\nQuestion: ${question}\n\n`;
    
    if (previousSteps && previousSteps.length > 0) {
      prompt += `Previous steps completed:\n${previousSteps.join('\n')}\n\n`;
      prompt += 'Provide the NEXT single step only. Explain it clearly but concisely.';
    } else {
      prompt += 'Provide the FIRST step only to solve this problem. Do not solve the entire problem.';
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating step:', error);
    throw new Error('Failed to generate solution step');
  }
}

// Generate study notes
export async function generateStudyNotes(
  topicName: string,
  materialContent?: string
): Promise<string> {
  try {
    const model = getAIModel('direct');
    
    let prompt = `Create comprehensive study notes for the topic: "${topicName}"\n\n`;
    
    if (materialContent) {
      prompt += `Based on the following material:\n${materialContent}\n\n`;
    }
    
    prompt += `Include:
1. Key Concepts (clearly defined)
2. Important Examples (with explanations)
3. Common Mistakes (and how to avoid them)
4. Study Tips (how to master this topic)

Format the notes in a clear, organized manner with markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating study notes:', error);
    throw new Error('Failed to generate study notes');
  }
}

// Generate practice questions
export async function generatePracticeQuestions(
  topicName: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 1,
  weakSkills?: string[]
): Promise<string[]> {
  try {
    const model = getAIModel('balanced');
    
    let prompt = `Generate ${count} ${difficulty} practice question(s) for the topic: "${topicName}"\n\n`;
    
    if (weakSkills && weakSkills.length > 0) {
      prompt += `Focus on these weak areas: ${weakSkills.join(', ')}\n\n`;
    }
    
    prompt += `Requirements:
- Each question should test understanding, not just memorization
- Include variety in question types
- Make questions challenging but fair
- Number each question

Provide only the questions, no solutions.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split by question numbers
    const questions = text
      .split(/\d+\./)
      .filter(q => q.trim().length > 0)
      .map(q => q.trim());
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate practice questions');
  }
}

// Generate flashcards
export async function generateFlashcards(
  topicName: string,
  materialContent?: string,
  count: number = 10
): Promise<Array<{ front: string; back: string }>> {
  try {
    const model = getAIModel('direct');
    
    let prompt = `Create ${count} flashcards for the topic: "${topicName}"\n\n`;
    
    if (materialContent) {
      prompt += `Based on this material:\n${materialContent}\n\n`;
    }
    
    prompt += `Format each flashcard as:
FRONT: [question or concept]
BACK: [answer or explanation]

Make them concise but comprehensive. Focus on key concepts, definitions, and important relationships.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse flashcards
    const flashcards: Array<{ front: string; back: string }> = [];
    const pairs = text.split(/FRONT:/i).filter(p => p.trim());
    
    pairs.forEach(pair => {
      const [front, back] = pair.split(/BACK:/i);
      if (front && back) {
        flashcards.push({
          front: front.trim(),
          back: back.trim(),
        });
      }
    });
    
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
}

// Detect weak skills from test performance
export async function detectWeakSkills(
  topicName: string,
  incorrectAnswers: Array<{ question: string; userAnswer: string; correctAnswer: string }>
): Promise<string[]> {
  try {
    const model = getAIModel('balanced');
    
    const prompt = `Analyze these incorrect answers from a test on "${topicName}" and identify specific weak skills or concepts:

${incorrectAnswers.map((item, i) => 
  `${i + 1}. Question: ${item.question}\n   User Answer: ${item.userAnswer}\n   Correct Answer: ${item.correctAnswer}`
).join('\n\n')}

Identify 3-5 specific skills or concepts the student needs to work on. Be specific and actionable.
List only the skill names, one per line.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse skills
    const skills = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*\d.]\s*/, '').trim());
    
    return skills;
  } catch (error) {
    console.error('Error detecting weak skills:', error);
    throw new Error('Failed to detect weak skills');
  }
}

export { genAI };
