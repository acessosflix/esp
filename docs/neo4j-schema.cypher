// ============================================
// Neo4j Knowledge Graph Schema for CogniLingua
// Spanish Grammar Domain Model
// ============================================

// Create constraint for unique concept IDs
CREATE CONSTRAINT concept_id_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.id IS UNIQUE;

// ============================================
// LEVEL 1: FOUNDATIONAL CONCEPTS
// ============================================

// Basic Phonetics and Alphabet
CREATE (c1:Concept {
  id: 'es_phonetics_001',
  name: 'Spanish Alphabet',
  category: 'phonetics',
  difficulty: 1,
  description: 'Basic Spanish alphabet and pronunciation',
  estimatedMinutes: 30
});

CREATE (c2:Concept {
  id: 'es_phonetics_002',
  name: 'Vowel Sounds',
  category: 'phonetics',
  difficulty: 1,
  description: 'Spanish vowel pronunciation (a, e, i, o, u)',
  estimatedMinutes: 20
});

CREATE (c3:Concept {
  id: 'es_phonetics_003',
  name: 'Consonant Sounds',
  category: 'phonetics',
  difficulty: 1,
  description: 'Spanish consonant pronunciation',
  estimatedMinutes: 25
});

// Basic Articles
CREATE (c4:Concept {
  id: 'es_articles_001',
  name: 'Definite Articles',
  category: 'articles',
  difficulty: 1,
  description: 'El, la, los, las',
  estimatedMinutes: 15
});

CREATE (c5:Concept {
  id: 'es_articles_002',
  name: 'Indefinite Articles',
  category: 'articles',
  difficulty: 1,
  description: 'Un, una, unos, unas',
  estimatedMinutes: 15
});

// Basic Nouns
CREATE (c6:Concept {
  id: 'es_nouns_001',
  name: 'Noun Gender',
  category: 'nouns',
  difficulty: 1,
  description: 'Masculine and feminine nouns',
  estimatedMinutes: 20
});

CREATE (c7:Concept {
  id: 'es_nouns_002',
  name: 'Noun Number',
  category: 'nouns',
  difficulty: 1,
  description: 'Singular and plural forms',
  estimatedMinutes: 20
});

// ============================================
// LEVEL 2: INTERMEDIATE CONCEPTS
// ============================================

// Adjectives
CREATE (c8:Concept {
  id: 'es_adjectives_001',
  name: 'Adjective Agreement',
  category: 'adjectives',
  difficulty: 2,
  description: 'Gender and number agreement with nouns',
  estimatedMinutes: 30
});

CREATE (c9:Concept {
  id: 'es_adjectives_002',
  name: 'Adjective Position',
  category: 'adjectives',
  difficulty: 2,
  description: 'Placement before or after nouns',
  estimatedMinutes: 25
});

// Present Tense Verbs
CREATE (c10:Concept {
  id: 'es_verbs_001',
  name: 'AR Verbs Present',
  category: 'verbs',
  difficulty: 2,
  description: 'Regular -ar verb conjugation in present tense',
  estimatedMinutes: 40
});

CREATE (c11:Concept {
  id: 'es_verbs_002',
  name: 'ER Verbs Present',
  category: 'verbs',
  difficulty: 2,
  description: 'Regular -er verb conjugation in present tense',
  estimatedMinutes: 40
});

CREATE (c12:Concept {
  id: 'es_verbs_003',
  name: 'IR Verbs Present',
  category: 'verbs',
  difficulty: 2,
  description: 'Regular -ir verb conjugation in present tense',
  estimatedMinutes: 40
});

// ============================================
// LEVEL 3: ADVANCED CONCEPTS
// ============================================

// Irregular Verbs
CREATE (c13:Concept {
  id: 'es_verbs_004',
  name: 'Ser vs Estar',
  category: 'verbs',
  difficulty: 3,
  description: 'Distinction between ser and estar (to be)',
  estimatedMinutes: 50
});

CREATE (c14:Concept {
  id: 'es_verbs_005',
  name: 'Stem-Changing Verbs',
  category: 'verbs',
  difficulty: 3,
  description: 'Verbs with stem changes (e→ie, o→ue, e→i)',
  estimatedMinutes: 60
});

// Past Tenses
CREATE (c15:Concept {
  id: 'es_verbs_006',
  name: 'Preterite Tense',
  category: 'verbs',
  difficulty: 3,
  description: 'Past tense for completed actions',
  estimatedMinutes: 60
});

CREATE (c16:Concept {
  id: 'es_verbs_007',
  name: 'Imperfect Tense',
  category: 'verbs',
  difficulty: 3,
  description: 'Past tense for habitual/ongoing actions',
  estimatedMinutes: 60
});

// ============================================
// DEPENDENCY RELATIONSHIPS (DEPENDS_ON)
// ============================================

// Phonetics dependencies
MATCH (vowels:Concept {id: 'es_phonetics_002'})
MATCH (alphabet:Concept {id: 'es_phonetics_001'})
CREATE (vowels)-[:DEPENDS_ON {strength: 0.9}]->(alphabet);

