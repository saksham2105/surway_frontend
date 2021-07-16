import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faTshirt } from '@fortawesome/free-solid-svg-icons';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { BuilderService } from 'src/services/builder/builder.service';
import { SurveyModel } from 'src/services/builder/survey.model';
import { ModalService } from 'src/services/modal/modal.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';
import { Group } from './group.model';

@Component({
  selector: 'app-survey-share',
  templateUrl: './survey-share.component.html',
  styleUrls: ['./survey-share.component.scss'],
})
export class SurveyShareComponent implements OnInit {
  surveyLink: string = 'No link available right now!';
  hideContent: number = 1;
  surveyId: string;
  @Input() userGroups: Array<Group>;
  assignedGroups = new BehaviorSubject<Array<Group>>([]);
  selectedGroupId: number = 0;
  survey: SurveyModel;
  currentEmail: string = '';
  localEmail: string = '';
  isUserSubscribed: Boolean = false;
  assignedEmails = new BehaviorSubject<Array<string>>([]);
  // isPaymentSuccess: Boolean = false;

  constructor(
    private modalService: ModalService,
    private builderService: BuilderService,
    private router: Router,
    private clipboardService: ClipboardService,
    private authService: AuthService,
    private userService: UserService,
    private paymentConfService: PaymentConfirmationService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('userCookies')) {
      //fetch email from local
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.localEmail = user.email;
      this.isUserSubscribed = user.subscribed;
    }

