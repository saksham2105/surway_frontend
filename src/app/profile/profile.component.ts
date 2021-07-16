import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { MainService } from 'src/services/main/main.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  isLoading = false;
  isSideBarHidden: Boolean = true;
  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router,
    private mainService: MainService
  ) {
    this.titleService.setTitle('SurWay Profile');
  }

  ngOnInit(): void {
    this.mainService.isSideBarHidden = false;
    this.mainService.isSideBarToggled = true;

    this.mainService.sideBarChanged.next();
    this.getSession('profile');

    this.isLoading = true; //need to set true for production
    this.authService.isLoading.subscribe((flag) => {
      this.isLoading = flag;
    });

    this.mainService.sideBarChanged.subscribe(() => {
      this.isSideBarHidden = this.mainService.isSideBarToggled;
      // console.log(this.isSideBarHidden);
    });
  }

  ngOnDestroy(): void {}

  getSession(route: string): void {
    let response2 = this.authService.getUserSession();
    // console.log('profile response');

    if (response2 != null) {
      console.log('route: ' + route);
      this.router.navigate([`/${route}`]);
    } else {
      //user not login yet, Restricting the backdoor entries of the user
      this.router.navigate(['/auth'], { replaceUrl: true });
    }

    this.authService.isLoading.next(false); //loading spinner listener
  }
}
