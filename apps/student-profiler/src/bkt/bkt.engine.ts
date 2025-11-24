export class BKTEngine {
  static updateMastery(
    pLo: number,
    isCorrect: boolean,
    pGuess: number = 0.2,
    pSlip: number = 0.1,
    pTransit: number = 0.1
  ): number {
    let pPosterior = 0;

    if (isCorrect) {
      const numerator = pLo * (1 - pSlip);
      const denominator = numerator + (1 - pLo) * pGuess;
      pPosterior = numerator / denominator;
    } else {
      const numerator = pLo * pSlip;
      const denominator = numerator + (1 - pLo) * (1 - pGuess);
      pPosterior = numerator / denominator;
    }

    return pPosterior + (1 - pPosterior) * pTransit;
  }
}
