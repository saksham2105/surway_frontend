import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentConfirmationService {
  questionString = new BehaviorSubject<string>(null);
  purchaseCost$ = new BehaviorSubject<number>(0);
  isPaymentAuthorized = new BehaviorSubject<Boolean>(null);

  paymentFailed = new BehaviorSubject<Boolean>(null);
  hasSurveyCounter = new BehaviorSubject<Boolean>(false);

  modalHeader = new BehaviorSubject<string>(null);
  imagePath = new BehaviorSubject<string>(null);
  message$ = new BehaviorSubject<string>(null);

  //Template[Dashboard] Screen Modal
  isTemplatePurchaseModal = new BehaviorSubject<Boolean>(false);
  isBuyHUCoinModal = new BehaviorSubject<Boolean>(false);
  isMissingSurvey = new BehaviorSubject<Boolean>(false);
  isPublicSurveyLaunch = new BehaviorSubject<Boolean>(false);
  isPrivateSurveyLaunch = new BehaviorSubject<Boolean>(false);

  isBeginSurveyLoading = new BehaviorSubject<Boolean>(false);
  isSurveyPublic = new BehaviorSubject<Boolean>(false);
  isSurveyCompleted = new BehaviorSubject<Boolean>(false);

  private display: BehaviorSubject<'open' | 'close'> = new BehaviorSubject(
    'close'
  );
  private alertdisplay: BehaviorSubject<'open' | 'close'> = new BehaviorSubject(
    'close'
  );

  constructor() {}

  watch(): Observable<'open' | 'close'> {
    return this.display.asObservable();
  }
  alertwatch(): Observable<'open' | 'close'> {
    return this.alertdisplay.asObservable();
  }

  open() {
    this.close();
    this.display.next('open');
  }
  close() {
    this.display.next('close');
  }

  alertopen() {
    this.alertclose();
    this.alertdisplay.next('open');
  }
  alertclose() {
    this.alertdisplay.next('close');
  }
}
