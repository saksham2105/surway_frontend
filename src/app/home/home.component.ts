import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import * as AOS from 'aos';
import { AuthService } from 'src/services/auth/auth.service';
declare var $;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private titleService: Title,
    private authService: AuthService
  ) {
    this.titleService.setTitle('SurWay');
  }

  ngOnInit(): void {
    this.getSession();

    // AOS
    AOS.init({
      offset: 130,
      delay: 0,
      duration: 2000,
      easing: 'ease',
      once: false,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });

    window.onscroll = function () {
      scrollFunction();
    };

    var element = document.getElementById('body');
    function scrollFunction() {
      if (
        document.body.scrollTop > 400 ||
        document.documentElement.scrollTop > 400
      ) {
        $('.navbar').addClass('fixed-top');
        element.classList.add('header-small');
        $('body').addClass('body-top-padding');
      } else {
        $('.navbar').removeClass('fixed-top');
        element.classList.remove('header-small');
        $('body').removeClass('body-top-padding');
      }
    }

    //SIDEBAR-OPEN
    $('#navbarSupportedContent').on('hidden.bs.collapse', function () {
      $('body').removeClass('sidebar-open');
    });

    $('#navbarSupportedContent').on('shown.bs.collapse', function () {
      $('body').addClass('sidebar-open');
    });

    // Scroll to top button appear
    $(document).on('scroll', function () {
      var scrollDistance = $(this).scrollTop();
      if (scrollDistance > 100) {
        $('.scroll-to-top').fadeIn();
      } else {
        $('.scroll-to-top').fadeOut();
      }
    });
  }

  homeToLogin() {
    this.router.navigate(['/auth', { replaceUrl: true }]);
  }

  getSession(): void {
    let userLocalDataPresent = localStorage.getItem('userCookies');
    if (userLocalDataPresent != null) {
      this.router.navigate(['/user'], { replaceUrl: true });
    } else {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
}
