import { QuestionModel } from './question.model';

export class SurveyModel {
  constructor(
    public id: string,
    public name: string,
    public surveyCategory: string | null,
    public userEmail: string | null,
    public password: string | null,
    public hasPassword: boolean,
    public questions: Array<QuestionModel>,
    public active: boolean,
    public colorCode: string
  ) {}
}
