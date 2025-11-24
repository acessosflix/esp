# CogniLingua

Ecossistema de Aprendizado Adaptativo Baseado em Agentes - Um sistema inteligente para ensino de idiomas que adapta o conteúdo ao perfil cognitivo de cada estudante.

## 🏗️ Arquitetura

Este projeto segue uma arquitetura de microsserviços usando NestJS Monorepo:

### Microsserviços

- **`apps/api-gateway`** - Gateway REST que expõe endpoints HTTP para o frontend
- **`apps/student-profiler`** - Gerencia o Gêmeo Digital do estudante e algoritmos BKT (Bayesian Knowledge Tracing)
- **`apps/content-brain`** - Gerencia o Grafo de Conhecimento (Neo4j) e orquestração de agentes pedagógicos
- **`libs/shared`** - Biblioteca compartilhada com DTOs, Interfaces e tipos comuns

## 📊 Modelagem de Dados

### Grafo de Conhecimento (Neo4j)

O sistema utiliza Neo4j para modelar as dependências entre conceitos linguísticos:

```cypher
// Exemplo de relação de dependência
(presente_indicativo)-[:DEPENDS_ON]->(pronomes_pessoais)
```

Ver `docs/neo4j-schema.cypher` para o schema completo.

### Digital Twin do Estudante

Cada estudante possui um perfil cognitivo que rastreia:
- **Knowledge State**: Probabilidade de domínio de cada conceito (BKT)
- **FSRS Parameters**: Parâmetros de revisão espaçada
- **Interaction History**: Histórico completo de interações

Ver `libs/shared/src/interfaces/student-profile.interface.ts` para as interfaces completas.

## 🤖 Agentes Pedagógicos

### 1. Knowledge Mapper
Consulta o grafo Neo4j para identificar lacunas de conhecimento.

### 2. Psychometrician Agent
Analisa o perfil cognitivo e seleciona o próximo tópico baseado na Zona de Desenvolvimento Proximal (ZDP).

### 3. BKT Engine
Implementa Bayesian Knowledge Tracing para atualizar probabilidades de domínio em tempo real.

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Build de todos os projetos
npm run build:all
```

## 🏃 Executando os Serviços

```bash
# API Gateway (porta 3000)
npm run start:dev api-gateway

# Student Profiler (porta 3001)
npm run start:dev student-profiler

# Content Brain (porta 3002)
npm run start:dev content-brain
```

## 📝 Estrutura de Pastas

```
cognilingua/
├── apps/
│   ├── api-gateway/          # Gateway REST
│   │   └── src/
│   │       ├── learning/     # Controllers de aprendizado
│   │       ├── app.module.ts
│   │       └── main.ts
│   ├── student-profiler/     # Microserviço de perfil do aluno
│   │   └── src/
│   │       ├── bkt/          # Engine BKT
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── content-brain/        # Microserviço de conteúdo
│       └── src/
│           ├── agents/       # Agentes pedagógicos
│           ├── app.module.ts
│           └── main.ts
├── libs/
│   └── shared/               # Biblioteca compartilhada
│       └── src/
│           ├── interfaces/   # Interfaces TypeScript
│           └── index.ts
├── docs/
│   └── neo4j-schema.cypher   # Schema do Neo4j
├── package.json
├── nest-cli.json
└── tsconfig.json
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:cov
```

## 🔧 Tecnologias

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programação
- **Neo4j** - Banco de dados de grafos
- **BullMQ** - Gerenciamento de filas
- **TypeORM** - ORM para PostgreSQL
- **LangChain** - Framework para agentes LLM

## 📖 API Endpoints

### API Gateway (porta 3000)

- `POST /webhook/lesson-complete` - Notifica conclusão de lição

### Content Brain (porta 3002)

- `GET /curriculum/next-topic/:studentId` - Determina próximo tópico para o estudante

## 🌐 Comunicação entre Serviços

Os microsserviços se comunicam via TCP usando o transport layer do NestJS:

- API Gateway → Student Profiler (TCP porta 3001)
- Eventos assíncronos usando pattern-based messaging

## 📄 Licença

Este projeto é privado e proprietário.
