/**
 * CogniLingua - Bayesian Knowledge Tracing Engine
 * Implements BKT algorithm for tracking student knowledge mastery
 */

/**
 * Parameters for Bayesian Knowledge Tracing
 */
export interface BktParameters {
  /**
   * p(Lo): Prior probability of knowing the skill initially
   * Value between 0 and 1
   */
  priorKnowledge: number;

  /**
   * p(T): Probability of learning/transitioning from not knowing to knowing
   * Value between 0 and 1
   */
  learnRate: number;

  /**
   * p(G): Probability of guessing correctly when not knowing
   * Value between 0 and 1
   */
  guessRate: number;

  /**
   * p(S): Probability of slipping/making a mistake when knowing
   * Value between 0 and 1
   */
  slipRate: number;
}

/**
 * Result of a BKT update
 */
export interface BktUpdateResult {
  /**
   * Updated probability of mastery after observing the result
   */
  probabilityOfMastery: number;

  /**
   * Whether the student is considered to have mastered the skill
   * (typically when probability >= 0.95)
   */
  isMastered: boolean;

  /**
   * The observation that was incorporated
   */
  correctResponse: boolean;
}

/**
 * Bayesian Knowledge Tracing Engine
 * 
 * BKT is a probabilistic model that tracks student knowledge by:
 * 1. Starting with a prior probability of knowing (p(Lo))
 * 2. Updating beliefs based on student responses
 * 3. Accounting for guessing and slipping behaviors
 * 4. Modeling learning transitions
 */
export class BktEngine {
  /**
   * Update the probability of mastery based on a student's response
   * 
   * @param params - BKT parameters (p(Lo), p(T), p(G), p(S))
   * @param currentMastery - Current probability of mastery (0-1)
   * @param correctResponse - Whether the student answered correctly
   * @returns Updated BKT result with new probability of mastery
   */
  updateMastery(
    params: BktParameters,
    currentMastery: number,
    correctResponse: boolean,
  ): BktUpdateResult {
    const { learnRate, guessRate, slipRate } = params;

    // Calculate probability of correct response given current mastery
    // P(correct) = P(correct|known) * P(known) + P(correct|unknown) * P(unknown)
    // P(correct|known) = 1 - slip
    // P(correct|unknown) = guess
    const pCorrectGivenKnown = 1 - slipRate;
    const pCorrectGivenUnknown = guessRate;

    // Bayes' theorem to update mastery probability
    let updatedMastery: number;

    if (correctResponse) {
      // P(known|correct) = P(correct|known) * P(known) / P(correct)
      const pCorrect =
        pCorrectGivenKnown * currentMastery +
        pCorrectGivenUnknown * (1 - currentMastery);
      updatedMastery =
        (pCorrectGivenKnown * currentMastery) / pCorrect;
    } else {
      // P(known|incorrect) = P(incorrect|known) * P(known) / P(incorrect)
      const pIncorrectGivenKnown = slipRate;
      const pIncorrectGivenUnknown = 1 - guessRate;
      const pIncorrect =
        pIncorrectGivenKnown * currentMastery +
        pIncorrectGivenUnknown * (1 - currentMastery);
      updatedMastery =
        (pIncorrectGivenKnown * currentMastery) / pIncorrect;
    }

    // Apply learning transition
    // After each attempt, there's a probability of learning
    // P(known_next) = P(known_current) + (1 - P(known_current)) * P(T)
    const finalMastery = updatedMastery + (1 - updatedMastery) * learnRate;

    // Check if mastered (typically >= 0.95 threshold)
    const isMastered = finalMastery >= 0.95;

    return {
      probabilityOfMastery: finalMastery,
      isMastered,
      correctResponse,
    };
  }

  /**
   * Calculate initial mastery probability from parameters
   * 
   * @param params - BKT parameters
   * @returns Initial probability of mastery (p(Lo))
   */
  getInitialMastery(params: BktParameters): number {
    return params.priorKnowledge;
  }

  /**
   * Batch update mastery based on multiple observations
   * 
   * @param params - BKT parameters
   * @param initialMastery - Starting probability of mastery
   * @param responses - Array of student responses (true = correct, false = incorrect)
   * @returns Final BKT result after all observations
   */
  batchUpdate(
    params: BktParameters,
    initialMastery: number,
    responses: boolean[],
  ): BktUpdateResult {
    let currentMastery = initialMastery;
    
    // Handle empty responses array
    if (responses.length === 0) {
      return {
        probabilityOfMastery: currentMastery,
        isMastered: currentMastery >= 0.95,
        correctResponse: false, // No response to report
      };
    }

    let lastResult: BktUpdateResult = {
      probabilityOfMastery: currentMastery,
      isMastered: currentMastery >= 0.95,
      correctResponse: responses[0],
    };

    for (const response of responses) {
      lastResult = this.updateMastery(params, currentMastery, response);
      currentMastery = lastResult.probabilityOfMastery;
    }

    return lastResult;
  }
}
