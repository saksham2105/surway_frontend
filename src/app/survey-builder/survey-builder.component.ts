import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { BuilderService } from 'src/services/builder/builder.service';
import { SurveyModel } from 'src/services/builder/survey.model';
import { MainService } from 'src/services/main/main.service';
import { ModalService } from 'src/services/modal/modal.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';
@Component({
  selector: 'app-survey-builder',
  templateUrl: './survey-builder.component.html',
  styleUrls: ['./survey-builder.component.scss'],
})
export class SurveyBuilderComponent implements OnInit {
  isNavBarVisible: Boolean = true;
  editQuestionIndex: number = 0;
  survey: SurveyModel = null;
  editSurveyId: string = '';
  colorTheme: string = '';
  colorTheme2: string = '';
  colorTheme$ = new BehaviorSubject<string>(null);
  isSurveyActive: string = 'true';
  isPreviewMode: Boolean = false;
  isBuilderLoading: Boolean = false;

  isPublicSurveyLaunchModal: Boolean = false;
  isPrivateSurveyLaunchModal: Boolean = false;

  constructor(
    private titleService: Title,
    private builderService: BuilderService,
    private authService: AuthService,
    private modalService: ModalService,
    private mainService: MainService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentConfService: PaymentConfirmationService,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay Builder');
  }

  navbar;
  sticky;

  myFunction() {
    this.navbar = document.getElementById('survey-builder-nav-bar');
    this.sticky = document.getElementById('survey-builder-nav-bar').offsetTop;

    if (
      document.body.scrollTop > 30 ||
      document.documentElement.scrollTop > 30
    ) {
      this.navbar.classList.add('navbar-fixed-top');
    } else {
      this.navbar.classList.remove('navbar-fixed-top');
    }
  }

