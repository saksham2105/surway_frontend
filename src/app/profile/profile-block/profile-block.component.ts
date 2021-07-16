import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { MainService } from 'src/services/main/main.service';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-profile-block',
  templateUrl: './profile-block.component.html',
  styleUrls: ['./profile-block.component.scss'],
  providers: [DatePipe],
})
export class ProfileBlockComponent implements OnInit, OnDestroy {
  editProfileForm: FormGroup;
  updatePasswordProfileForm: FormGroup;

  isLoading = false;

  firstName = '';
  lastName = '';
  email = '';
  huCoins = 0;
  accountCreatedOn = '';
  base64textImageString = [];
  isUserSubscribed = '';

  profileNav: string = 'MyAccount';
  profileTitle: string = 'My Account';

  resetPasswordSubs: Subscription;
  editProfileSubs: Subscription;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router,
    private mainService: MainService,
    private userService: UserService,
    private modalService: ModalService
  ) {
    this.titleService.setTitle('SurWay Profile');
  }

  ngOnInit(): void {
    this.initEditProfileForm();
    this.initUpdatePasswordProfileForm();

    this.authService.isLoading.subscribe((flag) => {
      this.isLoading = flag;
    });

    //pushing the sample profile image if no image is provided by the user
    this.base64textImageString.push('./../../assets/undraw_profile.svg');

    //Handling events of profile navigations [Contains => My Account, Edit Profile, Update Password]
    this.mainService.profileNavigation.subscribe((nav) => {
      this.profileNav = nav;
      switch (nav) {
        case 'MyAccount': {
          this.profileTitle = 'My Account';
          break;
        }
        case 'EditProfile': {
          this.profileTitle = 'Edit Profile';
          break;
        }
        case 'UpdatePassword': {
          this.profileTitle = 'Update Password';
          break;
        }
      }
    });

    //Getting user data from userCookies
    this.userService.user.subscribe((userInfo) => {
      if (userInfo != null) {
        this.firstName = userInfo.firstName;
        this.lastName = userInfo.secondName;
        this.email = userInfo.email;
        this.huCoins = userInfo.huCoins;
        this.isUserSubscribed = userInfo.subscribed
          ? 'SurWay Pro'
          : 'SurWay Freebie';
        this.accountCreatedOn = userInfo.registeredDate;
        this.editProfileForm.get('firstInputName').setValue(this.firstName);
        this.editProfileForm.get('lastInputName').setValue(this.lastName);
        if (userInfo.imageString != null && userInfo.imageString.length > 0) {
          this.base64textImageString = [];
          this.base64textImageString.push(userInfo.imageString);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.resetPasswordSubs != null) {
      this.resetPasswordSubs.unsubscribe();
    }
    if (this.editProfileSubs != null) {
      this.editProfileSubs.unsubscribe();
    }
  }

  onSubscribe() {
    //Payment Screen
    this.router.navigate(['/subscription']);
  }

  //Image upload method
  onUploadChange(ifile: any) {
    const file = ifile.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  //convert the image into string
  handleReaderLoaded(e: any) {
    // console.log('data:image/png;base64,' + btoa(e.target.result));
    this.base64textImageString = [];
    this.base64textImageString.push(
      'data:image/png;base64,' + btoa(e.target.result)
    );
  }

  //Initialization of Edit Profile Form plus Validations
  initEditProfileForm() {
    let firstInputName: string = '';
    let lastInputName: string = '';

    this.editProfileForm = new FormGroup({
      firstInputName: new FormControl(firstInputName, [Validators.required]),
      lastInputName: new FormControl(lastInputName, [Validators.required]),
    });
  }

  //Initialization of Update Password Form plus Validations
  initUpdatePasswordProfileForm() {
    let password: string = '';

    this.updatePasswordProfileForm = new FormGroup({
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

  //Action on click of save button on both the screens [EditProfile, UpdatePassword]
  onUpdateProfile() {
    if (this.profileNav === 'EditProfile') {
      //Edit Profile Save Button Clicked
      this.editProfileUpdate();
    } else {
      //Update Password Save Button Clicked
      this.updatePassword();
    }
  }

  // Method to update the details of the user
  private editProfileUpdate() {
    if (this.editProfileForm.invalid) {
      // this will check the profile form and return false if any field is remains empty
      document.getElementById('profileError').innerHTML =
        'Please enter proper profile details';
      document.getElementById('profileError').style.display = 'block';
      return;
    }

    this.isLoading = true; //starting the loading spinner
    this.editProfileSubs = this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        //After getting token
        this.authService
          .updateProfile(
            this.email,
            this.editProfileForm.get('firstInputName').value,
            this.editProfileForm.get('lastInputName').value,
            this.base64textImageString[0],
            token
          )
          .subscribe(
            (res) => {
              // console.log(JSON.stringify(res));
              if (res.success) {
                let user: UserCookieModel;
                this.userService.user.subscribe((userInfo) => {
                  user = userInfo;
                });
                let updatedUser = new UserCookieModel(
                  this.editProfileForm.get('firstInputName').value,
                  this.editProfileForm.get('lastInputName').value,
                  user.email,
                  user.verified,
                  user.huCoins,
                  user.contact,
                  user.subscribed,
                  user.registeredDate,
                  this.base64textImageString[0]
                );
                localStorage.setItem(
                  'userCookies',
                  JSON.stringify(updatedUser)
                );
                this.authService.isLoading.next(false);
                this.mainService.profileNavigation.next('MyAccount');
                window.location.reload(); //need to restart profile page to update the profile data automatically
              } else {
                this.isLoading = false;
                this.serverErrorModal();
                // console.log('Error Login'); //Modal to show error
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

  // Method to udpate the password
  private updatePassword() {
    let password = this.updatePasswordProfileForm.get('password').value;
    let confirmPassword =
      this.updatePasswordProfileForm.get('confirmPassword').value;

    if (this.updatePasswordProfileForm.invalid) {
      // this will check the profile form and return false if any field is remains empty
      document.getElementById('profileError').innerHTML =
        'Please enter proper profile details';
      document.getElementById('profileError').style.display = 'block';
      return;
    }

    if (password != confirmPassword) {
      //this will confirm that password and confirmPassword are equal or not
      document.getElementById('profileError').innerHTML =
        'Password and Confirm password not matched';
      document.getElementById('profileError').style.display = 'block';
      return;
    }
    this.isLoading = true; //staring the loading spinner

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
        }
        this.authService.resetPassword(email, password, token).subscribe(
          (res) => {
            // console.log(JSON.stringify(res));
            if (res.success) {
              this.isLoading = true;
              this.updatePasswordProfileForm.reset();
              this.authService.isLoading.next(false);
              this.mainService.profileNavigation.next('MyAccount');
            } else {
              this.isLoading = false;
              this.serverErrorModal();
              // console.log('Error Login'); //Modal to show error
            }
          },
          (err) => {
            // console.log('ERR: ' + JSON.stringify(err));
            this.isLoading = false;
            this.serverErrorModal();
          }
        );
      },
      (error) => {
        // alert(error.error);
        this.isLoading = false;
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

  onLogOut() {
    this.isLoading = true;
    this.mainService.logOut();
  }
}
