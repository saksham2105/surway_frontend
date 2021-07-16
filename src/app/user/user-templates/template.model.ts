import { QuestionModel } from "src/services/builder/question.model";

export class Template {
  constructor(
    public id: string,
    public color: string,
    public surveyCategory: string,
    public questions: Array<QuestionModel>,
    public status: Boolean
  ) { }
}
