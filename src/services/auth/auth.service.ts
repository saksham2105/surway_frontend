import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { UserCookieModel } from './userCookie.model';

/** This service contains Auth Functions along with session management */
@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoading = new BehaviorSubject<boolean>(true);
  baseURL = '';
  onProd = true; //manually set to true while pushing the code to CI/CD

  constructor(private http: HttpClient, private router: Router) {
    this.isLoading.next(true);
    if (this.onProd) {
      this.baseURL =
        'https://survey-tool-backend-dot-hu18-groupa-java.et.r.appspot.com';
    }
  }

  /** This function is used for getting image paths dynamically for different auth screens */
  getImagePath(route: string): string {
    /** Asset Paths */
    let loginImagePath = './../../assets/login.jpg';
    let registerImagePath = './../../assets/register.jpg';
    let forgotPasswordImagePath = './../../assets/forgot.jpg';
    let mailOTPImagePath = './../../assets/otp.jpg';
    let resetPasswordImagePath = './../../assets/reset.jpg';

    switch (route) {
      case 'login':
        return loginImagePath;
      case 'register':
        return registerImagePath;
      case 'forgot-password':
        return forgotPasswordImagePath;
      case 'mail-otp':
        return mailOTPImagePath;
      case 'reset-password':
        return resetPasswordImagePath;
    }
  }

  /** This function is used for getting color codes dynamically for different auth screens */
  getColorCodes(route: string): string {
    /** Background Color Codes */
    let loginColorCode = '#ACAAA9';
    let registerColorCode = '#D8CEC4';
    let forgotPasswordColorCode = '#B3BBC1';
    let mailOTPColorCode = '#C5DEF6';
    let resetPasswordColorCode = '#F6EACD';

    switch (route) {
      case 'login':
        return loginColorCode;
      case 'register':
        return registerColorCode;
      case 'forgot-password':
        return forgotPasswordColorCode;
      case 'mail-otp':
        return mailOTPColorCode;
      case 'reset-password':
        return resetPasswordColorCode;
    }
  }

  /** This function provide authenticate token */
  authenticateUser() {
    //TODO:: Need to secure these keys
    let adminKeys = {
      username: 'surwayToolApplication@907785',
      password: 'SurWayToolDevelopers@82250',
    };

    return this.http.post(this.baseURL + '/authenticate', adminKeys);
  }

  /** This function is used to login with email and password */
  loginUser(
    username: string,
    password: string,
    token: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    var data = {
      email: username,
      password: password,
    };
    return this.http.post(this.baseURL + '/surway/user/login', data, header);
  }

  /** This function is used to send OTP Mails to User mail id */
  mailOTPVerification(
    mailTO: string,
    mailSubject: string,
    mailMessage: string,
    token: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    var data = {
      to: mailTO,
      subject: mailSubject,
      message: mailMessage,
    };

    return this.http.post(this.baseURL + '/surway/user/sendOtp', data, header);
  }

  /** This function is used to check the existence of user whether the user is registered or not. */
  checkUserRegistered(email: string, token: string): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      email: email,
    };

    return this.http.post(
      this.baseURL + '/surway/user/getUserByMail',
      data,
      header
    );
  }

  /** This function is used to register the new user {params: firstName, lastName, email, password }*/
  registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    token: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };
    var data = {
      firstName: firstName,
      secondName: lastName,
      email: email,
      password: password,
      verified: true,
      huCoins: 0,
      contact: '',
      subscribed: false,
      collaborators: [],
    };
    console.log('data: ' + JSON.stringify(data));
    return this.http.post(this.baseURL + '/surway/user/register', data, header);
  }

  /** This function is used to reset the password */
  resetPassword(
    email: string,
    password: string,
    token: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      email: email,
      password: password,
    };

    return this.http.post(
      this.baseURL + '/surway/user/resetPassword',
      data,
      header
    );
  }

  /** This function is to update the profile */
  updateProfile(
    email: string,
    firstName: string,
    lastName: string,
    imageString: string,
    token: string
  ): Observable<any> {
    var header = {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
    };

    var data = {
      email: email,
      firstName: firstName,
      secondName: lastName,
      imageString: imageString,
    };

    return this.http.post(
      this.baseURL + '/surway/user/updateProfile',
      data,
      header
    );
  }

  /** This function is used to get user Session from Cookies, if any */
  getUserSession(): UserCookieModel {
    if (localStorage.getItem('userCookies') === null) {
      return null;
    }
    return JSON.parse(localStorage.getItem('userCookies'));
  }

  /** This function is used for sending OTP according to the content (passed in params) */
  sendOTP(mailTO: string, mailSubject: string, mailMessage: string) {
    this.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        this.mailOTPVerification(
          mailTO,
          mailSubject,
          mailMessage,
          token
        ).subscribe(
          (res) => {
            console.log(JSON.stringify(res));
            if (res.success) {
              console.log('otp ja rha h');
              let otp = res.message.otp;
              sessionStorage.setItem('otp', otp); //saving otp for otp verification

              this.router.navigate(['auth/otp-mail-verification'], {
                replaceUrl: true,
              });
            } else {
              this.isLoading.next(false);
              // console.log('Error Login'); //Modal to show error
            }
          },
          (err) => {
            // console.log('ERR: ' + JSON.stringify(err));
          }
        );
      },
      (error) => {
        // alert(error.error);
      }
    );
  }
}