  //On back pressed()
  isBackPressed: Boolean = false;
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.userService.isBackFromTemplate.next(true);
    confirm('Are you sure you want to leave?');
    this.router.navigate(['/user'], { replaceUrl: true });
  }

  ngOnInit(): void {
    this.navbar = document.getElementById('survey-builder-nav-bar');
    document.addEventListener('DOMContentLoaded', function () {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
          document
            .getElementById('survey-builder-nav-bar')
            .classList.add('fixed-top');
          // add padding top to show content behind navbar
          let navbar_height =
            document.querySelector<HTMLElement>('.navbar').offsetHeight;
          document.body.style.paddingTop = navbar_height + 'px';
        } else {
          document
            .getElementById('survey-builder-nav-bar')
            .classList.remove('fixed-top');
          // remove padding top from body
          document.body.style.paddingTop = '0';
        }
      });
    });

    this.userService.isBackFromTemplate.subscribe((flag) => {
      this.isBackPressed = flag;
    });

    this.paymentConfService.isPublicSurveyLaunch.subscribe((flag) => {
      this.isPublicSurveyLaunchModal = flag;
    });

    this.paymentConfService.isPrivateSurveyLaunch.subscribe((flag) => {
      this.isPrivateSurveyLaunchModal = flag;
    });

    if (!this.isBackPressed) {
      this.colorTheme2 = this.colorTheme + '-lite';
      this.modalService.templatePurchaseModal$.next(false);
      // check if user is logged
      this.getSession(this.router.url);
      this.builderService.initSurvey();
      this.builderService.updatedSurvey$.subscribe((survey: SurveyModel) => {
        this.survey = survey;
      });
      this.mainService.showNavBar$.subscribe((flag: boolean) => {
        this.isNavBarVisible = flag;
      });
      this.builderService.isBuilderLoading.subscribe((flag) => {
        this.isBuilderLoading = flag;
      });
      if (this.router.url.startsWith('/builder')) {
        // check if the url is for build
        this.colorTheme = 'primary-color';
        this.colorTheme2 = this.colorTheme + '-lite';
        // console.log('In build mode!!');
        // create a new survey
        // console.log('create survey!!');
        this.createSurvey();
      }
      // for editing survey
      else if (this.router.url.startsWith('/editSurvey')) {
        // check if url is for editSurvey
        // console.log('Entering edit mode!!');
        this.builderService.isEditMode$.next(true);
        this.route.params.subscribe((params) => {
          this.fetchSurvey(params['id']);
        });
        // console.log(this.builderService.updatedSurvey$.getValue());
      }
      //for templates
      else if (this.router.url.startsWith('/template')) {
        // check if url is for template editing
        // console.log('Entering template edit mode!!');
        // console.log('created a empty survey!!');
        this.builderService.choosenTemplate$.subscribe((template) => {
          this.assignNewSurveyId();
          if (template.questions.length > 0) {
            this.survey.questions = template.questions;
          }
          this.survey.colorCode = template.color;
        });
      }
    } else {
      this.router.navigate(['/user'], { replaceUrl: true });
    }

    // this.builderService.saveForm$.subscribe((flag: boolean) => {
    //   if (flag === true) {
    //     this.updateSurvey();
    //   }
    // });
  }

  //Bring Survey title editor to focus
  editSurveyTitle(): void {
    const ele = document.getElementById('surveyTitle');
    ele.focus();
  }

  //create survey in database
  createSurvey(): void {
    this.survey = this.builderService.survey;
    // fetch user session
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.survey.userEmail = user.email;
    }
    // console.log(this.survey);

    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string;
      token = response.token;
      this.builderService.isBuilderLoading.next(true);
      this.survey.colorCode = 'twitter-light-gray';
      this.builderService
        .createSurvey(token, this.survey)
        .subscribe((res: any) => {
          if (res.success === true) {
            // console.log('Survey added!');
            // console.log('Created survey with id: ' + res.message.id);
            // console.log(res);
            this.survey.id = res.message.id;
            this.updateSurvey();
            // console.log(this.survey);

            // console.log('Created a new survey!!');
            this.builderService.isBuilderLoading.next(false);
            // console.log('Redirecting to edit url!!');
            this.router.navigateByUrl('/editSurvey/' + this.survey.id);
          } else {
            // console.log(res.message);

            this.paymentConfService.purchaseCost$.next(2);
            this.paymentConfService.modalHeader.next('Create Survey');
            this.paymentConfService.imagePath.next(
              './../../../../assets/ill-survey.svg'
            );
            this.paymentConfService.questionString.next('purchase survey');
            this.paymentConfService.open();
            this.paymentConfService.hasSurveyCounter.next(true);

            this.paymentConfService.isPaymentAuthorized.next(false);
            // PAYMENT CHECK
            this.paymentConfService.isPaymentAuthorized.subscribe((flag) => {
              // Payment authorized
              if (flag) {
                // console.log('Payment authorized');
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
                    .purchaseSurvey(token, user.email)
                    .subscribe((response: any) => {
                      if (response.success) {
                        // alert('Payment success! Purchased 1 more survey!');
                        // window.location.reload();
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
                          user.huCoins - 2,
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
                        this.paymentConfService.paymentFailed.next(true);
                        // alert('Payment failed! Could not purchase 1 more survey!');
                        this.paymentConfService.modalHeader.next(
                          'Survey Editor'
                        );
                        this.paymentConfService.imagePath.next(
                          './../../../../assets/cross-modal.gif'
                        );
                        this.paymentConfService.message$.next(
                          'Transaction Failed'
                        );
                        this.paymentConfService.alertopen();
                      }
                    });
                });
              }
            });
          }
        });
    });
  }

  // launches prior info (launch-v1) modal
  launchV1() {
    this.updateSurvey();
    this.paymentConfService.isPublicSurveyLaunch.next(true);
    setTimeout(() => {
      if (!this.isPreviewMode) {
        this.modalService.open('launchV1');
      }
    }, 1000);
  }

  getSession(route: string): void {
    let response2 = this.authService.getUserSession();
    if (response2 != null) {
      // console.log('route: ' + route);
      this.router.navigate([`/${route}`]);
    } else {
      //user not login yet,
      // console.log('Cannot access builder..,login first!!');
      this.router.navigate(['/auth'], { replaceUrl: true });
    }
    this.authService.isLoading.next(false); //loading spinner listener
  }

  // fetches a surveey by ID
  fetchSurvey(surveyId: string) {
    this.builderService.isBuilderLoading.next(true);
    // fetch user session
    let user: UserCookieModel;
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      user = <UserCookieModel>JSON.parse(localStorage.getItem('userCookies'));
    }
    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string = response.token;
      this.builderService
        .getSurveyById(user.email, token, surveyId)
        .subscribe((response: any) => {
          // Found survey
          if (response.success) {
            this.survey = response.message;
            this.builderService.survey = this.survey;
            this.builderService.updatedSurvey$.next(this.survey);
            this.colorTheme = this.survey.colorCode;
            this.colorTheme2 = this.survey.colorCode + '-lite';
            this.builderService.isBuilderLoading.next(false);
          } else {
            // survey not found
            // console.log('Survey not found');
            // this.modalService.open('surveyError');
            this.paymentConfService.modalHeader.next('Survey Editor');
            this.paymentConfService.imagePath.next(
              './../../../../assets/cross-modal.gif'
            );
            this.paymentConfService.message$.next('Missing survey');
            this.paymentConfService.isMissingSurvey.next(true);
            this.paymentConfService.alertopen();
          }
        });
    });
  }

  //Update Survey in database
  updateSurvey(): void {
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
          console.log(res);

          if (res.success === true) {
            // console.log('Updated survey in database!!');
            // swal("Success", "Saved survey successfully!!", "success");
            this.paymentConfService.paymentFailed.next(false);
            this.paymentConfService.modalHeader.next('Survey Editor');
            this.paymentConfService.imagePath.next(
              './../../../../assets/tick-modal.gif'
            );
            this.paymentConfService.message$.next('Survey saved successfully');
            this.paymentConfService.alertopen();
            // console.log("Response from db>>" + JSON.stringify(res));
            // console.log("Local survey>>" + JSON.stringify(this.survey));
            this.builderService.survey = this.survey;
            this.builderService.updatedSurvey$.next(this.survey);
          } else {
            console.log("Couldn't update survey!!!");
            if (
              res.message ===
              "User can't edit survey as some response/responses has already recorded on this survey"
            ) {
              // swal("Sorry!", "Can't modify the survey, already received a response on it.", "error");
              this.paymentConfService.modalHeader.next('Survey Editor');
              this.paymentConfService.imagePath.next(
                './../../../../assets/cross-modal.gif'
              );
              this.paymentConfService.paymentFailed.next(false);
              this.paymentConfService.message$.next(
                'Cannot modify survey, already received a response on it'
              );
              this.paymentConfService.alertopen();
            } else if (res.message === 'Invalid User mail') {
              // swal("Nice try😉", "You don't own this survey!!", "error");
              this.paymentConfService.modalHeader.next('Survey Editor');
              this.paymentConfService.imagePath.next(
                './../../../../assets/cross-modal.gif'
              );
              this.paymentConfService.paymentFailed.next(false);
              this.paymentConfService.message$.next(
                "You didn't own this survey"
              );
              this.paymentConfService.alertopen();
            }
          }
        });
    });
  }

  //assigns a new survey id to survey
  assignNewSurveyId(): void {
    this.builderService.isBuilderLoading.next(true);
    // this.survey = this.builderService.survey;
    // fetch user session
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.survey.userEmail = user.email;
    }
    // console.log(this.survey);

    this.authService.authenticateUser().subscribe((response: any) => {
      let token: string;
      token = response.token;
      this.builderService
        .createSurvey(token, this.survey)
        .subscribe((res: any) => {
          if (res.success === true) {
            // console.log('Survey added!');
            // console.log('Created survey with id: ' + res.message.id);
            // console.log(res);
            this.survey.id = res.message.id;
            this.updateSurvey();
            // console.log(this.survey);

            // console.log(this.survey.colorCode);
            this.builderService.isBuilderLoading.next(false);
            this.router.navigateByUrl('/editSurvey/' + this.survey.id);
          } else {
            // console.log("Couldn't create survey!!");
            // console.log(res.message);
            this.paymentConfService.purchaseCost$.next(2);
            this.paymentConfService.modalHeader.next('Create Survey');
            this.paymentConfService.imagePath.next(
              './../../../../assets/ill-survey.svg'
            );
            this.paymentConfService.questionString.next('purchase survey');
            this.paymentConfService.open();
            this.paymentConfService.hasSurveyCounter.next(true);

            this.paymentConfService.isPaymentAuthorized.next(false);
            // PAYMENT CHECK
            this.paymentConfService.isPaymentAuthorized.subscribe((flag) => {
              // Payment authorized
              if (flag) {
                // console.log('Payment authorized');
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
                    .purchaseSurvey(token, user.email)
                    .subscribe((response: any) => {
                      if (response.success) {
                        //Show the popup
                        this.paymentConfService.modalHeader.next(
                          'Buy Template'
                        );
                        this.paymentConfService.imagePath.next(
                          './../../assets/tick-modal.gif'
                        );
                        this.paymentConfService.message$.next(
                          'Template has been purchased'
                        );
                        this.paymentConfService.alertopen();
                        // alert('Payment success! Purchased 1 more survey!');
                        // window.location.reload();

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
                          user.huCoins - 2,
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
                        this.paymentConfService.paymentFailed.next(true);
                        this.paymentConfService.modalHeader.next(
                          'Survey Editor'
                        );
                        this.paymentConfService.imagePath.next(
                          './../../../../assets/cross-modal.gif'
                        );
                        // alert('Payment failed! Could not purchase 1 more survey!');
                        this.paymentConfService.message$.next(
                          'Transaction Failed'
                        );
                        this.paymentConfService.alertopen();
                      }
                    });
                });
              }
            });
          }
        });
    });
  }

  // toggles between build and preview mode
  changePreview() {
    let temp: Boolean = this.isPreviewMode;
    this.isPreviewMode = !temp;

    if (this.isPreviewMode) {
      document
        .getElementById('enable-disable-div')
        .classList.add('div-active--' + this.colorTheme);
    } else {
      document
        .getElementById('enable-disable-div')
        .classList.remove('div-active--' + this.colorTheme);
    }
    this.builderService.isPreviewMode$.next(this.isPreviewMode);
  }
}
