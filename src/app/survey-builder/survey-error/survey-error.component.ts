import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from 'src/services/modal/modal.service';

@Component({
  selector: 'app-survey-error',
  templateUrl: './survey-error.component.html',
  styleUrls: ['./survey-error.component.scss']
})
export class SurveyErrorComponent implements OnInit {

  constructor(private router: Router,
    private modalService: ModalService) { }

  ngOnInit(): void {
  }

  // Navigates to create new survey url
  newSurvey(): void {
    this.router.navigateByUrl('/builder');
    this.modalService.surveyErrorModal$.next(false);
    this.modalService.close();
  }
}
