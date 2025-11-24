# CogniLingua - Arquitetura Técnica

## 1. Visão Geral da Arquitetura

CogniLingua utiliza uma arquitetura de microserviços baseada em eventos, implementada como um monorepo TypeScript/NestJS. O sistema é composto por três microserviços principais que se comunicam via Redis e compartilham tipos através da biblioteca `@cognilingua/shared`.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend/Client                          │
│                    (React/Vue/Mobile App)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway (Port 3000)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  - Validação de requisições                               │  │
│  │  - Roteamento                                             │  │
│  │  │  - POST /learning/webhook/lesson-complete              │  │
│  │  - Transformação de dados                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             │ Redis Events                  │ Redis Events
             ▼                               ▼
┌────────────────────────────┐  ┌───────────────────────────────┐
│   Student Profiler         │  │     Content Brain            │
│   (Port 3001)              │  │     (Port 3002)              │
│                            │  │                              │
│  ┌──────────────────────┐ │  │  ┌───────────────────────┐  │
│  │ BKT Engine           │ │  │  │ Curriculum Service    │  │
│  │ - pLearned tracking  │ │  │  │ - Round Table Logic   │  │
│  │ - Mastery calculation│ │  │  │ - Concept selection   │  │
│  └──────────────────────┘ │  │  └───────────────────────┘  │
│                            │  │                              │
│  ┌──────────────────────┐ │  │  ┌───────────────────────┐  │
│  │ FSRS Engine          │ │  │  │ Neo4j Client          │  │
│  │ - Stability calc     │ │  │  │ - Graph queries       │  │
│  │ - Review scheduling  │ │  │  │ - Dependency checks   │  │
│  └──────────────────────┘ │  │  └───────────────────────┘  │
│                            │  │                              │
│  ┌──────────────────────┐ │  │  ┌───────────────────────┐  │
│  │ Profile Repository   │ │  │  │ Psychometric Agent    │  │
│  │ - PostgreSQL         │ │  │  │ - Cognitive load      │  │
│  │ - Student states     │ │  │  │ - Motivation tracking │  │
│  └──────────────────────┘ │  │  └───────────────────────┘  │
└────────────────────────────┘  └───────────────────────────────┘
             │                               │
             │                               │
             ▼                               ▼
┌────────────────────────────┐  ┌───────────────────────────────┐
│      PostgreSQL            │  │         Neo4j                 │
│  - Student Profiles        │  │  - Knowledge Graph            │
│  - Learning History        │  │  - Concept Dependencies       │
│  - Session Data            │  │  - Curriculum Structure       │
└────────────────────────────┘  └───────────────────────────────┘
```

## 2. Componentes Detalhados

### 2.1 API Gateway (`apps/api-gateway`)

**Responsabilidade**: Ponto de entrada único para todas as requisições externas.

**Tecnologias**:
- NestJS HTTP Server
- class-validator para validação de DTOs
- class-transformer para transformação de objetos

**Endpoints**:

| Método | Caminho                            | Descrição                        |
|--------|-----------------------------------|----------------------------------|
| POST   | `/learning/webhook/lesson-complete` | Recebe dados de lição concluída  |
| POST   | `/learning/health`                 | Health check                     |

**Fluxo de Processamento**:
1. Recebe requisição HTTP
2. Valida payload com class-validator
3. Aplica regras de negócio
4. Emite evento via Redis para microserviços
5. Retorna resposta ao cliente

### 2.2 Student Profiler (`apps/student-profiler`)

**Responsabilidade**: Gerenciar o "Digital Twin" do aluno, incluindo todos os estados cognitivos e cálculos probabilísticos.

**Componentes Principais**:

#### BKT Engine (`src/bkt/bkt.engine.ts`)
- Implementa Bayesian Knowledge Tracing
- Atualiza probabilidade de domínio (pLearned)
- Calcula mastery level (0-100)
- Recomenda intensidade de prática

**Parâmetros BKT**:
```typescript
{
  pInit: 0.1,      // 10% conhecimento inicial
  pTransit: 0.3,   // 30% chance de aprender
  pGuess: 0.25,    // 25% chance de acerto por palpite
  pSlip: 0.1       // 10% chance de erro por deslize
}
```

**Fórmula de Atualização**:
```
P(L_new) = P(L_old | evidence) + (1 - P(L_old | evidence)) * pTransit

