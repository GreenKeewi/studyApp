# StudyApe Setup Guide

This guide will walk you through setting up StudyApe locally on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A **Firebase account** ([Sign up](https://firebase.google.com/))
- A **Google account** for Gemini API access

## Step 1: Clone the Repository

```bash
git clone https://github.com/GreenKeewi/studyApp.git
cd studyApp
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- Firebase SDK
- Gemini AI SDK
- Tailwind CSS
- And other dependencies

## Step 3: Set Up Firebase

### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "StudyApe")
4. (Optional) Disable Google Analytics or configure it as needed
5. Click "Create project" and wait for it to be created

### 3.2 Register Your Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Register the app with a nickname (e.g., "StudyApe Web")
3. You don't need to set up Firebase Hosting right now
4. Copy the Firebase configuration object - you'll need this later

### 3.3 Enable Firebase Services

#### Enable Authentication

1. In the Firebase Console, go to "Build" > "Authentication"
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Anonymous" authentication
5. Click "Save"

#### Set Up Firestore Database

1. Go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll set up rules later)
4. Select a location closest to your users
5. Click "Enable"

#### Set Up Firestore Security Rules

In the "Rules" tab, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can manage their own subjects, topics, assignments, etc.
    match /{collection}/{document} {
      // Use request.resource for creates, resource for existing docs
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

Click "Publish" to save the rules.

#### Enable Firebase Storage

1. Go to "Build" > "Storage"
2. Click "Get started"
3. Start in production mode
4. Use the same location as your Firestore database
5. Click "Done"

#### Set Up Storage Security Rules

In the "Rules" tab, replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /assignments/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /materials/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click "Publish" to save the rules.

## Step 4: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your project or create a new one
4. Copy the API key - you'll need this for the next step

## Step 5: Configure Environment Variables

1. In the project root directory, copy the example environment file:

```bash
cp .env.example .env.local
```

2. Open `.env.local` in your text editor

3. Fill in your Firebase configuration values (from Step 3.2):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Add your Gemini API key (from Step 4):

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

5. Save the file

## Step 6: Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should be automatically signed in anonymously
3. Complete the onboarding flow:
   - Select your education level
   - Add some subjects
   - Choose your AI mode
   - Select theme and font size
4. You should be redirected to the dashboard

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear the Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Firebase Connection Issues

If you see Firebase errors:

1. Verify all environment variables are correct in `.env.local`
2. Check that Firebase Authentication is enabled
3. Verify Firestore Database and Storage are enabled
4. Check browser console for specific error messages

### Gemini API Issues

If AI features aren't working:

1. Verify your Gemini API key is correct
2. Check if you have API quota remaining
3. Ensure your API key has the correct permissions

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run dev
```

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Deploying to Vercel

StudyApe is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your GitHub repository
4. Add your environment variables in the Vercel dashboard
5. Deploy!

Vercel will automatically detect it's a Next.js app and configure the build settings.

## Additional Configuration

### Custom Domain

If deploying to production, update your Firebase Authentication settings:

1. Go to Firebase Console > Authentication > Settings
2. Add your domain to "Authorized domains"

### Email Authentication (Optional)

To enable email/password authentication:

1. In Firebase Console > Authentication > Sign-in method
2. Enable "Email/Password"
3. Update the AuthContext to handle email sign-in

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/GreenKeewi/studyApp/issues)
2. Review Firebase documentation
3. Check Next.js documentation
4. Review Gemini API documentation

## Next Steps

Now that you have StudyApe running:

1. Add your real subjects and topics
2. Upload homework assignments
3. Use the AI-powered features
4. Customize your settings
5. Start studying! 🎓
