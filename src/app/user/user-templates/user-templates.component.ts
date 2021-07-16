import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { BuilderService } from 'src/services/builder/builder.service';
import { ModalService } from 'src/services/modal/modal.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';
import { Template } from './template.model';

@Component({
  selector: 'app-user-templates',
  templateUrl: './user-templates.component.html',
  styleUrls: ['./user-templates.component.scss'],
})
export class UserTemplatesComponent implements OnInit {
  isBaseModalOpen: Boolean = false;
  isPaymentConfModalOpen: Boolean = false;
  isAppAlertModalOpen: Boolean = false;

  constructor(
    private titleService: Title,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private builderService: BuilderService,
    private modalService: ModalService,
    private paymentConfService: PaymentConfirmationService
  ) {
    this.titleService.setTitle('SurWay Templates');
  }

  colors: Array<string> = [
    'twitter-light-gray',
    'google-blue',
    'google-red',
    'google-green',
    'google-yellow',
    'insta-dark-pink',
    'insta-purple',
    'insta-orange',
    'wp-teal-green',
    'wp-light-green',
  ];

  templates: Array<Template> = [];
  freeTemplates: Array<Template> = [];
  paidTemplates: Array<Template> = [];
  paidTemplatesGrouped: Map<any, any> = new Map<any, any>();
  isContentLoading: Boolean = false;
  categories: Array<string> = [
    'research',
    'education',
    'events',
    'hr',
    'customer',
  ];

  ngOnInit(): void {
    this.userService.isBackFromTemplate.next(false);
    this.isContentLoading = true;
    this.fetchAllTemplates();
    this.userService.purchase.subscribe((flag) => {
      if (flag) {
        let currentTemplate = this.builderService.choosenTemplate$.getValue();
        this.purchase_Template(currentTemplate);
      }
    });
    this.userService.isTemplateLoading.subscribe((flag) => {
      this.isContentLoading = flag;
    });

    //Modal Closing using flags

    this.paymentConfService.isBuyHUCoinModal.subscribe((flag) => {
      this.isAppAlertModalOpen = flag;
    });
  }

  // get image path of template
  getTemplateImage(surveyCategory: string): string {
    return this.userService.getImagePath(surveyCategory);
  }

  // make first letter capital
  firstCharCap(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // fetch all templates from db
  fetchAllTemplates() {
    let user: UserCookieModel;
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      user = <UserCookieModel>JSON.parse(localStorage.getItem('userCookies'));
    }
    this.authService.authenticateUser().subscribe((res: any) => {
      let token: string = res.token;
      this.userService
        .getAllTemplatesByUser(token, user.email)
        .subscribe((response: any) => {
          // console.log(response);
          this.templates = response.message;
          // fetch free templates
          this.freeTemplates = this.templates.filter(
            (template) => template.color === 'twitter-light-gray'
          );
          // fetch paid templates
          this.paidTemplates = this.templates.filter(
            (template) => !this.freeTemplates.includes(template)
          );
          // group the paid templates
          this.paidTemplatesGrouped = this.groupBy(
            this.paidTemplates,
            (template) => template.surveyCategory
          );
          this.isContentLoading = false;
        });
    });
  }

  // open template
  openTemplate(template: Template): void {
    this.builderService.choosenTemplate$.next(template);
    if (template.status) {
      // console.log('Go to builder');
      this.router.navigateByUrl('/template');
    } else {
      // console.log('Not purchased, do you want to purchase?');
      this.modalService.open('templatePurchase');
    }
  }

  // groups a list based on a key value
  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  // purchase a template
  purchase_Template(template: Template) {
    let user: UserCookieModel, token: string;
    if (localStorage.getItem('userCookies')) {
      // fetch user email
      user = <UserCookieModel>JSON.parse(localStorage.getItem('userCookies'));
    }
    this.authService.authenticateUser().subscribe((res: any) => {
      token = res.token;
      this.userService
        .purchaseTemplate(token, template, user.email)
        .subscribe((response: any) => {
          console.log(response);
          // this.userService.refreshList.next();
          if (response.success) {
            // console.log('Successfully purchased template!');

            //update the local storage
            let user: UserCookieModel;
            this.userService.user.subscribe((userInfo) => {
              user = userInfo;
            });
            let updatedUser = new UserCookieModel(
              user.firstName,
              user.secondName,
              user.email,
              user.verified,
              user.huCoins - 2,
              user.contact,
              true,
              user.registeredDate,
              user.imageString
            );
            this.userService.user.next(updatedUser);
            localStorage.setItem('userCookies', JSON.stringify(updatedUser));

            this.fetchAllTemplates();
            setTimeout(() => this.router.navigateByUrl('/template'), 1000);
          } else {
            this.paymentConfService.isBuyHUCoinModal.next(true);
            this.paymentConfService.modalHeader.next('Transaction Failed');
            this.paymentConfService.imagePath.next(
              './../../../../assets/ill-payment-failed.svg'
            );
            this.paymentConfService.paymentFailed.next(true);
            // alert('Payment failed')!
            this.paymentConfService.message$.next(
              'You have not sufficient HU coins in your account!'
            );
            this.paymentConfService.alertopen();
          }
        });
    });
    this.userService.purchase.next(false);
  }
}
