CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE;
CREATE (:Concept {id: 'pronomes_pessoais', name: 'Pronomes Pessoais', level: 1});
CREATE (:Concept {id: 'presente_indicativo', name: 'Presente do Indicativo', level: 2});
MATCH (a:Concept {id: 'presente_indicativo'}), (b:Concept {id: 'pronomes_pessoais'})
CREATE (a)-[:DEPENDS_ON]->(b);
