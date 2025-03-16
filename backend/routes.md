# Write Like A Human API Documentation

## Authentication Routes

### POST /api/auth/register

Register a new user with Supabase.

**Request Body:**

```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### POST /api/auth/login

Log in an existing user.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": false
  }
}
```

### GET /api/auth/me

Get current user information.

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### POST /api/auth/sync-user

Sync Supabase user with database.

**Request Body:**

```json
{
  "name": "string",
  "role": "STUDENT" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "User synchronized successfully",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### PATCH /api/auth/verify-email

Update email verification status.

**Request Body:**

```json
{
  "targetUserId": "string", // Optional, if not provided uses authenticated user
  "isVerified": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verification confirmed successfully",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": true,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### PATCH /api/auth/update-user

Update user profile information.

**Request Body:**

```json
{
  "name": "string",
  "role": "STUDENT", // Admin only
  "userId": "string", // Optional, for admins to update other users
  "isEmailVerified": true // Admin only
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

## User Management Routes

### GET /api/users

List users (admin only).

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `role`: string (optional filter by role)

**Response:**

```json
{
  "success": true,
  "users": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "STUDENT",
      "isEmailVerified": false,
      "createdAt": "2025-03-14T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### GET /api/users/:id

Get specific user details.

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### PATCH /api/users/:id/role

Update user role (admin only).

**Request Body:**

```json
{
  "role": "TEACHER"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "TEACHER",
    "isEmailVerified": false
  }
}
```

## Document Routes

### POST /api/documents

Upload a new document.

**Request Body:**

- Form data with `file` field containing the document
- Additional fields:
  - `title`: string
  - `groupId`: string (optional)

**Response:**

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "string",
    "title": "string",
    "fileName": "string",
    "fileUrl": "string",
    "fileType": "string",
    "fileSize": 1024,
    "userId": "string",
    "groupId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/documents

List user's documents.

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `groupId`: string (optional)

**Response:**

```json
{
  "success": true,
  "documents": [
    {
      "id": "string",
      "title": "string",
      "fileName": "string",
      "fileUrl": "string",
      "fileType": "string",
      "fileSize": 1024,
      "userId": "string",
      "groupId": "string",
      "createdAt": "2025-03-14T00:00:00.000Z",
      "isLatest": true,
      "versionNumber": 1
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### GET /api/documents/:id

Get a specific document.

**Response:**

```json
{
  "success": true,
  "document": {
    "id": "string",
    "title": "string",
    "content": "string",
    "fileName": "string",
    "fileUrl": "string",
    "fileType": "string",
    "fileSize": 1024,
    "userId": "string",
    "groupId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z",
    "versionNumber": 1,
    "isLatest": true,
    "user": {
      "id": "string",
      "name": "string"
    }
  }
}
```

### PATCH /api/documents/:id

Update a document.

**Request Body:**

```json
{
  "title": "string",
  "content": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Document updated successfully",
  "document": {
    "id": "string",
    "title": "string",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### DELETE /api/documents/:id

Delete a document.

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### POST /api/documents/:id/versions

Create a new version of a document.

**Request Body:**

- Form data with `file` field containing the updated document
- Additional fields:
  - `title`: string (optional, will use original title if not provided)

**Response:**

```json
{
  "success": true,
  "message": "New version created successfully",
  "document": {
    "id": "string",
    "title": "string",
    "versionNumber": 2,
    "parentDocumentId": "string",
    "isLatest": true,
    "createdAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/documents/:id/versions

List document versions.

**Response:**

```json
{
  "success": true,
  "versions": [
    {
      "id": "string",
      "title": "string",
      "versionNumber": 2,
      "isLatest": true,
      "createdAt": "2025-03-14T00:00:00.000Z"
    },
    {
      "id": "string",
      "title": "string",
      "versionNumber": 1,
      "isLatest": false,
      "createdAt": "2025-03-13T00:00:00.000Z"
    }
  ]
}
```

## AI Analysis Routes

### POST /api/documents/:id/analyze

Analyze a document for AI content.

**Response:**

```json
{
  "success": true,
  "message": "Document analysis initiated",
  "analysisId": "string"
}
```

### GET /api/documents/:id/analysis

Get AI analysis results.

**Response:**

```json
{
  "success": true,
  "analysis": {
    "id": "string",
    "documentId": "string",
    "overallAiScore": 0.75,
    "humanWrittenPercent": 25.0,
    "aiGeneratedPercent": 75.0,
    "analysisDate": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/documents/:id/sections

Get document sections with AI detection.

**Response:**

```json
{
  "success": true,
  "sections": [
    {
      "id": "string",
      "startOffset": 0,
      "endOffset": 250,
      "content": "string",
      "isAiGenerated": true,
      "aiConfidence": 0.92,
      "suggestions": "string"
    },
    {
      "id": "string",
      "startOffset": 251,
      "endOffset": 500,
      "content": "string",
      "isAiGenerated": false,
      "aiConfidence": 0.15,
      "suggestions": null
    }
  ]
}
```

### GET /api/documents/:id/metrics

Get document text metrics.

**Response:**

```json
{
  "success": true,
  "metrics": {
    "id": "string",
    "totalWordCount": 1250,
    "sentenceCount": 87,
    "averageSentenceLength": 14.37,
    "readabilityScore": 65.2,
    "lexicalDiversity": 0.78,
    "uniqueWordCount": 547,
    "academicLanguageScore": 0.65,
    "passiveVoicePercentage": 22.5,
    "firstPersonPercentage": 5.2,
    "thirdPersonPercentage": 85.7,
    "punctuationDensity": 0.12,
    "grammarErrorCount": 3,
    "spellingErrorCount": 2,
    "predictabilityScore": 0.67,
    "nGramUniqueness": 0.81
  }
}
```

## Feedback Routes

### POST /api/documents/:id/feedback

Create feedback for a document.

**Request Body:**

```json
{
  "content": "string",
  "status": "PENDING"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback created successfully",
  "feedback": {
    "id": "string",
    "content": "string",
    "status": "PENDING",
    "userId": "string",
    "documentId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/documents/:id/feedback

Get feedback for a document.

**Response:**

```json
{
  "success": true,
  "feedback": [
    {
      "id": "string",
      "content": "string",
      "status": "ANALYZED",
      "userId": "string",
      "createdAt": "2025-03-14T00:00:00.000Z",
      "user": {
        "id": "string",
        "name": "string"
      }
    }
  ]
}
```

### PATCH /api/feedback/:id

Update feedback.

**Request Body:**

```json
{
  "content": "string",
  "status": "REVIEWED",
  "response": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "feedback": {
    "id": "string",
    "content": "string",
    "status": "REVIEWED",
    "response": "string",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### DELETE /api/feedback/:id

Delete feedback.

**Response:**

```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

### GET /api/feedback/:id/metrics

Get feedback metrics.

**Response:**

```json
{
  "success": true,
  "metrics": {
    "id": "string",
    "feedbackId": "string",
    "sentenceLengthChange": -2.5,
    "paragraphStructureScore": 0.85,
    "headingConsistencyScore": 0.92,
    "lexicalDiversityChange": 0.12,
    "wordRepetitionScore": 0.78,
    "formalityShift": 0.15,
    "readabilityChange": 5.6,
    "voiceConsistencyScore": 0.88,
    "perspectiveShift": -0.05,
    "descriptiveLanguageScore": 0.76,
    "punctuationChangeScore": 0.02,
    "grammarPatternScore": 0.91,
    "spellingVariationScore": 0.99,
    "thematicConsistencyScore": 0.87,
    "keywordFrequencyChange": 0.14,
    "argumentDevelopmentScore": 0.79,
    "nGramSimilarityScore": 0.68,
    "tfIdfSimilarityScore": 0.73,
    "jaccardSimilarityScore": 0.82,
    "originalityShiftScore": 0.25
  }
}
```

## Comment Routes

### POST /api/documents/:id/comments

Add a comment to a document.

**Request Body:**

```json
{
  "content": "string",
  "feedbackId": "string" // Optional, only if commenting on feedback
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "string",
    "content": "string",
    "userId": "string",
    "documentId": "string", // This is the specific document version ID
    "feedbackId": "string", // Only present if commenting on feedback
    "createdAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/documents/:id/comments

Get comments for a document.

**Response:**

```json
{
  "success": true,
  "comments": [
    {
      "id": "string",
      "content": "string",
      "userId": "string",
      "documentId": "string",
      "feedbackId": "string",
      "createdAt": "2025-03-14T00:00:00.000Z",
      "user": {
        "id": "string",
        "name": "string"
      }
    }
  ]
}
```

### PATCH /api/comments/:id

Update a comment.

**Request Body:**

```json
{
  "content": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "comment": {
    "id": "string",
    "content": "string",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### DELETE /api/comments/:id

Delete a comment.

**Response:**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

## Word Suggestion Routes

### POST /api/documents/:id/suggestions

Add word suggestions for a document.

**Request Body:**

```json
{
  "suggestions": [
    {
      "originalWord": "string",
      "suggestedWord": "string",
      "position": 0,
      "startOffset": 0,
      "endOffset": 5,
      "context": "string",
      "aiConfidence": 0.85
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Suggestions added successfully",
  "suggestions": [
    {
      "id": "string",
      "originalWord": "string",
      "suggestedWord": "string",
      "position": 0,
      "startOffset": 0,
      "endOffset": 5
    }
  ]
}
```

### GET /api/documents/:id/suggestions

Get word suggestions for a document.

**Response:**

```json
{
  "success": true,
  "suggestions": [
    {
      "id": "string",
      "originalWord": "string",
      "suggestedWord": "string",
      "position": 0,
      "startOffset": 0,
      "endOffset": 5,
      "highlighted": true,
      "isAccepted": null,
      "context": "string",
      "aiConfidence": 0.85,
      "createdAt": "2025-03-14T00:00:00.000Z"
    }
  ]
}
```

### PATCH /api/suggestions/:id

Accept or reject a word suggestion.

**Request Body:**

```json
{
  "isAccepted": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Suggestion accepted",
  "suggestion": {
    "id": "string",
    "isAccepted": true,
    "acceptedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

## Group Routes

### POST /api/groups

Create a new group.

**Request Body:**

```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Group created successfully",
  "group": {
    "id": "string",
    "name": "string",
    "description": "string",
    "joinToken": "string",
    "adminId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/groups

List groups (for current user).

**Response:**

```json
{
  "success": true,
  "groups": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "adminId": "string",
      "createdAt": "2025-03-14T00:00:00.000Z",
      "memberCount": 12
    }
  ]
}
```

### GET /api/groups/:id

Get group details.

**Response:**

```json
{
  "success": true,
  "group": {
    "id": "string",
    "name": "string",
    "description": "string",
    "joinToken": "string",
    "adminId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z",
    "admin": {
      "id": "string",
      "name": "string"
    },
    "memberCount": 12
  }
}
```

### PATCH /api/groups/:id

Update group information.

**Request Body:**

```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Group updated successfully",
  "group": {
    "id": "string",
    "name": "string",
    "description": "string",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### DELETE /api/groups/:id

Delete a group.

**Response:**

```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

### POST /api/groups/join/:token

Join a group with token.

**Response:**

```json
{
  "success": true,
  "message": "Joined group successfully",
  "group": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

### GET /api/groups/:id/members

List group members.

**Response:**

```json
{
  "success": true,
  "members": [
    {
      "id": "string",
      "userId": "string",
      "joinedAt": "2025-03-14T00:00:00.000Z",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "STUDENT"
      }
    }
  ]
}
```

### POST /api/groups/:id/members

Add a member to a group.

**Request Body:**

```json
{
  "email": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Member added successfully",
  "member": {
    "id": "string",
    "userId": "string",
    "groupId": "string",
    "joinedAt": "2025-03-14T00:00:00.000Z",
    "user": {
      "name": "string",
      "email": "string"
    }
  }
}
```

### DELETE /api/groups/:id/members/:userId

Remove a member from a group.

**Response:**

```json
{
  "success": true,
  "message": "Member removed from group"
}
```

## Assignment Routes

### POST /api/groups/:id/assignments

Create an assignment for a group.

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2025-04-15T00:00:00.000Z",
  "documentUrl": "string",
  "documentName": "string",
  "documentType": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Assignment created successfully",
  "assignment": {
    "id": "string",
    "title": "string",
    "description": "string",
    "dueDate": "2025-04-15T00:00:00.000Z",
    "documentUrl": "string",
    "documentName": "string",
    "documentType": "string",
    "creatorId": "string",
    "groupId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### GET /api/groups/:id/assignments

List assignments for a group.

**Response:**

```json
{
  "success": true,
  "assignments": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "dueDate": "2025-04-15T00:00:00.000Z",
      "creatorId": "string",
      "groupId": "string",
      "createdAt": "2025-03-14T00:00:00.000Z",
      "creator": {
        "id": "string",
        "name": "string"
      },
      "submissionCount": 15
    }
  ]
}
```

### GET /api/assignments/:id

Get assignment details.

**Response:**

```json
{
  "success": true,
  "assignment": {
    "id": "string",
    "title": "string",
    "description": "string",
    "dueDate": "2025-04-15T00:00:00.000Z",
    "documentUrl": "string",
    "documentName": "string",
    "documentType": "string",
    "creatorId": "string",
    "groupId": "string",
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z",
    "creator": {
      "id": "string",
      "name": "string"
    },
    "group": {
      "id": "string",
      "name": "string"
    }
  }
}
```

### PATCH /api/assignments/:id

Update an assignment.

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2025-04-15T00:00:00.000Z",
  "documentUrl": "string",
  "documentName": "string",
  "documentType": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Assignment updated successfully",
  "assignment": {
    "id": "string",
    "title": "string",
    "description": "string",
    "dueDate": "2025-04-15T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```

### DELETE /api/assignments/:id

Delete an assignment.

**Response:**

```json
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

## Submission Routes

### POST /api/assignments/:id/submissions

Submit an assignment.

**Request Body:**

- Form data with `file` field containing the document
- Additional fields:
  - `title`: string

**Response:**

```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "submission": {
    "id": "string",
    "documentId": "string",
    "assignmentId": "string",
    "userId": "string",
    "status": "SUBMITTED",
    "submittedAt": "2025-03-14T00:00:00.000Z",
    "document": {
      "id": "string",
      "title": "string",
      "fileName": "string"
    }
  }
}
```

### GET /api/assignments/:id/submissions

List submissions for an assignment.

**Response:**

```json
{
  "success": true,
  "submissions": [
    {
      "id": "string",
      "documentId": "string",
      "assignmentId": "string",
      "userId": "string",
      "status": "SUBMITTED",
      "submittedAt": "2025-03-14T00:00:00.000Z",
      "user": {
        "id": "string",
        "name": "string"
      },
      "document": {
        "id": "string",
        "title": "string",
        "fileName": "string"
      }
    }
  ]
}
```

### GET /api/submissions/:id

Get submission details.

**Response:**

```json
{
  "success": true,
  "submission": {
    "id": "string",
    "documentId": "string",
    "assignmentId": "string",
    "userId": "string",
    "status": "GRADED",
    "submittedAt": "2025-03-14T00:00:00.000Z",
    "createdAt": "2025-03-14T00:00:00.000Z",
    "updatedAt": "2025-03-14T00:00:00.000Z",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "document": {
      "id": "string",
      "title": "string",
      "fileName": "string",
      "fileUrl": "string"
    },
    "assignment": {
      "id": "string",
      "title": "string"
    }
  }
}
```

### PATCH /api/submissions/:id/status

Update submission status.

**Request Body:**

```json
{
  "status": "GRADED"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Submission status updated successfully",
  "submission": {
    "id": "string",
    "status": "GRADED",
    "updatedAt": "2025-03-14T00:00:00.000Z"
  }
}
```
