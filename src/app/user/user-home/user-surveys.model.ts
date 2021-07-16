export class UserSurveyModel {
  constructor(
    public surveyID: string,
    public surveyName: string,
    public surveyImage: string,
    public surveyCategory: string,
    public userEmail: string,
    public hasPassword: Boolean,
    public timeStamp: string,
    public active: Boolean,
    public questionsCount: number,
    public password?: string
  ) {}
}
