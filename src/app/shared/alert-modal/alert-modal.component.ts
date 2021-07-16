import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
})
export class AlertModalComponent implements OnInit {
  modalHeader: string = '';
  imagePath: string = '';
  message: string = '';
  display$: Observable<'open' | 'close'>;
  paymentFailed: Boolean = false;
  isMissingSurveyCloseCalled: Boolean = false;

  constructor(
    private paymentConfService: PaymentConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.paymentConfService.modalHeader.subscribe((header) => {
      this.modalHeader = header;
    });

    this.paymentConfService.imagePath.subscribe((path) => {
      this.imagePath = path;
    });

    this.paymentConfService.message$.subscribe((val) => {
      this.message = val;
    });

    this.paymentConfService.paymentFailed.subscribe((flag) => {
      this.paymentFailed = flag;
    });

    this.paymentConfService.isMissingSurvey.subscribe((flag) => {
      this.isMissingSurveyCloseCalled = flag;
    });

    this.display$ = this.paymentConfService.alertwatch();
  }

  close() {
    if (this.isMissingSurveyCloseCalled) {
      this.router.navigate(['/user'], { replaceUrl: true });
      this.paymentConfService.isMissingSurvey.next(false);
    }
    this.paymentConfService.alertclose();
  }

  redirectToSubscription() {
    this.router.navigate(['/subscription'], { replaceUrl: true });
    this.paymentConfService.alertclose();
  }

  redirectToPublicSurvey() {
    this.paymentConfService.isBuyHUCoinModal.next(false);
    this.paymentConfService.alertclose();
    this.router.navigate(['/user'], { replaceUrl: true });
  }
}
