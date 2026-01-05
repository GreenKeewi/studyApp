# StudyApe - AI-Powered Study Platform

StudyApe is an AI-powered study platform designed for middle school, high school, and university students. It helps students understand concepts deeply, encourages active learning, adapts to individual weaknesses, and supports long study sessions.

## Features

### 🎯 Core Features Implemented

#### Onboarding
- Education level selection (Middle School, High School, University)
- Subject selection
- AI explanation mode preference (Guided/Socratic, Balanced, Direct)
- Theme selection (Light, Dark, Dim)
- Font size customization

#### Dashboard
- Upcoming assignments widget
- Study streak tracker
- Upcoming tests widget
- Weak topics/areas to improve widget
- Daily motivation message

#### Homework Management
- Add assignments with title, subject, due date, and priority
- View all assignments sorted by due date
- Mark assignments as complete
- Due date warnings based on user preferences
- Priority indicators (Low, Medium, High)

#### Step-by-Step Problem Solving
- Upload photos or PDFs of homework questions
- AI extracts questions from images
- Step-by-step solution generation
- Progress locked until understanding is confirmed
- Multiple AI explanation modes

#### Settings
- Theme customization (Light, Dark, Dim)
- Font size adjustment (Small, Default, Large, Extra Large)
- Dyslexia-friendly font option
- Reduced motion toggle
- AI mode preferences
- Voice settings (auto-play, speed)
- Due date warning offset
- Celebration effects toggle

### 🏗️ Architecture

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Space Grotesk font

**Backend:**
- Firebase Authentication (Anonymous auth)
- Cloud Firestore (database)
- Firebase Storage (file uploads)

**AI:**
- Google Gemini API (multimodal AI)
- Support for text, image, and audio inputs
- Subject-specific routing
- Three AI modes: Guided, Balanced, Direct

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project set up
- Google Gemini API key

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

2. Enable the following Firebase services:
   - **Authentication**: Enable Anonymous authentication
   - **Firestore Database**: Create a database in production mode
   - **Storage**: Enable Firebase Storage

3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and select the web app (or create one)
   - Copy the configuration values

### Gemini API Setup

1. Get a Gemini API key from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GreenKeewi/studyApp.git
cd studyApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your Firebase and Gemini API credentials:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
studyApp/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard page
│   ├── homework/            # Homework management
│   │   └── [id]/           # Individual assignment page
│   ├── study/              # Study section (placeholder)
│   ├── lectures/           # Lectures section (placeholder)
│   ├── settings/           # Settings page
│   ├── onboarding/         # Onboarding flow
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects)
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── navigation/        # Navigation components
│   └── homework/          # Homework-related components
├── contexts/              # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── SettingsContext.tsx # User settings state
├── lib/                   # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   └── ai.ts             # Gemini AI integration
├── types/                # TypeScript type definitions
│   └── index.ts
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Data Models

### User Settings
- Education level, subjects, AI preferences
- Theme, font size, accessibility options
- Dashboard widget configuration

### Assignments
- Title, subject, due date, priority
- Questions with images
- Solution steps (step-by-step solving)

### Study Data
- Subjects, topics, study hubs
- Flashcards with spaced repetition
- Test results and analytics
- Weak skill tracking

### Lectures
- Audio recordings
- AI-generated summaries and notes
- Linkable to study hubs

## AI Features

### AI Modes

1. **Guided (Socratic)**: Asks questions to help students discover answers
2. **Balanced**: Mix of explanations and guiding questions
3. **Direct**: Complete step-by-step solutions

### AI Capabilities

- Question extraction from images
- Step-by-step problem solving
- Study note generation
- Practice question generation
- Flashcard creation
- Weak skill detection
- Lecture transcription and summarization

## User Experience

### Design Principles
- Minimal, Notion-like interface
- Calm, distraction-free layout
- Designed for extended study sessions
- Mobile-first, responsive design
- Accessibility-focused (reduced motion, dyslexic font support)

### Navigation
- Bottom navigation on mobile
- Sidebar navigation on desktop
- Quick access to all main sections

## Development

### Tech Stack Details

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Firebase**: Backend as a Service
- **Gemini AI**: Google's multimodal AI model
- **React Context**: State management
- **React Dropzone**: File upload handling
- **date-fns**: Date manipulation
- **Lucide React**: Icon library

### Code Style

- Use functional components with hooks
- TypeScript for all code
- Tailwind for styling
- Keep components small and focused
- Use descriptive variable names

## Future Enhancements

### Planned Features

- **Study Section**: Full implementation with subjects, topics, and study hubs
- **Smart Study**: Adaptive question generation based on weak areas
- **Flashcards**: Spaced repetition system
- **Test Mode**: Configurable practice tests with analytics
- **Learning Games**: Puzzle-based conceptual learning
- **Lectures**: Audio recording and AI transcription
- **Materials System**: Upload and organize study materials
- **Streak System**: Advanced tracking with multipliers and milestones
- **Widget Customization**: Drag-and-drop dashboard widgets

### Potential Improvements

- Email/social authentication
- Collaborative features (study groups)
- Progress analytics and insights
- Integration with learning management systems
- Mobile app (React Native)
- Offline mode support
- Export study materials

## Security & Privacy

- Anonymous authentication by default
- Data stored securely in Firebase
- API keys protected via environment variables
- No personal information required
- GDPR compliant

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

ISC License

## Support

For issues or questions, please open an issue on GitHub.

## Acknowledgments

- Built with Next.js and Firebase
- AI powered by Google Gemini
- Icons from Lucide React
- Font: Space Grotesk by Florian Karsten
- Inspired by modern learning platforms

---

**Made with ❤️ for students who want to learn better**