    this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
      this.surveyLink =
        'https://' + window.location.hostname + '/appearSurvey' + survey.id;
      this.surveyId = survey.id;
      this.survey = survey;
    });
  }

  // Hides unselected sections
  toggle(id: number): void {
    this.hideContent = id;
  }

  // goes back to previous modal
  back() {
    this.modalService.isNext$.next(false);
  }

  // for launching a private survey
  done() {
    // Not a public survey,so enable survey and assign
    if (!this.builderService.isPublicSurvey$.getValue()) {
      // this.assignSurveyToGroup();
      console.log('Current Survey>>>');
      console.log(this.survey);

      this.assignEmail();
      this.launch();
    }
  }

  // Copy appear link to clipboard
  copyContent() {
    this.clipboardService.copyFromContent(this.surveyLink);
  }

  // assign survey to a group
  assignSurveyToGroup(i: number, event) {
    // let ele: HTMLElement = event.target;

    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string, groupId: string;
      token = response.token;
      groupId = this.userGroups[i]['id'];

      this.userService
        .assignSurveyToGroup(token, this.surveyId, groupId)
        .subscribe((res: any) => {
          console.log(res);

          if (res.success) {
            //assigned survey successfully
            // console.log('Assigned survey to group-' + i);
            let newAssignedGroups = this.assignedGroups.getValue();
            newAssignedGroups.push(this.userGroups[i]);
            newAssignedGroups = [...new Set(newAssignedGroups)];
            this.assignedGroups.next(newAssignedGroups);
            // swal("Oops!", "You need a subscription to avail this feature!", "success");
          } else {
            if (
              res.message ===
              "Can't assign survey to different users as you are not premium user"
            ) {
              console.log(
                'You need to be a premium user to avail this feature!!'
              );
              this.modalService.close();
              this.paymentConfService.modalHeader.next('Failure');
              this.paymentConfService.imagePath.next(
                './../../../../assets/cross-modal.gif'
              );
              this.paymentConfService.message$.next(
                'You need to be a premium user to avail this feature'
              );
              this.paymentConfService.alertopen();
              //Automatically transition to home screen after launching the survey in 2 seconds
              setTimeout(() => {
                this.paymentConfService.close();
                this.paymentConfService.isPrivateSurveyLaunch.next(false);
              }, 2000);
            } else {
              this.modalService.close();
              this.paymentConfService.modalHeader.next('Failure');
              this.paymentConfService.imagePath.next(
                './../../../../assets/cross-modal.gif'
              );
              this.paymentConfService.message$.next(
                'Survey not Assigned due to some error!'
              );
              this.paymentConfService.alertopen();
              //Automatically transition to home screen after launching the survey in 2 seconds
              setTimeout(() => {
                this.paymentConfService.close();
                this.router.navigate(['/user'], { replaceUrl: true });
                this.paymentConfService.isPrivateSurveyLaunch.next(false);
              }, 4000);
            }
          }
        });
    });
  }

  // fetch allowed users
  fetchUsers() {
    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string = response.token;
      this.userService
        .fetchAllowedUsers(token, this.surveyId)
        .subscribe((res: string) => {
          console.log(res);
        });
    });
  }

  // changes the selected value on change
  onChange(event) {
    // console.log(this.selectedGroupId);
    const newVal = event.target.value;
    this.selectedGroupId = newVal;
    console.log(this.selectedGroupId);
  }

  // enable survey on launch
  enableSurvey() {
    this.authService.authenticateUser().subscribe((res: any) => {
      let token = res.token;
      this.userService
        .enableSurvey(token, this.surveyId)
        .subscribe((response: any) => {
          if (response.success) {
            console.log('Survey enabled!');
          }
        });
    });
  }
  launch() {
    // console.log('launch');
    this.modalService.isNext$.next(false); //hide the share modal
    this.modalService.close();
    this.builderService.saveForm$.next(true);
    let totalAllowedMembers: Array<string> = [];

    this.enableSurvey();
    if (this.hideContent === 1 && this.isUserSubscribed) {
      //Send mail after click on done when Share method is Groups
      this.assignedGroups.getValue().forEach((el) => {
        totalAllowedMembers = totalAllowedMembers.concat(el.members);
        totalAllowedMembers = [...new Set(totalAllowedMembers)]; //generates unique list of assigned members
      });
      this.authService.authenticateUser().subscribe((response: any) => {
        let token: string = response.token;

        //update the survey at the time of launch
        this.authService.authenticateUser().subscribe((response: any) => {
          let token: string = response.token;
          this.builderService
            .updateSurvey(token, this.survey)
            .subscribe((res: any) => {
              if (res.success === true) {
                // console.log('Updated survey in database!!');

                this.builderService.survey = this.survey;
                this.builderService.updatedSurvey$.next(this.survey);
              } else {
                console.log("Couldn't update survey!!!");
                if (
                  res.message ===
                  "User can't edit survey as some response/responses has already recorded on this survey"
                ) {
                  // swal("Sorry!", "Can't modify the survey, already received a response on it.", "error");
                }
              }
            });
        });
        //send mail to the members
        this.userService
          .sendMail(token, totalAllowedMembers, this.surveyId)
          .subscribe((res: any) => {
            // console.log('SEND MAIL API RESPONSE>>');

            // console.log(res);
            if (res.success) {
              // console.log(res.message);
              this.modalService.close();
              this.paymentConfService.modalHeader.next('Success');
              this.paymentConfService.imagePath.next(
                './../../../../assets/tick-modal.gif'
              );
              this.paymentConfService.message$.next(
                'Survey Assigned among selected group(s)!'
              );
              this.paymentConfService.alertopen();
              //Automatically transition to home screen after launching the survey in 2 seconds
              setTimeout(() => {
                this.paymentConfService.close();
                this.router.navigate(['/user'], { replaceUrl: true });
                this.paymentConfService.isPrivateSurveyLaunch.next(false);
              }, 4000);
            } else {
              this.modalService.close();
              this.paymentConfService.modalHeader.next('Failure');
              this.paymentConfService.imagePath.next(
                './../../../../assets/cross-modal.gif'
              );
              this.paymentConfService.message$.next(
                'Survey not Assigned due to some error!'
              );
              this.paymentConfService.alertopen();
              //Automatically transition to home screen after launching the survey in 2 seconds
              setTimeout(() => {
                this.paymentConfService.close();
                this.router.navigate(['/user'], { replaceUrl: true });
                this.paymentConfService.isPrivateSurveyLaunch.next(false);
              }, 4000);
            }
          });
      });
    } else if (this.hideContent === 2) {
      //When share method is emails
      totalAllowedMembers = totalAllowedMembers.concat(
        this.assignedEmails.getValue()
      );
      totalAllowedMembers.pop();

      //update the survey at the time of launch
      this.authService.authenticateUser().subscribe((response: any) => {
        let token: string = response.token;
        this.builderService
          .updateSurvey(token, this.survey)
          .subscribe((res: any) => {
            if (res.success === true) {
              // console.log('Updated survey in database!!');

              this.builderService.survey = this.survey;
              this.builderService.updatedSurvey$.next(this.survey);
            } else {
              console.log("Couldn't update survey!!!");
              if (
                res.message ===
                "User can't edit survey as some response/responses has already recorded on this survey"
              ) {
                // swal("Sorry!", "Can't modify the survey, already received a response on it.", "error");
              }
            }
          });
      });

      this.authService.authenticateUser().subscribe((response: any) => {
        let token: string;
        token = response.token;

        this.userService
          .assignSurveyToEmails(
            token,
            this.localEmail,
            totalAllowedMembers,
            this.surveyId
          )
          .subscribe((res: any) => {
            // console.log(res);
            if (res.success) {
              //assigned survey successfully
              this.modalService.close();
              this.paymentConfService.modalHeader.next('Success');
              this.paymentConfService.imagePath.next(
                './../../../../assets/tick-modal.gif'
              );
              this.paymentConfService.message$.next(
                'Survey Assigned among selected email(s)!'
              );
              this.paymentConfService.alertopen();
              //Automatically transition to home screen after launching the survey in 2 seconds
              setTimeout(() => {
                this.paymentConfService.close();
                this.router.navigate(['/user'], { replaceUrl: true });
                this.paymentConfService.isPrivateSurveyLaunch.next(false);
              }, 4000);
            } else {
              if (
                res.message ===
                "Can't assign survey to different users as you are not premium user"
              ) {
                console.log(
                  'You need to be a premium user to avail this feature!!'
                );
                this.modalService.close();
                this.paymentConfService.modalHeader.next('Failure');
                this.paymentConfService.imagePath.next(
                  './../../../../assets/cross-modal.gif'
                );
                this.paymentConfService.message$.next(
                  'You need to be a premium user to avail this feature'
                );
                this.paymentConfService.alertopen();
                //Automatically transition to home screen after launching the survey in 2 seconds
                setTimeout(() => {
                  this.paymentConfService.close();
                  this.paymentConfService.isPrivateSurveyLaunch.next(false);
                }, 2000);
              } else {
                this.modalService.close();
                this.paymentConfService.modalHeader.next('Failure');
                this.paymentConfService.imagePath.next(
                  './../../../../assets/cross-modal.gif'
                );
                this.paymentConfService.message$.next(
                  'Survey not Assigned due to some error!'
                );
                this.paymentConfService.alertopen();
                //Automatically transition to home screen after launching the survey in 2 seconds
                setTimeout(() => {
                  this.paymentConfService.close();
                  this.router.navigate(['/user'], { replaceUrl: true });
                  this.paymentConfService.isPrivateSurveyLaunch.next(false);
                }, 4000);
              }
            }
          });
      });
    }
  }

  // assign email
  assignEmail() {
    if (this.assignedEmails.getValue().length < 5) {
      let assignedEmailsList = this.assignedEmails.getValue();
      assignedEmailsList.push(this.currentEmail);
      this.currentEmail = '';
      this.assignedEmails.next(assignedEmailsList);
      // console.log('list ' + assignedEmailsList);
    } else {
      document.getElementById('errorAssignEmails').style.visibility = 'visible';
      // console.log('Only 5 emails can be assigned at a time');
    }
  }
}
