 # Web Development Course Platform

A modern, interactive web-based learning platform for web development fundamentals. This platform offers a structured curriculum with video lessons, quizzes, progress tracking, and note-taking capabilities.

## Features

- 📺 11 curated video lessons covering HTML, CSS, and JavaScript
- ✅ Progress tracking and course completion status
- 📝 Interactive quizzes for knowledge assessment
- 📓 Personal note-taking system for each lesson
- 🎯 Course enrollment and progress persistence
- 🎓 Course completion tracking
- 📱 Responsive design for all devices

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- YouTube IFrame Player API
- Local Storage for data persistence

## Project Structure

```
.
├── src/
│   ├── main.js         # Core application logic
│   ├── courseData.js   # Course content and quiz data
│   └── styles.css      # Application styling
├── index.html          # Main entry point
└── package.json        # Project dependencies and scripts
```

## Core Functionality

### Video Player
- Integrated YouTube IFrame Player
- Auto-play next video on completion
- Video progress tracking
- Custom video controls and captions

### Course Management
- Enrollment system
- Progress tracking
- Course completion status
- Video completion checkmarks

### Learning Features
- Interactive quizzes for each lesson
- Note-taking system with auto-save
- Video summaries
- Progress statistics

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Course Content

The platform includes 11 comprehensive lessons:
1. Introduction to Web Development
2. Understanding How the Web Works
3. Your First Web Page
4. Basic HTML Elements
5. Advanced HTML Elements
6. Introduction to HTML Forms
7. Learn CSS in 20 Minutes
8. How to Style a Modern Website (Part 1)
9. How to Style a Modern Website (Part 2)
10. How to Style a Modern Website (Part 3)
11. JavaScript Shopping Cart Tutorial

## Local Storage

The application uses browser's Local Storage to persist:
- Course enrollment status
- Video completion progress
- User notes
- Quiz responses

## Browser Support

The application is compatible with modern browsers that support:
- ES6+ JavaScript
- Local Storage API
- YouTube IFrame API
- Modern CSS features