# CogniLingua - Ecossistema de Aprendizado Adaptativo Baseado em Agentes

## 📋 Visão Geral

CogniLingua é um sistema avançado de aprendizado de idiomas (foco em Espanhol) que utiliza múltiplos agentes de IA e algoritmos educacionais para criar uma experiência de aprendizado verdadeiramente personalizada e adaptativa.

### Características Principais

- **Digital Twin do Aluno**: Modelagem completa do estado cognitivo do estudante
- **Grafo de Conhecimento**: Estrutura de currículo baseada em Neo4j com dependências explícitas
- **BKT (Bayesian Knowledge Tracing)**: Rastreamento probabilístico de domínio de conceitos
- **FSRS (Free Spaced Repetition Scheduler)**: Otimização de revisões espaçadas
- **Orquestração Multi-Agente**: Sistema de "Mesa Redonda" para decisões pedagógicas
- **Arquitetura de Microserviços**: Monorepo modular e escalável

## 🏗️ Arquitetura

### Estrutura do Projeto (Monorepo)

```
cognilingua/
├── apps/
│   ├── api-gateway/          # Gateway principal (REST API)
│   ├── student-profiler/     # Perfil e rastreamento do aluno (BKT, FSRS)
│   └── content-brain/        # Orquestração de currículo e agentes
├── libs/
│   └── shared/               # Tipos, interfaces e utilidades compartilhadas
├── docs/
│   └── neo4j-schema.cypher   # Schema do grafo de conhecimento
└── package.json              # Configuração do workspace
```

### Microserviços

#### 1. API Gateway (Port 3000)
- **Responsabilidade**: Ponto de entrada principal para requisições externas
- **Tecnologia**: NestJS REST API
- **Principais Endpoints**:
  - `POST /learning/webhook/lesson-complete` - Recebe dados de conclusão de lição
  - `POST /learning/health` - Health check

#### 2. Student Profiler (Port 3001)
- **Responsabilidade**: Gerenciar perfis de alunos e cálculos cognitivos
- **Tecnologia**: NestJS Microservice (Redis Transport)
- **Funcionalidades**:
  - Algoritmo BKT para rastreamento de conhecimento
  - Cálculos FSRS para repetição espaçada
  - Armazenamento de histórico de aprendizado
  - Análise psicométrica

#### 3. Content Brain (Port 3002)
- **Responsabilidade**: Decisões de currículo e orquestração de agentes
- **Tecnologia**: NestJS Microservice (Redis Transport)
- **Funcionalidades**:
  - Consultas ao grafo de conhecimento (Neo4j)
  - Sistema de "Mesa Redonda" para recomendações
  - Avaliação de carga cognitiva
  - Seleção do próximo conceito

## 🧠 Modelos e Algoritmos

### 1. Bayesian Knowledge Tracing (BKT)

O BKT modela o aprendizado como um Modelo Oculto de Markov com dois estados:
- **Known (Conhecido)**: Aluno domina a habilidade
- **Unknown (Desconhecido)**: Aluno ainda não domina

**Parâmetros**:
- `pL0` (pInit): Probabilidade inicial de conhecimento (0.1)
- `pT` (pTransit): Probabilidade de aprender (0.3)
- `pG` (pGuess): Probabilidade de acertar por palpite (0.25)
- `pS` (pSlip): Probabilidade de erro por deslize (0.1)

**Atualização**:
```typescript
// Após resposta correta:
P(Learned | Correct) = P(Correct | Learned) × P(Learned) / P(Correct)

// Após resposta incorreta:
P(Learned | Incorrect) = P(Incorrect | Learned) × P(Learned) / P(Incorrect)
```

### 2. FSRS (Free Spaced Repetition Scheduler)

Otimiza o tempo de revisão baseado em:
- **Stability**: Quão duradoura é a memória (em dias)
- **Retrievability**: Probabilidade atual de recordar (0-1)
- **Difficulty**: Dificuldade inerente do conceito (0-10)

### 3. Grafo de Conhecimento (Neo4j)

Estrutura hierárquica de conceitos com relações de dependência:

