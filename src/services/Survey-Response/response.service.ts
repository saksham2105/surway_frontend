import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SurveyAnswer } from './survey-answer.model';
import { SurveyResponses } from './survey-responses.model';

@Injectable({
  providedIn: 'root',
})
export class ResponseService {
  currentSurveyAnswers$ = new BehaviorSubject<Array<SurveyAnswer>>(null);
  surveyStartTime$ = new BehaviorSubject<number>(null);

  isSurveyAppearLoading = new BehaviorSubject<Boolean>(true);

  constructor(private http: HttpClient) {}

  private baseURL: string =
    'https://survey-tool-backend-dot-hu18-groupa-java.et.r.appspot.com';

  initSurveyAnswers() {
    this.currentSurveyAnswers$.next(new Array<SurveyAnswer>());
  }
  // saves response into db
  saveResponse(
    surveyResponses: SurveyResponses,
    token: string
  ): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.post(
      this.baseURL + '/surway/survey/saveResponse',
      surveyResponses,
      header
    );
  }

  // increases survey view count
  incrementSurveyViewCount(token: string, surveyId: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    var data = { surveyId: surveyId };
    return this.http.post(
      this.baseURL + '/surway/survey/incrementSurveyViewCount',
      data,
      header
    );
  }

  checkSurveyStatus(token: string, surveyId: string): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.baseURL + '/surway/survey/isSurveyEnabled/' + surveyId,
      header
    );
  }
}
