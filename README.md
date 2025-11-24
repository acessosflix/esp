# CogniLingua - Adaptive Learning Ecosystem

**Ecossistema de Aprendizado Adaptativo Baseado em Agentes**

An intelligent, agent-based adaptive learning platform that uses AI and cognitive modeling to personalize educational experiences.

## 🏗️ Architecture

CogniLingua is built as a **monorepo** with a microservices architecture, featuring:

- **API Gateway** - Main entry point for external requests
- **Student Profiler** - Tracks and models student cognitive states using BKT
- **Content Brain** - AI agent orchestration for curriculum planning
- **Shared Libraries** - Common interfaces and types

### Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript (strict typing)
- **Database**: Neo4j (Knowledge Graph)
- **Caching**: Redis
- **Message Queue**: BullMQ
- **AI/ML**: LangChain, OpenAI

## 📁 Directory Structure

```
cognilingua/
├── apps/
│   ├── api-gateway/           # REST API Gateway
│   │   └── src/
│   │       ├── learning/      # Learning endpoints
│   │       │   └── learning.controller.ts
│   │       ├── app.module.ts
│   │       └── main.ts
│   ├── student-profiler/      # Student cognitive modeling
│   │   └── src/
│   │       ├── bkt/           # Bayesian Knowledge Tracing
│   │       │   └── bkt.engine.ts
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── content-brain/         # AI curriculum planning
│       └── src/
│           ├── agents/        # Agent orchestration
│           │   └── curriculum.service.ts
│           ├── app.module.ts
│           └── main.ts
├── libs/
│   └── shared/                # Shared types and interfaces
│       └── src/
│           ├── interfaces/
│           │   └── student-profile.interface.ts
│           └── index.ts
├── docs/
│   └── neo4j-schema.cypher    # Knowledge graph schema
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Neo4j database (optional for development)
- Redis (optional for development)

### Installation

```bash
# Install dependencies
npm install

# Build all applications
npm run build:all
```

### Running Applications

#### API Gateway (Port 3000)
```bash
cd apps/api-gateway
npm start
```

#### Student Profiler (Port 3002, TCP 3001)
```bash
cd apps/student-profiler
npm start
```

#### Content Brain (Port 3003)
```bash
cd apps/content-brain
npm start
```

## 🧩 Core Components

### 1. Neo4j Knowledge Graph

**File**: `docs/neo4j-schema.cypher`

The knowledge graph models learning concepts and their dependencies:

- **Nodes**: `:Concept` with properties (id, name, level)
- **Relationships**: 
  - `[:DEPENDS_ON]` - Prerequisite dependencies
  - `[:IS_PREREQUISITE_FOR]` - Inverse relationship

**Example**:
```cypher
(Presente do Indicativo) -[:DEPENDS_ON]-> (Pronomes Pessoais)
```

### 2. Digital Twin Interface

**File**: `libs/shared/src/interfaces/student-profile.interface.ts`

The `StudentProfile` interface represents a student's complete cognitive state:

```typescript
interface StudentProfile {
  studentId: string;
  proficiencyLevels: Record<string, number>;  // Concept mastery
  fsrsParams: Record<string, FsrsParams>;     // Memory modeling
  interactionHistory: InteractionRecord[];     // Learning history
  lastUpdated: Date;
}
```

### 3. Curriculum Service (Agent Orchestration)

**File**: `apps/content-brain/src/agents/curriculum.service.ts`

The "Round Table" agent collaboration system:

1. **Knowledge Graph Agent**: Queries Neo4j for knowledge gaps
2. **Psychometrician Agent**: Calculates success probability using IRT
3. **Curriculum Agent**: Recommends optimal next topic

**Key Method**: `executeRoundTable(studentId: string)`

### 4. BKT Algorithm Engine

**File**: `apps/student-profiler/src/bkt/bkt.engine.ts`

Bayesian Knowledge Tracing implementation for tracking mastery:

```typescript
class BktEngine {
  updateMastery(
    params: BktParameters,    // p(Lo), p(T), p(G), p(S)
    currentMastery: number,
    correctResponse: boolean
  ): BktUpdateResult
}
```

**Parameters**:
- `p(Lo)`: Prior knowledge
- `p(T)`: Learning rate
- `p(G)`: Guess rate
- `p(S)`: Slip rate

### 5. API Gateway Controller

**File**: `apps/api-gateway/src/learning/learning.controller.ts`

Main webhook endpoint for lesson completion:

```typescript
POST /learning/webhook/lesson-complete
{
  "studentId": "user123",
  "lessonId": "lesson456",
  "conceptId": "presente-indicativo",
  "success": true,
  "score": 85,
  "timeSpent": 300,
  "attempts": 2
}
```

## 🔧 Development

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

### Testing

```bash
npm test
```

## 📊 Key Algorithms

### Bayesian Knowledge Tracing (BKT)

BKT tracks student mastery using probabilistic updates:

1. **Prior**: Initial probability of knowing
2. **Observation**: Student response (correct/incorrect)
3. **Update**: Bayes' theorem application
4. **Learning**: Transition probability applied

### Item Response Theory (IRT)

Used by the Psychometrician Agent to calculate success probability:

```
P(success) = 1 / (1 + e^(-(θ - b)))
```

Where:
- θ (theta) = Student ability
- b = Item difficulty

### Zone of Proximal Development

The curriculum service targets success probability of 0.6-0.7 for optimal learning.

## 🎯 Features

- ✅ **Strict TypeScript typing** throughout the codebase
- ✅ **NestJS best practices** (modules, services, controllers)
- ✅ **Monorepo architecture** with workspace support
- ✅ **Microservices** communication (gRPC ready)
- ✅ **Knowledge Graph** schema with Neo4j
- ✅ **AI Agent Orchestration** for curriculum planning
- ✅ **Cognitive Modeling** with BKT algorithm
- ✅ **Digital Twin** student profiling

## 📝 API Documentation

### Webhook: Lesson Complete

**Endpoint**: `POST /learning/webhook/lesson-complete`

**Request Body**:
```json
{
  "studentId": "string",
  "lessonId": "string",
  "conceptId": "string",
  "success": boolean,
  "score": number,
  "timeSpent": number,
  "attempts": number,
  "metadata": object
}
```

**Response**:
```json
{
  "success": true,
  "message": "Lesson completion recorded. Profile update triggered.",
  "eventId": "evt_1234567890_abc123"
}
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Gateway
API_GATEWAY_PORT=3000

# Student Profiler
STUDENT_PROFILER_PORT=3002

# Content Brain
CONTENT_BRAIN_PORT=3003

# Neo4j (optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🏛️ Architecture Patterns

### Microservices Communication

- **Synchronous**: gRPC (planned)
- **Asynchronous**: Message Queue with BullMQ
- **Event Pattern**: student.profile.update

### Agent Orchestration

The "Round Table" pattern enables AI agents to collaborate:

1. Each agent has specialized knowledge
2. Agents communicate via service calls
3. Consensus emerges from collaboration
4. Final decision is data-driven

## 📚 Learning Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Neo4j Graph Database](https://neo4j.com/docs/)
- [Bayesian Knowledge Tracing](https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing)
- [Item Response Theory](https://en.wikipedia.org/wiki/Item_response_theory)

## 🤝 Contributing

This is a scaffolded project structure. To contribute:

1. Follow TypeScript strict typing
2. Use NestJS decorators and patterns
3. Write unit tests for new features
4. Update documentation

## 📄 License

Copyright © 2024 CogniLingua Team

---

**Built with ❤️ using NestJS, TypeScript, and AI**
