import { Component, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { MainService } from 'src/services/main/main.service';
import { UserService } from 'src/services/user/user.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'survey-tool-frontend';

  isLoading = false;

  constructor(
    private titleService: Title,
    private router: Router,
    private mainService: MainService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay');
  }

  ngOnInit(): void {
    //load the user in user service from cookies on init of main app
    this.userService.subscribeUser();
  }

  @HostListener('window:resize', ['$event'])
  getScreenWidth(event?) {
    this.mainService.setScreenSize(innerWidth, innerHeight);
  }

  //this function will ensure the cookies presence, and it should be called in onInit()
  getUserSession(): void {
    let response2 = this.authService.getUserSession();
    // console.log('app response ');
    this.isLoading = false;
    if (response2 != null) {
      this.router.navigate(['/user'], { replaceUrl: true });
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

}
