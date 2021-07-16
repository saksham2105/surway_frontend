import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';
import { MySurveysModel } from './my-surveys.model';

@Component({
  selector: 'app-user-my-surveys',
  templateUrl: './user-my-surveys.component.html',
  styleUrls: ['./user-my-surveys.component.scss'],
})
export class UserMySurveysComponent implements OnInit, OnDestroy {
  mySurveyList: MySurveysModel[] = [];
  email: string = '';
  headerMySurvey = 'My Surveys (0)';
  isMySurveyLoading: Boolean = false;

  mySurveysSubs: Subscription;
  enableDisableSubs: Subscription;
  deleteSurveySubs: Subscription;
  editSurveySubs: Subscription; //to be add

  isMySurveyLaunchModal: Boolean = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private paymentConfService: PaymentConfirmationService
  ) {
    this.titleService.setTitle('SurWay My-Surveys');
  }

  ngOnInit(): void {
    this.userService.isBackFromTemplate.next(false);
    if (localStorage.getItem('userCookies')) {
      //fetch email from local
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.email = user.email;
    }

    this.userService.isMySurveyLoading.subscribe((flag) => {
      this.isMySurveyLoading = flag;
    });

    this.userService.isMySurveyModal.subscribe((flag) => {
      this.isMySurveyLaunchModal = flag;
    });

    this.mysurvey();
  }

  ngOnDestroy(): void {
    if (this.mySurveysSubs != null) {
      this.mySurveysSubs.unsubscribe();
    }
    if (this.enableDisableSubs != null) {
      this.enableDisableSubs.unsubscribe();
    }
    if (this.deleteSurveySubs != null) {
      this.deleteSurveySubs.unsubscribe();
    }
    this.userService.isMySurveyModal.next(false);
  }

  onEnableDisableSurvey(isSurveyActive: Boolean, id: string) {
    setTimeout(() => {
      this.userService.isMySurveyLoading.next(true);
      if (isSurveyActive) {
        //call the disable survey API
        this.enableDisableSubs = this.authService
          .authenticateUser()
          .subscribe((res: any) => {
            let token = res.token;
            this.userService
              .disableSurvey(token, id)
              .subscribe((response: any) => {
                if (response.success) {
                  this.mysurvey();
                } else {
                  //
                  this.userService.isMySurveyLoading.next(false);
                }
              });
          });
      } else {
        //call the enable survey API
        this.enableDisableSubs = this.authService
          .authenticateUser()
          .subscribe((res: any) => {
            let token = res.token;
            this.userService
              .enableSurvey(token, id)
              .subscribe((response: any) => {
                if (response.success) {
                  this.mysurvey();
                } else {
                  this.userService.isMySurveyLoading.next(false);
                }
              });
          });
      }
    }, 1000);
  }

  onDeleteSurvey(surveyId: string) {
    setTimeout(() => {
      this.userService.isMySurveyLoading.next(true);
      this.deleteSurveySubs = this.authService.authenticateUser().subscribe(
        (response: any) => {
          let token = response.token;
          //After getting token
          this.userService.deleteSurvey(token, surveyId).subscribe(
            (res) => {
              if (res.success) {
                this.mysurvey();
              }
            },
            (err) => {
              this.userService.isMySurveyLoading.next(false);
            }
          );
        },
        (error) => {
          this.userService.isMySurveyLoading.next(false);
        }
      );
    }, 500);
  }

  private mysurvey() {
    this.mySurveyList = [];
    this.userService.isMySurveyLoading.next(true);
    this.mySurveysSubs = this.authService
      .authenticateUser()
      .subscribe((response: any) => {
        let token: string = response.token;
        this.userService
          .getCreatorMySurveys(this.email, token)
          .subscribe((response2: any) => {
            if (response2.success) {
              console.log(JSON.stringify(response2));
              let surveyCount = response2.message.length;

              for (let i = 0; i < surveyCount; i++) {
                let survey = response2.message[i];
                let surveyImagePath = this.userService.getImagePath(
                  survey.surveyCategory
                );
                let surveyCompletionRate: number = 0;
                let viewsCount = survey.views;
                let surveyResponseCount = 0;
                let surveyLastResponseTime: string = '';
                //this is the case when user responses are null and views count is 0
                if (survey.surveyResponses != null) {
                  surveyResponseCount =
                    survey.surveyResponses.surveyResponseList.length;
                  surveyLastResponseTime =
                    survey.surveyResponses.lastResponseTime;
                  if (viewsCount != 0) {
                    surveyCompletionRate =
                      (surveyResponseCount / viewsCount) * 100;
                  }
                }

                const publicSurveyModel = new MySurveysModel(
                  survey.id,
                  survey.name,
                  surveyImagePath,
                  survey.surveyCategory,
                  survey.timestamp,
                  survey.views,
                  surveyResponseCount,
                  surveyCompletionRate,
                  surveyLastResponseTime,
                  survey.active
                );
                this.mySurveyList.push(publicSurveyModel);
              }
              //dynamically set button name
              this.headerMySurvey = `My Surveys (${this.mySurveyList.length})`;
            } else {
              //error
            }
            setTimeout(() => {
              this.userService.isMySurveyLoading.next(false);
            }, 1000);
          });
      });
  }

  // redirects to builder for editing survey
  onEditSurvey(survey: MySurveysModel) {
    if (survey.surveyResponsesCount === 0) {
      this.router.navigateByUrl('/editSurvey/' + survey.surveyID);
    } else {
      console.log('Not allowed to edit!!');
      this.paymentConfService.imagePath.next('./../../../assets/ill-edit.svg');
      this.paymentConfService.message$.next(
        'You are not allowed to edit the Survey after getting response on it.'
      );
      this.userService.isMySurveyModal.next(true);
      this.paymentConfService.alertopen();
    }
  }

  onCreateSurvey() {
    this.userService.isTemplateLoading.next(true);
  }
}
