# Write Like A Human - App Overview

## Application Purpose

Write Like A Human is an AI-powered writing analysis platform that helps students create more authentic, human-like content by detecting AI-generated text and providing actionable feedback. The platform serves students, teachers, and educational institutions with tools for writing improvement and AI detection.

## Core Functionality

- **AI Detection**: Analyzes documents to identify AI-generated content with confidence scores
- **Feedback System**: Provides detailed suggestions to improve writing authenticity
- **Version Control**: Tracks document revisions and improvement over time
- **Classroom Integration**: Supports assignment creation, submission, and evaluation

## User Roles & Workflows

### Students can:
- Upload documents for AI analysis
- Receive detailed feedback on writing authenticity
- Get word-level suggestions for improvement
- Submit assignments to teachers
- Track writing progress over time

### Teachers can:
- Create class groups with join tokens
- Create and distribute assignments
- Review student submissions
- Provide feedback on student writing
- Track student progress and AI dependency

### Administrators can:
- Manage system performance
- Configure detection parameters
- Monitor overall usage

## Technical Architecture

The app uses a modern web stack:
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Email/password via Supabase Auth
- **AI Integration**: OpenAI API for content analysis
- **File Storage**: Cloud storage for document files

## Data Schema Overview

### Key Entities

- **Users**: Students, teachers, and administrators with role-based permissions
- **Documents**: Text content with complete version history
- **AI Analysis**: Detailed metrics on writing authenticity by document
- **Groups**: Classroom environments for teacher-student interaction
- **Assignments**: Tasks created by teachers for student completion
- **Submissions**: Student work linked to specific assignments
- **Feedback**: Teacher comments and system suggestions

### Specialized Features

- **Document Sections**: Granular analysis of specific text portions
- **Word Suggestions**: Word-level improvement recommendations
- **Text Metrics**: Comprehensive linguistic analysis (sentence structure, readability, etc.)
- **Feedback Metrics**: Comparative analysis between document versions

## Implementation Details

The application uses a sophisticated database schema to track:
- Writing authenticity through multiple linguistic dimensions
- Document versioning with parent-child relationships
- Precise text segment analysis with character offsets
- Comparative metrics across document versions

This detailed data model enables both accurate AI detection and meaningful improvement suggestions, creating a feedback loop that helps students develop more authentic writing skills over time.