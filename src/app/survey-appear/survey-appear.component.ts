import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AttemptService } from 'src/services/attempt/attempt.service';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { BuilderService } from 'src/services/builder/builder.service';
import { SurveyModel } from 'src/services/builder/survey.model';
import { CaptchaService } from 'src/services/captcha/captcha.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { ResponseService } from 'src/services/Survey-Response/response.service';

@Component({
  selector: 'app-survey-appear',
  templateUrl: './survey-appear.component.html',
  styleUrls: ['./survey-appear.component.scss'],
})
export class SurveyAppearComponent implements OnInit {
  survey: SurveyModel = null;
  surveyPassword: string = '';
  questionId: number = -1;
  userMail: string = '';
  surveyId: string = '';
  colorTheme: string = '';
  colorTheme2: string = '';

  isSurveyCompleted: Boolean = false;

  isSurveyAppearLoading: Boolean = false;
  isBeginSurveyLoading: Boolean = false;

  captcha: string = '';
  captchaCode: string = '';

  constructor(
    private titleService: Title,
    private attemptService: AttemptService,
    private authService: AuthService,
    private builderService: BuilderService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private paymentConfService: PaymentConfirmationService,
    private captchaService: CaptchaService
  ) {
    this.titleService.setTitle('SurWay Appear');
  }

  ngOnInit(): void {
    this.attemptService.currentQuestionId.subscribe((id: number) => {
      this.questionId = id;
    });

    this.route.params.subscribe((params) => {
      this.fetchSurvey(params['id']);
      this.surveyId = params['id'];
    });

    this.responseService.isSurveyAppearLoading.subscribe((flag) => {
      this.isSurveyAppearLoading = flag;
    });

    this.paymentConfService.isBeginSurveyLoading.subscribe((flag) => {
      this.isBeginSurveyLoading = flag;
    });

    this.paymentConfService.isSurveyCompleted.subscribe((flag) => {
      this.isSurveyCompleted = flag;
    });
  }

  beginSurvey() {
    if (
      this.captchaCode ==
      (<HTMLInputElement>document.getElementById('captcha-input')).value
    ) {
      if (
        !this.survey.hasPassword ||
        (this.survey.hasPassword &&
          this.surveyPassword === this.survey.password)
      ) {
        this.paymentConfService.isBeginSurveyLoading.next(true);
        document.getElementById('survey-start').style.display = 'none';
        this.authService.authenticateUser().subscribe((response: any) => {
          let token: string = response.token;
          this.responseService
            .checkSurveyStatus(token, this.surveyId)
            .subscribe((res2) => {
              if (res2.success) {
                this.responseService
                  .incrementSurveyViewCount(token, this.surveyId)
                  .subscribe((res) => {
                    // console.log(res.message);
                    this.responseService.initSurveyAnswers(); //create a new survey answers list
                    this.attemptService.currentQuestionId.next(
                      this.questionId + 1
                    );
                  });
              } else {
                // console.log(res2.message);
                window.alert('The survey is disabled');

                // swal('Oops!', 'The survey is disabled!', 'error');
              }
            });
        });
      } else {
        window.alert('Your password is incorrect');

        // swal('Oops!', 'Your password is incorrect!!', 'error');
      }
    } else {
      window.alert('Invalid Captcha Code');
    }
    // if survey has no paswword or survey has password and the password entered by user is correct
  }
  fetchSurvey(surveyId: string) {
    // fetch user session
    let user: UserCookieModel;
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      user = <UserCookieModel>JSON.parse(localStorage.getItem('userCookies'));
      this.userMail = user.email;
    }
    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string = response.token;
      this.builderService
        .getSurveyById(user.email, token, surveyId)
        .subscribe((response: any) => {
          // Found survey
          if (response.success) {
            this.survey = response.message;
            this.attemptService.survey.next(this.survey);
            this.colorTheme = this.survey.colorCode;
            this.colorTheme2 = this.colorTheme + '-lite';

            this.onRefreshCaptcha();
            // console.log(response);
          } else {
            // survey not found
            window.alert('Survey not found');

            // this.modalService.open('surveyError');
          }
        });
    });
  }

  onRefreshCaptcha() {
    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string = response.token;
      this.captchaService.generateCaptcha(token).subscribe((res: any) => {
        if (res.success) {
          this.captcha = 'data:image/png;base64,' + res.message.captchaImage;
          this.captchaCode = res.message.captchaCode;
        }
        this.responseService.isSurveyAppearLoading.next(false);
      });
    });
  }
}
