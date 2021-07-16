import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { MainService } from 'src/services/main/main.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-profile-side-bar',
  templateUrl: './profile-side-bar.component.html',
  styleUrls: ['./profile-side-bar.component.scss'],
})
export class ProfileSideBarComponent implements OnInit {
  mainService: MainService;
  isUserSubscribed = false;

  constructor(
    private authSerivce: AuthService,
    mainService: MainService,
    private router: Router,
    private userService: UserService
  ) {
    this.mainService = mainService;
  }
  isSideBarHidden: Boolean;
  ngOnInit(): void {
    this.userService.user.subscribe((userInfo) => {
      if (userInfo != null) {
        this.isUserSubscribed = userInfo.subscribed;
      }
    });
    this.mainService.sideBarChanged.subscribe(() => {
      this.isSideBarHidden = this.mainService.isSideBarHidden;
      // console.log(this.isSideBarHidden);
      if (!this.isSideBarHidden) {
        this.adjustPadding();
      }
    });
  }
  adjustPadding() {
    let ele = document.getElementById('user-content-wrapper');
    console.log(ele);
  }
  //open the payment screen if user clicks on Go Pro
  onSubscribe() {
    this.router.navigate(['/subscription']);
  }

  //this will handle the all routes of profile navigations
  profileNav(route: string) {
    console.log('profile:  ' + route);
    this.mainService.profileNavigation.next(route);
  }

  //this will logout the user
  onLogout() {
    this.authSerivce.isLoading.next(true);
    this.mainService.logOut();
  }
}
