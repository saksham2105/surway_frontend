import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SurveyModel } from '../builder/survey.model';

@Injectable({
  providedIn: 'root'
})
export class AttemptService {

  constructor() { }

  public currentQuestionId = new BehaviorSubject<number>(-1);
  public survey = new BehaviorSubject<SurveyModel>(null);
}
