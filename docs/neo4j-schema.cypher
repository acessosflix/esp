// CogniLingua - Neo4j Knowledge Graph Schema
// This schema defines the knowledge graph structure for adaptive learning

// ============================================
// CONSTRAINTS
// ============================================

// Ensure Concept IDs are unique
CREATE CONSTRAINT concept_id_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.id IS UNIQUE;

// ============================================
// NODE DEFINITIONS
// ============================================

// Concept nodes represent learning concepts with proficiency levels
// Properties:
//   - id: Unique identifier for the concept
//   - name: Human-readable name of the concept
//   - level: Difficulty level (e.g., A1, A2, B1, B2, C1, C2)
// Example: (:Concept {id: 'pronomes-pessoais', name: 'Pronomes Pessoais', level: 'A1'})

// ============================================
// RELATIONSHIP DEFINITIONS
// ============================================

// [:DEPENDS_ON] - Indicates that one concept depends on another
// Direction: (advanced_concept)-[:DEPENDS_ON]->(prerequisite_concept)
// Example: (Presente do Indicativo)-[:DEPENDS_ON]->(Pronomes Pessoais)

// [:IS_PREREQUISITE_FOR] - Inverse relationship of DEPENDS_ON
// Direction: (prerequisite_concept)-[:IS_PREREQUISITE_FOR]->(advanced_concept)
// Example: (Pronomes Pessoais)-[:IS_PREREQUISITE_FOR]->(Presente do Indicativo)

// ============================================
// SAMPLE DATA
// ============================================

// Create sample concepts
CREATE (pp:Concept {
  id: 'pronomes-pessoais',
  name: 'Pronomes Pessoais',
  level: 'A1'
});

CREATE (pi:Concept {
  id: 'presente-indicativo',
  name: 'Presente do Indicativo',
  level: 'A1'
});

CREATE (pp2:Concept {
  id: 'pronomes-possessivos',
  name: 'Pronomes Possessivos',
  level: 'A2'
});

CREATE (ppi:Concept {
  id: 'preterito-perfeito',
  name: 'Pretérito Perfeito',
  level: 'A2'
});

// Create dependency relationships
MATCH (pi:Concept {id: 'presente-indicativo'})
MATCH (pp:Concept {id: 'pronomes-pessoais'})
CREATE (pi)-[:DEPENDS_ON]->(pp);

MATCH (pp:Concept {id: 'pronomes-pessoais'})
MATCH (pi:Concept {id: 'presente-indicativo'})
CREATE (pp)-[:IS_PREREQUISITE_FOR]->(pi);

MATCH (pp2:Concept {id: 'pronomes-possessivos'})
MATCH (pp:Concept {id: 'pronomes-pessoais'})
CREATE (pp2)-[:DEPENDS_ON]->(pp);

MATCH (pp:Concept {id: 'pronomes-pessoais'})
MATCH (pp2:Concept {id: 'pronomes-possessivos'})
CREATE (pp)-[:IS_PREREQUISITE_FOR]->(pp2);

MATCH (ppi:Concept {id: 'preterito-perfeito'})
MATCH (pi:Concept {id: 'presente-indicativo'})
CREATE (ppi)-[:DEPENDS_ON]->(pi);

MATCH (pi:Concept {id: 'presente-indicativo'})
MATCH (ppi:Concept {id: 'preterito-perfeito'})
CREATE (pi)-[:IS_PREREQUISITE_FOR]->(ppi);

// ============================================
// QUERY EXAMPLES
// ============================================

// Find all prerequisites for a concept
// MATCH (c:Concept {id: 'presente-indicativo'})-[:DEPENDS_ON*]->(prereq:Concept)
// RETURN prereq;

// Find all concepts that depend on a given concept
// MATCH (c:Concept {id: 'pronomes-pessoais'})<-[:DEPENDS_ON]-(dependent:Concept)
// RETURN dependent;

// Find concepts at a specific level
// MATCH (c:Concept {level: 'A1'})
// RETURN c;
