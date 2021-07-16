import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { UserCookieModel } from 'src/services/auth/userCookie.model';
import { PaymentService } from 'src/services/payment/payment.service';
import { UserService } from 'src/services/user/user.service';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  options = {
    key: '',
    amount: '',
    name: 'SurWay Tool',
    description: 'Tool to create Surveys',
    image: './../../../assets/logo.svg',
    order_id: '',
    handler: function (response) {
      var event = new CustomEvent('payment.success', {
        detail: response,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    },
    prefill: {
      name: '',
      email: '',
      contact: '',
    },
    notes: {
      address: '',
    },
    theme: {
      color: '#3399cc',
    },
  };

  /** Variables */
  isLoading: Boolean = true;
  token: string;
  paymentId: string;
  name: string;
  email: string;
  tierHuCoins: number = 100;

  paymentSubs: Subscription;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private paymentService: PaymentService,
    private router: Router,
    private userService: UserService
  ) {
    this.titleService.setTitle('SurWay Plans');
  }

  ngOnInit(): void {
    if (localStorage.getItem('userCookies')) {
      let user: UserCookieModel = <UserCookieModel>(
        JSON.parse(localStorage.getItem('userCookies'))
      );
      this.name = user.firstName + ' ' + user.secondName;
      this.email = user.email;
    }

    this.paymentService.isPaymentLoading.subscribe((flag) => {
      this.isLoading = flag;
    });
  }

  ngOnDestroy(): void {
    if (this.paymentSubs != null) {
      this.paymentSubs.unsubscribe();
    }
  }

  onSubmit(typeTier: string): void {
    this.paymentService.isPaymentLoading.next(true);
    let price: number = 99;
    if (typeTier === 'mega') {
      price = 599;
      this.tierHuCoins = 1000;
    }

    this.paymentId = '';
    this.paymentSubs = this.authService
      .authenticateUser()
      .subscribe((res: any) => {
        this.token = res.token;

        this.paymentService
          .createOrder(this.name, this.email, price, typeTier, this.token)
          .subscribe(
            (data) => {
              this.paymentService.isPaymentLoading.next(false);
              // alert(JSON.stringify(data.applicationFee / 100));
              this.options.key = data.secretKey;
              this.options.order_id = data.razorpayOrderId;
              this.options.amount = data.applicationFee; //paise format
              this.options.prefill.name = this.name;
              this.options.prefill.email = this.email;

              var rzp1 = new Razorpay(this.options);
              rzp1.open();

              rzp1.on('payment.failed', function (response) {
                // Todo - store this information in the server
                // alert(JSON.stringify(response));
                console.log(response.error.code);
                console.log(response.error.description);
                console.log(response.error.source);
                console.log(response.error.step);
                console.log(response.error.reason);
                console.log(response.error.metadata.order_id);
                console.log(response.error.metadata.payment_id);
                this.error = response.error.reason;
              });
            },

            (err) => {
              console.log('1' + err.error.message);
            }
          );
      });
  }

  @HostListener('window:payment.success', ['$event'])
  onPaymentSuccess(event): void {
    // alert('On payment success invoked');
    this.paymentService.isPaymentLoading.next(true);
    this.authService.authenticateUser().subscribe((res: any) => {
      this.token = res.token;
      console.log(event.detail);
      this.paymentService.updateOrder(event.detail, this.token).subscribe(
        (data) => {
          this.paymentService.isPaymentLoading.next(true);
          console.log('Success Payment');
          this.paymentService.isPaymentLoading.next(false);

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
            user.huCoins + this.tierHuCoins,
            user.contact,
            true,
            user.registeredDate,
            user.imageString
          );
          this.userService.user.next(updatedUser);
          localStorage.setItem('userCookies', JSON.stringify(updatedUser));
          this.paymentId = data.message;
          this.backToHome();
        },
        (err) => {
          console.log('2' + err.error.message);
          // this.error = err.error.message;
        }
      );
    });
  }
  private backToHome() {
    this.router.navigate(['/user'], { replaceUrl: true });
  }
}
