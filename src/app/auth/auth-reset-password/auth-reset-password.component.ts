import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserModel } from 'src/services/auth/user.model';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-auth-reset-password',
  templateUrl: './auth-reset-password.component.html',
  styleUrls: ['./auth-reset-password.component.scss'],
})
export class AuthResetPasswordComponent implements OnInit, OnDestroy {
  /** Variables */
  isLoading = false;
  resetPasswordForm: FormGroup;
  resetPasswordTitle = 'Reset your password! 🤐';
  user: UserModel;
  authImagePath = this.authService.getImagePath('reset-password');
  colorCode = this.authService.getColorCodes('reset-password');

  sessionSubs: Subscription;
  resetPasswordSubs: Subscription;

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
    this.getSession('auth/reset-password');
    this.initResetPasswordForm();
    this.isLoading = true;
    this.authService.isLoading.subscribe((flag) => {
      this.isLoading = flag;
    });

    if (!localStorage.getItem('user')) {
      this.user = <UserModel>JSON.parse(localStorage.getItem('user'));
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('isForgotPassword');
    if (this.resetPasswordSubs != null) {
      this.resetPasswordSubs.unsubscribe();
    }
  }

  /** Template Attached Functions */
  onResetPassword() {
    let password = this.resetPasswordForm.get('password').value;
    let confirmPassword = this.resetPasswordForm.get('confirmPassword').value;

    if (password === confirmPassword) {
      this.resetPassword(sessionStorage, password);
    } else {
      let errorType = 'Password Error';
      let errorDescription = 'Password not matched';
      this.modalService.errorTitle.next(errorType);
      this.modalService.errorDescription.next(errorDescription);
      this.modalService.errorImagePath.next(
        './../../../assets/otpNotMatched.png'
      );
      this.modalService.open('errorHandling');
      this.resetPasswordForm.reset();
    }
  }

  /** Extra Support Functions */
  initResetPasswordForm() {
    let password: string = '';

    this.resetPasswordForm = new FormGroup({
      password: new FormControl(password, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-@]{6,}$'),
      ]),
      confirmPassword: new FormControl(password, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-@]{6,}$'),
      ]),
    });
  }

  private resetPassword(storage: Storage, password: string) {
    this.resetPasswordSubs = this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        let email = '';
        if (localStorage.getItem('userCookies') != null) {
          //email from profile session from auth service
          this.userService.user.subscribe((user) => {
            email = user.email;
          });
        } else {
          //email from user session
          email = this.user.email;
        }
        this.authService.resetPassword(email, password, token).subscribe(
          (res) => {
            // console.log(JSON.stringify(res));
            if (res.success) {
              this.isLoading = true;
              this.router.navigate(['/user'], { replaceUrl: true });
              storage.clear();
            } else {
              this.serverErrorModal();
              // console.log('Error Login'); //Modal to show error
            }
          },
          (err) => {
            // console.log('ERR: ' + JSON.stringify(err));
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
      //Restricting the backdoor entries of reset password screen while user is login
      if (route === 'auth/reset-password') {
        route = 'user';
      }
      console.log('route: ' + route);
      this.router.navigate([`/${route}`]);
    } else {
      //user not login yet,
      if (
        sessionStorage.getItem('isForgotPassword') != null &&
        sessionStorage.getItem('isForgotPassword') === 'true'
      ) {
        //This case is when user comes from forgot-password OTP Mail verification screen to reset-password
        this.router.navigate(['/auth/reset-password'], {
          replaceUrl: true,
        });
      } else {
        this.router.navigate(['/auth'], { replaceUrl: true });
      }
    }

    this.authService.isLoading.next(false); //loading spinner listener
  }
}
