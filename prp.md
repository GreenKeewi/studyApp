STUDYAPE — PRODUCT REQUIREMENT PROMPT (PRP)
ROLE

You are an expert full-stack engineer, AI systems designer, and UX architect.

Your task is to design and fully implement a functional MVP of a web-based AI study application called StudyApe.

The output must be a working application, not mockups or partial implementations.

PRODUCT OVERVIEW

StudyApe is an AI-powered study platform for middle school, high school, and university students.

Its purpose is to:

Help students understand concepts deeply

Encourage active learning

Adapt to individual weaknesses

Reduce distractions

Support long study sessions

The AI must prioritize guidance and reasoning, not just providing answers.

TECH STACK (REQUIRED)
Frontend

Next.js (App Router)

React

Tailwind CSS

Font: Space Grotesk

Mobile-first, responsive design

Backend

Firebase

Firestore (data)

Firebase Storage (file uploads)

Firebase Functions (AI routing)

AI

Gemini (multimodal)

Subject-specific routing

Text, image, and audio inputs supported

GLOBAL STRUCTURE
Main Sections

Dashboard

Homework

Study

Lectures

Settings

Navigation:

Bottom navigation on mobile

Sidebar navigation on desktop

ONBOARDING

On first use, guide the user through:

Selecting education level (Middle School, High School, University)

Selecting subjects (any subject allowed)

Choosing default AI explanation mode:

Guided (Socratic)

Balanced

Direct (step-by-step)

Selecting theme (Light, Dark, Dim)

Selecting font size

Store all preferences in Firestore.

DESIGN & UI REQUIREMENTS

Minimal, Notion-like interface

Calm, distraction-free layout

Designed for extended use

Clear visual hierarchy

Subtle animations only

Reduced motion option available

Typography:

Space Grotesk

Adjustable font size

Optional dyslexia-friendly mode

Themes:

Light

Dark (default)

Dim (low brightness)

DASHBOARD

The dashboard is the primary overview screen.

It must display:

Upcoming assignments and due dates

Current study streak

Upcoming tests

Weak topics detected by AI

A short, minimal motivation message

Dashboard widgets must be:

Reorderable

Toggleable (show/hide)

Affected by user settings (e.g. early due-date offset)

HOMEWORK SECTION
Assignment Management

Users can add assignments with:

Title

Subject

Due date

Priority

Assignments appear in Homework and Dashboard views

Question Upload & Scanning

Accept uploads:

Photos (handwritten and printed)

PDFs

Mobile camera supported

AI extracts questions accurately

Step-by-Step Solver (Core Feature)

Problems are solved one step at a time

Each step is locked until the user confirms understanding

AI must:

Explain equations line by line

Identify mistakes at the exact step

Explain why an error occurred in simple terms

Final answers are not shown by default unless user changes AI mode

Voice Explanations (Homework)

AI voice explanations available

Adjustable playback speed

Optional auto-play

Slides & Docs Critique

Users can link Google Slides or Docs

Optional rubric upload

AI critiques:

Clarity

Structure

Rubric alignment

Areas for improvement

STUDY SECTION (SUBJECT → TOPIC → STUDY HUB)
Study Organization

Study content is organized as:
Subject → Topic → Study Hub

Study Hub

Each topic has a dedicated Study Hub containing:

Study Notes

Smart Study

Flashcards

Test Mode

Games

Linked Materials

All content is scoped strictly to the selected topic.

Study Notes

AI-generated notes for the topic

Generated using:

Uploaded files

Linked lecture audio

Must include:

Key concepts

Examples

Common mistakes

Study guidance

Smart Study

Infinite AI-generated questions

Difficulty adapts dynamically

Weak sub-skills are intentionally repeated

Mastery tracked per topic

Flashcards

Auto-generated and manual flashcards

Confidence rating (1–5)

Spaced repetition based on confidence

Topic-specific

Test Mode

User-configurable:

Time limit

Difficulty

Number of questions

Exam pressure mode:

Navigation locked

Post-test analytics:

Accuracy by topic

Speed analysis

Weak areas

Recommended next steps

Games

Puzzle-based learning games

Conceptual, not reflex-based

Topic-specific

MATERIALS SYSTEM (SHARED ACROSS APP)

Users can upload:

PDFs

Images

Notes

Lecture audio

Uploaded materials are reusable

In a Study Hub, users can:

Upload new material

Select from previously uploaded materials

Selected materials influence:

Study Notes

Smart Study

Flashcards

Tests

LECTURES SECTION
Purpose

Central management of lecture audio.

Features

Record live audio

Upload audio files

AI generates:

Summaries

Key points

Questions

Notes

Lecture audio can be linked into any Study Hub.

AI BEHAVIOR & CONTROLS
AI Explanation Modes

Guided

Balanced

Direct

Users can:

Set a default mode

Temporarily override mode for a single response

AI Rules

Encourage reasoning before answers

Step-by-step explanations for equations

No answer dumping by default

STREAKS & MILESTONES

Daily study streak tracking

Breaking streak applies a penalty (loss of multiplier)

Milestones trigger lightweight confetti:

7 days

10 days

30 days

Major mastery milestones

Confetti respects reduced motion settings

SETTINGS

Users can customize:

Theme (Light, Dark, Dim)

Font size

Reduced motion

Dyslexia-friendly font

Default AI mode

Due date early-warning offset

Confetti on/off

Voice auto-play

Voice speed

Study reminders

Dashboard layout

Settings apply instantly.

DATA REQUIREMENTS (HIGH LEVEL)

Firestore must store:

User preferences

Subjects and topics

Assignments

Study hubs

Materials (files and audio)

Flashcards

Tests and analytics

Weak skill tracking

Streaks and milestones

OUTPUT REQUIREMENTS

You must produce:

Complete project file structure

Fully functional Next.js application

Firebase configuration and schema

AI routing logic

All required UI components

Instructions to run the project locally

No unfinished features.
No mock APIs.
No skipped logic.

FINAL PRINCIPLE

StudyApe should function as a thinking partner that helps students understand, practice, and improve — not as a shortcut to answers.
