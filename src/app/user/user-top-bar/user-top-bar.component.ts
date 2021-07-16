import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faBars,
  faUser,
  faCogs,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { MainService } from 'src/services/main/main.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-user-top-bar',
  templateUrl: './user-top-bar.component.html',
  styleUrls: ['./user-top-bar.component.scss'],
})
export class UserTopBarComponent implements OnInit {
  faBars = faBars;
  faUser = faUser;
  faCogs = faCogs;
  faSignOutAlt = faSignOutAlt;


  sessionSubs: Subscription;

  /** Variables */
  profileEmail: string = '';
  isLoading = false;
  imageString = '';
  base64textImageString = [];

  constructor(
    private mainService: MainService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe((userInfo) => {
      if (userInfo != null) {
        this.profileEmail = userInfo.firstName + ' ' + userInfo.secondName;
        if (userInfo.imageString != null) {
          this.imageString = userInfo.imageString;
        }
      }
    });
  }

  // Toggles nav bar in builder
  onClick(): void {
    this.mainService.sideBarToggleTopClicked();
    // this.mainService.isProfileSideBarHidden =
    //   !this.mainService.isProfileSideBarHidden;
    if (this.router.url.startsWith('/builder') || this.router.url.startsWith('/editSurvey')) {
      let currentFlag: Boolean = this.mainService.showNavBar$.getValue();
      this.mainService.showNavBar$.next(!currentFlag);
    }
  }

  onProfileClick() {
    //not clickable on profile screen
    if (this.router.url !== '/profile') {
      this.isLoading = true;
      this.getSession('profile');
    }
  }

  getSession(route: string): void {
    let response2 = this.authService.getUserSession();
    // console.log('user top bar response');

    if (response2 != null) {
      // console.log('route: ' + route);
      this.router.navigate([`/${route}`]);
    } else {
      //user not login yet,
      this.router.navigate(['/auth'], { replaceUrl: true });
    }

    this.authService.isLoading.next(false); //loading spinner listener
  }
}
