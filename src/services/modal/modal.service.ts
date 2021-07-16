import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { UserGroupModel } from 'src/app/user/user-groups/user-groups.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor() {}
  private display: BehaviorSubject<'open' | 'close'> = new BehaviorSubject(
    'close'
  );
  errorHandlingModal = new BehaviorSubject<Boolean>(false);
  contactGroupModal = new BehaviorSubject<Boolean>(false);
  contactGroupData = new BehaviorSubject<UserGroupModel>(null);

  errorTitle = new BehaviorSubject<string>('Error');
  errorDescription = new BehaviorSubject<string>('Error in Auth');
  errorImagePath = new BehaviorSubject<string>('./../../../assets/error.png');

  questionEditingModal = new BehaviorSubject<Boolean>(false);
  launchV1Modal = new BehaviorSubject<Boolean>(false);
  isNext$ = new BehaviorSubject<Boolean>(false);
  surveyErrorModal$ = new BehaviorSubject<Boolean>(false);
  templatePurchaseModal$ = new BehaviorSubject<Boolean>(false);

  watch(): Observable<'open' | 'close'> {
    return this.display.asObservable();
  }
  //Open Modal
  open(modalType: string) {
    this.close();
    if (modalType === 'errorHandling') {
      this.errorHandlingModal.next(true);
    } else if (modalType === 'contactGroupModal') {
      this.contactGroupModal.next(true);
    }
    if (modalType === 'editingQuestion') {
      this.questionEditingModal.next(true);
    }
    if (modalType === 'launchV1') {
      this.launchV1Modal.next(true);
    }
    if (modalType === 'surveyError') {
      this.surveyErrorModal$.next(true);
    }
    if (modalType === 'templatePurchase') {
      this.templatePurchaseModal$.next(true);
    }
    this.display.next('open');
  }
  //Close Modal
  close() {
    this.display.next('close');
  }
}
