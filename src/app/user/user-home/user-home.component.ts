import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { ResponseService } from 'src/services/Survey-Response/response.service';
import { UserService } from 'src/services/user/user.service';
import { UserSurveyModel } from './user-surveys.model';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit, OnDestroy {
  /** Variables */
  assignedSurveyList: UserSurveyModel[] = [];
  publicSurveyList: UserSurveyModel[] = [];

  isAssignedSurveyLoading: Boolean = false;
  isPublicSurveyLoading: Boolean = false;

  email: string = '';

  btnAssignedSurveyName = 'Assigned Surveys (0)';
  btnPublicSurveyName = 'Public Surveys (0)';

  sideBarSubs: Subscription;
  assignedSubs: Subscription;
  publicSubs: Subscription;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private responseService: ResponseService
  ) {
    this.titleService.setTitle('SurWay Users');
  }

  ngOnInit(): void {
    if (localStorage.getItem('userCookies')) {
      //fetch email from local
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.email = user.email;
    }

    /** Assigned Surveys Component */
    this.isAssignedSurveyLoading = true;
    //listener for loading spinner of assigned survey component
    this.userService.isAssignedSurveyLoading.subscribe((flag) => {
      this.isAssignedSurveyLoading = flag;
    });
    this.populateAssignedSurveyList();

    this.isPublicSurveyLoading = true;
    //listener for loading spinner of assigned survey component
    this.userService.isPublicSurveyLoading.subscribe((flag) => {
      this.isPublicSurveyLoading = flag;
    });
    this.populatePublicSurveyList();

    //Listener for sidebarhome icon call refer to USERService
    this.sideBarSubs = this.userService.sideBarHomeIconCall.subscribe(
      (flag) => {
        if (flag) {
          //checks for not hitting API again if API is already in process
          this.isAssignedSurveyLoading = true;
          this.isPublicSurveyLoading = true;
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.assignedSubs != null) {
      this.assignedSubs.unsubscribe();
    }
    if (this.publicSubs != null) {
      this.publicSubs.unsubscribe();
    }
    if (this.sideBarSubs != null) {
      this.sideBarSubs.unsubscribe();
    }
  }

  //Populate assigned user surveys
  public populateAssignedSurveyList() {
    this.assignedSurveyList = [];
    this.userService.isAssignedSurveyLoading.next(true);
    this.assignedSubs = this.authService
      .authenticateUser()
      .subscribe((response: any) => {
        let token: string = response.token;
        this.userService
          .getUserAssignedSurveys(this.email, token)
          .subscribe((response2: any) => {
            if (response2.success) {
              let surveyCount = response2.message.length;
              for (let i = 0; i < surveyCount; i++) {
                let survey = response2.message[i];
                let surveyImagePath = this.userService.getImagePath(
                  survey.surveyCategory
                );
                const assignedSurveyModel = new UserSurveyModel(
                  survey.id,
                  survey.name,
                  surveyImagePath,
                  survey.surveyCategory,
                  survey.userEmail,
                  survey.hasPassword,
                  survey.timestamp,
                  survey.active,
                  survey.questions.length,
                  survey.password
                );
                if (
                  assignedSurveyModel.active &&
                  assignedSurveyModel.userEmail != this.email
                ) {
                  //Only add the assigned surveys other than his created surveys, if those are active/enabled
                  this.assignedSurveyList.push(assignedSurveyModel);
                }
              }
              //dynamically set button name
              this.btnAssignedSurveyName = `Assigned Surveys (${this.assignedSurveyList.length})`;
            } else {
              //error
            }
            setTimeout(() => {
              this.userService.isAssignedSurveyLoading.next(false);
            }, 1000);
          });
      });
  }

  //Populate public surveys
  public populatePublicSurveyList() {
    this.publicSurveyList = [];
    this.userService.isPublicSurveyLoading.next(true);
    this.publicSubs = this.authService
      .authenticateUser()
      .subscribe((response: any) => {
        let token: string = response.token;
        this.userService
          .getAllPublicSurveys(token, this.email)
          .subscribe((response2: any) => {
            console.log('PUBLIC SURVEY LIST!!!');

            console.log(response2);

            if (response2.success) {
              let surveyCount = response2.message.length;
              for (let i = 0; i < surveyCount; i++) {
                let survey = response2.message[i];
                let surveyImagePath = this.userService.getImagePath(
                  survey.surveyCategory
                );
                const publicSurveyModel = new UserSurveyModel(
                  survey.id,
                  survey.name,
                  surveyImagePath,
                  survey.surveyCategory,
                  survey.userEmail,
                  survey.hasPassword,
                  survey.timestamp,
                  survey.active,
                  survey.questions.length,
                  survey.password
                );
                if (
                  publicSurveyModel.active &&
                  publicSurveyModel.userEmail != this.email
                ) {
                  //Only add the assigned surveys other than his own surveys, if those are active/enabled
                  this.publicSurveyList.push(publicSurveyModel);
                }
              }
              //dynamically set button name
              this.btnPublicSurveyName = `Public Surveys (${this.publicSurveyList.length})`;
            } else {
              //error
            }
            this.userService.isPublicSurveyLoading.next(false);
          });
      });
  }
  // redirects user to appear the current survey
  appearSurvey(item: UserSurveyModel) {
    // console.log(item);
    this.responseService.isSurveyAppearLoading.next(true);
    this.router.navigateByUrl('/appearSurvey/' + item.surveyID);
  }
}
