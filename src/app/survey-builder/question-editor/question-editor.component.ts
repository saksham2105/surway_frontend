import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuilderService } from 'src/services/builder/builder.service';
import { QuestionModel } from 'src/services/builder/question.model';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { SurveyModel } from 'src/services/builder/survey.model';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { AuthService } from 'src/services/auth/auth.service';

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss'],
})
export class QuestionEditorComponent implements OnInit {
  // Variables
  question: QuestionModel;
  questionForm: FormGroup;
  survey: SurveyModel;
  faWindowClose = faTimes;

  isFormSaved: Boolean = false;

  @Input() editQuestionPos: number;

  constructor(
    private builderService: BuilderService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
      this.survey = survey;
      this.question = this.survey.questions[this.editQuestionPos];
    });
    this.initQuestionForm();
  }

  //Sets isMandatory property of question
  setRequired() {
    if (this.question.title !== '') {
      this.question.isMandatory = !this.question.isMandatory;
    }
  }

  //Generates a empty form object and populates with the current question data
  initQuestionForm() {
    let questionCategory = this.formBuilder.group({
      categoryName: this.formBuilder.control(
        this.question.questionCategory.categoryName
      ),
    });
    this.questionForm = this.formBuilder.group({
      title: this.formBuilder.control(this.question.title),
      isMandatory: this.formBuilder.control(this.question.isMandatory),
      questionCategory,
      options: this.formBuilder.array(this.question.options, [
        Validators.minLength(1),
      ]),
      expectedTime: this.formBuilder.control(null, [Validators.min(0)]),
      sliderMinValue: this.formBuilder.control(this.question.sliderMinValue),
      sliderMaxValue: this.formBuilder.control(this.question.sliderMaxValue),
    });
  }
  //Saves the modified form as a question into the survey object
  saveForm() {
    if (this.questionForm.invalid) {
      this.isFormSaved = false;
      // console.log("Invalid form");
      return;
    } else {
      if (
        this.questionForm.get('questionCategory.categoryName').value ===
          'date' ||
        this.questionForm.get('questionCategory.categoryName').value ===
          'slider' ||
        this.questionForm.get('questionCategory.categoryName').value === 'text'
      ) {
        this.options.clear();
        this.options.push(this.formBuilder.control('Option 1'));
      }
      this.question = Object.assign(this.question, this.questionForm.value);
      this.builderService.survey.questions[this.editQuestionPos] =
        this.question;
      this.builderService.updatedSurvey$.next(this.builderService.survey);
      // console.log('Saved form!');
      this.isFormSaved = true;
      this.updateSurvey();
    }
  }

  //Update Survey in database
  updateSurvey() {
    // fetch user session
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.survey.userEmail = user.email;
    }
    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string = response.token;
      this.builderService
        .updateSurvey(token, this.survey)
        .subscribe((res: any) => {
          if (res.success === true) {
            console.log('Updated survey in database!!');
            this.builderService.survey = this.survey;
            this.builderService.updatedSurvey$.next(this.survey);
          } else {
            console.log("Couldn't update survey!!!");
          }
        });
    });
  }
  //Getter for options formArray
  get options() {
    return this.questionForm.get('options') as FormArray;
  }
  //Getter for expectedAnswer formArray
  get answers() {
    let x: FormArray = this.questionForm.get('expectedAnswer') as FormArray;
    return this.questionForm.get('expectedAnswer') as FormArray;
  }

  //Adds new option to the question
  addNewOption(options: Array<string>) {
    this.options.clear();
    options.forEach((option, index) => {
      this.options.push(this.formBuilder.control(option));
    });
    this.saveForm();
  }

  //Adds new answer for the question (only for checkbox type question)
  addNewAnswer(answers: Array<string>) {
    // console.log(answers);
    this.answers.clear();
    answers.forEach((option, index) => {
      this.answers.push(this.formBuilder.control(option));
    });
    this.saveForm();
  }

  //Removes option at given index
  removeOption(index: number) {
    this.options.removeAt(index);
  }

  //Removes answer at given index (only for checkbox type question)
  removeAnswer(index: number) {
    this.answers.removeAt(index);
  }

  // for testing, displays the questionForm
  log() {
    console.log('question:');
    console.log(this.question);
  }

  // Resets options and answers
  reset() {
    this.answers.clear();
    this.answers.push(this.formBuilder.control('Answer-1'));
  }

  // Selects Content of field
  selectContent(event): void {
    event.target.focus();
  }
}
