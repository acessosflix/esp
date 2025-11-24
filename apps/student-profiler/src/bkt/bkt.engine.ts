export class BKTEngine {
  /**
   * Updates the mastery probability of a skill.
   * @param pLo - Prior (previous probability of knowing)
   * @param isCorrect - Whether the student answered correctly
   * @param pGuess - Probability of guessing correctly (Guess)
   * @param pSlip - Probability of making a mistake even if known (Slip)
   * @param pTransit - Probability of learning during the attempt
   */
  static updateMastery(
    pLo: number,
    isCorrect: boolean,
    pGuess: number = 0.2,
    pSlip: number = 0.1,
    pTransit: number = 0.1
  ): number {
    let pPosterior = 0;

    if (isCorrect) {
      // Formula: (pLo * (1 - pSlip)) / (pLo * (1 - pSlip) + (1 - pLo) * pGuess)
      const numerator = pLo * (1 - pSlip);
      const denominator = numerator + (1 - pLo) * pGuess;
      pPosterior = numerator / denominator;
    } else {
      // Formula: (pLo * pSlip) / (pLo * pSlip + (1 - pLo) * (1 - pGuess))
      const numerator = pLo * pSlip;
      const denominator = numerator + (1 - pLo) * (1 - pGuess);
      pPosterior = numerator / denominator;
    }

    // Apply transition (learning between states)
    // pNew = pPosterior + (1 - pPosterior) * pTransit
    return pPosterior + (1 - pPosterior) * pTransit;
  }
}
