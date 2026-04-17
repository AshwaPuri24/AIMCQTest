# TestAI - AI-Powered MCQ Test Generator

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**A sophisticated, AI-driven platform for generating comprehensive multiple-choice question (MCQ) tests**

[Live Demo](https://ai-mcq-backend-66vn.onrender.com) • [Report Bug](https://github.com/AshwaPuri24/AIMCQTest/issues) • [Request Feature](https://github.com/AshwaPuri24/AIMCQTest/issues)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

**TestAI** is a modern, cloud-native web application designed to revolutionize technical test preparation for students and job seekers. By leveraging advanced Large Language Models (LLMs), specifically OpenAI's GPT technology, the platform intelligently generates comprehensive, topic-specific MCQ tests that adapt to user requirements.

### Problem Statement

Traditional test preparation methods are time-consuming, lack personalization, and often fail to cover the breadth of modern technical topics. AIMCQTest solves this by providing:

- **Instant Test Generation**: Create tailored tests in seconds
- **AI-Powered Content**: Leverage cutting-edge LLM capabilities for question generation
- **Personalized Learning**: Tests adapted to specific technical domains and difficulty levels
- **Performance Tracking**: Monitor progress and identify areas for improvement

### Solution Value Proposition

- 🚀 **Time Efficiency**: Generate tests in minutes instead of hours
- 🎓 **Quality Content**: AI-generated questions maintain academic rigor
- 🔄 **Scalability**: Generate unlimited tests across any technical domain
- 📊 **Data-Driven**: Track performance metrics and learning outcomes
- 💡 **Cost-Effective**: Reduce content creation overhead

---

## ✨ Key Features

### 1. **Intelligent MCQ Generation**

- AI-powered question creation using OpenAI GPT models
- Customizable difficulty levels (Beginner, Intermediate, Advanced)
- Topic-specific test generation across multiple domains
- Automatic distracter generation ensuring high-quality alternatives

### 2. **User Authentication & Management**

- Secure JWT-based authentication system
- User account creation and management
- Session persistence across devices
- Password security with industry-standard hashing

### 3. **Test Management**

- Create, save, and retrieve test instances
- Test history and analytics
- Performance metrics and score tracking
- Export functionality for offline use

### 4. **Database Persistence**

- PostgreSQL with Drizzle ORM for type-safe database operations
- Optimized schema for user data, tests, questions, and responses
- Automated migrations and version control

### 5. **Responsive User Interface**

- Modern, intuitive UI built with React
- Mobile-first responsive design using Tailwind CSS
- Real-time feedback and progress indicators
- Accessibility-compliant components

### 6. **Storage Integration**

- Cloud-based file storage capabilities
- Resume state persistence
- Media file handling for rich question content

---

## 🏗️ Architecture

### System Architecture Overview
```

┌─────────────────────────────────────────────────────────────┐
│ Client Layer (React)                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐        │
│ │ UI Pages     │ │ Components   │ │ State Mgmt     │        │  
│ └──────────────┘ └──────────────┘ └────────────────┘        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────┴────────────────────────────────────────┐
│ API Layer (Express.js)                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐        │
│ │ Routes       │ │ Middleware   │ │ Controllers    │        │
│ └──────────────┘ └──────────────┘ └────────────────┘        │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───┴────┐       ┌───┴────┐       ┌───┴────┐
│Database│       │ OpenAI │       │Storage │
│(PgSQL) │       │ API    │       │Service │
└────────┘       └────────┘       └────────┘

```

### Request Flow
1. **Client Request**: User initiates action from React frontend
2. **API Processing**: Express server receives and validates request
3. **Authentication**: JWT verification ensures authorized access
4. **Business Logic**: Core logic processing and validation
5. **LLM Integration**: OpenAI API call for intelligent content generation
6. **Data Persistence**: Results stored in PostgreSQL via Drizzle ORM
7. **Response**: Formatted response sent back to client

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework and component library | Latest |
| **TypeScript** | Type-safe JavaScript | 5.x |
| **Tailwind CSS** | Utility-first CSS framework | 4.x |
| **Vite** | Ultra-fast build tool and dev server | Latest |
| **React Router** | Client-side routing | Latest |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime | 18+ LTS |
| **Express.js** | Web framework | 4.x |
| **TypeScript** | Type-safe JavaScript | 5.x |
| **Drizzle ORM** | Type-safe SQL ORM | Latest |
| **PostgreSQL** | Relational database | 14+ |

### External Services
| Service | Usage |
|---------|-------|
| **OpenAI API** | GPT models for MCQ generation |
| **JWT** | Stateless authentication |
| **Cloud Storage** | File persistence (optional) |

### Development Tools
| Tool | Purpose |
|------|---------|
| **PostCSS** | CSS processing |
| **ESLint** | Code quality and consistency |
| **Prettier** | Code formatting |
| **npm** | Package management |

---

## 📁 Project Structure

```

AIMCQTest/
├── client/ # React Frontend Application
│ ├── src/
│ │ ├── components/ # Reusable React components
│ │ ├── pages/ # Page components and routes
│ │ ├── hooks/ # Custom React hooks
│ │ ├── services/ # API client and services
│ │ ├── store/ # State management (Redux/Context)
│ │ ├── types/ # TypeScript type definitions
│ │ ├── styles/ # Global styles and Tailwind configs
│ │ ├── App.tsx # Main application component
│ │ └── main.tsx # Entry point
│ ├── index.html # HTML template
│ └── public/ # Static assets
│
├── server/ # Node.js Backend Application
│ ├── auth.ts # Authentication logic (JWT, user sessions)
│ ├── db.ts # Database connection and initialization
│ ├── index.ts # Express server setup and middleware
│ ├── routes.ts # API route definitions
│ ├── openai.ts # OpenAI integration and MCQ generation logic
│ ├── storage.ts # File storage and retrieval operations
│ ├── vite.ts # Vite middleware for HMR in development
│ └── schemas/ # Drizzle ORM database schemas
│
├── shared/ # Shared Code Between Client & Server
│ ├── types.ts # Common TypeScript types
│ ├── constants.ts # Shared constants
│ └── utils.ts # Utility functions
│
├── drizzle.config.ts # Drizzle ORM configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
├── vite.config.ts # Vite build configuration
├── postcss.config.js # PostCSS configuration
├── package.json # Project dependencies and scripts
├── design_guidelines.md # UI/UX design specifications
├── components.json # Component library configuration
└── README.md # This file

````

### Key Directories Explained

#### `/client` - Frontend Application
Contains all React components, pages, and UI logic. Organized by feature for scalability.

#### `/server` - Backend Application
Core business logic including:
- **auth.ts**: JWT token generation, user validation
- **openai.ts**: LLM integration for intelligent test generation
- **routes.ts**: REST API endpoints definition
- **storage.ts**: Database and file operations
- **db.ts**: PostgreSQL connection management

#### `/shared` - Shared Utilities
Type definitions and utilities shared between frontend and backend for consistency.

---

## 📋 Prerequisites

Before installation, ensure you have:

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version

### External Requirements
- **OpenAI API Key**: [Get from OpenAI](https://platform.openai.com/account/api-keys)
- **PostgreSQL Database URL**: Local or cloud-hosted (e.g., Supabase, Railway)

### Recommended
- **VS Code**: For development with recommended extensions
- **Postman**: For API testing
- **pgAdmin** or **DBeaver**: For database management

---

## 🚀 Installation & Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/AshwaPuri24/AIMCQTest.git
cd AIMCQTest
````

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the project root:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk_your_openai_api_key_here
OPENAI_API_KEY=sk_your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo  # or gpt-3.5-turbo for cost optimization

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aimcqtest
# Example with cloud provider:
# DATABASE_URL=postgresql://user:password@cloud-provider.com:5432/aimcqtest

# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Client Configuration
VITE_API_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Session Configuration
SESSION_SECRET=your_session_secret_key_min_32_characters

# Feature Flags (Optional)
ENABLE_ANALYTICS=true
ENABLE_USER_FEEDBACK=true
MAX_QUESTIONS_PER_TEST=50
MAX_TEST_DURATION_MINUTES=120
```

### Step 4: Database Setup

```bash
# Run database migrations using Drizzle ORM
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

### Step 5: Verify Installation

```bash
# Test database connection
npm run db:check

# Verify all dependencies
npm list
```

---

## ⚙️ Configuration

### Drizzle ORM Configuration (`drizzle.config.ts`)

```typescript
export default defineConfig({
  schema: "./server/schemas/**/*.ts",
  driver: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },
});
```

### TypeScript Configuration (`tsconfig.json`)

- Strict mode enabled for type safety
- ES2020 target with ES2020 module support
- Path aliases for cleaner imports

### Tailwind CSS Configuration (`tailwind.config.ts`)

- Custom color palette
- Extended spacing system
- Component-layer styles

---

## 💻 Usage

### Development Environment

#### Start Development Server

```bash
# Runs both client and server with hot-reload
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

