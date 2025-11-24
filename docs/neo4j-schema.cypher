// Neo4j Schema for CogniLingua Knowledge Graph
// This file defines the structure for concepts and their relationships

// ============================================================
// CONSTRAINTS
// ============================================================

// Create constraint for unique Concept IDs
CREATE CONSTRAINT concept_id_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.id IS UNIQUE;

// Create constraint for Concept names
CREATE CONSTRAINT concept_name_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.name IS UNIQUE;

// ============================================================
// INITIAL CONCEPT NODES
// ============================================================

// Create initial concept: Pronomes Pessoais (Personal Pronouns)
CREATE (pronomes:Concept {
  id: 'concept_pronomes_pessoais',
  name: 'Pronomes Pessoais',
  description: 'Personal pronouns in Portuguese (eu, tu, ele/ela, nós, vós, eles/elas)',
  difficulty: 1,
  topic: 'Grammar',
  language: 'Portuguese',
  createdAt: datetime()
});

// Create initial concept: Presente do Indicativo (Present Indicative)
CREATE (presente:Concept {
  id: 'concept_presente_indicativo',
  name: 'Presente do Indicativo',
  description: 'Present tense conjugation in Portuguese indicative mood',
  difficulty: 2,
  topic: 'Verb Conjugation',
  language: 'Portuguese',
  createdAt: datetime()
});

// ============================================================
// RELATIONSHIPS
// ============================================================

// Define dependency: Present Indicative depends on Personal Pronouns
MATCH (pronomes:Concept {id: 'concept_pronomes_pessoais'})
MATCH (presente:Concept {id: 'concept_presente_indicativo'})
CREATE (presente)-[:DEPENDS_ON {
  weight: 1.0,
  description: 'Understanding personal pronouns is required for conjugating verbs in present tense',
  createdAt: datetime()
}]->(pronomes);

// ============================================================
// INDEXES (for performance)
// ============================================================

CREATE INDEX concept_topic_index IF NOT EXISTS
FOR (c:Concept) ON (c.topic);

CREATE INDEX concept_difficulty_index IF NOT EXISTS
FOR (c:Concept) ON (c.difficulty);
