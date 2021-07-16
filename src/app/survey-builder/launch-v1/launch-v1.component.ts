import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { BuilderService } from 'src/services/builder/builder.service';
import { SurveyModel } from 'src/services/builder/survey.model';
import { ModalService } from 'src/services/modal/modal.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';
import { Group } from '../survey-share/group.model';

@Component({
  selector: 'app-launch-v1',
  templateUrl: './launch-v1.component.html',
  styleUrls: ['./launch-v1.component.scss'],
})
export class LaunchV1Component implements OnInit, OnDestroy {
  survey: SurveyModel;
  showPasswordField: boolean = false;
  isNext: Boolean = false;
  userGroups: Array<Group> = [];
  isPublic: Boolean = false;

  constructor(
    private modalService: ModalService,
    private router: Router,
    private builderService: BuilderService,
    private authService: AuthService,
    private userService: UserService,
    private paymentConfService: PaymentConfirmationService
  ) {}
  ngOnDestroy(): void {
    // this.paymentConfService.isPaymentAuthorized.unsubscribe();
  }

  ngOnInit(): void {
    this.modalService.isNext$.subscribe((flag: Boolean) => {
      this.isNext = flag;
    });
    this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
      this.survey = survey;
      this.showPasswordField = survey.password.length > 0;
    });
    this.fetchUserGroups();
    this.survey.hasPassword = false;
    this.showPasswordField = false;
  }

  // launches the survey-share component for private survey else launches a public survey
  next(): void {
    if (!this.isPublic) {
      this.survey.hasPassword = this.showPasswordField;
      if (this.survey.password.length === 0 && this.survey.hasPassword) {
        // console.log('Not able to move next ');
      } else {
        this.modalService.isNext$.next(true);
        this.builderService.updatedSurvey$.next(this.survey);
        this.builderService.survey = this.survey;
        this.builderService.isPublicSurvey$.next(this.isPublic);
      }
    } else {
      this.paymentConfService.purchaseCost$.next(10);
      this.paymentConfService.modalHeader.next('Launch Public Survey');
      this.paymentConfService.imagePath.next(
        './../../../../assets/ill-purchase.svg'
      );
      this.paymentConfService.questionString.next('launch the survey publicly');
      this.paymentConfService.open();

      // PAYMENT CHECK
      this.paymentConfService.isPaymentAuthorized.subscribe((flag) => {
        // Payment authorized
        if (flag) {
          console.log('Payment authorized');
          // fetch user
          let user: UserCookieModel;
          if (localStorage.getItem('userCookies')) {
            user = <UserCookieModel>(
              JSON.parse(localStorage.getItem('userCookies'))
            );
          }
          // generate token
          this.authService.authenticateUser().subscribe((res: any) => {
            let token: string = res.token;
            // purchase call
            this.userService
              .purchasePublicSurvey(token, this.survey, user.email)
              .subscribe((response: any) => {
                console.log(response);
                if (response.success) {
                  // alert('Payment success')!
                  this.paymentConfService.modalHeader.next('Success');
                  this.paymentConfService.imagePath.next(
                    './../../../../assets/tick-modal.gif'
                  );
                  this.paymentConfService.message$.next(
                    'Transaction success!! Survey launched publicly!'
                  );
                  this.paymentConfService.alertopen();
                  //Automatically transition to home screen after launching the survey in 2 seconds
                  setTimeout(() => {
                    this.paymentConfService.close();
                    this.router.navigate(['/user'], { replaceUrl: true });
                    this.paymentConfService.isPublicSurveyLaunch.next(false);
                  }, 4000);
                  //update the local storage
                  let user: UserCookieModel;
                  this.userService.user.subscribe((userInfo) => {
                    user = userInfo;
                  });
                  let updatedUser = new UserCookieModel(
                    user.firstName,
                    user.secondName,
                    user.email,
                    user.verified,
                    user.huCoins - 10,
                    user.contact,
                    true,
                    user.registeredDate,
                    user.imageString
                  );
                  this.userService.user.next(updatedUser);
                  localStorage.setItem(
                    'userCookies',
                    JSON.stringify(updatedUser)
                  );
                } else {
                  // alert('Payment failed')!
                  this.paymentConfService.modalHeader.next(
                    'Transaction Failed'
                  );
                  this.paymentConfService.imagePath.next(
                    './../../../../assets/ill-payment-failed.svg'
                  );
                  this.paymentConfService.paymentFailed.next(true);
                  this.paymentConfService.message$.next(
                    'Transaction failed!! Survey was not launched!'
                  );
                  this.paymentConfService.alertopen();
                }
                this.modalService.close();
              });
          });
        }
      });
    }
  }

  // log user groups
  fetchUserGroups() {
    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string, userEmail: string;
      token = response.token;
      if (localStorage.getItem('userCookies')) {
        // fetch user email
        let user: UserCookieModel = <UserCookieModel>(
          JSON.parse(localStorage.getItem('userCookies'))
        );
        userEmail = user.email;
      }
      this.userService
        .getCreatorGroupList(userEmail, token)
        .subscribe((res: any) => {
          if (res.success) {
            this.userGroups = res.message; //store user groups into local variable
            console.log(this.userGroups);
          }
        });
    });
  }
  launch() {
    this.modalService.close();
    this.builderService.saveForm$.next(true);

    this.authService.authenticateUser().subscribe((res: any) => {
      let token = res.token;
      this.userService
        .enableSurvey(token, this.survey.id)
        .subscribe((response: any) => {
          if (response.success) {
            console.log('Survey enabled!');
          }
        });
    });
  }
}