MATCH (consonants:Concept {id: 'es_phonetics_003'})
MATCH (alphabet:Concept {id: 'es_phonetics_001'})
CREATE (consonants)-[:DEPENDS_ON {strength: 0.9}]->(alphabet);

// Articles depend on noun gender
MATCH (defArticles:Concept {id: 'es_articles_001'})
MATCH (nounGender:Concept {id: 'es_nouns_001'})
CREATE (defArticles)-[:DEPENDS_ON {strength: 0.8}]->(nounGender);

MATCH (indefArticles:Concept {id: 'es_articles_002'})
MATCH (nounGender:Concept {id: 'es_nouns_001'})
CREATE (indefArticles)-[:DEPENDS_ON {strength: 0.8}]->(nounGender);

// Plural forms depend on singular forms
MATCH (nounNumber:Concept {id: 'es_nouns_002'})
MATCH (nounGender:Concept {id: 'es_nouns_001'})
CREATE (nounNumber)-[:DEPENDS_ON {strength: 0.7}]->(nounGender);

// Adjectives depend on nouns
MATCH (adjAgreement:Concept {id: 'es_adjectives_001'})
MATCH (nounGender:Concept {id: 'es_nouns_001'})
MATCH (nounNumber:Concept {id: 'es_nouns_002'})
CREATE (adjAgreement)-[:DEPENDS_ON {strength: 0.9}]->(nounGender);
CREATE (adjAgreement)-[:DEPENDS_ON {strength: 0.9}]->(nounNumber);

MATCH (adjPosition:Concept {id: 'es_adjectives_002'})
MATCH (adjAgreement:Concept {id: 'es_adjectives_001'})
CREATE (adjPosition)-[:DEPENDS_ON {strength: 0.7}]->(adjAgreement);

// Verb conjugations depend on subject understanding
MATCH (arVerbs:Concept {id: 'es_verbs_001'})
MATCH (alphabet:Concept {id: 'es_phonetics_001'})
CREATE (arVerbs)-[:DEPENDS_ON {strength: 0.6}]->(alphabet);

MATCH (erVerbs:Concept {id: 'es_verbs_002'})
MATCH (arVerbs:Concept {id: 'es_verbs_001'})
CREATE (erVerbs)-[:DEPENDS_ON {strength: 0.8}]->(arVerbs);

MATCH (irVerbs:Concept {id: 'es_verbs_003'})
MATCH (erVerbs:Concept {id: 'es_verbs_002'})
CREATE (irVerbs)-[:DEPENDS_ON {strength: 0.8}]->(erVerbs);

// Ser vs Estar depends on basic verb knowledge
MATCH (serEstar:Concept {id: 'es_verbs_004'})
MATCH (arVerbs:Concept {id: 'es_verbs_001'})
CREATE (serEstar)-[:DEPENDS_ON {strength: 0.7}]->(arVerbs);

// Stem-changing verbs depend on regular verbs
MATCH (stemChange:Concept {id: 'es_verbs_005'})
MATCH (arVerbs:Concept {id: 'es_verbs_001'})
MATCH (erVerbs:Concept {id: 'es_verbs_002'})
MATCH (irVerbs:Concept {id: 'es_verbs_003'})
CREATE (stemChange)-[:DEPENDS_ON {strength: 0.9}]->(arVerbs);
CREATE (stemChange)-[:DEPENDS_ON {strength: 0.9}]->(erVerbs);
CREATE (stemChange)-[:DEPENDS_ON {strength: 0.9}]->(irVerbs);

// Past tenses depend on present tense
MATCH (preterite:Concept {id: 'es_verbs_006'})
MATCH (arVerbs:Concept {id: 'es_verbs_001'})
MATCH (erVerbs:Concept {id: 'es_verbs_002'})
MATCH (irVerbs:Concept {id: 'es_verbs_003'})
CREATE (preterite)-[:DEPENDS_ON {strength: 0.95}]->(arVerbs);
CREATE (preterite)-[:DEPENDS_ON {strength: 0.95}]->(erVerbs);
CREATE (preterite)-[:DEPENDS_ON {strength: 0.95}]->(irVerbs);

MATCH (imperfect:Concept {id: 'es_verbs_007'})
MATCH (preterite:Concept {id: 'es_verbs_006'})
CREATE (imperfect)-[:DEPENDS_ON {strength: 0.8}]->(preterite);

// ============================================
// QUERY EXAMPLES
// ============================================

// Find all concepts a student should master before tackling a specific concept
// MATCH (target:Concept {id: 'es_verbs_006'})<-[:DEPENDS_ON*]-(prereq:Concept)
// RETURN prereq.name, prereq.difficulty, prereq.category;

// Find the next concepts to study based on mastered concepts
// MATCH (mastered:Concept)
// WHERE mastered.id IN ['es_phonetics_001', 'es_nouns_001']
// MATCH (next:Concept)-[:DEPENDS_ON]->(mastered)
// RETURN DISTINCT next.name, next.difficulty, next.estimatedMinutes;

// Get all concepts at a specific difficulty level
// MATCH (c:Concept {difficulty: 1})
// RETURN c.name, c.category, c.estimatedMinutes
// ORDER BY c.category, c.name;