```cypher
(:Concept {
  id: 'es_verbs_001',
  name: 'AR Verbs Present',
  category: 'verbs',
  difficulty: 2,
  estimatedMinutes: 40
})

(:Concept)-[:DEPENDS_ON {strength: 0.9}]->(:Concept)
```

**Níveis de Dificuldade**:
- Nível 1: Conceitos fundamentais (fonética, artigos básicos)
- Nível 2: Conceitos intermediários (adjetivos, verbos regulares)
- Nível 3: Conceitos avançados (verbos irregulares, tempos passados)

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Neo4j 5.x
- Redis 7.x (para comunicação entre microserviços)
- PostgreSQL 15+ (para armazenamento de perfis)

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd esp

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações
```

### Configuração do Neo4j

```bash
# Inicie o Neo4j
# Importe o schema
cat docs/neo4j-schema.cypher | cypher-shell -u neo4j -p <password>
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=cognilingua

# Ports
API_GATEWAY_PORT=3000
STUDENT_PROFILER_PORT=3001
CONTENT_BRAIN_PORT=3002
```

### Executar os Serviços

```bash
# Build todos os apps
npm run build:all

# Ou execute individualmente em terminais separados:

# Terminal 1 - API Gateway
npm run start --workspace=apps/api-gateway

# Terminal 2 - Student Profiler
npm run start --workspace=apps/student-profiler

# Terminal 3 - Content Brain
npm run start --workspace=apps/content-brain
```

## 📊 Uso da API

### Webhook de Conclusão de Lição

```bash
POST /learning/webhook/lesson-complete
Content-Type: application/json

{
  "studentId": "student_123",
  "conceptId": "es_verbs_001",
  "exercises": [
    {
      "exerciseId": "ex_001",
      "type": "multiple-choice",
      "correct": true,
      "timeSpent": 45,
      "attempts": 1
    },
    {
      "exerciseId": "ex_002",
      "type": "fill-in-blank",
      "correct": false,
      "timeSpent": 60,
      "attempts": 2
    }
  ],
  "sessionDuration": 300,
  "confidenceRating": 4
}
```

**Resposta**:
```json
{
  "success": true,
  "message": "Lesson completion processed successfully",
  "data": {
    "studentId": "student_123",
    "conceptId": "es_verbs_001",
    "performance": {
      "score": 50,
      "correct": 1,
      "total": 2,
      "averageTime": 52.5
    },
    "timestamp": "2025-11-24T03:00:00.000Z"
  }
}
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:cov

# Testes em modo watch
npm run test:watch
```

## 🔧 Desenvolvimento

### Estrutura de Código

- **Interfaces TypeScript**: Todas em `libs/shared/src/interfaces/`
- **Serviços**: Lógica de negócio em cada app
- **Controllers**: Endpoints REST no api-gateway
- **Engines**: Algoritmos especializados (BKT, FSRS)

### Adicionando Novos Conceitos ao Grafo

Edite `docs/neo4j-schema.cypher` e adicione:

```cypher
CREATE (c:Concept {
  id: 'es_new_concept',
  name: 'New Concept',
  category: 'category',
  difficulty: 2,
  estimatedMinutes: 30,
  description: 'Description'
});

// Adicione dependências
MATCH (new:Concept {id: 'es_new_concept'})
MATCH (prereq:Concept {id: 'es_prerequisite'})
CREATE (new)-[:DEPENDS_ON {strength: 0.8}]->(prereq);
```

## 📚 Referências Técnicas

### Algoritmos
- **BKT**: Corbett, A. T., & Anderson, J. R. (1994). Knowledge tracing
- **FSRS**: Jarrett Ye (2023). Free Spaced Repetition Scheduler
- **Spaced Repetition**: Ebbinghaus (1885). Memory: A Contribution to Experimental Psychology

### Frameworks e Bibliotecas
- NestJS: Framework Node.js progressivo
- Neo4j: Banco de dados de grafos
- TypeScript: Superset tipado de JavaScript
- BullMQ: Sistema de filas baseado em Redis

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- CogniLingua Team

## 🙏 Agradecimentos

- Comunidade NestJS
- Neo4j Community
- Pesquisadores em Educational Data Mining
- SuperMemo Algorithm Contributors
