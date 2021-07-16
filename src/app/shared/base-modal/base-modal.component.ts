import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuilderService } from 'src/services/builder/builder.service';
import { ModalService } from 'src/services/modal/modal.service';

@Component({
  selector: 'app-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss'],
})
export class BaseModalComponent implements OnInit {
  /** Variables */
  display$: Observable<'open' | 'close'>;
  isErrorHandlingModal: Boolean = false;
  isContactGroupModal: Boolean = false;

  isQuestionEditorModal: Boolean = false;
  editQuestionPos: number;

  isLaunchV1Modal: Boolean = false;
  isSurveyError: Boolean = false;
  isTemplatePurchaseModal: Boolean = false;

  constructor(
    private modalService: ModalService,
    private router: Router,
    private builderService: BuilderService
  ) {}

  ngOnInit(): void {
    this.display$ = this.modalService.watch();
    this.builderService.editQuestionId$.subscribe((val) => {
      this.editQuestionPos = val;
    });
    this.modalService.questionEditingModal.subscribe((value) => {
      this.isQuestionEditorModal = value;
    });
    this.modalService.errorHandlingModal.subscribe((flag) => {
      this.isErrorHandlingModal = flag;
    });
    this.modalService.launchV1Modal.subscribe((flag: Boolean) => {
      this.isLaunchV1Modal = flag;
    });
    this.modalService.surveyErrorModal$.subscribe((flag: Boolean) => {
      this.isSurveyError = flag;
    });
    this.modalService.contactGroupModal.subscribe((flag) => {
      this.isContactGroupModal = flag;
    });
    this.modalService.templatePurchaseModal$.subscribe((flag) => {
      this.isTemplatePurchaseModal = flag;
    });
  }

  close() {
    this.modalService.close();
    this.isQuestionEditorModal = false;
    this.isLaunchV1Modal = false;
    this.modalService.isNext$.next(false);
    this.modalService.surveyErrorModal$.next(false);
    this.isTemplatePurchaseModal = false;
    this.isErrorHandlingModal = false;
    this.isContactGroupModal = false;
    this.isSurveyError = false;

    this.modalService.templatePurchaseModal$.next(false);
  }
}