#### Individual Development

```bash
# Run only client development server
npm run dev:client

# Run only server development server
npm run dev:server
```

### Production Build

```bash
# Build entire project for production
npm run build

# Build only client
npm run build:client

# Build only server
npm run build:server

# Start production server
npm run start
```

### Database Operations

```bash
# Generate new migration
npm run db:generate -- --name migration_name

# Apply pending migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Open Drizzle Studio for visual database management
npm run db:studio
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Test Endpoints

#### Generate MCQ Test

```http
POST /api/tests/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "JavaScript Basics",
  "numberOfQuestions": 10,
  "difficulty": "intermediate",
  "questionType": "multiple-choice"
}

Response: 200 OK
{
  "success": true,
  "testId": "test-uuid",
  "questions": [
    {
      "id": "q1",
      "question": "What is the output of console.log(typeof []);",
      "options": ["array", "object", "undefined", "null"],
      "correctAnswer": 1,
      "explanation": "In JavaScript, arrays are objects..."
    },
    ...
  ]
}
```

#### Submit Test Response

```http
POST /api/tests/{testId}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [
    { "questionId": "q1", "selectedOption": 1 },
    { "questionId": "q2", "selectedOption": 3 }
  ]
}

Response: 200 OK
{
  "success": true,
  "score": 18,
  "totalQuestions": 10,
  "percentage": 90,
  "results": [ ... ]
}
```

#### Retrieve Test History

```http
GET /api/tests/history
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "tests": [
    {
      "testId": "test-uuid",
      "topic": "JavaScript Basics",
      "createdAt": "2025-11-20T10:30:00Z",
      "score": 18,
      "totalQuestions": 10,
      "percentage": 90
    },
    ...
  ]
}
```

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

Common Error Codes:

- `AUTH_INVALID_CREDENTIALS`: Invalid email/password
- `AUTH_TOKEN_EXPIRED`: JWT token expired
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

---

## 👨‍💻 Development

### Code Style & Standards

#### TypeScript Guidelines

- Strict mode enabled; no `any` types without justification
- Interfaces for data structures; Types for unions and aliases
- JSDoc comments for public APIs

```typescript
/**
 * Generates MCQ questions based on topic and preferences
 * @param topic - The technical topic for question generation
 * @param count - Number of questions to generate
 * @param difficulty - Question difficulty level
 * @returns Promise containing generated questions
 */
