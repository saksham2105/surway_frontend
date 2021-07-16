import { Component, OnInit } from '@angular/core';
import {
  faWrench,
  faTachometerAlt,
  faCog,
  faChartArea,
  faFileAlt,
  faUsers,
  faPoll,
  faAngleLeft,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';

import { MainService } from 'src/services/main/main.service';
import { HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user/user.service';
import { UserHomeComponent } from '../user/user-home/user-home.component';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit {
  //Icons
  faWrench = faWrench;
  faTachometerAlt = faTachometerAlt;
  faCog = faCog;
  faChartArea = faChartArea;
  faFileAlt = faFileAlt;
  faUsers = faUsers;
  faPoll = faPoll;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;

  //Services
  mainService: MainService;
  isUserSubscribed = false;

  constructor(
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

  onSubscribe() {
    this.router.navigate(['/subscription']);
  }

  onUserHomeNavigation() {
    if (this.router.url !== '/user/home') {
      this.userService.sideBarHomeIconCall.next(true);
    }
  }

  onUserSurveysNavigation() {
    if (this.router.url !== '/user/home') {
      this.userService.sideBarHomeIconCall.next(true);
    }
  }

  onUserDashboardNavigation() {
    if (this.router.url !== '/user/dashboard') {
      this.userService.isUserDashboardLoading.next(true);
    }
  }

  onUserMySurveysNavigation() {
    if (this.router.url !== '/user/my-surveys') {
      this.userService.isUserDashboardLoading.next(true);
      this.userService.isMySurveyLoading.next(true);
    }
  }

  onUserGroupNavigation() {
    if (this.router.url !== '/user/groups') {
      this.userService.isContactGroupLoading.next(true);
    }
  }

  onUserTimelineNavigation() {
    if (this.router.url !== '/user/timeline') {
      this.userService.isTimeLineLoading.next(true);
    }
  }

  onUserTemplateNavigation() {
    if (this.router.url !== '/user/templates') {
      this.userService.isTemplateLoading.next(true);
    }
  }

  onUserStatisticsNavigation() {
    if (this.router.url !== '/user/statistics') {
      this.userService.isStatsLoading.next(true);
    }
  }

  adjustPadding() {
    let ele = document.getElementById('user-content-wrapper');
    console.log(ele);
  }
}
