import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { BuilderService } from 'src/services/builder/builder.service';
import { PaymentConfirmationService } from 'src/services/payment-confirmation/payment-confirmation.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-payment-confirmation-modal',
  templateUrl: './payment-confirmation-modal.component.html',
  styleUrls: ['./payment-confirmation-modal.component.scss'],
})
export class PaymentConfirmationModalComponent implements OnInit {
  modalHeader: string;
  imagePath: string;
  questionString: string;
  cost: number;
  purchaseType: string;
  purchaseObject: any;

  isComeFromTemplate: Boolean = false;
  display$: Observable<'open' | 'close'>;

  constructor(
    private router: Router,
    private paymentConfService: PaymentConfirmationService
  ) {}

  ngOnInit(): void {
    this.paymentConfService.isPaymentAuthorized.next(false);
    this.display$ = this.paymentConfService.watch();

    this.paymentConfService.hasSurveyCounter.subscribe((flag) => {
      this.isComeFromTemplate = flag;
    });

    this.paymentConfService.modalHeader.subscribe((header) => {
      this.modalHeader = header;
    });

    this.paymentConfService.imagePath.subscribe((path) => {
      this.imagePath = path;
    });

    this.paymentConfService.purchaseCost$.subscribe((val) => (this.cost = val));
    this.paymentConfService.questionString.subscribe(
      (val) => (this.questionString = val)
    );
  }

  pay() {
    this.paymentConfService.isPaymentAuthorized.next(true);
    this.close();
  }
  close() {
    this.paymentConfService.isPaymentAuthorized.next(false);
    this.paymentConfService.close();

    if (this.isComeFromTemplate) {
      this.router.navigate(['/user'], { replaceUrl: true });
    }
  }
}