export async function generateMCQs(
  topic: string,
  count: number,
  difficulty: "beginner" | "intermediate" | "advanced",
): Promise<Question[]> {
  // Implementation
}
```

#### Component Guidelines (React)

- Functional components with hooks
- Props destructuring with TypeScript
- Custom hooks for logic reuse

```typescript
interface TestCardProps {
  testId: string;
  topic: string;
  score: number;
  totalQuestions: number;
}

export const TestCard: React.FC<TestCardProps> = ({
  testId,
  topic,
  score,
  totalQuestions,
}) => {
  return (
    // Component JSX
  );
};
```

### Testing Strategy

#### Unit Tests

```bash
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

#### Integration Tests

API endpoints tested with Postman collection or Jest supertest

#### E2E Tests

Full user flow testing with Playwright or Cypress

### Commit Message Convention

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:

```
feat(mcq-generation): add difficulty level customization

- Implement three difficulty levels: beginner, intermediate, advanced
- Update OpenAI prompt template to include difficulty context
- Add difficulty selection to UI

Closes #123
```

### Git Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feat/feature-name
   ```

2. **Make Changes & Commit**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push & Create PR**

   ```bash
   git push origin feat/feature-name
   ```

4. **PR Review & Merge**
   - Ensure CI passes
   - Get code review approval
   - Squash merge to main

---

## 🌐 Deployment

### Deployment Options

#### Option 1: Render.com (Recommended for Full Stack)

1. **Create Render Account** and connect GitHub repository

2. **Environment Variables** in Render Dashboard

   ```
   OPENAI_API_KEY=sk_...
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   NODE_ENV=production
   ```

3. **Build Command**

   ```bash
   npm install && npm run build
   ```

4. **Start Command**

   ```bash
   npm start
   ```

5. **Deploy**
   - Push to main branch
   - Render automatically deploys

#### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**

```bash
vercel deploy --prod
```

**Backend (Railway):**

```bash
railway up
```

#### Option 3: Docker Containerization

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t aimcqtest .
docker run -p 5000:5000 --env-file .env.production aimcqtest
```

### Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Performance optimized (bundle size < 500KB gzip)
- [ ] Security audit passed (`npm audit`)
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled
- [ ] Monitoring and logging configured

### Post-Deployment

- [ ] Smoke tests on production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all integrations (OpenAI, Database)
- [ ] Set up automatic backups

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Contributing Guidelines

1. **Fork the Repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/AIMCQTest.git
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feat/amazing-feature
   ```

3. **Make Your Changes**
   - Follow code style guidelines
   - Write/update tests
   - Update documentation

4. **Commit Changes**

   ```bash
   git commit -m 'feat(scope): add amazing feature'
   ```

5. **Push to Branch**

   ```bash
   git push origin feat/amazing-feature
   ```

6. **Open Pull Request**
   - Provide clear PR description
   - Link related issues
   - Ensure CI passes

### Issues & Feature Requests

- **Bug Reports**: Use bug report template
- **Feature Requests**: Use feature request template
- **Questions**: Use discussions feature

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Error

```
Error: ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```bash
# Ensure PostgreSQL is running
sudo service postgresql start

# Verify DATABASE_URL in .env.local
# Format: postgresql://user:password@host:port/database
```

#### 2. OpenAI API Authentication Failed

```
Error: 401 Unauthorized - Invalid API key
```

**Solution:**

- Verify `OPENAI_API_KEY` in `.env.local`
- Check API key not expired
- Ensure account has credits

#### 3. Vite HMR Connection Issues

```
WebSocket connection error during development
```

**Solution:**

```bash
# Clear cache and restart
rm -rf node_modules .cache
npm install
npm run dev
```

#### 4. CORS Errors in Development

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

- Verify frontend and backend URLs match
- Check CORS middleware in `server/index.ts`
- Ensure credentials handling for cookies

#### 5. Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Linux/Mac: Find and kill process
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev:server
```

#### 6. Drizzle Migration Issues

```
Error: migration file not found
```

**Solution:**

```bash
# Regenerate migrations
npm run db:generate -- --name fix_migration

# Or manually inspect migrations folder
ls -la drizzle/
```

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm run dev
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use permitted
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty or liability

---

## 💬 Support & Community

### Getting Help

- **Documentation**: [Wiki](https://github.com/AshwaPuri24/AIMCQTest/wiki)
- **Issues**: [GitHub Issues](https://github.com/AshwaPuri24/AIMCQTest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AshwaPuri24/AIMCQTest/discussions)
- **Email**: support@aimcqtest.com (if applicable)

### Acknowledgments

- OpenAI for GPT models
- PostgreSQL community
- React and TypeScript communities
- All contributors and users

### Roadmap

#### Phase 1 (Current)

- [x] Core MCQ generation
- [x] User authentication
- [x] Basic test management
- [ ] Enhanced UI/UX

#### Phase 2 (Upcoming)

- [ ] Mobile application
- [ ] AI proctoring features
- [ ] Advanced analytics
- [ ] Collaborative testing

#### Phase 3 (Future)

- [ ] Video explanations
- [ ] Adaptive learning paths
- [ ] Certification badges
- [ ] Corporate training integration

---

## 📊 Project Statistics

- **Language**: TypeScript
- **Framework**: React + Express.js
- **Database**: PostgreSQL
- **License**: MIT
- **Status**: Active Development
- **Contributors**: Open to community

---

## 🚀 Quick Start Summary

```bash
# 1. Clone and install
git clone https://github.com/AshwaPuri24/AIMCQTest.git
cd AIMCQTest
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Setup database
npm run db:migrate

# 4. Start development
npm run dev

# 5. Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## 📝 Notes

- This project requires an active OpenAI API subscription
- PostgreSQL database is mandatory for production use
- Always use environment variables for sensitive data
- Keep dependencies updated regularly
- Review security guidelines before deployment

---