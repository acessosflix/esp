export interface FSRSParameters {
  stability: number;      // Intervalo em dias para 90% de recall
  retrievability: number; // Probabilidade atual de recall
}

export interface KnowledgeState {
  masteryProbability: number; // Calculado pelo BKT (0.0 a 1.0)
  fsrs: FSRSParameters;
  lastReview: Date;
}

export interface StudentInteraction {
  timestamp: Date;
  conceptId: string;
  outcome: 'CORRECT' | 'INCORRECT' | 'HINT';
  responseTimeMs: number;
}

export interface StudentProfile {
  studentId: string;
  // Mapa de ConceptID -> Estado Cognitivo
  knowledgeMap: Record<string, KnowledgeState>;
  interactionHistory: StudentInteraction[];
  createdAt: Date;
  updatedAt: Date;
}
