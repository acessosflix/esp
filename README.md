# CogniLingua

**Ecossistema de Aprendizado Adaptativo Baseado em Agentes**

CogniLingua is an adaptive learning ecosystem designed for personalized language learning. It uses AI agents, knowledge graphs, and psychometric models to provide tailored learning experiences.

## 🏗️ Architecture

This project follows a **monorepo structure** using NestJS workspaces, with three microservices and a shared library:

```
cognilingua/
├── apps/
│   ├── api-gateway/          # REST API Gateway (Port 3000)
│   ├── student-profiler/     # Student Profiling Service (Port 3001)
│   └── content-brain/        # Content & Curriculum Service (Port 3002)
├── libs/
│   └── shared/              # Shared interfaces and utilities
└── docs/
    └── neo4j-schema.cypher  # Neo4j knowledge graph schema
```

## 📦 Microservices

### 1. API Gateway (`apps/api-gateway`)
- **Purpose**: Entry point for all client requests
- **Port**: 3000
- **Technology**: NestJS HTTP Server
- **Key Features**:
  - `/learning/webhook/lesson-complete` - POST endpoint for lesson completion events
  - `/learning/health` - GET endpoint for health checks
  - Validates payloads using class-validator
  - Emits events to the student-profiler microservice

### 2. Student Profiler (`apps/student-profiler`)
- **Purpose**: Tracks student knowledge states and calculates mastery levels
- **Port**: 3001
- **Technology**: NestJS Microservice (TCP)
- **Key Features**:
  - **BKT Engine**: Implements Bayesian Knowledge Tracing algorithm
  - Calculates mastery based on student performance
  - Updates knowledge states in real-time

### 3. Content Brain (`apps/content-brain`)
- **Purpose**: Determines optimal learning paths and next topics
- **Port**: 3002
- **Technology**: NestJS Microservice (TCP)
- **Key Features**:
  - **Curriculum Service**: Determines next topic for students
  - **Psychometrician Agent**: Makes pedagogical decisions (mocked)
  - Queries Neo4j knowledge graph for concept dependencies

## 📚 Shared Library (`libs/shared`)

Contains TypeScript interfaces used across all microservices:

- **FSRSParameters**: Spaced repetition parameters
- **KnowledgeState**: Student mastery per concept
- **StudentInteraction**: Learning event data
- **StudentProfile**: Complete student learning profile

## 🧠 Knowledge Graph (Neo4j)

The `docs/neo4j-schema.cypher` file defines:

- **Concepts**: Knowledge units (e.g., "Pronomes Pessoais", "Presente do Indicativo")
- **Dependencies**: `[:DEPENDS_ON]` relationships between concepts
- **Constraints**: Unique IDs and names for concepts

### Initial Concepts

1. **Pronomes Pessoais** (Personal Pronouns) - Difficulty: 1
2. **Presente do Indicativo** (Present Indicative) - Difficulty: 2
   - Depends on: Pronomes Pessoais

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neo4j database (optional for full functionality)

### Installation

```bash
# Install dependencies
npm install

# Build all apps
npm run build

# Or build individual apps
npx nest build api-gateway
npx nest build student-profiler
npx nest build content-brain
```

### Running the Services

```bash
# Run API Gateway
npm run start:dev

# Or run specific service
npx nest start api-gateway --watch
npx nest start student-profiler --watch
npx nest start content-brain --watch
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Gateway
PORT=3000

# Student Profiler
STUDENT_PROFILER_HOST=localhost
STUDENT_PROFILER_PORT=3001

# Content Brain
CONTENT_BRAIN_HOST=localhost
CONTENT_BRAIN_PORT=3002

# Neo4j (optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

## 🔍 Linting

```bash
# Run ESLint
npm run lint
```

## 📖 API Endpoints

### API Gateway

#### POST /learning/webhook/lesson-complete
Records a lesson completion event.

**Request Body:**
```json
{
  "studentId": "string",
  "conceptId": "string",
  "success": boolean,
  "timeSpent": number (optional),
  "interactionType": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Lesson completion recorded successfully",
  "data": {
    "studentId": "string",
    "conceptId": "string",
    "success": boolean
  }
}
```

#### GET /learning/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "learning-controller",
  "timestamp": "ISO-8601 timestamp"
}
```

## 🔬 Key Algorithms

### Bayesian Knowledge Tracing (BKT)

The BKT engine in the student-profiler uses four parameters:

- **P(L0)**: Initial probability of knowing (0.1)
- **P(T)**: Probability of learning transition (0.1)
- **P(S)**: Probability of slipping (0.1)
- **P(G)**: Probability of guessing (0.25)

The algorithm updates student mastery after each interaction using Bayesian inference.

### Curriculum Selection

The Content Brain uses a heuristic approach:
1. Query Neo4j for concepts where dependencies are mastered
2. Filter out already-mastered concepts
3. Select concept with lowest difficulty and mastery

## 🏛️ Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: Neo4j (for knowledge graph)
- **Message Queue**: TCP (built-in NestJS microservices)
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

## 📝 Project Structure Details

```
apps/
├── api-gateway/
│   ├── src/
│   │   ├── learning/
│   │   │   ├── learning.controller.ts   # Webhook endpoints
│   │   │   └── learning.module.ts       # Module configuration
│   │   ├── api-gateway.module.ts        # Main app module
│   │   └── main.ts                      # Bootstrap file
│   ├── tsconfig.app.json
│   └── package.json
│
├── student-profiler/
│   ├── src/
│   │   ├── bkt/
│   │   │   └── bkt.engine.ts           # BKT algorithm
│   │   ├── student-profiler.module.ts  # Main app module
│   │   └── main.ts                     # Bootstrap file
│   ├── tsconfig.app.json
│   └── package.json
│
└── content-brain/
    ├── src/
    │   ├── agents/
    │   │   └── curriculum.service.ts    # Curriculum logic
    │   ├── content-brain.module.ts      # Main app module
    │   └── main.ts                      # Bootstrap file
    ├── tsconfig.app.json
    └── package.json

libs/
└── shared/
    ├── src/
    │   ├── interfaces/
    │   │   └── student-profile.interface.ts  # Shared interfaces
    │   └── index.ts                         # Barrel export
    ├── tsconfig.lib.json
    └── package.json
```

## 🔮 Future Enhancements

- [ ] Integrate real Neo4j queries in CurriculumService
- [ ] Implement FSRS (Free Spaced Repetition Scheduler) algorithm
- [ ] Add LLM-based Psychometrician Agent
- [ ] Implement event handlers in student-profiler for mastery calculation
- [ ] Add authentication and authorization
- [ ] Implement data persistence layer
- [ ] Add monitoring and logging
- [ ] Create end-to-end tests

## 📄 License

This project is part of the CogniLingua adaptive learning ecosystem.

## 👥 Contributing

This is a scaffold project. Contributions should follow the established architecture and coding patterns.

---

**Built with ❤️ using NestJS and TypeScript**