Onde:
P(L | Correct) = [(1-pSlip) * P(L)] / [(1-pSlip)*P(L) + pGuess*(1-P(L))]
P(L | Incorrect) = [pSlip * P(L)] / [pSlip*P(L) + (1-pGuess)*(1-P(L))]
```

#### FSRS Engine (Futuro)
- Calcula stability e retrievability
- Agenda próximas revisões
- Otimiza intervalos de repetição

#### Profile Repository
- Armazena estados em PostgreSQL
- Mantém histórico de sessões
- Gerencia métricas de engajamento

### 2.3 Content Brain (`apps/content-brain`)

**Responsabilidade**: Orquestrar a "Mesa Redonda" de agentes para decisões de currículo.

**Componentes Principais**:

#### Curriculum Service (`src/agents/curriculum.service.ts`)

**Sistema de "Mesa Redonda"** - Processo de decisão colaborativa:

```typescript
async getNextLesson(studentProfile) {
  // 1. Consultar Neo4j para conceitos disponíveis
  const availableConcepts = await this.getAvailableConcepts();
  
  // 2. Avaliar carga cognitiva
  const cognitiveLoad = this.assessCognitiveLoad(studentProfile);
  
  // 3. Filtrar por pré-requisitos
  const eligibleConcepts = this.filterByPrerequisites(availableConcepts);
  
  // 4. Identificar oportunidades de revisão (FSRS)
  const reviewCandidates = this.identifyReviewCandidates(studentProfile);
  
  // 5. Pontuar candidatos
  const scoredConcepts = this.scoreConceptCandidates(
    eligibleConcepts, 
    reviewCandidates,
    cognitiveLoad
  );
  
  // 6. Selecionar melhor conceito
  return this.selectBestConcept(scoredConcepts);
}
```

**Fatores de Pontuação**:

1. **Carga Cognitiva vs Dificuldade** (±20 pontos)
   - Alta carga + baixa dificuldade = +20
   - Baixa carga + alta dificuldade = +15

2. **Força/Fraqueza da Categoria** (+10 pontos)
   - Categoria com baixo domínio médio = +10

3. **Prioridade de Revisão** (+25 pontos)
   - Conceito devido para revisão FSRS = +25

4. **Ritmo de Aprendizado** (+10 pontos)
   - Correspondência entre ritmo e dificuldade = +10

5. **Compatibilidade de Duração** (+5 pontos)
   - Cabe na duração típica de sessão = +5

6. **Variedade** (+8 pontos)
   - Categoria diferente das últimas 5 sessões = +8

### 2.4 Shared Library (`libs/shared`)

**Responsabilidade**: Tipos, interfaces e utilidades compartilhadas entre todos os microserviços.

**Principais Interfaces**:

- `StudentProfile`: Digital Twin completo
- `ConceptState`: Estado de um conceito para um aluno
- `BKTState`: Estado BKT (pLearned, pTransit, etc.)
- `FSRSParameters`: Parâmetros FSRS (stability, retrievability)
- `LearningSession`: Registro de sessão de aprendizado
- `LessonCompletePayload`: DTO para webhook
- `NextLessonRecommendation`: Resposta de recomendação

## 3. Modelo de Dados

### 3.1 Neo4j - Grafo de Conhecimento

**Nós (Nodes)**:
```cypher
(:Concept {
  id: String,              // Identificador único
  name: String,            // Nome do conceito
  category: String,        // Categoria (verbs, nouns, etc.)
  difficulty: Integer,     // 1-3 (fácil a difícil)
  estimatedMinutes: Integer, // Tempo estimado
  description: String      // Descrição
})
```

**Arestas (Relationships)**:
```cypher
(:Concept)-[:DEPENDS_ON {strength: Float}]->(:Concept)

// strength: 0.0-1.0
// 0.9+ = dependência forte
// 0.7-0.9 = dependência moderada
// 0.5-0.7 = dependência fraca
```

**Consultas Comuns**:

```cypher
// Encontrar pré-requisitos de um conceito
MATCH (c:Concept {id: $conceptId})-[:DEPENDS_ON*]->(prereq:Concept)
RETURN prereq;

// Encontrar conceitos sem dependências não atendidas
MATCH (c:Concept)
WHERE NOT EXISTS {
  MATCH (c)-[:DEPENDS_ON]->(prereq:Concept)
  WHERE NOT prereq.id IN $masteredIds
}
RETURN c;

// Conceitos do próximo nível
MATCH (mastered:Concept)
WHERE mastered.id IN $masteredIds
MATCH (next:Concept)-[:DEPENDS_ON]->(mastered)
WHERE NOT next.id IN $masteredIds
RETURN DISTINCT next;
```

### 3.2 PostgreSQL - Dados Transacionais

**Tabela: students**
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  target_language VARCHAR(50) NOT NULL,
  native_language VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  learning_pace VARCHAR(20), -- 'slow', 'moderate', 'fast'
  avg_session_length INTEGER -- em minutos
);
```

**Tabela: concept_states**
```sql
CREATE TABLE concept_states (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  concept_id VARCHAR(100) NOT NULL,
  concept_name VARCHAR(255),
  category VARCHAR(50),
  
  -- BKT State
  p_learned FLOAT NOT NULL,
  p_init FLOAT NOT NULL,
  p_transit FLOAT NOT NULL,
  p_guess FLOAT NOT NULL,
  p_slip FLOAT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  
  -- FSRS State
  stability FLOAT,
  retrievability FLOAT,
  difficulty FLOAT,
  last_reviewed TIMESTAMP,
  next_review TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  
  -- Metrics
  mastery_level INTEGER, -- 0-100
  is_mastered BOOLEAN DEFAULT FALSE,
  total_time_spent INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  last_session_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, concept_id)
);
```

