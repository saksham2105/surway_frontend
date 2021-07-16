export class MySurveysModel {
  constructor(
    public surveyID: string,
    public surveyName: string,
    public surveyImage: string,
    public surveyCategory: string,
    public surveyCreationDate: string,
    public surveyViewsCount: number,
    public surveyResponsesCount: number,
    public surveyCompletionRate: number,
    public surveyLastResponse: string,
    public surveyActive: boolean
  ) {}
}
