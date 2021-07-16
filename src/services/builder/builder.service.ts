import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Template } from 'src/app/user/user-templates/template.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ModalService } from '../modal/modal.service';
import { QuestionModel } from './question.model';
import { QuestionCategory } from './questionCategory.model';
import { SurveyModel } from './survey.model';

@Injectable({
  providedIn: 'root',
})
export class BuilderService {
  public survey: SurveyModel;
  editQuestionId$ = new BehaviorSubject<number>(-1); //holds the question id that is being edited
  updatedSurvey$: BehaviorSubject<SurveyModel>; //holds the updated survey
  choosenTemplate$ = new BehaviorSubject<Template>(null); //holds the choosen template object

  isEditMode$ = new BehaviorSubject<Boolean>(false);
  saveForm$ = new BehaviorSubject<Boolean>(false);
  isPreviewMode$ = new BehaviorSubject<Boolean>(false);
  private baseURL: string =
    'https://survey-tool-backend-dot-hu18-groupa-java.et.r.appspot.com';
  isPublicSurvey$ = new BehaviorSubject<Boolean>(false);

  isBuilderLoading = new BehaviorSubject<Boolean>(true);

  constructor(
    private modalService: ModalService,
    private http: HttpClient,
    private authService: AuthService
  ) {}
  //Generate empty survey
  initSurvey(): void {
    let questions = new Array<QuestionModel>();
    questions.push(this.initQuestion(1, 'multiple'));
    this.survey = new SurveyModel(
      '',
      'Untitled Survey',
      'research',
      'dummy-email',
      '',
      false,
      questions,
      false,
      ''
    );
    this.updatedSurvey$ = new BehaviorSubject<SurveyModel>(this.survey);
  }
  //Generate dummy question
  initQuestion(id: number, type: string): QuestionModel {
    let question: QuestionModel;
    if (type == 'multiple') {
      question = new QuestionModel(
        'Question ' + id,
        false,
        new QuestionCategory('multiple'),
        ['Option 1'],
        ['Answer-1'],
        0,
        null,
        null
      );
    }
    return question;
  }

  //edit question by launching modal
  editQuestion(id: number): void {
    // console.log('inside builder service editQuestion()');
    // console.log('edit Id changed from ' + this.editQuestionId$.value);
    this.editQuestionId$.next(id);
    // console.log('to ' + this.editQuestionId$.value);

    // this.updatedSurvey$.next(this.survey);
    this.modalService.open('editingQuestion');
  }

  //Add new question (by default adds a multiple choice question)
  addQuestion(id: number): void {
    console.log('inside builder service addQuestion()');
    console.log('adding new question at position ' + id);
    let newQuestion = this.initQuestion(
      this.survey.questions.length + 1,
      'multiple'
    );
    console.log(newQuestion);
    this.survey.questions.splice(id, 0, newQuestion);
    this.editQuestionId$.next(id);
    this.editQuestion(id);
  }

  //Delete question at index
  deleteQuestion(id: number): void {
    if (this.survey.questions.length > 1) {
      console.log('inside builder service deleteQuestion()');
      console.log('deleting question at position ' + id);
      this.survey.questions.splice(id, 1);
      // this.updatedSurvey$.next(this.survey);
    } else {
      console.log('Atleast 1 question must be present!');
    }
  }

  //Create a survey in database
  createSurvey(token: string, survey: SurveyModel): Observable<any> {
    // create header
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.post(this.baseURL + '/surway/survey/add', survey, header);
  }

  // Updates current survey in database
  updateSurvey(token: string, survey: SurveyModel) {
    // create header
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.post(
      this.baseURL + '/surway/survey/editSurvey',
      survey,
      header
    );
  }

  // gets a survey by ID
  getSurveyById(
    userEmail: string,
    token: string,
    surveyId: string
  ): Observable<any> {
    let header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    return this.http.get(
      this.baseURL + '/surway/survey/getSurveyById/' + surveyId,
      header
    );
  }
}
