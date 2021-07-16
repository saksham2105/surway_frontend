import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserModel } from 'src/services/auth/user.model';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-auth-mail-otp-verification',
  templateUrl: './auth-mail-otp-verification.component.html',
  styleUrls: ['./auth-mail-otp-verification.component.scss'],
})
export class AuthMailOtpVerificationComponent implements OnInit, OnDestroy {
  /** Variables */
  isLoading = false;
  otpForm: FormGroup;
  otp: string = '';
  user: UserModel;
  colorCode: string = this.authService.getColorCodes('mail-otp');
  authImagePath: string = this.authService.getImagePath('mail-otp');

  timerSubscription: Subscription;
  sessionSubs: Subscription;
  registerSubs: Subscription;

  timerLimit = 300000; //5 mins in millis
  timerMinLeft: number;
  timerSecLeft: number;
  showResendOtpButton = false;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay Auth');
  }

  ngOnInit(): void {
    this.initOtpForm();

    this.timerSubscription = interval(1000).subscribe((_) => {
      this.updateTimer();
    });

    this.isLoading = true;
    this.authService.isLoading.subscribe((flag) => {
      this.isLoading = flag;
    });
    console.log('on Init()');
    console.log('ss ' + sessionStorage.getItem('user'));
    if (sessionStorage.getItem('user') != null) {
      this.user = <UserModel>JSON.parse(sessionStorage.getItem('user'));
    }
    this.getSession('auth/otp-mail-verification');
  }

  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
    if (this.registerSubs != null) {
      this.registerSubs.unsubscribe();
    }
    this.authService.isLoading.unsubscribe();
  }

  /** Template Attached Functions */
  onOTPVerification() {
    this.otp = sessionStorage.getItem('otp');

    let otpInputByUser = this.otpForm.get('otp').value;
    this.isLoading = true;
    if (+this.otp === otpInputByUser) {
      //TODO:: timeout + loading
      if (this.user.prevRoute === 'forgot-password') {
        sessionStorage.setItem('isForgotPassword', 'true'); //saving user info for next screen [OTP Verification screen]
        this.getSession('auth/reset-password'); //transition to reset-password
      } else {
        this.registerUser(sessionStorage);
      }
    } else {
      //show modal
      this.isLoading = false;
      let errorType = 'OTP Error';
      let errorDescription = 'OTP not matched';
      this.modalService.errorTitle.next(errorType);
      this.modalService.errorDescription.next(errorDescription);
      this.modalService.errorImagePath.next(
        './../../../assets/otpNotMatched.png'
      );
      this.modalService.open('errorHandling');
      this.otpForm.reset();
    }
  }

  resendOTP() {
    this.timerLimit = 300000;
    this.timerSubscription.unsubscribe();
    this.timerSubscription = interval(1000).subscribe((_) => {
      this.updateTimer();
    });
    this.showResendOtpButton = false;
    sessionStorage.removeItem('otp'); //to remove the expired OTP

    //by-default register mail content
    let mailTO = this.user.email;
    let mailSubject = 'Welcome to SurWay! Confirm your Email';
    let mailMessage =
      "You're on your way! \nLet's confirm your email address. \nYour One Time Password For Signup is";

    if (this.user.prevRoute === 'forgot-password') {
      //need to change content accordingly for forgot password
      //Forgot Password mail content
      mailSubject = 'Welcome back to SurWay! Reset your password';
      mailMessage =
        "We get it, stuff happens. \nLet's confirm your reset password request. \nYour One Time Password For Reset Password is";
    }

    this.authService.sendOTP(mailTO, mailSubject, mailMessage);
  }

  /** Extra Support Functions */
  private initOtpForm() {
    let otp: string = '';

    this.otpForm = new FormGroup({
      otp: new FormControl(otp, [
        Validators.required,
        Validators.pattern('^[0-9]{6}$'),
      ]),
    });
  }

  private updateTimer() {
    this.timerLimit -= 1000;
    this.timerMinLeft = Math.floor((this.timerLimit / (1000 * 60)) % 60);
    this.timerSecLeft = Math.floor((this.timerLimit / 1000) % 60);

    if (this.timerMinLeft === 0 && this.timerSecLeft === 0) {
      this.timerSubscription.unsubscribe();
      this.showResendOtpButton = true;
    }
  }

  private registerUser(storage: Storage) {
    this.isLoading = true;
    this.registerSubs = this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        this.authService
          .registerUser(
            this.user.firstName,
            this.user.lastName,
            this.user.email,
            this.user.password,
            token
          )
          .subscribe(
            (res) => {
              // console.log(JSON.stringify(res));
              if (res.success) {
                const user = new UserCookieModel(
                  this.user.firstName,
                  this.user.lastName,
                  this.user.email,
                  this.user.verified,
                  this.user.huCoins,
                  this.user.contact,
                  this.user.subscribed,
                  this.user.registeredDate,
                  this.user.imageString
                );
                localStorage.setItem('userCookies', JSON.stringify(user));
                this.userService.user.next(user);
                setTimeout(() => {
                  //to sync up the local cookies with userCookies
                  this.authService.isLoading.next(false);
                  this.router.navigate(['/user'], { replaceUrl: true });
                  storage.clear();
                }, 1000);
              } else {
                this.isLoading = false;
                this.serverErrorModal();
              }
            },
            (err) => {
              this.isLoading = false;
              this.serverErrorModal();
              // console.log('ERR: ' + JSON.stringify(err));
            }
          );
      },
      (error) => {
        this.isLoading = false;
        this.serverErrorModal();
        // alert(error.error);
      }
    );
  }

  private serverErrorModal() {
    this.isLoading = false;
    let errorType = 'Server Error';
    let errorDescription = 'Error from our side';
    this.modalService.errorTitle.next(errorType);
    this.modalService.errorDescription.next(errorDescription);
    this.modalService.errorImagePath.next('./../../../assets/networkError.png');
    this.modalService.open('errorHandling');
  }

  getSession(route: string): void {
    let response2 = this.authService.getUserSession();

    if (response2 != null) {
      //Restricting the backdoor entries of otp mail verification screen while user is login
      if (route === 'auth/otp-mail-verification') {
        route = 'user';
      }
      console.log('route: ' + route);
      this.router.navigate([`/${route}`], { replaceUrl: true });
    } else {
      //user not login yet,
      let prevRoute = '';
      // if (this.user != null) {
      console.log('yha aa jaye' + this.user);
      prevRoute = this.user.prevRoute;
      // }
      if (route === 'auth/reset-password') {
        this.router.navigate(['/auth/reset-password'], {
          replaceUrl: true,
        });
      } else if (
        (prevRoute === 'register' || prevRoute === 'forgot-password') &&
        route != 'user'
      ) {
        //This case is when user comes from auth screen to otp mail screen [Register/Forgot Password]
        this.router.navigate(['/auth/otp-mail-verification'], {
          replaceUrl: true,
        });
      } else {
        this.router.navigate(['/auth'], { replaceUrl: true });
      }
    }

    this.authService.isLoading.next(false); //loading spinner listener
  }
}
