import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  isSideBarHidden: Boolean = false;
  isSideBarToggled: Boolean = true;
  isProfileSideBarHidden: Boolean = false;
  screenWidth: Number;
  screenHeight: number;

  showNavBar$ = new BehaviorSubject<Boolean>(true);
  sideBarChanged = new Subject<void>();
  profileNavigation = new BehaviorSubject<string>('MyAccount');

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  sideBarToggleTopClicked() {
    this.isSideBarHidden = !this.isSideBarHidden;
    this.isSideBarToggled = !this.isSideBarToggled;

    this.sideBarChanged.next();
  }
  toggleSideBar() {
    this.isSideBarToggled = !this.isSideBarToggled;
    this.isSideBarHidden = !this.isSideBarHidden;

    this.sideBarChanged.next();
  }

  // Hides sidebar in user and nav bar in builder on small screens
  setScreenSize(width, height): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.isSideBarHidden = this.screenWidth < 480 ? true : false;
    this.showNavBar$.next(this.screenWidth < 480 ? false : true);
  }

  /** This function is used to logout  */
  logOut(): void {
    this.authService.authenticateUser().subscribe(
      (response: any) => {
        let token = response.token;
        var header = {
          headers: new HttpHeaders().set('Authorization', 'Bearer ' + token),
        };

        this.http
          .get(this.authService.baseURL + '/surway/user/logout', header)
          .subscribe(
            (res) => {
              console.log(JSON.stringify(res));
              this.router.navigate(['/auth'], { replaceUrl: true });
              localStorage.clear();
              this.authService.isLoading.next(false); //loading spinner listener
            },
            (err) => {
              console.log('Err ' + JSON.stringify(err));
            }
          );
      },
      (error) => {
        //  alert(error.error);
        console.log(error.error);
      }
    );
  }
}
