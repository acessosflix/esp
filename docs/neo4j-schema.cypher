// 1. Constraints and Indexes
CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE;

// 2. Concept Creation (Example: Spanish Grammar)
CREATE (:Concept {id: 'pronomes_pessoais', name: 'Pronomes Pessoais', level: 1});
CREATE (:Concept {id: 'presente_indicativo', name: 'Presente do Indicativo', level: 2});

// 3. Dependency Definition (DAG)
MATCH (a:Concept {id: 'presente_indicativo'}), (b:Concept {id: 'pronomes_pessoais'})
CREATE (a)-[:DEPENDS_ON]->(b);
