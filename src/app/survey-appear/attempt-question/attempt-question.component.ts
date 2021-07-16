import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AttemptService } from 'src/services/attempt/attempt.service';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { QuestionModel } from 'src/services/builder/question.model';
import { SurveyModel } from 'src/services/builder/survey.model';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { ResponseService } from 'src/services/Survey-Response/response.service';
import { SurveyAnswer } from 'src/services/Survey-Response/survey-answer.model';
import { SurveyResponse } from 'src/services/Survey-Response/survey-response.model';
import { SurveyResponses } from 'src/services/Survey-Response/survey-responses.model';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-attempt-question',
  templateUrl: './attempt-question.component.html',
  styleUrls: ['./attempt-question.component.scss'],
})
export class AttemptQuestionComponent implements OnInit, OnDestroy {
  isLastQuestion: Boolean = false;
  survey: SurveyModel;

  sliderMin: number = 0;
  sliderMax: number = 0;
  interval: any = 0;
  interval2: any = 0;

  totalTimeTaken: number = 0;
  questionTimeTaken: number = 0;

  question: QuestionModel = null;
  questionId: number = 0;
  endSurvey: Boolean = false; //checks if this is the last question

  answerForm: FormGroup = null;
  @Input() colorTheme: string;
  colorTheme2: string = '';

  validForm: Boolean = true;

  // will fetch answer from form
  currentQuestionAnswer: SurveyAnswer = null;

  isSurveyCompleted: Boolean = false;

  constructor(
    private attemptService: AttemptService,
    private responseService: ResponseService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private paymentConfService: PaymentConfirmationService,
    private router: Router,
    private userService: UserService
  ) {}
  ngOnDestroy(): void {
    this.attemptService.survey.unsubscribe();
    this.attemptService.currentQuestionId.unsubscribe();
    this.responseService.currentSurveyAnswers$.unsubscribe();
  }

  ngOnInit(): void {
    // this.isQuestionComplete();
    this.attemptService.survey.subscribe((survey: SurveyModel) => {
      this.survey = survey;
    });

    this.attemptService.currentQuestionId.subscribe((id: number) => {
      // if valid question id
      if (id > -1 && id < this.survey.questions.length) {
        //stop the loader which starts on click of begin survey button
        this.paymentConfService.isBeginSurveyLoading.next(false);
        this.questionId = id;
        // check if this is the last question
        if (this.questionId == this.survey.questions.length - 1) {
          this.isLastQuestion = true;
        } else {
          this.isLastQuestion = false;
        }
        // get the current question and time limit
        this.question = this.survey.questions[id];
        this.sliderMin = this.question.sliderMinValue;
        this.sliderMax = this.question.sliderMaxValue;

        this.initResponseForm();
        this.currentQuestionAnswer = new SurveyAnswer(
          this.questionId,
          0,
          this.question.title,
          null
        );
        // start timer for the survey
        this.startTimer();
        // start timer for the question
        this.questionTimeTaken = 0;
        if (this.questionId === 0) {
          this.startTimer2(); //start a new timer for the current question
        }
      } else {
        this.endSurvey = true;
      }
    });

    this.responseService.currentSurveyAnswers$.subscribe(
      (surveyAnswers: Array<SurveyAnswer>) => {
        console.log(surveyAnswers);
      }
    );

    this.colorTheme2 = this.colorTheme + '-lite';
  }
  // for going to previous question
  getBack() {
    this.pauseTimer2();
    this.saveForm();
    this.attemptService.currentQuestionId.next(this.questionId - 1);
  }
  // for going to next question
  goNext() {
    // pause timer before saving
    if (this.saveForm() === true) {
      this.pauseTimer2();
      this.currentQuestionAnswer.timeTaken = this.questionTimeTaken;
      console.log('time :' + this.currentQuestionAnswer.timeTaken);
      this.startTimer2();
      this.questionTimeTaken = 0;
      let currentSurveyAnswers =
        this.responseService.currentSurveyAnswers$.getValue();
      currentSurveyAnswers.push(this.currentQuestionAnswer);
      this.responseService.currentSurveyAnswers$.next(currentSurveyAnswers);

      if (this.isLastQuestion === false) {
        //if not last question
        this.attemptService.currentQuestionId.next(this.questionId + 1); //move to next question
      } else {
        //if last question
        // save survey responses into db
        this.paymentConfService.isBeginSurveyLoading.next(true);
        if (localStorage.getItem('userCookies')) {
          // fetch user email
          let user: UserCookieModel = <UserCookieModel>(
            JSON.parse(localStorage.getItem('userCookies'))
          );
          var userMail = user.email;
        }
        let surveyResponse = new SurveyResponse(
          userMail,
          this.responseService.currentSurveyAnswers$.getValue()
        );
        let surveyResponses = new SurveyResponses(
          this.attemptService.survey.getValue().id,
          [surveyResponse]
        );
        this.authService.authenticateUser().subscribe((response: any) => {
          let token: string = response.token;
          this.responseService
            .saveResponse(surveyResponses, token)
            .subscribe((res) => {
              console.log(res.message);
              this.paymentConfService.isBeginSurveyLoading.next(false);
              if (
                res.message ===
                'Your response has been recorded on public survey'
              ) {
                this.paymentConfService.isSurveyCompleted.next(true);
                this.paymentConfService.paymentFailed.next(false);
                this.paymentConfService.modalHeader.next('Survey Editor');
                this.paymentConfService.imagePath.next(
                  './../../../../assets/tick-modal.gif'
                );
                this.paymentConfService.message$.next(
                  'Your response has been submitted & awarded with 2 HU coins!'
                );
                this.add2HUCoinsInLocal();
                this.paymentConfService.alertopen();
                setTimeout(() => {
                  this.paymentConfService.close();
                  this.router.navigate(['/user'], { replaceUrl: true });
                  this.paymentConfService.isSurveyCompleted.next(false);
                }, 4000);

                // swal("Good job!", "Your response has been submitted!", "success");
              } else if (
                res.message ===
                'Response has been Recorded successfully on non public survey'
              ) {
                this.paymentConfService.isSurveyCompleted.next(true);
                this.paymentConfService.paymentFailed.next(false);
                this.paymentConfService.modalHeader.next('Survey Editor');
                this.paymentConfService.imagePath.next(
                  './../../../../assets/tick-modal.gif'
                );
                this.paymentConfService.message$.next(
                  'Your response has been submitted'
                );
                this.paymentConfService.alertopen();
                setTimeout(() => {
                  this.paymentConfService.close();
                  this.router.navigate(['/user'], { replaceUrl: true });
                  this.paymentConfService.isSurveyCompleted.next(false);
                }, 4000);
              } else {
                this.paymentConfService.isSurveyCompleted.next(true);
                this.paymentConfService.paymentFailed.next(false);
                this.paymentConfService.modalHeader.next('Survey Editor');
                this.paymentConfService.imagePath.next(
                  './../../../../assets/cross-modal.gif'
                );
                this.paymentConfService.message$.next(
                  'You have already responded to this survey'
                );
                this.paymentConfService.alertopen();
                // swal("Sorry!", "You have already responded to this survey!", "error");
              }
            });
        });
      }
    }
  }

