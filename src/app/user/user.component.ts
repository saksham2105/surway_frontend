import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserModel } from 'src/services/auth/user.model';
import { MainService } from 'src/services/main/main.service';
import { ModalService } from 'src/services/modal/modal.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit, OnDestroy {
  isLoading = false;
  isSideBarHidden: Boolean = true;
  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private mainService: MainService
  ) {}

  ngOnInit(): void {
    this.mainService.isSideBarHidden = false;
    this.mainService.isSideBarToggled = true;

    this.mainService.sideBarChanged.next();
    this.modalService.errorHandlingModal.next(false);
    this.getSession('user');

    this.isLoading = true;
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
    if (response2 != null) {
      console.log('route: ' + route);
      this.router.navigate([`/${route}`]);
    } else {
      //user not login yet,
      this.router.navigate(['/auth'], { replaceUrl: true });
    }
    this.authService.isLoading.next(false); //loading spinner listener
  }

  // @HostListener('window:scroll', ['$event'])
  // detectScroll() {
  //   window.onscroll = () => {
  //     // document.getElementById('sidebar').classList.add('sticky');
  //     console.log('hey');

  //   }
  // }
}
