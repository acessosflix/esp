# CogniLingua - Adaptive Learning Ecosystem

An intelligent, adaptive learning platform powered by AI agents, cognitive models, and graph-based knowledge representation.

## Project Structure

This is a monorepo-based project using NestJS framework with the following structure:

```
cognilingua/
├── apps/
│   ├── api-gateway/         # Main API Gateway (HTTP REST)
│   ├── student-profiler/    # Student Profiler Microservice (BKT + FSRS)
│   └── content-brain/       # Content Brain Microservice (Neo4j Knowledge Graph)
├── libs/
│   └── shared/              # Shared libraries and interfaces
├── docs/                    # Documentation and schemas
│   └── neo4j-schema.cypher  # Neo4j database schema
└── package.json             # Root package configuration
```

## Architecture Components

### Apps

#### 1. API Gateway (`apps/api-gateway`)
- **Port**: 3000
- **Type**: HTTP REST API
- **Purpose**: Main entry point for client applications
- **Technology**: NestJS with Express

#### 2. Student Profiler (`apps/student-profiler`)
- **Port**: 3001
- **Type**: TCP Microservice
- **Purpose**: Manages student cognitive profiles using BKT (Bayesian Knowledge Tracing) and FSRS (Free Spaced Repetition Scheduler)
- **Technology**: NestJS Microservice

#### 3. Content Brain (`apps/content-brain`)
- **Port**: 3002
- **Type**: TCP Microservice
- **Purpose**: Manages knowledge graph and concept dependencies
- **Technology**: NestJS Microservice with Neo4j

### Libraries

#### Shared (`libs/shared`)
Common interfaces and utilities used across all microservices:
- `StudentProfile`: Student cognitive state representation
- `KnowledgeState`: Per-concept mastery tracking
- `FSRSParameters`: Spaced repetition parameters
- `StudentInteraction`: Learning interaction events

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Neo4j database (for Content Brain)
- PostgreSQL (for data persistence)
- Redis (for BullMQ job queues)

### Installation

```bash
# Install dependencies
npm install

# Build all applications
npm run build:all
```

### Running the Services

```bash
# Start API Gateway in development mode
npm run start:dev

# Or start specific services
npm run start api-gateway
npm run start student-profiler
npm run start content-brain
```

### Neo4j Setup

Initialize the Neo4j database with the provided schema:

```bash
# Connect to Neo4j and run the schema
cat docs/neo4j-schema.cypher | cypher-shell -u neo4j -p password
```

## Key Technologies

- **NestJS**: Framework for building scalable server-side applications
- **Neo4j**: Graph database for knowledge representation
- **TypeORM**: ORM for PostgreSQL interactions
- **BullMQ**: Queue system for background jobs
- **LangChain**: AI/LLM integration framework
- **FSRS**: Spaced repetition algorithm
- **BKT**: Bayesian Knowledge Tracing for mastery estimation

## Development

### Project Scripts

```bash
npm run build        # Build the default app
npm run build:all    # Build all workspaces
npm run start:dev    # Start in watch mode
npm run lint         # Lint the codebase
npm run test         # Run tests
npm run test:cov     # Run tests with coverage
```

## Cognitive Models

### Bayesian Knowledge Tracing (BKT)
Estimates the probability that a student has mastered a particular concept based on their interaction history.

### FSRS (Free Spaced Repetition Scheduler)
Optimizes review intervals to maximize long-term retention while minimizing study time.

## License

Private - All Rights Reserved
