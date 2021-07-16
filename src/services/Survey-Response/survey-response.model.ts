import { SurveyAnswer } from './survey-answer.model';

export class SurveyResponse {
  constructor(
    public userMail: string,
    public surveyAnswers: Array<SurveyAnswer>
  ) {}
}
