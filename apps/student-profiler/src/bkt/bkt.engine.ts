export class BKTEngine {
  /**
   * Atualiza a probabilidade de domínio de uma habilidade.
   * @param pLo - Prior (probabilidade anterior de saber)
   * @param isCorrect - Se o aluno acertou ou não
   * @param pGuess - Probabilidade de acertar sem saber (Chute)
   * @param pSlip - Probabilidade de errar mesmo sabendo (Deslize)
   * @param pTransit - Probabilidade de aprender durante a tentativa
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

    // Aplicar a transição (aprendizado entre estados)
    // pNew = pPosterior + (1 - pPosterior) * pTransit
    return pPosterior + (1 - pPosterior) * pTransit;
  }
}
