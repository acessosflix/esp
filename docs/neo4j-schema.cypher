// 1. Constraints e Índices
CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE;

// 2. Criação de Conceitos (Exemplo: Gramática Espanhola)
CREATE (:Concept {id: 'pronomes_pessoais', name: 'Pronomes Pessoais', level: 1});
CREATE (:Concept {id: 'presente_indicativo', name: 'Presente do Indicativo', level: 2});

// 3. Definição de Dependências (Grafo Direcionado Acíclico - DAG)
MATCH (a:Concept {id: 'presente_indicativo'}), (b:Concept {id: 'pronomes_pessoais'})
CREATE (a)-[:DEPENDS_ON]->(b);

// Nota: A aresta [:DEPENDS_ON] indica que 'a' requer conhecimento prévio de 'b'.
