import { KnowledgeState } from '@cognilingua/shared';

/**
 * Bayesian Knowledge Tracing Engine
 * 
 * Implements the BKT algorithm to estimate student mastery based on their performance.
 * The BKT model uses four parameters:
 * - P(L0): Initial probability of knowing the skill
 * - P(T): Probability of learning (transitioning from not knowing to knowing)
 * - P(S): Probability of slipping (knowing but answering incorrectly)
 * - P(G): Probability of guessing (not knowing but answering correctly)
 */
export class BKTEngine {
  // Default BKT parameters
  private static readonly DEFAULT_P_L0 = 0.1; // Initial knowledge probability
  private static readonly DEFAULT_P_T = 0.1; // Learning probability
  private static readonly DEFAULT_P_S = 0.1; // Slip probability
  private static readonly DEFAULT_P_G = 0.25; // Guess probability

  /**
   * Updates the mastery level for a concept based on student performance
   * using the Bayesian Knowledge Tracing formula.
   * 
   * @param knowledgeState - Current knowledge state for the concept
   * @param correct - Whether the student answered correctly
   * @param pT - Learning probability (optional, uses default if not provided)
   * @param pS - Slip probability (optional, uses default if not provided)
   * @param pG - Guess probability (optional, uses default if not provided)
   * @returns Updated mastery level
   */
  static updateMastery(
    knowledgeState: KnowledgeState,
    correct: boolean,
    pT: number = BKTEngine.DEFAULT_P_T,
    pS: number = BKTEngine.DEFAULT_P_S,
    pG: number = BKTEngine.DEFAULT_P_G,
  ): number {
    // Current mastery level (probability of knowing)
    const pLn = knowledgeState.mastery;

    // Calculate posterior probability based on whether answer was correct
    let pLnGivenEvidence: number;

    if (correct) {
      // P(L_n | correct) = P(L_n) * (1 - P(S)) / (P(L_n) * (1 - P(S)) + (1 - P(L_n)) * P(G))
      const numerator = pLn * (1 - pS);
      const denominator = pLn * (1 - pS) + (1 - pLn) * pG;
      pLnGivenEvidence = denominator > 0 ? numerator / denominator : pLn;
    } else {
      // P(L_n | incorrect) = P(L_n) * P(S) / (P(L_n) * P(S) + (1 - P(L_n)) * (1 - P(G)))
      const numerator = pLn * pS;
      const denominator = pLn * pS + (1 - pLn) * (1 - pG);
      pLnGivenEvidence = denominator > 0 ? numerator / denominator : pLn;
    }

    // Update mastery with learning probability
    // P(L_n+1) = P(L_n | evidence) + (1 - P(L_n | evidence)) * P(T)
    const updatedMastery = pLnGivenEvidence + (1 - pLnGivenEvidence) * pT;

    // Ensure mastery stays within [0, 1] bounds
    return Math.max(0, Math.min(1, updatedMastery));
  }

  /**
   * Calculates the initial mastery for a new concept
   * 
   * @param pL0 - Initial probability of knowing (optional, uses default if not provided)
   * @returns Initial mastery level
   */
  static getInitialMastery(pL0: number = BKTEngine.DEFAULT_P_L0): number {
    return pL0;
  }

  /**
   * Determines if a concept has been mastered based on a threshold
   * 
   * @param mastery - Current mastery level
   * @param threshold - Mastery threshold (default 0.95)
   * @returns True if concept is mastered
   */
  static isMastered(mastery: number, threshold: number = 0.95): boolean {
    return mastery >= threshold;
  }
}
