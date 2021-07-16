export class ParticipantsModel {
  constructor(
    public userMail: string,
    public surveyAnswers: Array<SurveyAnswerParticipantModel>,
    public actualTimeTaken: string,
    public timestamp: string
  ) {}
}

export class SurveyAnswerParticipantModel {
  constructor(
    public questionNumber: number,
    public question: string,
    public timeTaken: number,
    public answers: Array<string>
  ) {}
}