  // can start a timer for entire survey
  startTimer() {
    this.interval = setInterval(() => {
      this.totalTimeTaken++;
    }, 1000);
  }

  // pauses the timer of the survey
  pauseTimer() {
    clearInterval(this.interval);
  }

  // starts a timer for the question
  startTimer2() {
    this.interval2 = setInterval(() => {
      this.questionTimeTaken++;
    }, 1000);
  }

  // pauses the timer of the question
  pauseTimer2() {
    clearInterval(this.interval2);
  }

  // initialize a response form to store response
  initResponseForm(): void {
    let checkboxAnswers = this.formBuilder.array([]);
    this.question.options.forEach((option: string) => {
      checkboxAnswers.push(this.formBuilder.control(''));
    });
    this.answerForm = this.formBuilder.group({
      answers: this.formBuilder.control(null),
      checkboxAnswers,
    });

    // checks for validity
    this.answerForm.valueChanges.subscribe((val) => {
      // console.log(this.answerForm);
      if (
        this.validForm === false &&
        this.question.questionCategory.categoryName !== 'checkbox' &&
        val.answers !== null
      ) {
        this.validForm = true;
      } else if (
        this.validForm === false &&
        this.question.questionCategory.categoryName === 'checkbox' &&
        val.checkboxAnswers.some((ele: Boolean) => ele === true)
      ) {
        this.validForm = true;
      }
    });
  }

  // get checkbox answers
  get checkboxAnswers(): FormArray {
    return this.answerForm.get('checkboxAnswers') as FormArray;
  }

  //saves the answerForm
  saveForm(): Boolean {
    if (this.answerForm.invalid) {
      console.log('Invalid options form');
      return;
    } else {
      // check if its checkbox type question
      if (this.question.questionCategory.categoryName === 'checkbox') {
        let checkAnswers: Array<string> = [];
        this.answerForm
          .get('checkboxAnswers')
          .value.forEach((ele: Boolean, index: number) => {
            if (ele === true) {
              checkAnswers.push(this.question.options[index]);
            }
          });
        this.currentQuestionAnswer.answers = checkAnswers;
      } else {
        this.currentQuestionAnswer.answers = [
          this.answerForm.get('answers').value,
        ];
      }
      // check if answer is empty for a mandatory question that is not checkbox type
      if (
        this.question.isMandatory === true &&
        this.question.questionCategory.categoryName !== 'checkbox' &&
        this.answerForm.get('answers').value === null
      ) {
        // this.validForm = true;
        console.log('Please enter a answer!!');
        this.validForm = false;
        return false;
      }
      // check if answer is empty for a mandatory question that is checkbox type
      if (
        this.question.isMandatory === true &&
        this.question.questionCategory.categoryName === 'checkbox' &&
        !this.answerForm
          .get('checkboxAnswers')
          .value.some((ele: boolean) => ele === true)
      ) {
        console.log('Please enter a answer!!');
        this.validForm = false;
        return false;
      }
      // answer is valid
      else {
        console.log('Answer form saved!');
        this.validForm = true;
        return true;
      }
    }
  }

  // checks if the question is attempted by user
  isQuestionComplete() {
    // return i < this.questionId ? true : false;
    const list = document.getElementsByClassName('q-side-btn');
    const eleList = Array.from(list);
    // console.log(eleList);

    eleList.forEach((el, index) => {
      if (index < this.questionId) {
        console.log(list[index]);
        list[index].classList.add('bg--{{' + this.colorTheme2 + '}}');
      }
    });
  }

  add2HUCoinsInLocal() {
    let user: UserCookieModel;
    this.userService.user.subscribe((userInfo) => {
      user = userInfo;
    });
    let updatedUser = new UserCookieModel(
      user.firstName,
      user.secondName,
      user.email,
      user.verified,
      user.huCoins + 2,
      user.contact,
      true,
      user.registeredDate,
      user.imageString
    );
    this.userService.user.next(updatedUser);
    localStorage.setItem('userCookies', JSON.stringify(updatedUser));
  }
}
