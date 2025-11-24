# CogniLingua - Guia de Início Rápido

Este guia ajudará você a configurar e executar o CogniLingua em seu ambiente de desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 20.x ou superior
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (recomendado para bancos de dados)
- **Git**

## 🚀 Instalação Rápida

### 1. Clonar o Repositório

```bash
git clone https://github.com/acessosflix/esp.git
cd esp
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

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
```

### 4. Iniciar Serviços de Infraestrutura (Docker)

Crie um arquivo `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: cognilingua
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  neo4j:
    image: neo4j:5-community
    environment:
      NEO4J_AUTH: neo4j/your_password
      NEO4J_PLUGINS: '["apoc"]'
    ports:
      - "7474:7474"  # HTTP
      - "7687:7687"  # Bolt
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
```

Inicie os serviços:

```bash
docker-compose up -d
```

### 5. Importar Schema do Neo4j

Aguarde alguns segundos para o Neo4j inicializar, então execute:

```bash
# Método 1: Via Browser
# Acesse http://localhost:7474
# Cole o conteúdo de docs/neo4j-schema.cypher

# Método 2: Via CLI (se cypher-shell estiver instalado)
cat docs/neo4j-schema.cypher | docker exec -i <container-id> cypher-shell -u neo4j -p your_password
```

### 6. Build do Projeto

```bash
npm run build
```

### 7. Executar os Serviços

#### Opção A: Todos os serviços em terminais separados

Terminal 1 - API Gateway:
```bash
npm run start --workspace=apps/api-gateway
```

Terminal 2 - Student Profiler:
```bash
npm run start --workspace=apps/student-profiler
```

Terminal 3 - Content Brain:
```bash
npm run start --workspace=apps/content-brain
```

#### Opção B: Modo desenvolvimento com watch

```bash
npm run start:dev --workspace=apps/api-gateway
```

## 🧪 Testar a API

### 1. Health Check

```bash
curl -X POST http://localhost:3000/learning/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "api-gateway",
  "controller": "learning",
  "timestamp": "2025-11-24T03:00:00.000Z"
}
```

### 2. Completar uma Lição

```bash
curl -X POST http://localhost:3000/learning/webhook/lesson-complete \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student_001",
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
      },
      {
        "exerciseId": "ex_003",
        "type": "translation",
        "correct": true,
        "timeSpent": 50,
        "attempts": 1
      }
    ],
    "sessionDuration": 300,
    "confidenceRating": 4
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Lesson completion processed successfully",
  "data": {
    "studentId": "student_001",
    "conceptId": "es_verbs_001",
    "performance": {
      "score": 66.66666666666666,
      "correct": 2,
      "total": 3,
      "averageTime": 51.666666666666664
    },
    "timestamp": "2025-11-24T03:00:00.000Z"
  }
}
```

## 📊 Explorar o Neo4j

1. Acesse o Neo4j Browser: http://localhost:7474
2. Faça login com `neo4j` / `your_password`
3. Execute consultas:

```cypher
// Ver todos os conceitos
MATCH (c:Concept)
RETURN c.name, c.category, c.difficulty
ORDER BY c.difficulty, c.category;

// Ver grafo de dependências
MATCH (c:Concept)-[r:DEPENDS_ON]->(p:Concept)
RETURN c, r, p;

// Conceitos de nível 1 (iniciantes)
MATCH (c:Concept {difficulty: 1})
RETURN c.name, c.estimatedMinutes;
```

## 🔍 Verificar Logs

Todos os serviços produzem logs no console. Procure por:

- `API Gateway is running on: http://localhost:3000`
- `Student Profiler is running on: http://localhost:3001`
- `Content Brain is running on: http://localhost:3002`

## 🛠️ Desenvolvimento

### Executar Linter

```bash
npm run lint
```

### Executar Testes

```bash
npm test
```

### Build de Produção

```bash
npm run build
npm run start:prod
```

## 🐛 Troubleshooting

### Problema: "Cannot connect to Neo4j"

**Solução**:
1. Verifique se o container está rodando: `docker ps`
2. Aguarde 10-15 segundos após iniciar
3. Teste a conexão: `docker exec <container-id> cypher-shell -u neo4j -p your_password`

### Problema: "Redis connection refused"

**Solução**:
1. Verifique se Redis está rodando: `docker ps | grep redis`
2. Teste a conexão: `docker exec <container-id> redis-cli ping`

### Problema: "Module not found @cognilingua/shared"

**Solução**:
```bash
npm run build
npm install
```

### Problema: "Port already in use"

**Solução**:
```bash
# Encontre o processo
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use portas diferentes no .env
```

## 📚 Próximos Passos

1. **Ler a Documentação Completa**: [README.md](../README.md)
2. **Explorar a Arquitetura**: [docs/architecture.md](./architecture.md)
3. **Estudar o Schema Neo4j**: [docs/neo4j-schema.cypher](./neo4j-schema.cypher)
4. **Entender Interfaces**: [libs/shared/src/interfaces/](../libs/shared/src/interfaces/)

## 💡 Dicas

- Use **Postman** ou **Insomnia** para testar a API de forma mais conveniente
- Configure **VS Code** com extensões TypeScript e ESLint
- Use `npm run start:dev` para reload automático durante desenvolvimento
- Consulte logs detalhados com `DEBUG=* npm run start`

## 🤝 Contribuir

Encontrou um problema ou tem uma sugestão? Abra uma issue ou envie um PR!

---

**Parabéns! 🎉 Você configurou o CogniLingua com sucesso!**
