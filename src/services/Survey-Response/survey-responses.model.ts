import { SurveyResponse } from "./survey-response.model";

export class SurveyResponses {
  constructor(
    public surveyId: string,
    public surveyResponseList: Array<SurveyResponse>
  ) { }
}
