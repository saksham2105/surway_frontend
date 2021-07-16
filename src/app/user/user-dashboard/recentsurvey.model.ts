export class RecentSurveyModel {
  constructor(
    public surveyName: string,
    public surveyCategory: string,
    public surveyCreationDate: string
  ) {}
}

export class MonthBasedResponseModel {
  constructor(
    public month: string,
    public views: number,
    private responsesCount: number
  ) {}
}