**Tabela: learning_sessions**
```sql
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  concept_id VARCHAR(100) NOT NULL,
  
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL, -- em segundos
  
  performance_score FLOAT, -- 0-100
  confidence_rating INTEGER, -- 1-5
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela: session_exercises**
```sql
CREATE TABLE session_exercises (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES learning_sessions(id),
  
  exercise_id VARCHAR(100) NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  correct BOOLEAN NOT NULL,
  time_spent INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL
);
```

## 4. Fluxo de Dados Completo

### 4.1 Conclusão de Lição

```
┌─────────┐
│ Cliente │
└────┬────┘
     │ POST /learning/webhook/lesson-complete
     │ {
     │   studentId: "123",
     │   conceptId: "es_verbs_001",
     │   exercises: [...],
     │   sessionDuration: 300
     │ }
     ▼
┌──────────────┐
│ API Gateway  │
│              │
│ 1. Valida    │
│ 2. Calcula   │
│    performance│
└──────┬───────┘
       │ Event: 'lesson.completed'
       ▼
┌──────────────────┐
│ Student Profiler │
│                  │
│ 1. BKT Update    │
│    - Para cada   │
│      exercício   │
│    - Atualiza    │
│      pLearned    │
│                  │
│ 2. FSRS Update   │
│    - Ajusta      │
│      stability   │
│    - Agenda      │
│      review      │
│                  │
│ 3. Save to DB    │
│    - concept_    │
│      states      │
│    - learning_   │
│      sessions    │
└──────┬───────────┘
       │ Event: 'profile.updated'
       ▼
┌──────────────────┐
│ Content Brain    │
│                  │
│ 1. Query Neo4j   │
│    - Available   │
│      concepts    │
│    - Check deps  │
│                  │
│ 2. Round Table   │
│    - Cognitive   │
│      load        │
│    - Category    │
│      strength    │
│    - Review      │
│      needs       │
│                  │
│ 3. Score & Select│
│    - Best next   │
│      concept     │
└──────┬───────────┘
       │ Event: 'recommendation.ready'
       ▼
┌──────────────┐
│ API Gateway  │
│              │
│ Response to  │
│ Client       │
└──────────────┘
```

## 5. Segurança e Performance

### 5.1 Validação

- **Input Validation**: class-validator em todos os DTOs
- **Business Rules**: Validação adicional nos controllers
- **Type Safety**: TypeScript strict mode

### 5.2 Performance

- **Caching**: Redis para estados frequentemente acessados
- **Connection Pooling**: PostgreSQL e Neo4j
- **Async Processing**: Event-driven para operações pesadas
- **Indexação**: Índices em student_id, concept_id

### 5.3 Observabilidade

- **Logging**: Winston com níveis (debug, info, warn, error)
- **Metrics**: Prometheus para métricas de negócio
- **Tracing**: Distributed tracing com OpenTelemetry (futuro)

## 6. Deployment

### 6.1 Docker Compose (Desenvolvimento)

```yaml
services:
  api-gateway:
    build: ./apps/api-gateway
    ports: ["3000:3000"]
    depends_on: [redis, postgres]
    
  student-profiler:
    build: ./apps/student-profiler
    ports: ["3001:3001"]
    depends_on: [redis, postgres]
    
  content-brain:
    build: ./apps/content-brain
    ports: ["3002:3002"]
    depends_on: [redis, neo4j]
    
  postgres:
    image: postgres:15
    
  neo4j:
    image: neo4j:5
    
  redis:
    image: redis:7
```

### 6.2 Kubernetes (Produção)

- Deployments para cada microserviço
- Services para comunicação interna
- Ingress para roteamento externo
- Horizontal Pod Autoscaling baseado em CPU/memória
- StatefulSets para PostgreSQL, Neo4j, Redis

## 7. Roadmap Técnico

### Fase 1 (Atual): Fundação
- [x] Estrutura de monorepo
- [x] Interfaces TypeScript
- [x] BKT Engine básico
- [x] Curriculum Service
- [x] API Gateway controller

### Fase 2: Integração
- [ ] Integração PostgreSQL completa
- [ ] Integração Neo4j completa
- [ ] Event bus Redis/BullMQ
- [ ] FSRS Engine completo

### Fase 3: Inteligência
- [ ] Agente psicométrico com ML
- [ ] Sistema de recomendação avançado
- [ ] Análise preditiva de performance
- [ ] Geração dinâmica de exercícios

### Fase 4: Escala
- [ ] Caching multicamada
- [ ] CDN para conteúdo estático
- [ ] Read replicas
- [ ] Sharding de dados
