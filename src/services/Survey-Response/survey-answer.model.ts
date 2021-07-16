export class SurveyAnswer {
  constructor(
    public questionNumber: number,
    public timeTaken: number,
    public question: string,
    public answers: Array<string>
  ) { }
}
