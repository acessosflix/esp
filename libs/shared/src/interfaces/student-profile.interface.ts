/**
 * Student Profile Interface - Digital Twin
 * Represents the cognitive state and learning characteristics of a student
 */

/**
 * FSRS (Free Spaced Repetition Scheduler) Parameters
 * Based on the SuperMemo algorithm for optimal spaced repetition
 */
export interface FSRSParameters {
  /**
   * Stability - How long the memory will last (in days)
   * Higher stability = longer retention
   */
  stability: number;

  /**
   * Retrievability - Probability of recalling the item (0-1)
   * 0 = completely forgotten, 1 = perfect recall
   */
  retrievability: number;

  /**
   * Difficulty - Inherent difficulty of the concept (0-10)
   * Higher values indicate harder concepts
   */
  difficulty: number;

  /**
   * Last review timestamp
   */
  lastReviewed: Date;

  /**
   * Next optimal review date based on FSRS algorithm
   */
  nextReview: Date;

  /**
   * Number of times this concept has been reviewed
   */
  reviewCount: number;
}

/**
 * BKT (Bayesian Knowledge Tracing) State
 * Tracks the probability of concept mastery
 */
export interface BKTState {
  /**
   * Probability that the skill is learned (0-1)
   */
  pLearned: number;

  /**
   * Initial probability of knowing the skill before instruction (pL0)
   */
  pInit: number;

  /**
   * Probability of learning from not-known to known state (pT - transition)
   */
  pTransit: number;

  /**
   * Probability of guessing correctly when not knowing (pG)
   */
  pGuess: number;

  /**
   * Probability of making a mistake when knowing (pS - slip)
   */
  pSlip: number;

  /**
   * Number of correct responses
   */
  correctCount: number;

  /**
   * Number of incorrect responses
   */
  incorrectCount: number;

  /**
   * Last updated timestamp
   */
  lastUpdated: Date;
}

/**
 * Cognitive State for a specific concept
 * Combines FSRS and BKT models
 */
export interface ConceptState {
  /**
   * Unique identifier for the concept (from Neo4j)
   */
  conceptId: string;

  /**
   * Concept name
   */
  conceptName: string;

  /**
   * Concept category (e.g., 'verbs', 'nouns', 'adjectives')
   */
  category: string;

  /**
   * FSRS parameters for spaced repetition
   */
  fsrs: FSRSParameters;

  /**
   * BKT state for knowledge tracing
   */
  bkt: BKTState;

  /**
   * Mastery level (0-100)
   * Derived from BKT pLearned
   */
  masteryLevel: number;

  /**
   * Whether this concept is considered mastered (>= 80%)
   */
  isMastered: boolean;

  /**
   * Engagement metrics
   */
  engagement: {
    totalTimeSpent: number; // in seconds
    averageSessionTime: number; // in seconds
    sessionCount: number;
    lastSessionDate: Date;
  };
}

/**
 * Learning Session Record
 * Captures interaction data for a single learning session
 */
export interface LearningSession {
  /**
   * Unique session identifier
   */
  sessionId: string;

  /**
   * Concept being studied
   */
  conceptId: string;

  /**
   * Student identifier
   */
  studentId: string;

  /**
   * Session start time
   */
  startTime: Date;

  /**
   * Session end time
   */
  endTime: Date;

  /**
   * Duration in seconds
   */
  duration: number;

  /**
   * Exercises completed in this session
   */
  exercises: {
    exerciseId: string;
    type: string; // 'multiple-choice', 'fill-in-blank', 'translation', etc.
    correct: boolean;
    timeSpent: number; // in seconds
    attempts: number;
    timestamp: Date;
  }[];

  /**
   * Overall session performance (0-100)
   */
  performanceScore: number;

  /**
   * Student's self-reported confidence (1-5)
   */
  confidenceRating?: number;
}

/**
 * Student Profile - Complete Digital Twin
 */
export interface StudentProfile {
  /**
   * Unique student identifier
   */
  studentId: string;

  /**
   * Student metadata
   */
  metadata: {
    name: string;
    email: string;
    createdAt: Date;
    lastActive: Date;
    targetLanguage: string; // e.g., 'Spanish'
    nativeLanguage: string; // e.g., 'Portuguese'
  };

  /**
   * Cognitive states for all concepts
   * Key: conceptId, Value: ConceptState
   */
  conceptStates: Map<string, ConceptState>;

  /**
   * Learning history
   */
  learningHistory: LearningSession[];

  /**
   * Learning preferences and patterns
   */
  learningProfile: {
    preferredStudyTime: string; // 'morning', 'afternoon', 'evening'
    averageSessionLength: number; // in minutes
    learningPace: 'slow' | 'moderate' | 'fast';
    strongCategories: string[]; // Categories where student excels
    weakCategories: string[]; // Categories needing more practice
  };

  /**
   * Current curriculum position
   */
  curriculum: {
    currentConceptId: string;
    suggestedNextConcepts: string[];
    masteredConceptIds: string[];
    inProgressConceptIds: string[];
    totalConceptsInCurriculum: number;
    completionPercentage: number;
  };

  /**
   * Psychometric insights
   */
  psychometrics: {
    cognitiveLoad: number; // 0-100, current mental load
    motivationLevel: number; // 0-100
    frustrationIndex: number; // 0-100
    flowState: boolean; // Whether student is in optimal learning zone
    lastAssessment: Date;
  };
}

/**
 * DTO for updating student profile after a lesson
 */
export interface LessonCompletePayload {
  studentId: string;
  conceptId: string;
  exercises: {
    exerciseId: string;
    type: string;
    correct: boolean;
    timeSpent: number;
    attempts: number;
  }[];
  sessionDuration: number;
  confidenceRating?: number;
  timestamp: Date;
}

/**
 * Response for next lesson recommendation
 */
export interface NextLessonRecommendation {
  conceptId: string;
  conceptName: string;
  category: string;
  difficulty: number;
  estimatedMinutes: number;
  reasoning: string;
  prerequisites: {
    conceptId: string;
    conceptName: string;
    masteryLevel: number;
  }[];
}
