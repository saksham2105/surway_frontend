import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserModel } from 'src/services/auth/user.model';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  /**Variables */
  loginForm: FormGroup;
  isLoading = false;
  token: string = ''; // variable to store authenticate token
  loginType: string = 'Login';
  titleLogin: string = 'Sign into your account! 📡';
  btnName: string = 'Login';
  colorCode = this.authService.getColorCodes('login');
  authImagePath = this.authService.getImagePath('login');

  //Register-OTP Params
  mailTO: string = '';
  mailSubject: string = '';
  mailMessage: string = '';

  loginSubs: Subscription;
  checkUserRegisteredSubs: Subscription;

  constructor(
    private titleService: Title,
    private router: Router,
    private authService: AuthService,
    private modalService: ModalService,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay Auth');
  }

  ngOnInit(): void {
    this.initLoginForm();

    this.isLoading = true;
    this.authService.isLoading.subscribe((flag) => {
      this.isLoading = flag;
    });
    //maintain the session, if user is login then open dashboard otherwise auth from getSession()
    this.getSession('user');
  }

  ngOnDestroy(): void {
    if (this.loginSubs != null) {
      this.loginSubs.unsubscribe();
    }
    if (this.checkUserRegisteredSubs != null) {
      this.checkUserRegisteredSubs.unsubscribe();
    }
  }

  openModal() {
    this.modalService.open('errorHandling');
  }

  onLogin() {
    this.isLoading = true;

    //Needs to be remove when API is on the cloud9 (Hosted)
    switch (this.loginType) {
      case 'Login': {
        //Login Request
        this.loginEmailPassword();
        break;
      }
      case 'Register': {
        //Register Request (OTP Request)
        this.sendOTP();
        break;
      }
      case 'ForgotPassword': {
        //Forgot Password Request (OTP Request)
        this.sendOTP();
        break;
      }
    }
  }

  /** This function is called when user click on login transition text */
  onLoginScreenTransition() {
    this.loginType = 'Login';
    this.titleLogin = 'Sign into your account! 📡';
    this.btnName = 'Login';
    this.authImagePath = this.authService.getImagePath('login');
    this.colorCode = this.authService.getColorCodes('login');
    this.initLoginForm();
  }

  /** This function is called when user click on register transition text */
  onRegisterScreenTransition() {
    this.loginType = 'Register';
    this.titleLogin = 'Create an Account! 🎉';
    this.btnName = 'Register';
    this.authImagePath = this.authService.getImagePath('register');
    this.colorCode = this.authService.getColorCodes('register');
    this.initRegisterForm();
  }

  /** This function is called when user click on forgot password transition text */
  onForgotPasswordScreenTransition() {
    this.loginType = 'ForgotPassword';
    this.titleLogin = 'Forgot Your Password? 🔑';
    this.btnName = 'Reset Password';
    this.authImagePath = this.authService.getImagePath('forgot-password');
    this.colorCode = this.authService.getColorCodes('forgot-password');
    this.initForgotForm();
  }

  /****************** Extra Functions *********************/

  //Initialization of Reactive Login Form with Validations
  private initLoginForm() {
    let loginEmail: string = '';
    let loginPassword: string = '';

    this.loginForm = new FormGroup({
      email: new FormControl(loginEmail, [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      password: new FormControl(loginPassword, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-@]{6,}$'),
      ]),
    });
  }

  //Initialization of Reactive Register Form with Validations
  private initRegisterForm() {
    let firstName: string = '';
    let lastName: string = '';
    let registerEmail: string = '';
    let registerPassword: string = '';

    this.loginForm = new FormGroup({
      firstName: new FormControl(firstName, Validators.required),
      lastName: new FormControl(lastName, Validators.required),
      email: new FormControl(registerEmail, [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      password: new FormControl(registerPassword, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-@]{6,}$'),
      ]),
    });
  }

  //Initialization of Reactive Forgot Password Form with Validations
  private initForgotForm() {
    let forgotPasswordEmail: string = '';

    this.loginForm = new FormGroup({
      email: new FormControl(forgotPasswordEmail, [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
    });
  }

  //Function to listen the observable of login method from auth service
  private loginEmailPassword() {
    this.loginSubs = this.authService.authenticateUser().subscribe(
      (response: any) => {
        this.token = response.token;
        //After getting token
        this.authService
          .loginUser(
            this.loginForm.get('email').value,
            this.loginForm.get('password').value,
            this.token
          )
          .subscribe(
            (res) => {
              // console.log(JSON.stringify(res));

              if (res.success) {
                //formation of cookie at the time of login from response message
                const user = new UserCookieModel(
                  res.message.firstName,
                  res.message.secondName,
                  res.message.email,
                  res.message.verified,
                  res.message.huCoins,
                  res.message.contact,
                  res.message.subscribed,
                  res.message.registeredDate,
                  res.message.imageString
                );
                localStorage.setItem('userCookies', JSON.stringify(user));
                this.userService.user.next(user);
                this.router.navigate(['/user'], { replaceUrl: true });
              } else {
                this.isLoading = false;
                let errorType = 'Login Error';
                let errorDescription = res.message;
                this.modalService.errorTitle.next(errorType);
                this.modalService.errorDescription.next(errorDescription);
                this.modalService.errorImagePath.next(
                  './../../../assets/error.png'
                );
                this.modalService.open('errorHandling');
                this.loginForm.reset();
              }
            },
            (err) => {
              this.serverErrorModal();
              // console.log('ERR: ' + JSON.stringify(err));
            }
          );
      },
      (error) => {
        this.serverErrorModal();
        // alert(error.error);
      }
    );
  }

  //Function to listen the observable of check registered user from auth service
  private sendOTP() {
    //Mail Content
    let firstName: string = '';
    let lastName: string = '';
    let email: string = '';
    let password: string = '';
    if (this.loginType === 'Register') {
      //register form values
      firstName = this.loginForm.get('firstName').value;
      lastName = this.loginForm.get('lastName').value;
      password = this.loginForm.get('password').value;
    }
    email = this.loginForm.get('email').value;

    //maintain the prevRoute for OTP verification screen to check the previous screen for further transition
    let prevRoute = 'register';
    if (this.loginType === 'ForgotPassword') {
      prevRoute = 'forgot-password';
    }

    //find the current date and time
    let curDateTime = formatDate(
      new Date(),
      'YYYY-MM-dd hh:mm:ss',
      'en-US',
      '+0530'
    );

    //making temporary user till user sign ups
    const user = new UserModel(
      firstName,
      lastName,
      email,
      password,
      true,
      0,
      '',
      false,
      [],
      prevRoute,
      curDateTime,
      ''
    );
    sessionStorage.setItem('user', JSON.stringify(user)); //saving user info for next screen [OTP Verification screen]

    //By default, this content is for register user mail
    this.mailTO = email;
    this.mailSubject = 'Welcome to SurWay! Confirm your Email';
    this.mailMessage =
      "You're on your way! \nLet's confirm your email address. \nYour One Time Password For Signup is";

    //Forgot Password mail content
    if (this.loginType === 'ForgotPassword') {
      this.mailSubject = 'Welcome back to SurWay! Reset your password';
      this.mailMessage =
        "We get it, stuff happens. \nLet's confirm your reset password request. \nYour One Time Password For Reset Password is";
    }

    //verify user whether user is registered or not
    this.checkUserRegisteredSubs = this.authService
      .authenticateUser()
      .subscribe(
        (response: any) => {
          // console.log('otp token: ' + response.token);
          this.token = response.token;
          //After getting token
          this.authService
            .checkUserRegistered(this.loginForm.get('email').value, this.token)
            .subscribe(
              (res) => {
                // console.log('otp user : ' + JSON.stringify(res));
                if (res.success) {
                  // CASE - Email exist
                  // console.log("auth: " + JSON.stringify(res));
                  if (this.loginType === 'Register') {
                    //main work is to register the user => end the loading spinner and show the error modal.
                    this.isLoading = false;
                    let errorType = 'Register Error';
                    let errorDescription = 'Email aready exists';
                    this.modalService.errorTitle.next(errorType);
                    this.modalService.errorDescription.next(errorDescription);
                    this.modalService.errorImagePath.next(
                      './../../../assets/emailExist.png'
                    );
                    this.modalService.open('errorHandling');
                    this.loginForm.reset();
                  } else {
                    //forgot or reset the password
                    this.authService.sendOTP(
                      this.mailTO,
                      this.mailSubject,
                      this.mailMessage
                    );
                  }
                } else {
                  //CASE - Email not exist, then send OTP
                  if (this.loginType === 'Register') {
                    //main work is to register the user
                    // console.log('register ho rha h');
                    this.authService.sendOTP(
                      this.mailTO,
                      this.mailSubject,
                      this.mailMessage
                    );
                  } else {
                    //forgot or reset the password => end the loading spinner and show the error modal.
                    this.isLoading = false;
                    let errorType = 'Reset Password Error';
                    let errorDescription = 'Email not exists';
                    this.modalService.errorTitle.next(errorType);
                    this.modalService.errorDescription.next(errorDescription);
                    this.modalService.errorImagePath.next(
                      './../../../assets/emailExist.png'
                    );
                    this.modalService.open('errorHandling');
                    this.isLoading = false;
                    this.loginForm.reset();
                  }
                }
              },
              (err) => {
                this.serverErrorModal();
              }
            );
        },
        (error) => {
          // alert(error.error);
          this.serverErrorModal();
        }
      );
  }

  //modal to server side errors
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
    /*this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;

        this.authService.getUserSession().subscribe(
        (response2: any) => {*/
    let response2 = this.authService.getUserSession();
    // console.log('auth response');

    if (response2 != null) {
      console.log('route: ' + route);
      this.router.navigate([`/${route}`]);
    } else {
      //user not login yet,
      this.router.navigate(['/auth'], { replaceUrl: true });
    }

    this.authService.isLoading.next(false); //loading spinner listener
    //   },
    //   (err2) => {
    //     console.log(JSON.stringify(err2));
    //   }
    // );
    // }
    // (error) => {
    // console.log(JSON.stringify(error));
    // alert(JSON.stringify(error));
    // }
    // );
  }
}
